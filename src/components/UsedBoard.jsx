import '../css/usedboard.css';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from "../supabase/supabase";
import { UsedItem } from './UsedItem';
import { LoadingCircle } from './LoadingCircle';
import { useUserTable } from '../hooks/useUserTable';
import { useRegion } from '../hooks/useRegion';
import Loadingfail from '../public/Loadingfail.png'

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
    const [loading, setLoading] = useState(true);
    const user = useUserTable();
    const { item } = useParams();

    const { city, district } = useRegion();
    const region = `${city} ${district}`;

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            let supa = supabase
                .from('trades')
                .select('*,categories(name), users(name)')
                .eq('category_id', categoryId)
                .eq('super_category_id', 3)
                .eq('location', region)
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
            setLoading(false);
            if (error) {
                console.log("error: ", error);
            }
            if (loading) {
                <div>로딩중..</div>
            }
        }
        fetchPosts();
    }, [categoryId, keyword, region]);

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
                    {posts.length === 0 ? (<div style={{ display: 'flex', width: '100%', alignItems: 'center', flexDirection: 'column' }}>
                        <img src={Loadingfail} style={{ width: '50%' }} />
                        <p style={{ fontSize: '1.rem', fontWeight: '700', color: 'var(--base-color-1)' }}>
                            검색 조건이 없거나, 아직 게시글이 없어요!
                        </p>
                    </div>) : posts.map((used) => (
                        <div className="usedboard-col" key={used.id}>
                            <UsedItem used={used}
                                likesCount={used.likesCount}
                                commentsCount={used.commentsCount} />
                        </div>
                    ))}
                </>
                {/* 글쓰기 플로팅 버튼 */}
                {user?.info?.id && (
                    <div className="floating-button-container">
                        <button className="write-button" onClick={() => setShowRegisterMenu(prev => !prev)}>
                            + 글쓰기
                        </button>

                        {showRegisterMenu && (
                            <div className="write-menu">
                                {['거래 등록', '공구 등록'].map((label, idx) => {
                                    // `/trade/${tap}/form` - 하위카테고리 위치에서 등록버튼 처리
                                    // `/trade/deal/form` - 전체페이지 위치에서 등록버튼 처리
                                    const path = label === '거래 등록'
                                        ? item ? `/trade/all/creative` : `/trade/all/creative`
                                        : item ? `/trade/${item}/creative` : `/trade/gonggu/creative`
                                    return (
                                        <button
                                            key={idx}
                                            className="write-menu-item"
                                            onClick={() => navigate(path)}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return <UsedBoardContent />;
}