import "../css/layout.css"
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBell } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getUser } from "../utils/getUser";
import { useUserTable } from "../hooks/useUserTable";
import { useDispatch } from 'react-redux';
import { clearUserInfo } from '../store/userReducer';
import { supabase } from "../supabase/supabase";
import { FaAngleDown } from "react-icons/fa";
import region from '../utils/region.json';


const boards = [
    { name: '게시판1' },
    { name: '게시판2' },
    { name: '게시판3' },
]

const boardsTab = [
    { name: '인테리어&꾸미기' },
    { name: '꿀팁' },
    { name: '탭1' },
]

const board_init = ({ pathname }) => {
    // 디코딩된 경로: 예) "/게시판/인테리어&꾸미기"
    const decodedPath = decodeURIComponent(pathname);

    // "/" 기준으로 나눔
    const pathSegments = decodedPath.split('/').filter(Boolean);  // 빈 문자열 제거

    if (pathSegments[0] === undefined || pathSegments[0] === 'login') { return ["", ""] }
    return ['', ...pathSegments];
}

export function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [atTop, setAtTop] = useState(true);
    const location = useLocation();
    const [board, setBoard] = useState(board_init(location)); // 로그인 리다이렉트때가 문젠데?
    const user = useUserTable();
    const [toogle1, setToogle1] = useState({
        state: Object.keys(region)[0],
        boolean: true
    })
    const [toogle2, setToogle2] = useState({
        state: region[Object.keys(region)[0]][0],
        boolean: true,
    })

    const toogle1list = Object.keys(region);
    const toogle2list = region[toogle1.state];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('로그아웃 실패: ' + error.message);
        } else {
            dispatch(clearUserInfo());
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setAtTop(window.scrollY === 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (<>
        <div className="layout">
            <header className={`${atTop && 'top'}`}>
                <div className="breakpoints">
                    <img
                        className="logo"
                        onClick={(e) => {
                            e.preventDefault();
                            setBoard(["", ""])
                            navigate(`/`)
                        }}
                    />
                    <form className="inputBox">
                        <input />
                        <button>
                            <FaSearch />
                        </button>
                    </form>
                    <div className="right">
                        {user.info === null
                            ? (<>
                                <p
                                    className="link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setBoard(["", ""])
                                        navigate("/login")
                                    }}
                                >
                                    로그인
                                </p>
                            </>)
                            : (<>
                                <p className="link">내정보</p>
                                <a className="shaking">
                                    <FaBell />
                                </a>
                            </>)
                        }
                    </div>
                </div>
                <div className="breakpoints header">
                    <p
                        className={"board-item " + ("" === board[1] ? 'red' : '')}
                        onClick={(e) => {
                            e.preventDefault();
                            setBoard(["", ""])
                            navigate(`/`)
                        }}
                    >
                        홈
                    </p>
                    {boards.map((o, k) => {
                        return (<React.Fragment key={k}>
                            <p
                                className={"board-item " + (o.name === board[1] ? 'red' : '')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setBoard(["", o.name])
                                    navigate(`/${o.name}`)
                                }}
                            >
                                {o.name}
                            </p>
                        </React.Fragment>)
                    })}
                    {user.info !== null && (
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
                <div className={`taps ${board[1] === "" && 'none'}`}>
                    <div className="breakpoints">
                        <ul>
                            <li
                                className={(undefined === board[2] ? 'select' : '')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setBoard(["", board[1]])
                                    navigate(`/${board[1]}`)
                                }}
                            >
                                전체
                            </li>
                            {boardsTab.map((o, k) => {
                                return (
                                    <li
                                        key={k}
                                        className={(o.name === board[2] ? 'select' : '')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setBoard(["", board[1], o.name])
                                            navigate(`/${board[1]}/${o.name}`)
                                        }}
                                    >
                                        {o.name}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </header>
            {board[1] !== `` ? (
                <div className="breakpoints main margin">
                    <p>
                        <a
                            onClick={(e) => {
                                e.preventDefault();
                                setBoard(["", ""])
                                navigate("/")
                            }}
                        >{'홈 > '}</a>
                        {board.map((o, k) => {
                            if (k === 0) return null;
                            return k === board.length - 1 ? (
                                <strong key={k}>{o}</strong>
                            ) : (
                                <a key={k}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setBoard(["", board[1]])
                                    }}
                                >{o + ' > '}</a>
                            );
                        })}
                    </p>
                    <div>
                        <div className="toogle_item">
                            <div
                                onClick={(e) => {
                                    setToogle1({
                                        ...toogle1,
                                        boolean: !toogle1.boolean
                                    })
                                }}
                            >
                                <p>{toogle1.state}</p><FaAngleDown />
                                <span className={`toogle_list ${toogle1.boolean && 'hover'}`}>
                                    {toogle1list.map((o, k) =>
                                        <b
                                            key={k}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation()
                                                setToogle1({
                                                    ...toogle1,
                                                    state: o,
                                                    boolean: !toogle1.boolean
                                                })
                                                setToogle2({
                                                    state: region[o][0],
                                                    boolean: true,
                                                })
                                            }}
                                        >{o}</b>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="toogle_item">
                            <div
                                onClick={(e) => {
                                    setToogle2({
                                        ...toogle2,
                                        boolean: !toogle2.boolean
                                    })
                                }}
                            >
                                <p>{toogle2.state}</p><FaAngleDown />
                                <span className={`toogle_list ${toogle2.boolean && 'hover'}`}>
                                    {toogle2list.map((o, k) =>
                                        <b
                                            key={k}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation()
                                                setToogle2({
                                                    state: o,
                                                    boolean: true,
                                                })
                                            }}
                                        >{o}</b>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <ul>
                            <li
                                className={(undefined === board[2] ? 'select' : '')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setBoard(["", board[1]])
                                    navigate(`/${board[1]}`)
                                }}
                            >
                                전체
                            </li>
                            {boardsTab.map((o, k) => {
                                return (
                                    <li
                                        key={k}
                                        className={(o.name === board[2] ? 'select' : '')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setBoard(["", board[1], o.name])
                                            navigate(`/${board[1]}/${o.name}`)
                                        }}
                                    >
                                        {o.name}
                                    </li>
                                )
                            })}
                        </ul>
                        <main>{children}</main>
                    </div>
                </div>
            )
                : (<main className="breakpoints main">{children}</main>)}
            <footer>
                <div className="breakpoints">
                    ( 푸터 내용을 적어주세요 )
                </div>
            </footer>
        </div>
    </>)
}

