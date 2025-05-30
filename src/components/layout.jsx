import React, { useCallback, useEffect, useState, useRef, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useUserTable } from "../hooks/useUserTable";
import { useDispatch } from 'react-redux';
import { clearUserInfo } from '../store/userReducer';
import { supabase } from "../supabase/supabase";
import { useRegion } from "../hooks/useRegion";
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import "../css/layout.css";
import { LayoutMenu } from './Layout.Menu';
import { LayoutMenuTop } from './Layout.Menu.Top'
import { FaUserCircle } from "react-icons/fa";
import logo from '../logo.png';
import { FaArrowAltCircleRight } from "react-icons/fa";


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

const SearchBar = forwardRef((props, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <form className="inputBox"
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <input 
                ref={ref} 
                placeholder="검색어를 입력해주세요..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
                <button type="submit" className={isFocused ? 'focused' : ''}>
                    {isFocused ? <FaArrowAltCircleRight /> : <FaSearch />}
                </button>
        </form>
    );
});

function SideBar({ }) {

} 

export function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useUserTable();
    const refInput = useRef();
    const location = useLocation();
    const [showSearch, setShowSearch] = useState(false);
    const [humbeger, setHumbeger] = useState(false);
    const { info: categories, loading: categoriesLoding } = useCategoriesTable();
    const board = board_init(categories);
    const {
        city, setCity,
        district, setDistrict,
        citys, districts,
    } = useRegion();
    const [atTop, setAtTop] = useState(true);

    const linkRef = useRef();

    const [isHovering, setIsHovering] = useState(false);
    let hoverTimer = useRef(null);

    // 마우스가 진입했을 때
    const handleMouseEnter = () => {
        clearTimeout(hoverTimer.current);
        setIsHovering(true);
    };

    // 마우스가 완전히 나갔을 때 (약간의 delay로 처리)
    const handleMouseLeave = () => {
        hoverTimer.current = setTimeout(() => {
            setIsHovering(false);
            setHumbeger(false);
        }, 500); // 짧은 딜레이를 주면 사용자 경험이 더 부드러움
    };

    const handleLogout = useCallback(async (e) => {
        e.preventDefault()
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

    useEffect(() => {
        const handleScroll = () => {
            setShowSearch(window.scrollY >= 60);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    if (isLoading()) return <></>;
    return (
        <div className="layout">
            <header className={atTop ? "layout_header top" : "layout_header"}>
                <div className="breakpoints">
                    <img
                        className="logo"
                        src={logo}
                        alt="logo"
                        style={{ transform: 'rotate(305deg)' }}
                        onClick={(e) => handleNavigate(e, '/')}
                    />
                    <div className='displayOff'>
                        <p
                            className={`board-item ${location.pathname === '/' ? 'red' : ''}`}
                            onClick={(e) => handleNavigate(e, `/`)}
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
                    <div className="right">
                        {board.length > 0 && !['my', 'login'].includes(board[0].url) && (<>
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
                            <button
                                className={`serchBtn ${showSearch ? 'show' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (refInput.current) {
                                        refInput.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); // 스무스 스크롤
                                        setTimeout(() => {
                                            refInput.current.focus(); // 포커스
                                        }, 100); // 스크롤이 끝나고 포커스 주기 (지연시간은 조정 가능)
                                    }
                                }}
                            >
                                <FaSearch />
                            </button>
                        </>)}
                        {user.info ? (
                            <div className="profile"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setHumbeger(!humbeger);
                                }}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                {/* <FaBell className='bell shaking' />
                                <FaUserCircle className='red' /> */}
                                <FaBell className='bell' />
                                <FaUserCircle className='' />
                                <div
                                    className={`humbeger ${humbeger ? 'on' : ''}`}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <b className='humbeger_btn'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/my')
                                        }}
                                    >
                                        내정보
                                    </b>
                                    <b className='humbeger_btn'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/my/talk')
                                        }}
                                    >
                                        채팅
                                    </b>
                                    <b className='humbeger_btn logout' onClick={handleLogout}>
                                        로그아웃
                                    </b>
                                </div>
                            </div>)
                            : (
                                <div
                                    className='link'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/login')
                                    }}
                                >
                                    로그인
                                </div>
                            )}
                    </div>
                </div>
                <div
                    ref={linkRef}
                    className="breakpoints header"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}
                >
                    <div className='displayOn' style={{ width: 'calc( 100% - 64px )' }}>
                        <p
                            className={`board-item ${location.pathname === '/' ? 'red' : ''}`}
                            onClick={(e) => handleNavigate(e, `/`)}
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
                </div>
                {board[0] !== undefined && (<LayoutMenuTop board={board} />
                )}
            </header>
            {board[0] !== undefined ? (
                <div className="breakpoints main">
                    <div className="div">
                        <LayoutMenu board={board} />
                        <main className="mainLayout">
                            {board[0].url !== 'my' && (<SearchBar ref={refInput} />)}
                            <main className="mainLayout">
                                <div>{children}</div>
                            </main>
                        </main>
                    </div>
                </div>
            ) : (
                <main className="mainLayout">
                    <div className="div">{children}</div>
                </main>
            )}
            <footer className='layout_footer'>
                <div className="breakpoints">( 푸터 내용을 적어주세요 )</div>
            </footer>
        </div>
    );
}
