import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useImage } from "../hooks/useImage";
import { useUserTable } from "../hooks/useUserTable";
import { Form, Button, FloatingLabel, InputGroup, Spinner, Image } from "react-bootstrap";

export function UsedUpdate() {
    const shadowHostRef = useRef(null);
    const [shadowRoot, setShadowRoot] = useState(null);

    // TODO: 수정 시간 업데이트
    const now = new Date().toISOString();
    const navigate = useNavigate();
    // url에서 가져옴
    const { item } = useParams();

    // 제목, 내용, 가격
    // const [title, setTitle] = useState("");
    // const [content, setContent] = useState("");
    // const [price, setPrice] = useState("");

    const titleRef = useRef();
    const contentRef = useRef();
    const priceRef = useRef();

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

    // 드림해요-> 가격 내용 비움(썼다가 중간에 바꾸면 내용이 남으므로 비워줌)
    useEffect(() => {
        if (category === "5") {
            if (priceRef.current) priceRef.current.value = "";
        }
    }, [category]);

    const UsedUpdateContent = ({ }) => {
        const { images, setImages, getImages, initImage } = useImage();
        const [fileCount, setFileCount] = useState(0);
        const fileInputRef = useRef();

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
                    if (titleRef.current) titleRef.current.value = data.title;
                    if (contentRef.current) contentRef.current.value = data.content;
                    if (priceRef.current) priceRef.current.value = data.price;
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
            if (!titleRef.current.value || !contentRef.current.value) {
                alert("제목과 내용을 모두 작성해주세요.");
                return;
            }
            if (category !== "5" && !priceRef.current.value) { // '나눔' 아니면 가격 필요
                alert("가격을 입력해주세요.");
                return;
            }
            if (!confirm('게시글을 수정할까요?')) {
                return;
            }

            const { data, error } = await supabase
                .from('trades')
                .update({
                    title: titleRef.current.value,
                    content: contentRef.current.value,
                    price: category === "5" ? 0 : Number(priceRef.current.value),
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
                const categoryString = CATEGORY_MAP[category];
                const newItem = data.id;
                navigate(`/trade/${categoryString}/${newItem}`);
            }
        }

        console.log(images)
        return (
            <div className="p-4 rounded-4 shadow-sm bg-white" style={{ maxWidth: 600, margin: "40px auto" }}>
                <Form>
                    <Form.Group className="mb-3" controlId="category">
                        <Form.Label>글수정</Form.Label>
                        <Form.Select value={category} onChange={e => {
                            setCategory(e.target.value);
                            console.log('카테고리: ', e.target.value)
                        }} required>
                            <option value="">카테고리 선택</option>
                            <option value="4">벼룩해요</option>
                            <option value="5">드림해요</option>
                            <option value="6">구해요</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="location">
                        <Form.Label>지역</Form.Label>
                        <Form.Control
                            value={location}
                            type="text"
                            disabled
                        />
                        <div className="form-text mt-1 text-muted" style={{ fontSize: 14 }}>
                            ※ 지역은 수정할 수 없습니다.
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="title">
                        <FloatingLabel label="제목">
                            <Form.Control
                                type="text"
                                //value={title}
                                // onChange={e => setTitle(e.target.value)}
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
                                // value={category === "5" ? 0 : price}
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

                    {/* 기존 이미지 미리보기 */}
                    <Form.Group className="mb-3">
                        <Form.Label>기존 이미지</Form.Label>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                            {exPics.length > 0 ? (
                                exPics.map((img, i) => (
                                    <Image
                                        key={i}
                                        src={getImages(img)}
                                        alt={`기존 이미지 ${i + 1}`}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 12, border: "1px solid #eee" }}
                                        thumbnail
                                    />
                                ))
                            ) : (
                                <div className="text-muted">기존 이미지 없음</div>
                            )}
                        </div>
                    </Form.Group>

                    {/* 새 이미지 업로드 */}
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
                        <div className="d-flex flex-wrap gap-2 mt-3">
                            {images.length > 0 && images.map((img, idx) => (
                                <Image
                                    key={idx}
                                    src={getImages(img)}
                                    alt={`업로드 이미지${idx + 1}`}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 12, border: "1px solid #eee" }}
                                    thumbnail
                                />
                            ))}
                        </div>
                        <Button className="mt-2"
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleRemoveImage}
                        >
                            전체 이미지 다시 선택
                        </Button>
                    </Form.Group>

                    <div className="d-grid gap-2 mt-4">
                        <Button
                            style={{ background: "var(--base-color-5)", border: "none" }}
                            size="lg"
                            onClick={handleUpdate}
                            disabled={images.length > 0 && fileCount !== images.length}
                        >
                            수정
                        </Button>
                    </div>
                </Form>
            </div>
        );
    };
    //    const [exPics, setExPics] = useState([]);

    return (
        <div>
            <div ref={shadowHostRef}></div>
            {/* {shadowRoot && createPortal(<UsedUpdateContent exPics={exPics} />, shadowRoot)} */}
            {shadowRoot && createPortal(<UsedUpdateContent />, shadowRoot)}
        </div>
    );
}