import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useImage } from "../hooks/useImage";
import { useUserTable } from "../hooks/useUserTable";
import { getUser } from '../utils/getUser'; // create에서만 쓰는 부분이면 아래에서 분기처리
import { useRegion } from "../hooks/useRegion"; // create에서만 쓰는 부분이면 아래에서 분기처리
import '../css/usedform.css';

export function UsedForm({ mode, item }) {
    const now = new Date().toISOString();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");

    const { images, setImages, getImages, initImage } = useImage();
    const [fileCount, setFileCount] = useState(0);
    const fileInputRef = useRef();

    const { info: userInfo } = useUserTable();

    const {city, district} = useRegion();
    const region = `${city} ${district}`;
    const CATEGORY_MAP = { 4: "sell", 5: "share", 6: "buy" };


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

    // 기존 데이터 불러오기
    useEffect(() => {
        if (mode === "edit" && item) {
            supabase
                .from('trades')
                .select('*, categories(name)')
                .eq('id', item)
                .single()
                .then(({ data, error }) => {
                    if (data) {
                        setTitle(data.title);
                        setContent(data.content);
                        setPrice(data.price);
                        setCategory(String(data.category_id));
                        setLocation(data.location);
                        const oldImgs=[
                            data.main_img,
                            data.detail_img1,
                            data.detail_img2,
                            data.detail_img3,
                            data.detail_img4
                        ].filter(Boolean);
                        initImage(oldImgs);
                        setFileCount(oldImgs.length);
                    }
                });
        }
    }, [mode, item]);

    useEffect(() => {
        if (mode === "create" && region) {
            setLocation(region);
        }
    }, [mode, region]);

    // 드림해요면 가격 비움
    useEffect(() => {
        if (category === "5") setPrice("");
    }, [category]);

    // 파일 업로드
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            alert("사진은 최대 5장까지만 업로드할 수 있습니다.");
            fileInputRef.current.value = "";
            return;
        }
        setFileCount(images.length + files.length);
        if (files.length > 0) {
            setImages(e); // 기존대로
        }
    }

    // 이미지 삭제
    const handleRemoveImage = () => {
        initImage([]);
        setFileCount(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    //등록/수정
    const handleSubmit = async (e) => {
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
        if (!confirm(mode === "edit" ? "게시글을 수정할까요?" : "게시글을 등록할까요?")) {
            return;
        }

        let result;
        if (mode === "edit") {
            result = await supabase
                .from('trades')
                .update({
                    title,
                    content,
                    price: category === "5" ? 0 : Number(price),
                    category_id: Number(category),
                    location,
                    main_img: images[0] ? images[0] : null,
                    detail_img1: images[1] ? images[1] : null,
                    detail_img2: images[2] ? images[2] : null,
                    detail_img3: images[3] ? images[3] : null,
                    detail_img4: images[4] ? images[4] : null,
                    update_date: now
                })
                .eq('id', item)
                .select()
                .single();
        } else {
            result = await supabase
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
                    state: 0,
                    sales_begin: null,
                    sales_end: null,
                    limit_type: null,
                    limit: null,
                }])
                .select()
                .single();
        }
        const { data, error } = result;
        if (error) {
            console.log('error', error);
        }
        if (data && data.id) {
            const categoryString = CATEGORY_MAP[category];
            const newItem = data.id;
            navigate(`/trade/${categoryString}/${newItem}?keyword=`);
        }
    }

    return (<>
                <style>{`
                .inputBox{
                    display: none !important;
                }
            `}</style>
        <div className="usededit-wrap">
            <form className="usededit-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="form-title">
                    {mode === "edit" ? "글수정" : "글등록"}
                </div>
                {/* 카테고리 */}
                <div className="form-group">
                    <label className="form-label">카테고리</label>
                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">카테고리 선택</option>
                        <option value="4">벼룩해요</option>
                        <option value="5">드림해요</option>
                        <option value="6">구해요</option>
                    </select>
                </div>
                {/* 지역 */}
                <div className="form-group">
                    <label className="form-label">지역</label>
                    <input className="form-input" value={location} type="text" disabled />
                    <div className="form-desc">
                        {mode === "edit" ? "※ 지역은 수정할 수 없습니다." : "※ 상단메뉴에서 선택해주세요."}
                    </div>
                </div>
                {/* 제목 */}
                <div className="form-group">
                    <input className="form-input" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
                </div>
                {/* 내용 */}
                <div className="form-group">
                    <textarea className="form-input textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="내용" rows={5} />
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
                    />
                    {/* <span className="form-price-unit">원</span> */}
                </div>
                {/* 새 이미지 업로드 */}
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
                        이미지를 클릭하여 대표이미지를 설정해주세요.
                    </div>
                    {fileCount !== images.length && (
                            <div className="form-desc">이미지 업로드 중입니다...</div>
                        )}
                    {/* 새 이미지 미리보기 */}
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
                                    alt={`업로드 이미지${idx + 1}`}
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
                    <button type="button" className="form-reset-img" onClick={handleRemoveImage}>
                        전체 이미지 다시 선택
                    </button>
                </div>
                {/* 등록/수정 버튼 */}
                <button className="form-btn" type="submit" disabled={images.length > 0 && fileCount !== images.length}>
                    {mode === "edit" ? "수정" : "등록"}
                </button>
            </form>
        </div>
    </>);
}
