import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useImage } from "../hooks/useImage";
import { getUser } from '../utils/getUser';
import { useUserTable } from "../hooks/useUserTable";
import { useRegion } from "../hooks/useRegion";
import '../css/usedcreate.css'

export function UsedCreate() {

    const now = new Date().toISOString();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [price, setPrice] = useState("");

    // type-> 4: 벼룩해요 5: 드림해요 6. 구해요 7. 공구해요
    const [category, setCategory] = useState("");

    // useImage 훅
    const { images, setImages, getImages, initImage } = useImage();
    const [fileCount, setFileCount] = useState(0);
    const fileInputRef = useRef();

    // useUserTable 훅
    const { info: userInfo, loading, error } = useUserTable();

    // useRegion 훅
    const { city, district } = useRegion();
    const location = `${city} ${district}`;

    // 카테고리 숫자->문자열로 변환
    const CATEGORY_MAP = {
        4: "sell",
        5: "share",
        6: "buy"
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!userInfo) {
            alert("로그인해야 글작성이 가능합니다.");
            navigate('/login');
            return;
        }

        if (!category) {
            alert("카테고리를 선택해주세요.");
            return;
        }
        if (!title || !content) {
            alert("제목과 내용을 모두 작성해주세요.");
            return;
        }
        if (category !== "5" && !price) {
            alert("가격을 입력해주세요.");
            return;
        }
        if (!confirm('게시글을 등록할까요?')) {
            return;
        }
        const { data, error } = await supabase
            .from('trades')
            .insert([{
                user_id: userInfo.id,
                title,
                content,
                price: Number(price),
                location,
                main_img: images[0] ? images[0] : null,
                detail_img1: images[1] ? images[1] : null,
                detail_img2: images[2] ? images[2] : null,
                detail_img3: images[3] ? images[3] : null,
                detail_img4: images[4] ? images[4] : null,
                category_id: Number(category),
                super_category_id: 3,
                create_date: now,
                update_date: now,
                cnt: 0,
                state: 1,
                // 공구에 들어가는 내용->null
                sales_begin: null,
                sales_end: null,
                limit_type: null,
                limit: null,
            }])
            .select()
            .single();
        if (error) {
            console.log('error', error);
        } if (data && data.id) {
            // 숫자->문자열로 변환
            const categoryString = CATEGORY_MAP[category];
            const newItem = data.id;
            navigate(`/trade/${categoryString}/${newItem}`);
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        console.log(files);
        if (images.length + files.length > 5) {
            alert("사진은 최대 5장까지만 업로드할 수 있습니다.");
            fileInputRef.current.value = ""; // 선택 취소
            return;
        }
        setFileCount(images.length + files.length);
        setImages(e);
    }

    // 이미지 삭제
    const handleRemoveImage = () => {
        initImage([]);
        setFileCount(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";   // input의 파일 선택 자체를 비움
        }
    }

    useEffect(() => {
        const checkLogin = async () => {
            const { user } = await getUser();
            if (!user) {
                alert('로그인해야 글작성이 가능합니다.');
                navigate('/login');
            }
        }
        checkLogin();
    }, []);

    // 드림해요-> 가격 내용 비움
    useEffect(() => {
        if (category === "5") setPrice("");
    }, [category]);

    // // useImage 훅 -> 게시글등록 함수 안에다 넣음
    // const { images, setImages, getImages, initImage } = useImage();
    // const [fileCount, setFileCount] = useState(0);
    // const fileInputRef = useRef();

    return (
        <div className="usedcreate-wrap">
            <form className="usedcreate-form" onSubmit={handleCreate} autoComplete="off">
                <div className="form-title">글등록</div>
                {/* 카테고리 */}
                <div className="form-group">
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} required>
                        <option value="">카테고리 선택</option>
                        <option value="4">벼룩해요</option>
                        <option value="5">드림해요</option>
                        <option value="6">구해요</option>
                    </select>
                </div>
                {/* 지역 */}
                <div className="form-group">
                    <select className="form-select" value={location} disabled>
                        <option value="">{location}</option>
                    </select>
                    <div className="form-desc">※ 상단메뉴에서 선택해주세요.</div>
                </div>
                {/* 제목 */}
                <div className="form-group">
                    <input className="form-input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" required />
                </div>
                {/* 내용 */}
                <div className="form-group">
                    <input className="form-input textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="내용" rows={5} required />
                </div>
                {/* 가격 */}
                <div className="form-group form-price-group">
                    <input
                        className="form-input"
                        type="number"
                        value={category === "5" ? "" : price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder={category === "5" ? "나눔" : "가격"}
                        disabled={category === "5"}
                        min={0}
                        required={category !== "5"}
                    />
                    <span className="form-price-unit">원</span>
                </div>
                {/* 이미지 업로드 */}
                <div className="form-group">
                    <div className="form-label">이미지 업로드</div>
                    <input
                        className="form-input"
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <div className="form-desc">
                        ※ 이미지는 최대 5장까지 업로드할 수 있습니다.<br />
                        가장 먼저 선택한 이미지가 대표이미지로 설정됩니다.
                    </div>
                    {/* 이미지 미리보기 */}
                    <div className="img-preview-list">
                        {images.length > 0 && images.map((img, idx) => (
                            <div className="img-preview-box" key={idx}>
                                {idx === 0 && <span className="img-badge">대표</span>}
                                <button
                                    type="button"
                                    className="img-del"
                                    onClick={() => {
                                        initImage(prev => prev.filter((_, i) => i !== idx));
                                        setFileCount(prev => prev - 1);
                                    }}
                                >×</button>
                                <img
                                    src={getImages(img)}
                                    alt={`미리보기${idx + 1}`}
                                    className="img-preview"
                                    onClick={() => {
                                        if (idx === 0) return;
                                        initImage(prev => {
                                            const newArr = [...prev];
                                            const [selected] = newArr.splice(idx, 1);
                                            newArr.unshift(selected);
                                            return newArr;
                                        });
                                    }}
                                    title={idx === 0 ? "대표 이미지" : "대표로 지정"}
                                />
                            </div>
                        ))}
                    </div>
                    <button type="button" className="form-reset-simg" onClick={handleRemoveImage}>
                        전체 이미지 다시 선택
                    </button>
                </div>
                {/* 등록 버튼 */}
                <button className="form-btn" type="submit" disabled={images.length > 0 && fileCount !== images.length}>등록</button>
            </form>
        </div>
    );
};