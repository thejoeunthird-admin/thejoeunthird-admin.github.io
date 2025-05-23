import styles from "../css/layout.module.css"
import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useUserTable } from "../hooks/useUserTable";
import { useDispatch } from 'react-redux';
import { clearUserInfo } from '../store/userReducer';
import { supabase } from "../supabase/supabase";
import { useRegion } from "../hooks/useRegion";
import { useCategoriesTable } from "../hooks/useCategoriesTable";

/** 주소 경로 초기화 */
const board_init = (categories) => {
    // 주소를 브라우저에서 가져온다.
    const location = useLocation();
    // 주소를 / 기준으로 배열화
    const pathSegments = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    switch (pathSegments[0]) {
        case undefined:
        case 'login':
            { return [""] } break;
        default: {
            // 전체 카테고리를 돌려 확인하여 이름으로 돌려줌
            if(categories !== null){
                let stop = false;
                for(let i=0; i < pathSegments.length; i++){
                    for(let j=0; j < categories.length; j++){
                        if(categories[j].url === pathSegments[i]){
                            pathSegments[i] = categories[j].name
                            break;
                        }
                    }
                    if(stop) { break; }
                }
            }
            return [...pathSegments] 
        } break;
    }
}

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

    /** 이름 찾기 */
    const isCategories = useCallback((name)=>{
        const targetItem = categories.find(item => item.url === board[0]);
        if(targetItem.url === name){
            return targetItem.name
        } else ''
    
    },[categories,board])

    /** 필요한 데이터가 모두 로딩되었는지 확인 */
    const isLoading = useCallback(()=>{
        let result = true;
        const list = [
            categoriesLoding,
        ]
        for(let i=0; i <list.length; i++){
            result = list[i];
            if(!result) { break; }
        }
        return !result;
    },[categoriesLoding])

    useEffect(() => {
        //** 지금 현재 스크롤이 맨위 인제 확인 */
        const handleScroll = () => { setAtTop(window.scrollY === 0); };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (isLoading()) { return <></> } // 로딩페이지 만들어야됨
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
                    <p
                        className={`${styles['board-item']} ${("" === board[0] ? styles.red : '')}`}
                        onClick={(e) => handleNavigate(e, '/')}
                    >
                        홈
                    </p>
                    {/* 임시 게시판 이름 */}
                    {categories.filter(category => category.type === 'header').map((o, k) => (
                        <React.Fragment key={k}>
                            {/* 각각 게시판 이름 나열 */}
                            <p
                                className={`${styles['board-item']} ${(o.name === board[0] ? styles.red : '')}`}
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
            <div className={`${styles.taps} ${board[0] === "" ? styles.none : ''}`}>
                {/* 게시판의 모든 탭들을 보여주는 ui */}
                <div className={styles.breakpoints}>
                    <ul>
                        {/* 전체는 기본적으로 있으니 미리 생성 */}
                        <li
                            className={board[1] === undefined ? styles.select : ''}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/${board[0]}`);
                            }}
                        >
                            전체
                        </li>
                        {/* 게시판의 각 탭들 표기 */}
                        {categories.filter(category => category.type === board[0]).map((o, k) => (
                            <li
                                key={k}
                                className={o.name === board[1] ? styles.select : ''}
                                onClick={(e) => handleNavigate(e, `/${board[0]}/${o.name}`)}
                            >
                                {o.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
        {/* 게시판들의 각 탭들을 나타내는 ui */}
        {/* board_init의 스위치문에 추가하면, 해당 ui들이 안나타남 */}
        {board[0] !== `` ? (
            <div className={`${styles.breakpoints} ${styles.main}`}>
                <p className={styles.p}>
                    <a onClick={(e) => handleNavigate(e, '/')} > {'홈 > '}</a>
                    {/* 현재 주소의 위치를 모두 기입 */}
                    {board.map((o, k) => {
                        // 마지막껀 현재 위치라 강조 및 링크 제거
                        if (k === board.length - 1) {
                            return <strong key={k} className={styles.strong}>{o}</strong>;
                        } else {
                            // 경로
                            return <a key={k}> {o + ' > '}</a>;
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
                                navigate(`/${board[0]}`);
                            }}
                        >
                            전체
                        </li>
                        {/* 게시판의 각 탭들 표기 */}
                        {categories.filter(category => category.type === board[0]).map((o, k) => (
                            <li
                                key={k}
                                className={o.name === board[1] ? `${styles.li} ${styles.select}` : styles.li}
                                onClick={(e) => handleNavigate(e, `/${board[0]}/${o.name}`)}
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

