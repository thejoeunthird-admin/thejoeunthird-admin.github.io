import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabase'; // 경로는 실제 프로젝트 구조에 맞게 조정
import { useCategoriesTable } from '../hooks/useCategoriesTable'; // 커스텀 훅
import { formatDateTime } from '../utils/formatDateTime'; // 날짜 포매팅 함수

export function MyPageLike({ user }) {
    const { info } = user;
    const [likes, setLikes] = useState([])
    const { findById } = useCategoriesTable();
    const nav = useNavigate();

    const badLike = async (e, table) => {
        try {
            // category_id, table_id, user_id 기준으로 좋아요 레코드 삭제
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('category_id', table.category_id)
                .eq('table_id', table.table_id)
                .eq('user_id', table.user_id);
            if (error) throw error;
            setLikes(prev =>
                prev.map(like =>
                    like.category_id === table.category_id &&
                        like.table_id === table.table_id &&
                        like.user_id === table.user_id
                        ? { ...like, is_liked: true }
                        : like
                )
            );
        } catch (err) {
            console.error("좋아요 취소 중 오류 발생:", err.message);
        }
    };

    const fetchLikesWithCategoryAndItem = async () => {
        try {
            // 1. likes 가져오기
            const { data: likes, error: likesError } = await supabase
                .from('likes')
                .select('*')
                .eq('user_id', info.id);

            if (likesError) throw likesError;
            if (!likes || likes.length === 0) return [];

            // 2. category_id들 중복 없이 추출
            const categoryIds = [...new Set(likes.map(like => like.category_id))];

            // 3. categories 수동 조회
            const { data: categories, error: categoryError } = await supabase
                .from('categories')
                .select('*')
                .in('id', categoryIds);

            if (categoryError) throw categoryError;

            const result = [];

            // 4. 각 like에 category 붙이고 type + table_id 로 item 가져오기
            for (const like of likes) {
                const category = categories.find(cat => cat.id === like.category_id);

                if (!category || !category.type || !like.table_id) {
                    result.push({ ...like, category, item: null });
                    continue;
                }

                // 5. 동적 테이블에서 item 조회
                const { data: item, error: itemError } = await supabase
                    .from(category.type)
                    .select('*')
                    .eq('id', like.table_id)
                    .single();

                if (itemError) {
                    console.warn(`${category.type} 테이블의 id=${like.table_id} 조회 실패`, itemError);
                    // result.push({ ...like, category, item: null });
                } else {
                    result.push({ ...like, category, item });
                }
            }
            setLikes(result);
            return result;
        } catch (err) {
            console.error('❌ 전체 조회 실패:', err);
        }

    };

    useEffect(() => {
        if (!info?.id) return;
        fetchLikesWithCategoryAndItem();
    }, [info?.id]);

    return (
        <>
            <ul className="likes-list">
                <span className='likes-title'>♥️좋아요 목록</span>
                {likes.map((o, k) => (
                    <li
                        key={o.id}
                        className={`likes-item ${o?.is_liked === true ? 'delet' : ''}`}
                        onTransitionEnd={(e) => {
                            if (e.propertyName === 'transform' && o.is_liked) {
                                setLikes(prev => prev.filter(like => like.id !== o.id));
                            }
                        }}
                    >
                        <section className="likes-card">
                            <img alt="main" src={o.item.main_img} className="likes-img" />
                            <span className="likes-category">
                                {`${findById(o.category.parent_id).name} > ${o.category.name}`}
                            </span>
                            <div className="likes-title">{o.item.title}</div>
                            <div className="likes-content">{o.item.content}</div>
                            <div className="likes-footer">
                                <p className="likes-date">{formatDateTime(o.created_date)}</p>
                                <button
                                    className="likes-link-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        nav(`/${findById(o.category.parent_id).url}/${o.category.url}/${o.id}`);
                                    }}
                                >
                                    Link
                                </button>
                                <button className="likes-remove-btn" onClick={(e) => badLike(e, o)}>💔</button>
                            </div>
                        </section>
                    </li>
                ))}
            </ul>
        </>
    );
}