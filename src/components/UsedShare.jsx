import '../css/usedsell.css';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabase/supabase";
import { UsedItem } from './UsedItem';
import { LoadingCircle } from './LoadingCircle';
import { useLocation } from 'react-router-dom';

export function UsedShare() {
    const [posts, setPosts] = useState([]);
    const [showRegisterMenu, setShowRegisterMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const keyword = query.get('keyword') || '';

    useEffect(() => {
        const fetchPosts = async () => {
            let supa = supabase
                .from('trades')
                .select('*,categories(name), users(name)')
                .eq('category_id', 5)
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
    }, [keyword]);

    const handleToggleMenu = () => {
        setShowRegisterMenu(prev => !prev);
    };

    const handleRegisterNavigate = (path) => {
        setShowRegisterMenu(false);
        navigate(path);
    };

    const UsedShareContent = () => {
        if (!posts) return <div><LoadingCircle /></div>;

        return (
            <div className="usedsell-container">
                <div className="usedsell-grid">
                    {posts.map((used) => (
                        <div className="usedsell-col" key={used.id}>
                            <UsedItem used={used} />
                        </div>
                    ))}
                </div>
                {/* 글쓰기 플로팅 버튼 */}
                <div className="usedsell-fab-zone">
                    <button
                        className="usedsell-fab"
                        onClick={handleToggleMenu}
                    >
                        + 글쓰기
                    </button>
                    {showRegisterMenu && (
                        <div className="usedsell-menu">
                            <button
                                className="usedsell-menu-btn"
                                onClick={() => handleRegisterNavigate('/trade/deal/register')}
                            >
                                거래 등록
                            </button>
                            <button
                                className="usedsell-menu-btn"
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

    return <UsedShareContent />;
}
