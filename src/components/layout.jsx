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

export function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ atTop, setAtTop] = useState(true);
    const [ board, setBoard ] = useState(['','']);
    const user = useUserTable();

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

    return(<>
        <div className="layout">
            <header className={`${atTop &&'top'}`}>
                <div className="breakpoints">
                    <img 
                    className="logo"
                    onClick={(e)=>{
                        e.preventDefault();
                        setBoard([ "", "" ])
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
                        { user.info === null
                            ?(<>
                                <p
                                className="link"
                                onClick={(e)=>{
                                    e.preventDefault();
                                    setBoard([ "", "" ])
                                    navigate("/login")
                                }}
                                >
                                    로그인
                                </p>
                            </>)
                            :(<>
                                <p className="link">내정보</p>
                                <a className="shaking">
                                    <FaBell/>
                                </a>
                            </>)
                        }
                    </div>
                </div>
                <div className="breakpoints header">
                    <p 
                    className={"board-item " + ("" === board[1]? 'red' : '')}
                    onClick={(e)=>{
                        e.preventDefault();
                        setBoard([ "", "" ])
                        navigate(`/`)
                    }}
                    >
                        홈
                    </p>
                    { boards.map((o,k)=>{ return(<React.Fragment key={k}>
                        <p 
                        className={"board-item " + (o.name === board[1]? 'red' : '')}
                        onClick={(e)=>{
                            e.preventDefault();
                            setBoard([ "", o.name ])
                            navigate(`/${o.name}`)
                        }}
                        >
                            { o.name }
                        </p>
                    </React.Fragment>)})}
                    { user.info !== null &&(
                        <div className="right">
                            <p 
                            className="link red"
                            onClick={(e)=>{
                                e.preventDefault();
                                handleLogout();
                            }}
                            >로그아웃</p>
                        </div>
                    )}
                </div>
                <div className={`taps ${board[1] === ""&&'none'}`}>
                    <div className="breakpoints">
                        <ul>
                            <li
                            className={(undefined === board[2]? 'select' : '')}
                            onClick={(e)=>{
                                e.preventDefault();
                                setBoard([ "", board[1]])
                                navigate(`/${board[1]}`)
                            }}
                            >
                                전체
                            </li>
                            { boardsTab.map((o,k)=>{ return(
                                <li 
                                key={k}
                                className={(o.name === board[2]? 'select' : '')}
                                onClick={(e)=>{
                                    e.preventDefault();
                                    setBoard([ "", board[1], o.name ])
                                    navigate(`/${board[1]}/${o.name}`)
                                }}
                                >
                                    { o.name }    
                                </li>
                            )})}
                        </ul>
                    </div>
                </div>
            </header>
            { board[1] !== ``?( 
                <div className="breakpoints main margin">
                    <p>
                        <a
                            onClick={(e)=>{
                            e.preventDefault();
                            setBoard([ "", "" ])
                            navigate("/")
                        }}
                        >{'홈 > '}</a>
                        { board.map((o, k) => {
                            if (k === 0) return null; 
                            return  k === board.length - 1 ?(
                                <strong key={k}>{o}</strong>
                            ) : (
                                <a key={k}
                                onClick={(e)=>{
                                    e.preventDefault();
                                    setBoard([ "", board[1] ])
                                }}
                                >{ o + ' > '}</a>
                            );
                        })}
                    </p>
                    {/* 여기에 지역 api 넣기 */}
                    <div>
                        <ul>
                            <li
                            className={(undefined === board[2]? 'select' : '')}
                            onClick={(e)=>{
                                e.preventDefault();
                                setBoard([ "", board[1]])
                                navigate(`/${board[1]}`)
                            }}
                            >
                                전체
                            </li>
                            { boardsTab.map((o,k)=>{ return(
                                <li 
                                key={k}
                                className={(o.name === board[2]? 'select' : '')}
                                onClick={(e)=>{
                                    e.preventDefault();
                                    setBoard([ "", board[1], o.name ])
                                    navigate(`/${board[1]}/${o.name}`)
                                }}
                                >
                                    { o.name }    
                                </li>
                            )})}
                        </ul>
                        <main>{ children }</main>
                    </div>
                </div>
            )
            :(<main className="breakpoints main">{ children }</main>)}
            <footer>
                <div className="breakpoints">
                    ( 푸터 내용을 적어주세요 )
                </div>
            </footer>
        </div>
    </>)
}

