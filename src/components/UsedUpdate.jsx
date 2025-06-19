import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useImage } from "../hooks/useImage";
import { useUserTable } from "../hooks/useUserTable";
import '../css/usedupdate.css'

export function UsedUpdate() {

    // TODO: 수정 시간 업데이트
    const now = new Date().toISOString();
    const navigate = useNavigate();
    // url에서 가져옴
    const { id, item } = useParams();

    // 제목, 내용, 가격
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [price, setPrice] = useState("");

    const { images, setImages, getImages, initImage } = useImage();
    const [fileCount, setFileCount] = useState(0);
    const fileInputRef = useRef();

    const [location, setLocation] = useState("");

    // type-> 4: 벼룩해요 5: 드림해요 6. 구해요 7. 공구해요
    const [category, setCategory] = useState("");
    // useUserTable 훅
    const { info: userInfo, loading, error } = useUserTable();
        // 카테고리 숫자->문자열로 변환
    const CATEGORY_MAP = {
        4: "sell",    // 중고거래
        5: "share",     // 구매
        6: "buy"  // 나눔
    };


    // 드림해요-> 가격 내용 비움(썼다가 중간에 바꾸면 내용이 남으므로 비워줌)
    useEffect(() => {
        if (category === "5") setPrice("");
    }, [category]);



    const [exPics, setExPics] = useState([]);
    useEffect(() => {
        const fetchForm = async () => {
            const { data, error } = await supabase
                .from('trades')
                .select('*, categories(name)')
                .eq('id', item)
                .single();
            if (error) {
                console.log("error: ", error);
                console.log("data: ", data);
            }
            if (data) {
                setTitle(data.title)
                setContent(data.content)
                setPrice(data.price)
                setCategory(String(data.category_id))
                setLocation(data.location)
                //기존 이미지들 배열로 만듦
                setExPics([
                    data.main_img,
                    data.detail_img1,
                    data.detail_img2,
                    data.detail_img3,
                    data.detail_img4
                ].filter(Boolean)); //비어있는 건 뺌
            }
        }
        fetchForm();
    }, [item]);

    const handleRemoveImage = () => {
        initImage([]);
        setFileCount(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";   // input의 파일 선택 자체를 비움!
        }
    }

    // fileCount: 사용자가 < input type = "file" multiple > 에서 고른 파일의 개수
    // images.length: 실제로 서버에 업로드 끝난 이미지 개수(useImage 훅에서 관리)
    // 이미지 업로드 개수 제한 함수
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        console.log(files);
        if (images.length + files.length > 5) {
            alert("사진은 최대 5장까지만 업로드할 수 있습니다.");
            fileInputRef.current.value = "";
            return;
        }
        if (files.length > 0) {
            // setExPics([]);
            setImages(e).then(() => {
                // 기존이미지도 그냥 냅두는게 좋을 것 같음(미리보기)
                //setExPics([]);
                setFileCount(images.length + files.length);
            });
        }
    }

    // 이미지 수정했으면 기존 이미지는 빠지게
    const finalPics = (images.length > 0 ? images : exPics).filter(Boolean);

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!userInfo) {
            alert("로그인해야 글수정이 가능합니다.");
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
        if (category !== "5" && !price) { // '나눔' 아니면 가격 필요
            alert("가격을 입력해주세요.");
            return;
        }
        if (!confirm('게시글을 수정할까요?')) {
            return;
        }

        const { data, error } = await supabase
            .from('trades')
            .update({
                title,
                content,
                price: category === "5" ? 0 : Number(price),
                category_id: Number(category),
                location,
                main_img: finalPics[0],
                detail_img1: finalPics[1],
                detail_img2: finalPics[2],
                detail_img3: finalPics[3],
                detail_img4: finalPics[4],
                update_date: now
            })
            .eq('id', item)
            .select()
            .single();
        if (error) {
            console.log('error', error);
        } if (data) {
            const newItem = data.id;
            const categoryString = CATEGORY_MAP[category];
            navigate(`/trade/${categoryString}/${newItem}?keyword=`);
        }
    }

    console.log(images)
    return (
        <div className="usededit-wrap">
            <form className="usededit-form" onSubmit={handleUpdate} autoComplete="off">
                <div className="form-title">글수정</div>
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
                    <input className="form-input" value={location} type="text" disabled />
                    <div className="form-desc">※ 지역은 수정할 수 없습니다.</div>
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
                {/* 기존 이미지 미리보기 */}
                <div className="form-group">
                    <div className="form-label">기존 이미지</div>
                    <div className="img-preview-list">
                        {exPics.length > 0 ? (
                            exPics.map((img, i) => (
                                <img
                                    key={i}
                                    src={getImages(img)}
                                    alt={`기존 이미지 ${i + 1}`}
                                    className="img-preview"
                                />
                            ))
                        ) : (
                            <div className="form-desc">기존 이미지 없음</div>
                        )}
                    </div>
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
                        가장 먼저 선택한 이미지가 대표이미지로 설정됩니다.
                    </div>
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
                {/* 수정 버튼 */}
                <button className="form-btn" type="submit" disabled={images.length > 0 && fileCount !== images.length}>
                    수정
                </button>
            </form>
        </div>
    );

};