import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useUserTable } from "../hooks/useUserTable";
import { useDispatch } from 'react-redux';
import { clearUserInfo } from '../store/userReducer';
import { supabase } from "../supabase/supabase";
import { useRegion } from "../hooks/useRegion";
import { useCategoriesTable } from "../hooks/useCategoriesTable";

import "../css/layout.css";  // CSS 모듈 -> 일반 전역 CSS 임포트

const board_init = (categories) => {
    const location = useLocation();
    if (!categories) return;
    const pathSegments = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    const matchedPath = [];
    let currentLevel = categories;
    for (const segment of pathSegments) {
        const found = currentLevel.find(cat => cat.url === segment);
        if (!found) break;
        matchedPath.push(found);
        currentLevel = found.children || [];
    }
    return matchedPath;
};

export function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useUserTable();
    const location = useLocation();
    const { info: categories, loading: categoriesLoding } = useCategoriesTable();
    const board = board_init(categories);
    const {
        city, setCity,
        district, setDistrict,
        citys, districts,
    } = useRegion();
    const [atTop, setAtTop] = useState(true);
    
    const handleLogout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('로그아웃 실패: ' + error.message);
        } else {
            alert('로그아웃 되었습니다.');
            dispatch(clearUserInfo());
        }
    }, [dispatch]);

    const handleNavigate = useCallback((e, path) => {
        e.preventDefault();
        navigate(path);
    }, [navigate]);

    const isLoading = useCallback(() => {
        return categoriesLoding;
    }, [categoriesLoding]);

    useEffect(() => {
        const handleScroll = () => setAtTop(window.scrollY === 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    if (isLoading()) return <></>;

    return (
        <div className="layout">
            <header className={atTop ? "top" : ""}>
                <div className="breakpoints">
                    <img
                        className="logo"
                        onClick={(e) => handleNavigate(e, '/')}
                    />
                    <form className="inputBox">
                        <input placeholder="검색" />
                        <button>
                            <FaSearch />
                        </button>
                    </form>
                    <div className="right">
                        {user.info === null ? (
                            <p
                                className="link"
                                onClick={(e) => handleNavigate(e, '/login')}
                            >
                                로그인
                            </p>
                        ) : (
                            <>
                                <p
                                    className="link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/my');
                                    }}
                                >
                                    내정보
                                </p>
                                <a className="shaking">
                                    <FaBell />
                                </a>
                            </>
                        )}
                    </div>
                </div>
                <div
                    className="breakpoints header"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}
                >
                    <div style={{ width: 'calc( 100% - 64px )' }}>
                        <p
                            className={`board-item ${location.pathname === '/' ? 'red' : ''}`}
                            onClick={(e) => handleNavigate(e, '/')}
                        >
                            홈
                        </p>
                        {categories.filter((o) => o.id !== 16).map((o, k) => (
                            <React.Fragment key={k}>
                                <p
                                    className={`board-item ${o.url === board[0]?.url ? 'red' : ''}`}
                                    onClick={(e) => handleNavigate(e, `/${o.url}`)}
                                >
                                    {o.name}
                                </p>
                            </React.Fragment>
                        ))}
                    </div>
                    {user.info !== null && (
                        <div className="right" style={{ width: '64px', flexShrink: 0 }}>
                            <p
                                className="link red"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLogout();
                                }}
                            >
                                로그아웃
                            </p>
                        </div>
                    )}
                </div>
                {board[0] !== undefined && (
                    <div className="taps">
                        <div className="breakpoints">
                            <ul>
                                <li
                                    className={board[1] === undefined ? 'select' : ''}
                                    style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate(`/${board[0].url}`);
                                    }}
                                >
                                    {board[0].url !== 'my' ? "전체" : "내정보"}
                                </li>
                                {board[0].children.map((o, k) => (
                                    <li
                                        key={k}
                                        className={o.url === board[1]?.url ? 'select' : ''}
                                        style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                                        onClick={(e) => handleNavigate(e, `/${board[0].url}/${o.url}`)}
                                    >
                                        {o.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </header>
            {board[0] !== undefined ? (
                <div className="breakpoints main">
                    <p className="p">
                        <a onClick={(e) => handleNavigate(e, '/')}> {'홈 > '} </a>
                        {board.map((o, k) => {
                            if (k === board.length - 1) {
                                return <strong key={k} className="strong">{o.name}</strong>;
                            } else {
                                return <a key={k}> {o.name + ' > '}</a>;
                            }
                        })}
                    </p>
                    {board[0].url !== 'my' && (
                        <div className="div">
                            <select
                                className="select_region"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            >
                                {citys.map((o, k) => (
                                    <option key={k}>{o}</option>
                                ))}
                            </select>
                            <select
                                className="select_region"
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                            >
                                {districts.map((o, k) => (
                                    <option key={k}>{o}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="div">
                        <ul className="ul">
                            <li
                                className={board[1] === undefined ? 'li select' : 'li'}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/${board[0].url}`);
                                }}
                            >
                                {board[0].url !== 'my' ? "전체" : "내정보"}
                            </li>
                            {board[0].children.map((o, k) => (
                                <li
                                    key={k}
                                    className={o.url === board[1]?.url ? 'li select' : 'li'}
                                    onClick={(e) => handleNavigate(e, `/${board[0].url}/${o.url}`)}
                                >
                                    {o.name}
                                </li>
                            ))}
                        </ul>
                        <main className="mainLayout">
                            {children}
                        </main>
                        
                    </div>
                </div>
            ) : (
                <main className="mainLayout">
                    <div className="div">{children}</div>
                </main>
            )}
            <footer>
                <div className="breakpoints">( 푸터 내용을 적어주세요 )</div>
            </footer>
        </div>
    );
}
