import "../css/layout.css"
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


// 임시 게시판
const boards = [
    { name: '게시판1' },
    { name: '게시판2' },
    { name: '게시판3' },
]

// 임시 게시판 탭들
const boardsTab = [
    { name: '인테리어&꾸미기' },
    { name: '꿀팁' },
    { name: '탭1' },
]

/** 주소 경로 초기화 */
const board_init = () => {
    // 주소를 브라우저에서 가져온다.
    const location = useLocation();
    // 주소를 / 기준으로 배열화
    const pathSegments =  decodeURIComponent(location.pathname).split('/').filter(Boolean);
    switch(pathSegments[0]){
        case undefined:
        case 'login':
        { return [""] } break;
        default:{ return [...pathSegments] } break;
    }
}

/* children가 <Routes> </Routes> 부분 */
export function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useUserTable();
    const board = board_init()
    const { info:categories, loading:categoriesLoding } = useCategoriesTable();
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
    const handleNavigate = useCallback((e,path)=>{
        e.preventDefault()
        navigate(path)
    },[navigate])

    useEffect(() => {
        //** 지금 현재 스크롤이 맨위 인제 확인 */
        const handleScroll = () => { setAtTop(window.scrollY === 0); };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    

    if(!categoriesLoding) { return <></> } // 로딩페이지 만들어야됨
    return (<div className="layout">
        {/* 헤더부분 */}
        <header className={`${atTop && 'top'}`}>
            {/* 헤더의 첫번째줄 */}
            <div className="breakpoints">
                {/* 로고 이미지 */}
                <img
                className="logo"
                onClick={(e) =>handleNavigate(e,'/')}
                />
                {/* 검색 창*/}
                <form className="inputBox">
                    <input />
                    <button>
                        <FaSearch />
                    </button>
                </form>
                {/* 맨 우측 ui들 */}
                <div className="right">
                    { user.info === null
                        // 비로그인시 로그인 ui
                        ?(<>
                            <p className="link"
                            onClick={(e) =>handleNavigate(e,'/login')}
                            >
                                로그인
                            </p>
                        </>)
                        // 로그인시 내정보, 알람 UI
                        : (<>
                            <p className="link">내정보</p>
                            <a className="shaking">
                                <FaBell />
                            </a>
                        </>)
                    }
                </div>
            </div>
            {/* 헤더 두번째줄 */}
            <div className="breakpoints header">
                {/* 홈은 리스트에 없음으로 먼저 생성 */}
                <p
                className={"board-item " + ("" === board[0] ? 'red' : '')}
                onClick={(e) =>handleNavigate(e,'/')}
                >
                    홈
                </p>
                {/* 임시 게시판 이름 */}
                { categories.map((o, k) =>(
                    <React.Fragment key={k}>
                        {/* 각각 게시판 이름 나열 */}
                        <p
                        className={"board-item " + (o.name === board[0] ? 'red' : '')}
                        onClick={(e) =>handleNavigate(e,`/${o.name}`)}
                        >
                            {o.name}
                        </p>
                    </React.Fragment>)
                )}
                {/* 유저의 정보가 있으면 로그아웃 ui 생성 */}
                { user.info !== null && (
                    <div className="right">
                        <p
                            className="link red"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}
                        >로그아웃</p>
                    </div>
                )}
            </div>
            {/* 모바일 모드시 tap을 상단에 생성 */}
            <div className={`taps ${board[0] === "" && 'none'}`}>
                {/* 게시판의 모든 탭들을 보여주는 ui */}
                <div className="breakpoints">
                    <ul>
                        {/* 전체는 기본적으로 있으니 미리 생성 */}
                        <li
                        className={(undefined === board[1] ? 'select' : '')}
                        onClick={(e) =>handleNavigate(e,`/${board[1]}`)}
                        >
                            전체
                        </li>
                        {/* 임시 데이터 사용하여, 게시판들의 탭들을 나타냄 */}
                        {boardsTab.map((o, k) => 
                            <li
                            key={k}
                            className={(o.name === board[1] ? 'select' : '')}
                            onClick={(e) =>handleNavigate(`/${board[0]}/${o.name}`) }
                            >
                                {o.name}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </header>
        {/* 게시판들의 각 탭들을 나타내는 ui */}
        {/* board_init의 스위치문에 추가하면, 해당 ui들이 안나타남 */}
        {board[0] !== `` ? (
            <div className="breakpoints main margin">
                <p>
                    <a onClick={(e) => handleNavigate(e,'/')} > {'홈 > '}</a>
                    {/* 현재 주소의 위치를 모두 기입 */}
                    { board.map((o, k) => {
                        // 첫번째는 제외
                        if (k === 0) return null;
                        // 마지막껀 현재 위치라 강조 및 링크 제거
                        if(k ===  board.length - 1 ){ return <strong key={k}>{o}</strong>}
                        // 경로
                        else { return(<a key={k}> {o + ' > '}</a>)}
                    })}
                </p>
                {/* 위치 ui */}
                <div>
                    {/* 시 선택 ui */}
                    <select
                    className="select_region"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    >
                    { citys.map((o, k) =>
                        <option key={k}>{o}</option>
                    )}
                    </select>
                    {/* 군구 선택 ui */}
                    <select
                        className="select_region"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                    >{districts.map((o, k) =>
                        <option key={k}>{o}</option>
                    )}</select>
                </div>
                {/* 게시판의 각 탭 표시 */}
                <div>
                    <ul>
                        {/* 전체는 기본적으로 있으니 미리 생성 */}
                        <li
                        className={(undefined === board[2] ? 'select' : '')}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/${board[1]}`)
                        }}
                        >
                            전체
                        </li>
                        {/* 게시판의 각 탭들 표기 */}
                        { boardsTab.map((o, k) => 
                            <li
                            key={k}
                            className={(o.name === board[2] ? 'select' : '')}
                            onClick={(e) =>handleNavigate(e,`/${board[1]}/${o.name}`)}
                            >
                                {o.name}
                            </li>
                        )}
                    </ul>
                    {/* children(페이지) 랜더링 */}
                    <main>{children}</main>
                </div>
            </div>
        )
            //tap 부분이 필요없는 children(페이지) 랜더링
            : (<main className="breakpoints main">{children}</main>)}
        {/* 맨 하단 푸터 */}
        <footer>
            <div className="breakpoints">
                ( 푸터 내용을 적어주세요 )
            </div>
        </footer>
    </div>)
}

