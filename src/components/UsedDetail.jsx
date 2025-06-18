import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useNavigate } from "react-router-dom";
import { useUserTable } from "../hooks/useUserTable";
import { Carousel, Row, Col, Button, Badge, Card } from 'react-bootstrap';
import { Comments } from "./Comments";
import { LoadingCircle } from './LoadingCircle';

export function UsedDetail() {
    const shadowHostRef = useRef(null);
    const [shadowRoot, setShadowRoot] = useState(null);
    
    const { item } = useParams();
    const navigate = useNavigate();
    const now = new Date().toISOString();
    const [error, setError] = useState(null);
    const [likesCount, setLikesCount] = useState(0);    // 좋아요 수
    const [isLiked, setIsLiked] = useState(false);      // 내가 눌렀는지
    const [isLiking, setIsLiking] = useState(false);    // 처리중
    const [loading, setLoading] = useState(true);

    // 글쓰기 메뉴
    const [showRegisterMenu, setShowRegisterMenu] = useState(false);

    // 상세게시물 정보 담음
    const [detail, setDetail] = useState(null);
    // 로그인한 사람의 정보
    const { info: userInfo } = useUserTable();

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
                .hover-shadow:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    transition: box-shadow 0.2s ease;
                }
                .position-fixed {
                    position: fixed !important;
                }
                .bottom-0 {
                    bottom: 0 !important;
                }
                .start-0 {
                    left: 0 !important;
                }
                .position-absolute {
                    position: absolute !important;
                }
            `;
            shadow.appendChild(style);

            const mountPoint = document.createElement('div');
            shadow.appendChild(mountPoint);
            
            setShadowRoot(mountPoint);
        }
    }, [shadowRoot]);

    const handleToggleMenu = () => {
        setShowRegisterMenu(prev => !prev);
    };
    
    const handleRegisterNavigate = (path) => {
        console.log('Navigate to', path);
        setShowRegisterMenu(false);
        navigate(path);
    };

    // 게시물정보(item)
    useEffect(() => {
        const fetchDetails = async () => {
            if (!item) return;
            try {
                // 기존 조회수
                const { data: preData, error: preError } = await supabase
                    .from('trades')
                    .select('cnt')
                    .eq('id', item)
                    .single();
                if (preError) {
                    console.log('increaseView error: ', preError);
                    return;
                }
                // +1
                await supabase
                    .from('trades')
                    .update({ cnt: preData.cnt + 1 })
                    .eq('id', item);

                // 게시물 불러오기
                const { data: detailData, error } = await supabase
                    .from('trades')
                    .select('*, categories(*), users(id, name)')
                    .eq('id', item)
                    .single();
                if (error) {
                    console.log('error: ', error);
                }
                if (detailData) {
                    setDetail(detailData);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('데이터를 불러오는 도중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [item]);

    // 좋아요(detail, userInfo)
    useEffect(() => {
        const fetchLikes = async () => {
            if (!detail) return;

            // 좋아요 수
            const { count, error: likeCountError } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', detail.category_id)
                .eq('table_id', detail.id);
            if (!likeCountError) setLikesCount(count);

            // 좋아요 상태
            if (userInfo) {
                const { data: likedData } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('category_id', detail.category_id)
                    .eq('table_id', detail.id)
                    .eq('user_id', userInfo.id);
                setIsLiked(likedData?.length > 0);
            } else {
                setIsLiked(false);
            }
        };
        fetchLikes();
    }, [detail, userInfo]);

    // 좋아요 수 갱신 함수
    const updateLikeCount = async () => {
        try {
            const { count, error: likeCountError } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', detail.category_id)
                .eq('table_id', detail.id);

            if (!likeCountError) {
                setLikesCount(count);  // 좋아요 수 갱신
            } else {
                console.error('좋아요 수 불러오기 실패', likeCountError);
            }
        } catch (error) {
            console.error('좋아요 수 갱신 실패:', error);
        }
    };

    const handleLikeToggle = async () => {
        if (!detail) return;
        setIsLiking(true);

        try {
            if (isLiked) {
                // 좋아요 취소
                await supabase
                    .from('likes')
                    .delete()
                    .eq('category_id', detail.category_id)
                    .eq('table_id', detail.id)
                    .eq('user_id', userInfo.id);

                setIsLiked(false);
            } else {
                // 좋아요 추가
                await supabase
                    .from('likes')
                    .insert({
                        category_id: detail.category_id,
                        table_id: detail.id,
                        user_id: userInfo.id
                    });

                setIsLiked(true);
            }

            // 좋아요 상태 변경 후 좋아요 수 갱신
            await updateLikeCount();

        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLiking(false);
        }
    };

    // 글 삭제
    const deleteDetails = async () => {
        if (!confirm('게시글을 삭제할까요?')) {
            return;
        }
        const { data, error } = await supabase
            .from('trades')
            .delete()
            .eq('id', item)
            .select();
        if (error) {
            alert('삭제에 실패했습니다.');
            console.log('delete error', error);
        }
        if (data) {
            alert('게시글이 삭제되었습니다.');
            const categoryString = CATEGORY_MAP[detail.category_id];
            navigate(`/trade/${categoryString}`);
        }
    }

    // 구매하기/나눔받기/팔기 -> 판매자 채팅으로
    const makeChats = async () => {
        if(!confirm('거래 요청 메시지를 보낼까요?')) return;
        const { data, error } = await supabase
            .from('chats')
            .insert([{
                sender_id: detail?.user_id,
                receiver_id: userInfo?.id,
                chat: '거래해요!',
                create_date: now,
                read: false,
                trades_id: detail.id,
                trades_quantity: 1
            }])
            .select()
        if (error) {
            console.log('error: ', error);
        }
        if (data) {
            console.log('data: ', data);
            navigate(`/my/talk/${detail?.user_id}`)
        }
    }

    // 버튼 분기
    const handleButtons = () => {
        // 내가 쓴 글이면 (글수정/삭제만)
        if (userInfo && userInfo.id === detail.user_id) {
            return (
                <div>
                    <Button variant="outline-secondary" onClick={handleUpdate}>글수정</Button>
                    <Button variant="outline-danger" onClick={deleteDetails}>삭제</Button>
                </div>
            );
        } else {
            // 좋아요 버튼 + 기타 버튼
            return (
                <div>
                    <Button
                        variant={isLiked ? "danger" : "outline-danger"}
                        onClick={handleLikeToggle}
                        disabled={isLiking}
                    >
                        {isLiked ? "❤️" : "🤍"}
                        {isLiked ? " 좋아요 취소" : " 좋아요"}
                    </Button>
                    <Button variant="outline-primary" onClick={makeChats}>✉️ 쪽지</Button>
                </div>
            );
        }
    };

    // 글 수정 버튼
    const handleUpdate = () => {
        navigate('update');
    }

    // 날짜 계산
    const getDateDiff = (date) => {
        const created = new Date(date);
        created.setHours(created.getHours() + 9);
        const now = new Date();
        const diffMs = now - created; // 밀리초 차이
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffDay > 0) return `${diffDay}일 전`;
        if (diffHour > 0) return `${diffHour}시간 전`;
        if (diffMin > 0) return `${diffMin}분 전`;
        return "방금 전";
    }

    const UsedDetailContent = () => {
        if (!detail) return <div><LoadingCircle text={`물건 가져오는 중...`}/></div>;

        const images = [detail.main_img, detail.detail_img1, detail.detail_img2, detail.detail_img3, detail.detail_img4].filter(Boolean);
        const isEdited = detail.create_date !== detail.update_date;
        const baseTime = isEdited ? detail.update_date : detail.create_date;

        return (
            <>
                <div
                    className="position-fixed bottom-0 start-0 m-4"
                    style={{ zIndex: 1050 }}
                >
                    <Button
                        variant="danger"
                        className="d-flex justify-content-center align-items-center shadow rounded-3"
                        style={{ width: '100px', height: '50px', whiteSpace: 'nowrap' }}
                        onClick={handleToggleMenu}
                    >
                        + 글쓰기
                    </Button>

                    {showRegisterMenu && (
                        <div
                            className="bg-danger rounded-3 shadow p-2 mt-3 position-absolute start-0"
                            style={{
                                bottom: '70px',
                                width: '200px',
                                userSelect: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        >
                            {['거래 등록', '공구 등록'].map((label, idx) => {
                                const path = label === '거래 등록'
                                    ? '/trade/deal/register'
                                    : '/trade/gonggu/register';

                                return (
                                    <Button
                                        key={idx}
                                        variant="danger"
                                        className="w-100 text-start mb-2 rounded-2"
                                        onClick={() => handleRegisterNavigate(path)}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <Card className="border-0" style={{ maxWidth: 1100, margin: "30px auto", borderRadius: 18 }}>
                    <Row className="g-0">
                        {/* 왼쪽: 이미지 */}
                        <Col md={6} xs={12}>
                            <div style={{ background: "#fafafa", borderRadius: "18px 0 0 18px", height: "100%", minHeight: 400 }}>
                                <Carousel indicators={images.length > 1}>
                                    {images.length === 0 ? (
                                        <Carousel.Item>
                                            <div className="text-center text-muted p-5">이미지가 없습니다.</div>
                                        </Carousel.Item>
                                    ) : (
                                        images.map((img, idx) => (
                                            <Carousel.Item key={idx}>
                                                <img
                                                    src={img}
                                                    alt={`상세 이미지 ${idx + 1}`}
                                                    style={{
                                                        width: "100%",
                                                        height: 500,
                                                        objectFit: "cover",
                                                        borderRadius: "18px 0 0 18px"
                                                    }}
                                                />
                                            </Carousel.Item>
                                        ))
                                    )}
                                </Carousel>
                            </div>
                        </Col>
                        {/* 오른쪽: 정보 */}
                        <Col md={6} xs={12} className="p-5 d-flex flex-column justify-content-between">
                            <div>
                                <h4 className="fw-bold">{detail.title}</h4>
                                <div className="text-secondary mb-2">
                                    {detail.categories?.name} · {detail.location}
                                    <span className="ms-3">{getDateDiff(baseTime)}{isEdited && (' (수정)')}</span>
                                </div>
                                <div className="mb-3 fs-4 fw-bold" style={{ color: "#333" }}>
                                    {detail.category_id === 5
                                        ? <Badge bg="success" className="fs-6">나눔</Badge>
                                        : `${Number(detail.price).toLocaleString()}원`
                                    }
                                </div>
                                <div className="mb-4" style={{ whiteSpace: "pre-line" }}>{detail.content}</div>
                                <div className="mb-2 text-muted d-flex align-items-center gap-2" style={{ fontSize: 14 }}>
                                    <span>좋아요 {likesCount}</span>
                                    <span>· 조회 {detail.cnt ?? 0}</span>
                                </div>

                                <div className="mb-4 text-muted" style={{ fontSize: 14 }}>
                                    작성자: {detail.users?.name ?? '알 수 없음'}
                                </div>
                                <div className="d-flex gap-2">
                                    {handleButtons()}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </>
        );
    };

    return (
        <div>
            <div ref={shadowHostRef}></div>
            {shadowRoot && createPortal(<UsedDetailContent />, shadowRoot)}
            <Comments productId={detail?.id} categoryId={detail?.category_id} />
        </div>
    );
}

    // const getFinalUrl = (img) => {
    //     if (!img) return null;
    //     return img.startsWith("http") ? img : getImages(img);
    // };