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

function BestItems() {

    return (<>
        <div className='bestItems'>
            <ul className='row trade'>
                <h2 className='row_title'>중고 거래</h2>

                <li className='contents'>
                    <img className='contents-img' />
                    <div className='contents-box'>
                        <p className='start-string'>
                            서울시 마포구
                            <small
                                className='end-string'
                                style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            >
                                04:02
                            </small>
                        </p>
                        <p className='contents-title'>제목</p>
                        <p className='contents-string'>글쓴내용</p>
                        <p
                            className='start-string'
                            style={{ marginTop: 'auto', marginBottom: '5px', color: 'black', fontSize: '1.2rem' }}
                        >
                            1,000원
                            <small className='end-string'>
                                <MdChat />&nbsp;23
                                &nbsp;
                                <FaHeart />&nbsp;211
                            </small>
                        </p>
                    </div>
                </li>
                <li className='contents'>
                    <img className='contents-img' />
                    <div className='contents-box'>
                        <p className='start-string'>
                            서울시 마포구
                            <small
                                className='end-string'
                                style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            >
                                04:02
                            </small>
                        </p>
                        <p className='contents-title'>제목</p>
                        <p className='contents-string'>글쓴내용</p>
                        <p
                            className='start-string'
                            style={{ marginTop: 'auto', marginBottom: '5px', color: 'black', fontSize: '1.2rem' }}
                        >
                            1,000원
                            <small className='end-string'>
                                <MdChat />&nbsp;23
                                &nbsp;
                                <FaHeart />&nbsp;211
                            </small>
                        </p>
                    </div>
                </li>
                <li className='contents'>
                    <img className='contents-img' />
                    <div className='contents-box'>
                        <p className='start-string'>
                            서울시 마포구
                            <small
                                className='end-string'
                                style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            >
                                04:02
                            </small>
                        </p>
                        <p className='contents-title'>제목</p>
                        <p className='contents-string'>글쓴내용</p>
                        <p
                            className='start-string'
                            style={{ marginTop: 'auto', marginBottom: '5px', color: 'black', fontSize: '1.2rem' }}
                        >
                            1,000원
                            <small className='end-string'>
                                <MdChat />&nbsp;23
                                &nbsp;
                                <FaHeart />&nbsp;211
                            </small>
                        </p>
                    </div>
                </li>
            </ul>
            <ul className='row trade'>
                <h2 className='row_title'>공동 구매</h2>

                <li className='contents'>
                    <img className='contents-img' />
                    <div className='contents-box'>
                        <p className='start-string'>
                            서울시 마포구
                            <small
                                className='end-string'
                                style={{ fontSize: '0.9rem', fontWeight: '500' }}
                            >
                                04:02
                            </small>
                        </p>
                        <p className='contents-title'>제목</p>
                        {/* <p className='contents-string'>글쓴내용</p> */}
                        <p> 진행률 적기 </p>
                        <p
                            className='start-string'
                            style={{ marginTop: 'auto', marginBottom: '5px', color: 'black', fontSize: '1.2rem' }}
                        >
                            1,000원
                            <small className='end-string'>
                                <MdChat />&nbsp;23
                                &nbsp;
                                <FaHeart />&nbsp;211
                            </small>
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </>)
}


function BestBoards() {
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
    if (error) { return (<>
        <ul className="bestBoards">
            에러메세지
        </ul>
    </>)}
    else if (boards.length === 0 || boardsTop3.length === 0) { return(<>
        <ul className="bestBoards">
            <LoadingCircle />
        </ul>
    </>)}
    else {
        return (<>
            <ul className="bestBoards">
                {boardsTop3.map((o, k) =>
                    <li key={k} className='contents'>
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
                                {formatDateTime(o.create_date)}
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
                        <a key={k} className='line'>
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
        <div className="container">
            <span className='boardsHeader'>🔥 꿀팁</span>
            <BestBoards />
            <span className='boardsHeader'>🍯 꿀템</span>
            <BestItems />
        </div>
    </>)
}