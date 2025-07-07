import '../css/main.css'
import { MdChat } from "react-icons/md";
import { FaHeart } from "react-icons/fa";
import img from '../public/noImg.png'
import fullLogo from '../public/fullLogo.png';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';
import { useCategoriesTable } from '../hooks/useCategoriesTable';
import { formatDateTime } from '../utils/formatDateTime';
import { useImage } from '../hooks/useImage';
import { LoadingCircle } from './LoadingCircle';
import { formatTime } from '../utils/fomatTime';
import { useNavigate } from 'react-router-dom';
import noImg from '../public/noImg.png'

function BestItems() {
    const nav = useNavigate();
    const { findById } =useCategoriesTable();
    const { getImages } = useImage();
    const [gonggu, setGonggu] = useState([])
    const [items, setItems] = useState([]);
    const [error, setError] = useState(false);

    const getFinalUrl = (img) => {
        if (!img) return noImg;
        return img.startsWith("http") ? img : getImages(img);
    };

    useEffect(() => {
        const fetchBoards = async () => {
            const { data, error: dataError } = await supabase.rpc('get_earliest_trades_with_counts');
            if (dataError) {
                setError(true)
                return;
            }
            if (data) {
                setItems(data)
            }
        };
        fetchBoards();
    }, []);

    useEffect(() => {
        //get_earliest_trades_category_5
        const fetchBoards = async () => {
            const { data, error: dataError } = await supabase.rpc('get_earliest_trades_category_5');
            if (dataError) {
                setError(true)
                return;
            }
            if (data) {
                setGonggu(data)
            }
        };
        fetchBoards();

    }, [])

    if (error) {
        return (<>
            <ul className="bestBoards">
                에러메세지
            </ul>
        </>)
    }
    else if (gonggu.length === 0 || items.length === 0) {
        return (<>
            <ul className="bestBoards">
                <LoadingCircle />
            </ul>
        </>)
    }
    else {
        return (<>
            <div className='bestItems'>
                <ul className='row trade'>
                    <h2 className='row_title'>중고 거래</h2>
                    {items.map((o, k) =>
                        <li 
                            key={k} 
                            className='contents'
                            onClick={(e)=>{
                                e.preventDefault();
                                console.log('keyword')
                                nav(`/trade/${(findById(o.category_id)).url}/${o.id}?keyword=`)
                            }}
                        >
                            <img src={getFinalUrl(o.main_img)} className='contents-img' />
                            <div className='contents-box'>
                                <p className='start-string'>
                                    {o.location}
                                    <small
                                        className='end-string'
                                        style={{ fontSize: '0.9rem', fontWeight: '500' }}
                                    >
                                        {formatDateTime(o.create_date)}
                                    </small>
                                </p>
                                <p className='contents-title'>
                                    {o.title}
                                </p>
                                <p className='contents-string'>
                                    {o.content}
                                </p>
                                <p
                                    className='start-string'
                                    style={{ marginTop: 'auto', marginBottom: '5px', color: 'black', fontSize: '1.2rem' }}
                                >
                                    {(o.price).toLocaleString()} 원
                                    <small className='end-string'>
                                        <MdChat />&nbsp;{o.comment_count}
                                        &nbsp;
                                        <FaHeart />&nbsp;{o.like_count}
                                    </small>
                                </p>
                            </div>
                        </li>
                    )}
                </ul>
                <ul className='row trade'>
                    <h2 className='row_title'>공동 구매</h2>
                    {gonggu.map((o, k) =>
                        <li 
                            key={k} 
                            className='contents'
                            onClick={(e)=>{
                                e.preventDefault();
                                nav(`/trade/${(findById(o.category_id)).url}/${o.id}?keyword=`)
                            }}
                        >
                            <img src={getFinalUrl(o.main_img)} className='contents-img' />
                            <div className='contents-box'>
                                <p className='start-string'>
                                    {o.location}
                                    <small
                                        className='end-string'
                                        style={{ fontSize: '0.9rem', fontWeight: '500' }}
                                    >
                                        {formatDateTime(o.create_date)}
                                    </small>
                                </p>
                                <p className='contents-title'>
                                    {o.title}
                                </p>
                                <p className='contents-string'>
                                    {o.content}
                                </p>
                                <p
                                    className='start-string'
                                    style={{ marginTop: 'auto', marginBottom: '5px', color: 'black', fontSize: '1.2rem' }}
                                >
                                    {(o.price).toLocaleString()} 원
                                    <small className='end-string'>
                                        <MdChat />&nbsp;{o.comment_count}
                                        &nbsp;
                                        <FaHeart />&nbsp;{o.like_count}
                                    </small>
                                </p>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </>)
    }
}


function BestBoards() {
    const nav = useNavigate();
    const { findById } = useCategoriesTable();
    const { getImages } = useImage();
    const [boardsTop3, setBoardsTop3] = useState([]);
    const [boards, setBoards] = useState([]);
    const [error, setError] = useState(false);
    
    useEffect(() => {
        const fetchBoards = async () => {
            const { data, error: dataError } = await supabase.rpc('get_top_liked_boards');
            if (dataError) {
                setError(true);
                return;
            }
            if (data) {
                setBoardsTop3(data.slice(0, 3));
                setBoards(data.slice(3));
            }
        };
        fetchBoards();
    }, []);
    if (error) {
        return (<>
            <ul className="bestBoards">
                에러메세지
            </ul>
        </>)
    }
    else if (boards.length === 0 || boardsTop3.length === 0) {
        return (<>
            <ul className="bestBoards">
                <LoadingCircle />
            </ul>
        </>)
    }
    else {
        return (<>
            <ul className="bestBoards">
                {boardsTop3.map((o, k) =>
                    <li 
                        key={k} 
                        className='contents'
                        onClick={(e)=>{
                            e.preventDefault();
                            nav(`/life/detail/${o.id}?keyword=`)
                        }}
                    >
                        <p className='contents_title'>
                            {o.title}
                        </p>
                        <div className='contents_img'>
                            <img src={o.main_img === null ? img : getImages(o.main_img)} />
                        </div>
                        <div className='contents_box'>
                            <p className='tag'>
                                {findById(o.category_id).name}
                            </p>
                            <p className='timestamp'>
                                {formatTime(o.create_date)}
                            </p>
                        </div>
                        <span className='contents_area'>
                            {o.contents}
                        </span>
                        <span className='contents_icon'>
                            <MdChat />&nbsp;{o.comment_count}
                            &nbsp;
                            <FaHeart />&nbsp;{o.like_count}
                        </span>
                    </li>
                )}
                <li className='contents-span'>
                    {boards.map((o, k) =>
                        <a 
                            key={k} 
                            className='line'
                            onClick={(e)=>{
                                e.preventDefault();
                                nav(`/life/detail/${o.id}?keyword=`)
                            }}
                        >
                            <strong className='contents_tag'>{findById(o.category_id).name}</strong>
                            <small className='contents_title'>{o.title}</small>
                            <div style={{ display: 'flex', flexDirection: 'row', flex: '1' }}>
                                <strong className='contents-row-tag'>{findById(o.category_id).name}</strong>
                                <span className='contents_icon'>
                                    <MdChat />&nbsp;{o.comment_count}
                                    &nbsp;
                                    <FaHeart />&nbsp;{o.like_count}
                                </span>
                            </div>
                        </a>
                    )}
                </li>
                <li className='contents-hidden'>
                    <div style={{ width: '100%', height: '175px', overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', borderRadius: '10px' }}>
                        <img src={fullLogo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                </li>
            </ul>
        </>)
    }
}

export function Main() {

    return (<>
        <div className="containers" style={{ marginTop:0 }}>
            <span className='boardsHeader'>🔥 꿀팁</span>
            <BestBoards />
            <span className='boardsHeader'>🍯 꿀템</span>
            <BestItems />
        </div>
    </>)
}