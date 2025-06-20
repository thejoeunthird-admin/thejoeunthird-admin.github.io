import '../css/usedboard.css';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from "../supabase/supabase";
import { UsedItem } from './UsedItem';
import { LoadingCircle } from './LoadingCircle';

export function UsedBoard() {
    const [posts, setPosts] = useState([]);
    const [showRegisterMenu, setShowRegisterMenu] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const CATEGORY_MAP = { sell: 4, share: 5, buy: 6 };
    const categoryId = CATEGORY_MAP[id];
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const keyword = query.get('keyword') || '';



    useEffect(() => {
        const fetchPosts = async () => {
            let supa = supabase
                .from('trades')
                .select('*,categories(name), users(name)')
                .eq('category_id', categoryId)
                .eq('super_category_id', 3)
                .order('create_date', { ascending: false });
            if (keyword) {
                supa = supa.or(
                    `title.ilike.%${keyword}%,content.ilike.%${keyword}%,location.ilike.%${keyword}%`
                );
            }

            const { data: postsData, error } = await supa;


            const postsWithCounts = await Promise.all(
                (postsData || []).map(async (post) => {
                    const { count: commentsCount } = await supabase
                        .from("comments")
                        .select("*", { count: "exact", head: true })
                        .eq("table_id", post.id);

                    const { count: likesCount } = await supabase
                        .from("likes")
                        .select("*", { count: "exact", head: true })
                        .eq("table_id", post.id);

                    return {
                        ...post,
                        commentsCount: commentsCount || 0,
                        likesCount: likesCount || 0,
                    };
                })
            );
            setPosts(postsWithCounts);
            if (error) {
                console.log("error: ", error);
            }
        }
        fetchPosts();
    }, [categoryId, keyword]);

    const handleToggleMenu = () => {
        setShowRegisterMenu(prev => !prev);
    };

    const handleRegisterNavigate = (path) => {
        setShowRegisterMenu(false);
        navigate(path);
    };

    const UsedBoardContent = () => {
        if (!posts) return <div><LoadingCircle /></div>;

        return (
            <div className="usedboard-container">
                <>
                    {posts.map((used) => (
                        <div className="usedboard-col" key={used.id}>
                            <UsedItem used={used}
                            likesCount={used.likesCount}
                            commentsCount={used.commentsCount} />
                        </div>
                    ))}
                </>
                {/* 글쓰기 플로팅 버튼 */}
                <div className="usedboard-fab-zone">
                    <button
                        className="usedboard-fab"
                        onClick={handleToggleMenu}
                    >
                        + 글쓰기
                    </button>
                    {showRegisterMenu && (
                        <div className="usedboard-menu">
                            <button
                                className="usedboard-menu-btn"
                                onClick={() => handleRegisterNavigate('/trade/deal/register')}
                            >
                                거래 등록
                            </button>
                            <button
                                className="usedboard-menu-btn"
                                onClick={() => handleRegisterNavigate('/trade/gonggu/register')}
                            >
                                공구 등록
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return <UsedBoardContent />;
}
