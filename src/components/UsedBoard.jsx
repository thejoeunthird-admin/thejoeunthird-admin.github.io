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

            const { data, error } = await supa;
            if (error) {
                console.log("error: ", error);
            }
            if (data) {
                setPosts(data);
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
        // if (!categoryId) {
        //     return <div>존재하지 않는 카테고리입니다.</div>
        // }

        return (
            <div className="usedboard-container">
                <div className="usedboard-grid">
                    {posts.map((used) => (
                        <div className="usedboard-col" key={used.id}>
                            <UsedItem used={used} />
                        </div>
                    ))}
                </div>
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
