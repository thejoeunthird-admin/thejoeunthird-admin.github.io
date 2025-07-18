
import { Outlet, useLoaderData, useLocation, useNavigate, useNavigation, useParams, useRevalidator, useSearchParams } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import {
    useRegion,
    useCategories,
    useToken,
} from '@hooks';
import { logo, profile } from '@img'
import { useCallback, useEffect, useState, Fragment, useRef } from 'react';
import { supabase } from '@/supabase'
import { Menu, MenuTop } from './menu';
import { SearchBar } from './searchBar';
import * as S from "./index.styled"
import { useImage } from '../../hooks';

export { loader } from './loader'
export function Layout() {
    const { state:loading } = useRevalidator();
    const navigate = useNavigate();
    const hoverTimer = useRef(null);
    const searchBar = useRef();
    const [isHovering, setIsHovering] = useState(false);
    const [atTop, setAtTop] = useState(true);
    const [humbeger, setHumbeger] = useState(false);
    const location = useLocation().pathname.split('/');
    const pathname = useLocation().pathname;
    const [searchParams, setSearchParams] = useSearchParams();
    const user = useLoaderData();
    const { init: tokenInit } = useToken();
    const { categorie, findByUrl } = useCategories();
    const { region, regionList, setRegion } = useRegion();
    const { getImages } = useImage();

    /**URLSearchParams에 기본 쿼리 키를 초기화합니다.*/
    const initSearchParams = useCallback((searchs) => {
        let change = false;
        let init = Object.fromEntries(searchParams.entries());
        for (let search of searchs) {
            if (!searchParams.has(search)) {
                change = true;
                init[search] = '';
            }
        }
        if (change) { setSearchParams(init); }
    }, [setSearchParams]);    
    /**스크롤 위치를 감지하여, 화면이 최상단인지 여부를 상태로 반영하는 함수*/
    const scrollTop = useCallback(() => {
        const handleScroll = () => setAtTop(window.scrollY === 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    })

    // 마우스가 진입했을 때
    const handleMouseEnter = useCallback(() => {
        clearTimeout(hoverTimer.current);
        setIsHovering(true);
    }, [hoverTimer]);

    // 마우스가 완전히 나갔을 때 (약간의 delay로 처리)
    const handleMouseLeave = useCallback(() => {
        hoverTimer.current = setTimeout(() => {
            setIsHovering(false);
            setHumbeger(false);
        }, 500)
    }, [hoverTimer])

    // 강제 로그아웃
    const handleLogout = useCallback(async (e) => {
        e.preventDefault()
        const { } = await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        tokenInit();
        window.location.reload();
        alert('로그아웃 되었습니다.');
    });

    const handleNavigate = useCallback((e, path) => {
        e.preventDefault();
        console.log(searchParams.toString())
        searchParams.set('keyword','')
        navigate({
            pathname: path,
            search: searchParams.toString() ? `?${searchParams.toString()}` : '',
        });
    }, [navigate, searchParams])

    const handleLogin = useCallback((e) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        newParams.set('redirectFrom', pathname);
        navigate({
            pathname: 'login',
            search: `?${newParams.toString()}`
        });
    }, [navigate, searchParams, location]);

    // 실행 한번만 불러올것들
    useEffect(() => {
        scrollTop();
    }, []);

    // 기본 serchParam 설정
    useEffect(() => {
        const searchs = ['keyword'];
        initSearchParams(searchs);
    }, [searchParams.toString()])
    if (!region) { return (<></>) }
    else {
        return (<>
            <S.Layout>
                <S.Header
                    $state={findByUrl(location[1])}
                >
                    <S.Breakpoint>
                        <div
                            className='logo'
                            onClick={(e) => handleNavigate(e, '/')}
                        >
                            <img src={logo} alt="오생꿀 로고" />
                            <p>오생꿀</p>
                        </ div>
                        <div className='topCategorie'>
                            {categorie.map((o, k) => (
                                <S.TopCategorieTabs
                                    key={k}
                                    $select={location[1] === o.url ? 'true' : 'false'}
                                    onClick={(e) => handleNavigate(e, `/${o.url}`)}
                                >
                                    {o.name}
                                </S.TopCategorieTabs>
                            ))}
                        </div>
                        <div className='right'>
                            <div className='region'>
                                <select
                                    value={region.city}
                                    onChange={(e) => setRegion('city', e.target.value)}
                                >
                                    {regionList.city.map((o, k) => (
                                        <option key={k}>{o}</option>
                                    ))}
                                </select>
                                <select
                                    value={region.district}
                                    onChange={(e) => setRegion('district', e.target.value)}
                                >
                                    {regionList.district.map((o, k) => (
                                        <option key={k}>{o}</option>
                                    ))}
                                </select>
                            </div>
                            {[0].map(() => {
                                const out = ['', 'my'].includes(location[1]) || searchParams.get('keyword') === 'false';
                                if (out) return <Fragment key='only'></Fragment>
                                return (<S.SearchButton
                                    key='only'
                                    $active={atTop}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (searchBar.current) {
                                            searchBar.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            setTimeout(() => {
                                                searchBar.current.focus();
                                            }, 100);
                                        }
                                    }}
                                >
                                    <FaSearch />
                                </S.SearchButton>
                                )
                            })}
                            {findByUrl(location[1])?.url !== 'my' && user.id ?
                                (<div className="profile">
                                    <div
                                        className='imgContent'
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setHumbeger(!humbeger);
                                        }}
                                    >
                                        <img src={user?.img ? getImages(user.img) : profile} />
                                    </div>
                                    <S.HambegerMenu
                                        $active={humbeger}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <b onClick={(e) => { handleNavigate(e, '/my') }}>
                                            내정보
                                        </b>
                                        <b onClick={(e) => { handleNavigate(e, '/my/talk') }}>
                                            채팅
                                        </b>
                                        <b onClick={(e) => { handleNavigate(e, '/notification') }}>
                                            알림
                                        </b>
                                        <b onClick={handleLogout}>
                                            로그아웃
                                        </b>
                                    </S.HambegerMenu>
                                </div>)
                                : !user.name && (
                                    <div
                                        className='loginButton'
                                        onClick={(e) => { handleLogin(e) }}
                                    >
                                        로그인
                                    </div>
                                )
                            }
                        </div>
                    </S.Breakpoint>
                    <S.Breakpoint>
                        <div className='underCategorie'>
                            {categorie.filter(parent => parent.id !== 16).map((o, k) => (
                                <S.underCategorieTab
                                    key={k}
                                    $select={location[1] === o.url ? 'true' : 'false'}
                                    onClick={(e) => handleNavigate(e, `/${o.url}`)}
                                >
                                    {o.name}
                                </S.underCategorieTab>
                            ))}
                        </div>
                    </S.Breakpoint>
                    {findByUrl(location[1])?.children && (<MenuTop location={location} board={findByUrl(location[1])} />)}
                </S.Header>
                {[0].map(() => {
                    const out = !['', 'login', 'my'].includes(location[1]);
                    const menu = !['', 'login'].includes(location[1]);
                    return (<S.Container key='only' $flex={out}>
                        <div className='grid'>
                            {menu && <Menu location={location} board={findByUrl(location[1])} />}
                            { !loading ?<>로딩중입니다.</> 
                            :(<>
                                <main style={{ width: '100%' }}>
                                    {out && <SearchBar ref={searchBar} />}
                                    <Outlet />
                                </main>
                            </>)}
                        </div>
                    </S.Container>)
                })}
            </S.Layout>
        </>)
    }
}
