import styles from "../css/layout.module.css"
import React, { useCallback } from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { FaBell } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useUserTable } from "../hooks/useUserTable";
import { useDispatch } from 'react-redux';
import { clearUserInfo } from '../store/userReducer';
import { supabase } from "../supabase/supabase";
import { useRegion } from "../hooks/useRegion";
import { useCategoriesTable } from "../hooks/useCategoriesTable";

const board_init = (categories) => {
    const location = useLocation();
    if (!categories) return;
    const pathSegments = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    // 초기화된 경로 결과를 저장할 배열
    const matchedPath = [];
    let currentLevel = categories;

    for (const segment of pathSegments) {
        const found = currentLevel.find(cat => cat.url === segment);
        if (!found) break;

        matchedPath.push(found);
        currentLevel = found.children || []; // 다음 단계로 이동
    }
    return matchedPath; // 계단식으로 탐색된 카테고리 배열
};

/* children가 <Routes> </Routes> 부분 */
export function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useUserTable();
    const { info: categories, loading: categoriesLoding } = useCategoriesTable();
    const board = board_init(categories);
    const {
        city, setCity,
        district, setDistrict,
        citys, districts,
    } = useRegion();
    /** 현재 최상단인지 확인 */
    const [atTop, setAtTop] = useState(true);

    /** 로그아웃 */
    const handleLogout = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('로그아웃 실패: ' + error.message);
        } else {
            dispatch(clearUserInfo());
        }
    }, [dispatch]);

    /** path에 입력된 값으로 주소값을 바꿔줌 */
    const handleNavigate = useCallback((e, path) => {
        e.preventDefault()
        navigate(path)
    }, [navigate])

    /** 필요한 데이터가 모두 로딩되었는지 확인 */
    const isLoading = useCallback(() => {
        let result = false;
        const loadingStates = [
            categoriesLoding,
        ];

        for (let i = 0; i < loadingStates.length; i++) {
            if (loadingStates[i]) {
                result = true;
                break;
            }
        }
        return result;
    }, [categoriesLoding])

    useEffect(() => {
        //** 지금 현재 스크롤이 맨위 인제 확인 */
        const handleScroll = () => { setAtTop(window.scrollY === 0); };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (isLoading()) { return <></> }
    //console.log(board)
    return (<div className={styles.layout}>
        {/* 헤더부분 */}
        <header className={atTop ?styles.top:''}>
            {/* 헤더의 첫번째줄 */}
            <div className={styles.breakpoints}>
                {/* 로고 이미지 */}
                <img
                    className={styles.logo}
                    onClick={(e) => handleNavigate(e, '/')}
                />
                {/* 검색 창*/}
                <form className={styles.inputBox}>
                    <input />
                    <button>
                        <FaSearch />
                    </button>
                </form>
                {/* 맨 우측 ui들 */}
                <div className={styles.right}>
                    {user.info === null
                        // 비로그인시 로그인 ui
                        ? (<>
                            <p
                                className={styles.link}
                                onClick={(e) => handleNavigate(e, '/login')}
                            >
                                로그인
                            </p>
                        </>)
                        // 로그인시 내정보, 알람 UI
                        : (<>
                            <p className={styles.link}>내정보</p>
                            <a className={styles.shaking}>
                                <FaBell />
                            </a>
                        </>)
                    }
                </div>
            </div>
            {/* 헤더 두번째줄 */}
            <div className={`${styles.breakpoints} ${styles.header}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}
            >
                {/* 홈은 리스트에 없음으로 먼저 생성 */}
                <div
                    style={{ width: 'calc( 100% - 64px )' }}
                >
                    { console.log(board[0]?.url)}
                    <p
                        className={`${styles['board-item']} ${(board.length == 0? styles.red : '')}`}
                        onClick={(e) => handleNavigate(e, '/')}
                    >
                        홈
                    </p>
                    {/* 임시 게시판 이름 */}
                    {categories.map((o, k) => (
                        <React.Fragment key={k}>
                            {/* 각각 게시판 이름 나열 */}
                            <p
                                className={`${styles['board-item']} ${(o.url == board[0]?.url ? styles.red : '')}`}
                                onClick={(e) => handleNavigate(e, `/${o.url}`)}
                            >
                                {o.name}
                            </p>
                        </React.Fragment>)
                    )}
                </div>
                {/* 유저의 정보가 있으면 로그아웃 ui 생성 */}
                {user.info !== null && (
                    <div
                        className={styles.right}
                        style={{ width: '64px', flexShrink: 0 }}
                    >
                        <p
                            className={`${styles.link} ${styles.red}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}
                        >로그아웃</p>
                    </div>
                )}
            </div>
            {/* 모바일 모드시 tap을 상단에 생성 */}
            { board[0] !== undefined && (
            <div className={`${styles.taps}`}>
                {/* 게시판의 모든 탭들을 보여주는 ui */}
                <div className={styles.breakpoints}>
                    <ul>
                        {/* 전체는 기본적으로 있으니 미리 생성 */}
                        <li
                            className={board[1] === undefined ? styles.select : ''}
                            style={{ whiteSpace:'nowrap', textOverflow: 'ellipsis'  }}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/${board[0].url}`);
                            }}
                        >
                            전체
                        </li>
                        { board[0].children.map((o, k) => (
                            <li
                                key={k}
                                className={o.url === board[1]?.url ? styles.select : ''}
                                style={{ whiteSpace:'nowrap', textOverflow: 'ellipsis' }}
                                onClick={(e) => handleNavigate(e, `/${board[0].url}/${o.url}`)}
                            >
                                {o.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>)}
        </header>
        {/* 게시판들의 각 탭들을 나타내는 ui */}
        {/* board_init의 스위치문에 추가하면, 해당 ui들이 안나타남 */}
        {board[0] !== undefined ? (
            <div className={`${styles.breakpoints} ${styles.main}`}>
                <p className={styles.p}>
                    <a onClick={(e) => handleNavigate(e, '/')} > {'홈 > '}</a>
                    {/* 현재 주소의 위치를 모두 기입 */}
                    {board.map((o, k) => {
                        if (k === board.length - 1) {
                            return <strong key={k} className={styles.strong}>{o.name }</strong>;
                        } else {
                            return <a key={k}> {o.name + ' > '}</a>;
                        }
                    })}
                </p>
                {/* 위치 ui */}
                <div className={styles.div}>
                    {/* 시 선택 ui */}
                    <select
                        className={styles.select_region}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        {citys.map((o, k) => (
                            <option key={k}>{o}</option>
                        ))}
                    </select>
                    {/* 군구 선택 ui */}
                    <select
                        className={styles.select_region}
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                    >
                        {districts.map((o, k) => (
                            <option key={k}>{o}</option>
                        ))}
                    </select>
                </div>
                {/* 게시판의 각 탭 표시 */}
                <div className={styles.div}>
                    <ul className={styles.ul}>
                        {/* 전체는 기본적으로 있으니 미리 생성 */}
                        <li
                            className={board[1] === undefined ? `${styles.li} ${styles.select}` : styles.li}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/${board[0].url}`);
                            }}
                        >
                            전체
                        </li>
                        {/* 게시판의 각 탭들 표기 */}
                        {board[0].children.map((o, k) => (
                            <li
                                key={k}
                                className={o.url === board[1]?.url ? `${styles.li} ${styles.select}` : styles.li}
                                onClick={(e) => handleNavigate(e, `/${board[0].url}/${o.url}`)}
                            >
                                {o.name}
                            </li>
                        ))}
                    </ul>
                    {/* children(페이지) 랜더링 */}
                    <main className={styles.mainLayout}>
                        {children}    
                    </main>
                </div>
            </div>
        ) : (
            // tap 부분이 필요없는 children(페이지) 랜더링
            <main className={styles.mainLayout}>
                <div className={styles.div}> {children} </div>    
            </main>
        )}
        {/* 맨 하단 푸터 */}
        <footer>
            <div className={styles.breakpoints}>
                ( 푸터 내용을 적어주세요 )
            </div>
        </footer>

    </div>)
}

