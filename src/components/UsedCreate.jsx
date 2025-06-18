import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useImage } from "../hooks/useImage";
import { getUser } from '../utils/getUser';
import { useUserTable } from "../hooks/useUserTable";
import { useRegion } from "../hooks/useRegion";
import { Form, Button, FloatingLabel, Image, Spinner, InputGroup } from "react-bootstrap";

// useRef()_

export function UsedCreate() {
    const shadowHostRef = useRef(null);
    const [shadowRoot, setShadowRoot] = useState(null);

    const now = new Date().toISOString();
    const navigate = useNavigate();
    const titleRef = useRef();
    const contentRef = useRef();
    const priceRef = useRef();

    //const [title, setTitle] = useState("");
    //const [content, setContent] = useState("");
    //const [price, setPrice] = useState("");

    // type-> 4: 벼룩해요 5: 드림해요 6. 구해요 7. 공구해요
    const [category, setCategory] = useState("");

    // useImage 훅
    // const { images, setImages, getImages, initImage } = useImage();
    // const [fileCount, setFileCount] = useState(0);
    // const fileInputRef = useRef();

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

    // Shadow DOM 설정
    useEffect(() => {
        if (shadowHostRef.current && !shadowRoot) {
            const shadow = shadowHostRef.current.attachShadow({ mode: 'open' });

            // Bootstrap CSS를 Shadow DOM에 추가
            const bootstrapLink = document.createElement('link');
            bootstrapLink.rel = 'stylesheet';
            bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
            shadow.appendChild(bootstrapLink);

            // Bootstrap JavaScript를 Shadow DOM에 추가
            const bootstrapScript = document.createElement('script');
            bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
            bootstrapScript.async = true;
            shadow.appendChild(bootstrapScript);

            // 추가 스타일링
            const style = document.createElement('style');
            style.textContent = `
                :host {
                    --base-color-5: #dc3545;
                }
                .hover-shadow:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    transition: box-shadow 0.2s ease;
                }
            `;
            shadow.appendChild(style);

            const mountPoint = document.createElement('div');
            shadow.appendChild(mountPoint);

            setShadowRoot(mountPoint);
        }
    }, [shadowRoot]);

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

    const UsedCreateContent = () => {
        // useImage 훅 -> 게시글등록 함수 안에다 넣음
        const { images, setImages, getImages, initImage } = useImage();
        const [fileCount, setFileCount] = useState(0);
        const fileInputRef = useRef();

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
            if (!titleRef.current.value || !contentRef.current.value) {
                alert("제목과 내용을 모두 작성해주세요.");
                return;
            }
            if (category !== "5" && !priceRef.current.value) {
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
                    title: titleRef.current.value,
                    content: contentRef.current.value,
                    price: Number(priceRef.current.value),
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
        return (
            <div className="p-4 rounded-4 shadow-sm bg-white" style={{ maxWidth: 600, margin: "40px auto" }}>
                <Form>
                    <Form.Group className="mb-3" controlId="category">
                        <Form.Label>글등록</Form.Label>
                        <Form.Select value={category} onChange={e => setCategory(e.target.value)} required>
                            <option value="">카테고리 선택</option>
                            <option value="4">벼룩해요</option>
                            <option value="5">드림해요</option>
                            <option value="6">구해요</option>
                            {/* <option value="7">공구해요</option> */}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="location">
                        <Form.Label>지역</Form.Label>
                        <Form.Select value={location} disabled>
                            <option value="">{location}</option>
                        </Form.Select>
                        <div className="form-text mt-1 text-muted" style={{ fontSize: 14 }}>
                            ※ 상단메뉴에서 선택해주세요.
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="title">
                        <FloatingLabel label="제목">
                            <Form.Control
                                type="text"
                                ref={titleRef}
                                placeholder="제목"
                                required
                            />
                        </FloatingLabel>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="content">
                        <FloatingLabel label="내용">
                            <Form.Control
                                as="textarea"
                                style={{ minHeight: 120 }}
                                // value={content}
                                // onChange={e => setContent(e.target.value)}
                                ref={contentRef}
                                placeholder="내용"
                                required
                            />
                        </FloatingLabel>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="price">
                        <InputGroup>
                            <Form.Control
                                type="number"
                                // value={price.toLocaleString()}
                                // onChange={e => setPrice(e.target.value)}
                                ref={priceRef}
                                placeholder={category === "5" ? "나눔" : "가격"}
                                disabled={category === "5"}
                                min={0}
                                required={category !== "5"}
                            />
                            {category !== "5" && <InputGroup.Text>원</InputGroup.Text>}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="images">
                        <Form.Label>이미지 업로드</Form.Label>
                        <Form.Control
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <div className="form-text mt-1 text-muted" style={{ fontSize: 14 }}>
                            ※ 이미지는 최대 5장까지 업로드할 수 있습니다.<br />
                            <span className="text-secondary">가장 먼저 선택한 이미지가 대표이미지로 설정됩니다.</span>
                        </div>
                        {fileCount !== images.length && (
                            <div className="mt-2 text-secondary d-flex align-items-center gap-2">
                                <Spinner animation="border" size="sm" />
                                이미지 업로드 중입니다...
                            </div>
                        )}
                        {/* 업로드 미리보기 *
                        <div className="d-flex flex-wrap gap-2 mt-3">
                            {images.length > 0 && images.map((img, idx) => (
                                <Image
                                    key={idx}
                                    src={getImages(img)}
                                    alt={`이미지${idx + 1}`}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 12, border: "1px solid #eee" }}
                                    thumbnail
                                />
                            ))}
                        </div> */}

                        <div className="d-flex flex-wrap gap-2 mt-3">
                            {images.length > 0 && images.map((img, idx) => (
                                <div key={idx} style={{ position: 'relative', display: "inline-block" }}>
                                    {/* 대표 뱃지 */}
                                    {idx === 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: 5,
                                            left: 5,
                                            background: '#dc3545',
                                            color: '#fff',
                                            borderRadius: 8,
                                            padding: '2px 7px',
                                            fontSize: 12,
                                            zIndex: 2
                                        }}>
                                            대표
                                        </span>
                                    )}
                                    {/* X 버튼 */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // 삭제 로직
                                            initImage(prev => prev.filter((_, i) => i !== idx));
                                            setFileCount(prev => prev - 1);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            background: '#fff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 24,
                                            height: 24,
                                            zIndex: 2,
                                            color: '#dc3545',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                        }}
                                    >×</button>
                                    {/* 이미지 클릭시 대표 지정 */}
                                    <Image
                                        src={getImages(img)}
                                        alt={`이미지${idx + 1}`}
                                        style={{
                                            width: '100px', height: '100px',
                                            objectFit: 'cover',
                                            borderRadius: 12,
                                            border: "1px solid #eee",
                                            opacity: idx === 0 ? 1 : 0.8,
                                            cursor: 'pointer'
                                        }}
                                        thumbnail
                                        onClick={() => {
                                            // 클릭한 이미지가 이미 대표라면 무시
                                            if (idx === 0) return;
                                            // 대표로 이동(맨 앞으로)
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

                        <Button className="mt-2"
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleRemoveImage}
                        >
                            전체 이미지 다시 선택
                        </Button>
                    </Form.Group >


                    <div className="d-grid gap-2 mt-4">
                        <Button
                            style={{ background: "var(--base-color-5)", border: "none" }}
                            size="lg"
                            onClick={handleCreate}
                            disabled={images.length > 0 && fileCount !== images.length}
                        >
                            등록
                        </Button>
                    </div>
                </Form >
            </div >
        );
    };

    return (
        <div>
            <div ref={shadowHostRef}></div>
            {shadowRoot && createPortal(<UsedCreateContent />, shadowRoot)}
        </div>
    );
}
