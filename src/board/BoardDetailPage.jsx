import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Badge, Image } from "react-bootstrap";
import { supabase } from "../supabase/supabase";
import { useUserTable } from "../hooks/useUserTable";
import { Comments } from "../components/Comments";

const getImages = (path) =>
    `https://mkoiswzigibhylmtkzdh.supabase.co/storage/v1/object/public/images/${path}`;

export default function BoardDetailPage() {
    const shadowHostRef = useRef(null);
    const [shadowRoot, setShadowRoot] = useState(null);
    
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserTable();

    const [post, setPost] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

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

    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser();
            setCurrentUserId(data?.user?.id ?? null);
        }
        getUser();
    }, []);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            const numericId = Number(id);
            if (isNaN(numericId)) return;

            const { data: postData, error } = await supabase
                .from("boards")
                .select("*, users(name), categories(name)")
                .eq("id", numericId)
                .single();

            if (!postData || error) {
                setLoading(false);
                return;
            }

            await supabase
                .from("boards")
                .update({ cnt: (postData.cnt ?? 0) + 1 })
                .eq("id", numericId);

            setPost({ ...postData, cnt: (postData.cnt ?? 0) + 1 });
            setLoading(false);
        };
        fetchDetail();
    }, [id]);

    useEffect(() => {
        const fetchLikes = async () => {
            if (!post) return;

            const { count } = await supabase
                .from("likes")
                .select("*", { count: "exact", head: true })
                .eq("category_id", post.category_id)
                .eq("table_id", post.id);
            setLikesCount(count || 0);

            if (user.info) {
                const { data } = await supabase
                    .from("likes")
                    .select("id")
                    .eq("category_id", post.category_id)
                    .eq("table_id", post.id)
                    .eq("user_id", user.info.id);
                setIsLiked(data.length > 0);
            } else {
                setIsLiked(false);
            }
        };

        fetchLikes();
    }, [post, user.info]);

    const handleLikeToggle = async () => {
        if (!user.info || !post) {
            alert("로그인이 필요합니다.");
            return;
        }

        setIsLiking(true);
        try {
            if (isLiked) {
                await supabase
                    .from("likes")
                    .delete()
                    .eq("category_id", post.category_id)
                    .eq("table_id", post.id)
                    .eq("user_id", user.info.id);
                setIsLiked(false);
            } else {
                await supabase
                    .from("likes")
                    .insert({
                        category_id: post.category_id,
                        table_id: post.id,
                        user_id: user.info.id,
                    });
                setIsLiked(true);
            }

            const { count } = await supabase
                .from("likes")
                .select("*", { count: "exact", head: true })
                .eq("category_id", post.category_id)
                .eq("table_id", post.id);
            setLikesCount(count || 0);
        } catch (err) {
            console.error("좋아요 처리 오류:", err);
            alert("좋아요 처리 중 오류가 발생했습니다.");
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        await supabase.from("boards").delete().eq("id", post.id);
        navigate("/life/all");
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const plus9 = new Date(d.getTime() + 9 * 60 * 60 * 1000);
        return `${plus9.getFullYear()}. ${plus9.getMonth() + 1}. ${plus9.getDate()}. ${plus9
            .getHours()
            .toString()
            .padStart(2, "0")}:${plus9.getMinutes().toString().padStart(2, "0")}`;
    };

    const BoardDetailContent = () => {
        const detailImages = [
            post?.detail_img1,
            post?.detail_img2,
            post?.detail_img3,
            post?.detail_img4,
        ].filter(Boolean);

        if (loading || !post) {
            return (
                <Container className="text-center py-5">
                    <Spinner animation="border" />
                </Container>
            );
        }

        return (
            <>
                {/* 본문 카드 영역 */}
                <Container style={{ margin: "30px auto" }}>
                    {/* <Card className="shadow rounded-4 border-0 p-4"> */}
                        {/* 상단 버튼 */}
                        <div className="d-flex justify-content-end mb-3">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => navigate(-1)}
                                style={{ borderRadius: 8 }}
                            >
                                목록
                            </Button>
                        </div>

                        {/* 카테고리, 날짜, 조회수 */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <Badge bg="light" text="dark" className="me-2">
                                    {post.categories?.name || "-"}
                                </Badge>
                                <span style={{ color: "#888", fontSize: 13 }}>
                                    {formatDate(post.create_date)} · 조회 {post.cnt}
                                </span>
                            </div>
                            <div style={{ color: "#888", fontSize: 14 }}>
                                {post.users?.name || "익명"}
                            </div>
                        </div>

                        {/* 제목 */}
                        <h2 className="fw-bold mb-3">{post.title}</h2>

                        {/* 메인 이미지 */}
                        {post.main_img && (
                            <Image
                                src={getImages(post.main_img)}
                                alt="대표 이미지"
                                rounded
                                className="mb-3"
                                style={{ width: "100%", maxHeight: 400, objectFit: "contain" }}
                            />
                        )}

                        {/* 상세 이미지 */}
                        {detailImages.map((img, i) => (
                            <Image
                                key={i}
                                src={getImages(img)}
                                alt={`상세 이미지 ${i + 1}`}
                                rounded
                                className="mb-3"
                                style={{ width: "100%", maxHeight: 400, objectFit: "contain" }}
                            />
                        ))}

                        {/* 내용 */}
                        <div
                            style={{
                                fontSize: 15,
                                whiteSpace: "pre-line",
                                lineHeight: 1.8,
                                color: "#333",
                            }}
                            className="mb-4"
                        >
                            {post.contents}
                        </div>

                        {/* 좋아요 */}
                        <div className="mb-3">
                            <Button
                                variant={isLiked ? "danger" : "outline-danger"}
                                size="sm"
                                onClick={handleLikeToggle}
                                disabled={isLiking}
                            >
                                {isLiked ? "❤️ 좋아요 취소" : "🤍 좋아요"}
                            </Button>
                            <span style={{ marginLeft: 12, color: "#888", fontSize: 14 }}>
                                좋아요 {likesCount}개
                            </span>
                        </div>

                        {/* 수정/삭제 */}
                        {post.user_id === currentUserId && (
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={() => navigate(`/life/edit/${post.id}`)}
                                >
                                    수정
                                </Button>
                                <Button variant="outline-danger" onClick={handleDelete}>
                                    삭제
                                </Button>
                            </div>
                        )}
                    {/* </Card> */}
                </Container>
            </>
        );
    };

    return (
        <div>
            <div ref={shadowHostRef}></div>
            {shadowRoot && createPortal(<BoardDetailContent />, shadowRoot)}
            {/* 댓글 영역 */}
            {!loading && post && ( <Comments productId={post.id} categoryId={post.category_id} /> )}
        </div>
    );
}