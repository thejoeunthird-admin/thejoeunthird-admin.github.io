// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useSearchParams } from "react-router-dom";
// import { supabase } from "../supabase";
// import { useUserTable } from "../hooks/useUser";
// import { Comments } from "../components/Comments";
// import { useCategoriesTable } from '../hooks/useCategoriesTable';
// import { LoadingCircle } from '../components/LoadingCircle';

import { useCallback, useState } from 'react';
import { Outlet, useLoaderData, useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom';
import { useImage } from '../../../hooks/useImage';
import { Comment } from '@components';
import { useCategories } from '../../../hooks';
import { supabase } from '@/supabase';
import { likeNotification } from '../../../utils/likesNotification';

export { loader } from './loader'
export function Detail() {
    const location = useLocation();
    const { getImages } = useImage();
    const user = useRouteLoaderData('user');
    const { detail, likes, isLike } = useLoaderData();
    const [ like, setLike ] = useState({
        state: isLike,
        count: likes,
    })
    const { findById } = useCategories();
    const navigate = useNavigate();

    const handleDelete = useCallback(async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        await supabase.from("boards").delete().eq("id", detail.id);
        navigate(`/life${location.search}`);
        window.location.reload();
    }, [detail.id, navigate]);

    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const plus9 = new Date(d.getTime() + 9 * 60 * 60 * 1000);
        return `${plus9.getFullYear()}. ${plus9.getMonth() + 1}. ${plus9.getDate()}. ${plus9
            .getHours()
            .toString()
            .padStart(2, "0")}:${plus9.getMinutes().toString().padStart(2, "0")}`;
    }, []);

    const handleLikeToggle = async () => {
        if (!user.access) {
            alert("로그인이 필요합니다.");
            return;
        }
        
        try {
            if (like.state) {
                const { error } = await supabase
                    .from("likes")
                    .delete()
                    .eq("category_id", detail.category_id)
                    .eq("table_id", detail.id)
                    .eq("user_id", user.id);
                if(error) throw error
                setLike({
                    state: false,
                    count: --like.count,
                })
            }
            else {
                const { error } = await supabase
                    .from("likes")
                    .insert({
                        category_id: detail.category_id,
                        table_id: detail.id,
                        user_id: user.id,
                    });
                if(error) throw error
                await likeNotification('boards',detail)
                .then(()=>{ 
                    setLike({
                        state: true,
                        count: ++like.count,
                    })
                })
            }
        } catch (err) {
            console.error("좋아요 처리 오류:", err);
            alert("좋아요 처리 중 오류가 발생했습니다.");
        }
    };

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
                            {detail.categories?.name || "-"}
                        </span>

                    </div>

                </div>

                {/* 제목 */}
                <h1 style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "24px", color: "#333" }}>
                    {detail.title}
                </h1>
                {/* 작성자, 날짜, 조회수 한 줄에 정렬 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    {/* 왼쪽: 날짜 + 조회수 */}
                    <span style={{ color: "#888", fontSize: "13px" }}>
                        {formatDate(detail.create_date)} · 조회 {detail.cnt}
                    </span>

                    {/* 오른쪽: 작성자 */}
                    <span style={{ color: "#888", fontSize: "14px" }}>
                        {detail.users?.name || "익명"}
                    </span>
                </div>


                {/* 메인 이미지 */}
                {detail.main_img && (
                    <img
                        src={getImages(detail.main_img)}
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
                {[
                    detail?.detail_img1,
                    detail?.detail_img2,
                    detail?.detail_img3,
                    detail?.detail_img4,
                ].filter(Boolean).map((img, i) => (
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
                    {detail.contents}
                </div>

                {/* 좋아요 */}
                <div style={{ marginBottom: "20px" }}>
                    <button
                        onClick={handleLikeToggle}
                        style={{
                            padding: "8px 16px",
                            border: like.state ? "1px solid #dc3545" : "1px solid #dc3545",
                            backgroundColor: like.state ? "#dc3545" : "transparent",
                            color: like.state ? "white" : "#dc3545",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                            transition: 'all 0.2s ease-in'
                        }}
                    >
                        {like.state ? "❤️ 좋아요 취소" : "🤍 좋아요"}
                    </button>
                    <span style={{ marginLeft: "12px", color: "#888", fontSize: "14px" }}>
                        좋아요 {like.count}개
                    </span>
                </div>

                {/* 수정/삭제 */}
                {detail.user_id === user.id && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                            onClick={() => navigate(`/life/${findById(detail.category_id).url}/write/${detail.id}?keyword=`)}
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
                <Outlet />
                <Comment product={detail} categoryId={detail.category_id} />
            </div>
        </div>
    );
}