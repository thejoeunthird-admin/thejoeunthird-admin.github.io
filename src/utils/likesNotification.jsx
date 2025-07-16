import { supabase } from "@/supabase";

// 거래, 게시판 테이블만 가능
export const likeNotification = async (tableType,detail) => {
    try {
        const { count, error } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("category_id", detail.category_id)
            .eq("table_id", detail.id);
        if (count === 0 || error) throw undefined;
        // 5의 배수일 경우 돌린다.
        if (count > 0 && count % 5 === 0) {
            // 디테일 <- 게시자 
            // 세선의 유저토큰 <- 로그인한 유저 
            const { error } = await supabase
                .from('notifications')
                .insert([{
                    receiver_id: detail.user_id,
                    message: `${detail.title} 게시글이 좋아요 ${count}개를 달성했습니다.`,
                    type: 'likes',
                    table_type: tableType,
                    table_id: detail.id
                }]);
            if(error) throw error;
        }
    } catch (error) { return undefined; }

    // try {
    //     // 1. category 테이블에서 type 조회
    //     const { data: categoryData, error: categoryError } = await supabase
    //         .from('categories')
    //         .select('type')
    //         .eq('id', post.category_id)
    //         .single();

    //     if (categoryError || !categoryData) throw categoryError;

    //     const categoryType = categoryData.type; // ex) 'board', 'trade'

    //     let postTitle = null; // title 
    //     let postAuthorId = null;

    //     if (categoryType === 'boards') {
    //         const { data, error } = await supabase
    //             .from('boards')
    //             .select('title, user_id')
    //             .eq('id', post.id)
    //             .single();

    //         if (error) throw error;
    //         postTitle = data.title;
    //         postAuthorId = data.user_id; // 게시글 작성자

    //     } else if (categoryType === 'trades') {
    //         const { data, error } = await supabase
    //             .from('trades')
    //             .select('title, user_id')
    //             .eq('id', post.id)
    //             .single();

    //         if (error) throw error;
    //         postTitle = data.title;
    //         postAuthorId = data.user_id; // 게시글 작성자
    //     }

    //     // 좋아요 갯수가 5개 이상일 때 알림 생성
    //     if (likesCount % 5 === 0 && likesCount > 0) {
    //         const { error: notificationError } = await supabase
    //             .from('notifications')
    //             .insert([{
    //                 receiver_id: postAuthorId, // 게시글 작성자에게 알림
    //                 message: `${postTitle} 게시글이 좋아요 ${likesCount}개를 달성했습니다.`,
    //                 type: 'likes',
    //                 table_type: categoryType,
    //                 table_id: post.id
    //             }]);

    //         // 오류가 있을 경우
    //         if (notificationError) {
    //             console.log('알림 생성 중 오류: ', notificationError);
    //         }
    //     }
    // } catch (error) {
    //     // try-catch로 전체 오류 처리
    //     console.log('알림 생성 중 오류: ', error);
    // }
};