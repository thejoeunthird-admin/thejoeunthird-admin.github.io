import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { supabase } from "../supabase/supabase";

export function Likes({ categoryId, tableId, userInfo, detailCnt }) {
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

        // 좋아요 처리 후 알림을 생성하는 함수
        const createLikeNotification = async () => {

            try {
                // 2. category 테이블에서 type 조회
                const { data: categoryData, error: categoryError } = await supabase
                    .from('categories')
                    .select('type')
                    .eq('id', categoryId)
                    .single();
    
                if (categoryError || !categoryData) throw categoryError;
    
                const categoryType = categoryData.type; // ex) 'board', 'trade'
    
                let postTitle = null; // title 
                if (categoryType === 'boards') {
                    const { data, error } = await supabase
                        .from('boards')
                        .select('title')
                        .eq('id', tableId)
                        .single();
    
                    if (error) throw error;
                    postTitle = data.title;
    
    
                } else if (categoryType === 'trades') {
                    const { data, error } = await supabase
                        .from('trades')
                        .select('title')
                        .eq('id', tableId)
                        .single();
                    if (error) throw error;
                    postTitle = data.title;
                }
    
                if (likesCount % 5 === 0 && likesCount > 0) {
                    const { error: notificationError } = await supabase
                        .from('notifications')
                        .insert([{
                            receiver_id: userInfo.id,
                            message: `${postTitle} 게시글이 좋아요 ${likesCount}개를 달성했습니다. `,
                            type: 'likes',
                            table_type: categoryType,
                            table_id: tableId
                        }])
                }
            } catch (error) {
                console.log('알림 생성 중 오류 ', error);
            }
        }

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
            await createLikeNotification(); // 좋아요 알림 함수
        } catch (error) {
            console.error('좋아요 처리 실패:', error);;
            alert('좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLiking(false);
        }
    };


    return (
        <div>
            {userInfo &&
                <Button
                    variant={isLiked ? 'danger' : 'outline-danger'}
                    size="sm"
                    onClick={handleLikeToggle}
                    disabled={isLiking}
                    className="mt-2"
                    style={{ marginBottom:'10px' }}
                >
                    {isLiked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
                </Button>
            }
            <p className="mb-1">❤️ 좋아요 {likesCount} | 👁 조회수 {detailCnt}</p>

        </div>
    );
}