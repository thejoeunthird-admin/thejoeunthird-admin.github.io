import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase";
import { useUserTable } from "../hooks/useUser";
import { Comments } from "../components/Comments";
import { useCategoriesTable } from '../hooks/useCategoriesTable';
import { LoadingCircle } from '../components/LoadingCircle';

const getImages = (path) =>
    `https://mkoiswzigibhylmtkzdh.supabase.co/storage/v1/object/public/images/${path}`;

export default function BoardDetailPage() {
    const { id, tap } = useParams();
    const navigate = useNavigate();
    const user = useUserTable();

    const [post, setPost] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');  

    useEffect(() => {
        async function getUser() {
            const { data } = await supabase.auth.getUser();
            setCurrentUserId(data?.user?.id ?? null);
        }
        getUser();
    }, []);

    console.log(keyword)
    useEffect(() => {
        if (post !== null && keyword !== '') {
            navigate(`/life/${tap}?keyword=${keyword}`)
        }
    }, [keyword])

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

     // 좋아요 처리 후 알림을 생성하는 함수
    const createLikeNotification = async () => {
        try {
            // 1. category 테이블에서 type 조회
            const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('type')
                .eq('id', post.category_id)
                .single();
    
            if (categoryError || !categoryData) throw categoryError;
    
            const categoryType = categoryData.type; // ex) 'board', 'trade'
    
            let postTitle = null; // title 
            let postAuthorId = null;
    
            if (categoryType === 'boards') {
                const { data, error } = await supabase
                    .from('boards')
                    .select('title, user_id')
                    .eq('id', post.id)
                    .single();
    
                if (error) throw error;
                postTitle = data.title;
                postAuthorId = data.user_id; // 게시글 작성자
    
            } else if (categoryType === 'trades') {
                const { data, error } = await supabase
                    .from('trades')
                    .select('title, user_id')
                    .eq('id', post.id)
                    .single();
    
                if (error) throw error;
                postTitle = data.title;
                postAuthorId = data.user_id; // 게시글 작성자
            }
    
            // 좋아요 갯수가 5개 이상일 때 알림 생성
            if (likesCount % 5 === 0 && likesCount > 0) {
                const { error: notificationError } = await supabase
                    .from('notifications')
                    .insert([{
                        receiver_id: postAuthorId, // 게시글 작성자에게 알림
                        message: `${postTitle} 게시글이 좋아요 ${likesCount}개를 달성했습니다.`,
                        type: 'likes',
                        table_type: categoryType,
                        table_id: post.id
                    }]);
    
                // 오류가 있을 경우
                if (notificationError) {
                    console.log('알림 생성 중 오류: ', notificationError);
                }
            }
        } catch (error) {
            // try-catch로 전체 오류 처리
            console.log('알림 생성 중 오류: ', error);
        }
    };
    
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
            await createLikeNotification();
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

    if (loading || !post) {
        return (<div>
            <LoadingCircle />
        </div>);
    }

    const detailImages = [
        post?.detail_img1,
        post?.detail_img2,
        post?.detail_img3,
        post?.detail_img4,
    ].filter(Boolean);

    return (
        <div>
            <div style={{ marginTop: '20px', maxWidth: "1200px", padding: "0 10px" }}>
                {/* 카테고리 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <div>
                        <span style={{
                            backgroundColor: "#f8f9fa",
                            color: "#212529",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            marginRight: "10px"
                        }}>
                            {post.categories?.name || "-"}
                        </span>

                    </div>

                </div>

                {/* 제목 */}
                <h1 style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "24px", color: "#333" }}>
                    {post.title}
                </h1>
                {/* 작성자, 날짜, 조회수 한 줄에 정렬 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    {/* 왼쪽: 날짜 + 조회수 */}
                    <span style={{ color: "#888", fontSize: "13px" }}>
                        {formatDate(post.create_date)} · 조회 {post.cnt}
                    </span>

                    {/* 오른쪽: 작성자 */}
                    <span style={{ color: "#888", fontSize: "14px" }}>
                        {post.users?.name || "익명"}
                    </span>
                </div>


                {/* 메인 이미지 */}
                {post.main_img && (
                    <img
                        src={getImages(post.main_img)}
                        alt="대표 이미지"
                        style={{
                            width: "100%",
                            maxHeight: "400px",
                            objectFit: "contain",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    />
                )}

                {/* 상세 이미지 */}
                {detailImages.map((img, i) => (
                    <img
                        key={i}
                        src={getImages(img)}
                        alt={`상세 이미지 ${i + 1}`}
                        style={{
                            width: "100%",
                            maxHeight: "400px",
                            objectFit: "contain",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    />
                ))}

                {/* 내용 */}
                <div
                    style={{
                        fontSize: "15px",
                        whiteSpace: "pre-line",
                        lineHeight: "1.8",
                        color: "#333",
                        marginBottom: "25px"
                    }}
                >
                    {post.contents}
                </div>

                {/* 좋아요 */}
                <div style={{ marginBottom: "20px" }}>
                    <button
                        onClick={handleLikeToggle}
                        disabled={isLiking}
                        style={{
                            padding: "8px 16px",
                            border: isLiked ? "1px solid #dc3545" : "1px solid #dc3545",
                            backgroundColor: isLiked ? "#dc3545" : "transparent",
                            color: isLiked ? "white" : "#dc3545",
                            borderRadius: "4px",
                            cursor: isLiking ? "not-allowed" : "pointer",
                            fontSize: "14px"
                        }}
                    >
                        {isLiked ? "❤️ 좋아요 취소" : "🤍 좋아요"}
                    </button>
                    <span style={{ marginLeft: "12px", color: "#888", fontSize: "14px" }}>
                        좋아요 {likesCount}개
                    </span>
                </div>

                {/* 수정/삭제 */}
                {post.user_id === currentUserId && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                            onClick={() => navigate(`/life/edit/${post.id}`)}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #0d6efd",
                                backgroundColor: "transparent",
                                color: "#0d6efd",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            수정
                        </button>
                        <button
                            onClick={handleDelete}
                            style={{
                                padding: "8px 16px",
                                border: "1px solid #dc3545",
                                backgroundColor: "transparent",
                                color: "#dc3545",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            삭제
                        </button>
                    </div>
                )}
                <Comments productId={post.id} categoryId={post.category_id} />
            </div>
        </div>
    );
}