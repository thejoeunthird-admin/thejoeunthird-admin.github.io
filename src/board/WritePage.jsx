import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from '../supabase/supabase';
import { useUserTable } from "../hooks/useUserTable";
import { useImage } from "../hooks/useImage";

const getImages = (path) =>
    `https://mkoiswzigibhylmtkzdh.supabase.co/storage/v1/object/public/images/${path}`;

export default function WritePage() {
    const shadowHostRef = useRef(null);
    const [shadowRoot, setShadowRoot] = useState(null);
    
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

    // Shadow DOM 설정
    useEffect(() => {
        if (shadowHostRef.current && !shadowRoot) {
            const shadow = shadowHostRef.current.attachShadow({ mode: 'open' });
            
            // Bootstrap CSS를 Shadow DOM에 추가
            const bootstrapLink = document.createElement('link');
            bootstrapLink.rel = 'stylesheet';
            bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
            shadow.appendChild(bootstrapLink);

            // Bootstrap JavaScript를 Shadow DOM에 추가
            const bootstrapScript = document.createElement('script');
            bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
            bootstrapScript.async = true;
            shadow.appendChild(bootstrapScript);

            const mountPoint = document.createElement('div');
            shadow.appendChild(mountPoint);
            
            setShadowRoot(mountPoint);
        }
    }, [shadowRoot]);

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

    const WritePageContent = () => {
        return (
            <>
                {/* 왼쪽 전체 카테고리 ul(ul.ul)만 BoardDetailPage에서 숨김 */}
                <style>
                    {`
                  .ul {
                    display: none !important;
                  }
                `}
                </style>
                <div>
                    <h2>{editId ? "게시글 수정" : "게시글 작성"}</h2>
                    <form onSubmit={handleSubmit}>
                        <span>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                <option value="">카테고리 선택</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </span>
                        <span>
                            <input type="text"
                                placeholder="제목"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </span>
                        <div>
                            <textarea
                                placeholder="내용"
                                value={contents}
                                onChange={e => setContents(e.target.value)}
                                rows={8}
                                cols={40}
                            />
                        </div>

                        {/* 이미지 프리뷰 영역 */}
                        <div style={{ margin: "16px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {/* 기존 이미지 */}
                            {oldImages.map((img, idx) => (
                                <div key={`old-${idx}`} style={{ position: "relative", cursor: "pointer" }}>
                                    <img
                                        src={getImages(img)}
                                        alt={`기존이미지${idx + 1}`}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            objectFit: "cover",
                                            borderRadius: 5,
                                            border: mainIndex === idx ? "3px solid #e14989" : "1px solid #eee",
                                            boxSizing: "border-box"
                                        }}
                                        onClick={() => setMainIndex(idx)}
                                    />
                                    <button
                                        type="button"
                                        style={{
                                            position: "absolute", top: 4, right: 4, background: "none", nborder: "none", 
                                            color: "#d32f2f", fontSize: 22, fontWeight: "bold", cursor: "pointer", padding: 0, zIndex: 10
                                        }}
                                        onClick={() => handleRemoveOldImage(idx)}
                                        aria-label="이미지 삭제"
                                    > X </button>

                                    {mainIndex === idx && (
                                        <span style={{
                                            position: "absolute", top: 4, left: 4, background: "#e14989", color: "#fff",
                                            padding: "1px 7px", fontSize: 11, borderRadius: 3, fontWeight: 700
                                        }}>
                                            대표
                                        </span>
                                    )}
                                </div>
                            ))}
                            {/* 새 이미지 */}
                            {images.filter(Boolean).map((img, idx) => (
                                <div key={`new-${idx}`} style={{ position: "relative", cursor: "pointer" }}>
                                    <img
                                        src={getImages(img)}
                                        alt={`업로드이미지${idx + 1}`}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            objectFit: "cover",
                                            borderRadius: 5,
                                            border: mainIndex === (oldImages.length + idx) ? "3px solid #e14989" : "1px solid #eee",
                                            boxSizing: "border-box"
                                        }}
                                        onClick={() => setMainIndex(oldImages.length + idx)}
                                    />
                                    {mainIndex === (oldImages.length + idx) && (
                                        <span style={{
                                            position: "absolute", top: 4, left: 4, background: "#e14989", color: "#fff",
                                            padding: "1px 7px", fontSize: 11, borderRadius: 3, fontWeight: 700
                                        }}> 대표 </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ margin: "16px 0" }}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            <p style={{ color: "#888", fontSize: 13 }}>대표이미지로 지정할 이미지를 클릭하세요! (최대 5장)</p>
                        </div>

                        <button type="submit">{editId ? "수정" : "등록"}</button>
                    </form>
                </div>
            </>
        );
    };

    return (
        <div>
            <div ref={shadowHostRef}></div>
            {shadowRoot && createPortal(<WritePageContent />, shadowRoot)}
        </div>
    );
}