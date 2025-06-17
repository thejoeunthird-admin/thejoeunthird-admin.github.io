import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { supabase } from "../supabase/supabase";

export function Likes({ categoryId, tableId, userInfo }) {
    const [likesCount, setLikesCount] = useState(0); // 좋아요 수
    const [isLiked, setIsLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    // 좋아요 수 및 상태 불러오기
    const fetchLikes = async () => {
        try {
            const { count, error: likeCountError } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', categoryId)
                .eq('table_id', tableId);
            if (!likeCountError) {
                setLikesCount(count);
            }

            // 현재 유저가 좋아요 했는지
            if (userInfo) {
                const { data: likedData } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('category_id', categoryId)
                    .eq('table_id', tableId)
                    .eq('user_id', userInfo.id);

                setIsLiked(likedData.length > 0);
            }

        } catch (error) {
            console.error('좋아요 정보 불러오기 실패 : ', error);
        }
    }

    useEffect(() => {
        fetchLikes();
    }, [categoryId, tableId, userInfo]);

    //좋아요 토글 핸들러
    const handleLikeToggle = async () => {
        if (!userInfo) {
            alert('로그인이 필요합니다.');
            return;
        }

        setIsLiking(true);

        try {
            // 좋아요 취소
            if (isLiked) {
                await supabase
                    .from('likes')
                    .delete()
                    .eq('category_id', categoryId)
                    .eq('table_id', tableId)
                    .eq('user_id', userInfo.id);

                setIsLiked(false);
            } else {
                // 좋아요 추가
                await supabase
                    .from('likes')
                    .insert({
                        category_id: categoryId,
                        table_id: tableId,
                        user_id: userInfo.id
                    });
                setIsLiked(true);
            }
            await fetchLikes(); // 상태 갱신
        } catch (error) {
            console.error('좋아요 처리 실패:', error);;
            alert('좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div>
            <p className="mb-1"><i className="bi bi-heart-fill text-danger"></i> 좋아요</p>
            <p className="fw-semibold">{likesCount}</p>
            <Button
                variant={isLiked ? 'danger' : 'outline-danger'}
                size="sm"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className="mt-2"
            >
                {isLiked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
            </Button>
        </div>
    );
}