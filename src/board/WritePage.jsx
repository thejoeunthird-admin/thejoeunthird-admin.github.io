import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from '../supabase/supabase';
import { useUserTable } from "../hooks/useUserTable";
import { useImage } from "../hooks/useImage";
import './WritePage.css'; // CSS 파일 import

const getImages = (path) =>
    `https://mkoiswzigibhylmtkzdh.supabase.co/storage/v1/object/public/images/${path}`;

export default function WritePage() {
    const { id: editId } = useParams();
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [mainIndex, setMainIndex] = useState(0);
    const [oldImages, setOldImages] = useState([]);
    const navigate = useNavigate();
    const user = useUserTable();
    const { images, setImages } = useImage();

    // 카테고리 로드
    useEffect(() => {
        supabase.from("categories").select("id, name, parent_id").then(({ data }) => {
            const lifeCategories = (data || []).filter(cat => cat.parent_id === 1);
            setCategories(lifeCategories);
        });
    }, []);

    // 수정모드: 기존 데이터 불러오기 (이미지는 oldImages에!)
    useEffect(() => {
        if (!editId) return;
        (async () => {
            const { data } = await supabase.from("boards").select("*").eq("id", editId).single();
            if (data) {
                setTitle(data.title);
                setContents(data.contents);
                setCategoryId(data.category_id + "");
                const imgs = [data.main_img, data.detail_img1, data.detail_img2, data.detail_img3, data.detail_img4].filter(Boolean);
                setOldImages(imgs);
                setMainIndex(0);
            }
        })();
    }, [editId]);

    // 기존 이미지 삭제
    const handleRemoveOldImage = (idx) => {
        setOldImages(oldImages.filter((_, i) => i !== idx));
        // 메인 인덱스 조정 (삭제 시)
        if (mainIndex === idx) setMainIndex(0);
        else if (mainIndex > idx) setMainIndex(mainIndex - 1);
    };

    // 기존+새이미지 합치기
    const allImages = [...oldImages, ...images.filter(Boolean)];
    const currentMainImg = allImages[mainIndex];

    // 대표/디테일 추출
    const main_img = currentMainImg || null;
    const detailImages = allImages
        .map((img, idx) => ({ img, idx }))
        .filter(obj => obj.idx !== mainIndex)
        .map(obj => obj.img)
        .concat(Array(4).fill(null))
        .slice(0, 4);
    const [detail_img1, detail_img2, detail_img3, detail_img4] = detailImages;

    // 파일 input에서 새 이미지 추가
    const handleFileChange = (e) => {
        setImages(e); // useImage 내부에서만 처리
    };

    // 저장/수정
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !contents || !categoryId) {
            alert("모든 값을 입력하세요.");
            return;
        }

        const payload = {
            title,
            contents,
            category_id: Number(categoryId),
            user_id: user.info.id,
            main_img,
            detail_img1,
            detail_img2,
            detail_img3,
            detail_img4
        };

        let error;
        let newId = editId;
        if (editId) {
            ({ error } = await supabase.from("boards").update(payload).eq("id", editId));
        } else {
            const { data, error: insertError } = await supabase.from("boards").insert([payload]).select();
            error = insertError;
            if (data && data[0]?.id) newId = data[0].id;
        }

        if (error) {
            alert((editId ? "수정" : "글 등록") + " 실패: " + error.message);
        } else {
            alert(editId ? "수정되었습니다!" : "등록되었습니다!");
            navigate(`/life/detail/${newId}`);
        }
    };

    return (
        <div>
            <style>{`
                .inputBox{
                    display: none !important;
                }
            `}</style>
            <div className="write-page-container">
                <h2 className="write-page-title">
                    {editId ? "게시글 수정" : "게시글 작성"}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-header">
                        <div>
                            <select
                                className="category-select"
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                            >
                                <option value="">카테고리 선택</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-header-title">
                            <input
                                className="title-input"
                                type="text"
                                placeholder="제목"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="content-container">
                        <textarea
                            className="content-textarea"
                            placeholder="내용"
                            value={contents}
                            onChange={e => setContents(e.target.value)}
                            rows={8}
                        />
                    </div>

                    {/* 이미지 프리뷰 영역 */}
                    <div className="image-preview-container">
                        {/* 기존 이미지 */}
                        {oldImages.map((img, idx) => (
                            <div key={`old-${idx}`} className="image-item">
                                <img
                                    src={getImages(img)}
                                    alt={`기존이미지${idx + 1}`}
                                    className={`image-thumbnail ${mainIndex === idx ? 'selected' : ''}`}
                                    onClick={() => setMainIndex(idx)}
                                />
                                <button
                                    type="button"
                                    className="image-delete-button"
                                    onClick={() => handleRemoveOldImage(idx)}
                                    aria-label="이미지 삭제"
                                >
                                    ×
                                </button>

                                {mainIndex === idx && (
                                    <span className="main-image-badge">
                                        대표
                                    </span>
                                )}
                            </div>
                        ))}

                        {/* 새 이미지 */}
                        {images.filter(Boolean).map((img, idx) => (
                            <div key={`new-${idx}`} className="image-item">
                                <img
                                    src={getImages(img)}
                                    alt={`업로드이미지${idx + 1}`}
                                    className={`image-thumbnail ${mainIndex === (oldImages.length + idx) ? 'selected' : ''}`}
                                    onClick={() => setMainIndex(oldImages.length + idx)}
                                />
                                {mainIndex === (oldImages.length + idx) && (
                                    <span className="main-image-badge">
                                        대표
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="form-footer">
                        <div className="file-upload-section">
                            <input
                                className="file-input"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            <p className="file-input-description">
                                대표이미지로 지정할 이미지를 클릭하세요! (최대 5장)
                            </p>
                        </div>
                        <button type="submit" className="submit-button">
                            {editId ? "수정" : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}