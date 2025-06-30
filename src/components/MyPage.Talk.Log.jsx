import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { useSubscribe } from '../hooks/useSubscribe';
import { useImage } from '../hooks/useImage';
import { useCategoriesTable } from '../hooks/useCategoriesTable';
import noImg from '../public/noImg.png'

export function MyPageTalkLog({ user }) {
    const talkRef = useRef();
    const inputRef = useRef();
    const [talk, setTalk] = useState([]);
    const { item: receiver } = useParams(); // 보낸사람
    const [receiverName, setReceiverName] = useState(null);
    const { getImages } = useImage();
    const nav = useNavigate();
    const { findById } = useCategoriesTable();

    const getFinalUrl = (img) => {
        if (!img) return noImg;
        return img.startsWith("http") ? img : getImages(img);
    };
    const fetchChatLog = async () => {
        if (!user) return;
        const { data, error } = await supabase.rpc('get_chats_by_sender_and_receiver', {
            p_sender: receiver,
            p_receiver: user.info.id
        });
        if (error) console.error(error);
        else setTalk([...data]);
    };

    useSubscribe({
        table: 'chats',
        schema: 'public',
        callback: ({ newData }) => {
            if (newData) fetchChatLog();
        },
    });

    const markAllAsRead = async () => {
        if (receiver === user.info.id) return;
        const { error } = await supabase.rpc('mark_all_chats_as_read', {
            p_sender: user.info.id,
            p_receiver: receiver,
        });
        if (error) console.error('채팅 읽음 처리 실패:', error);
    };

    useEffect(() => {
        const getReceiver = async () => {
            if (!receiver) return;
            const { data: { name }, error } = await supabase
                .from('users')
                .select('name')
                .eq('id', receiver)
                .single();
            if (!error) setReceiverName(name);
        };
        fetchChatLog();
        markAllAsRead();
        getReceiver();
    }, [receiver]);

    useEffect(() => {
        if (talkRef.current) {
            talkRef.current.scrollTo({
                top: talkRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    });

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const message = inputRef.current.value.trim();
        if (!message) return;
        const { data, error } = await supabase.from('chats').insert({
            sender_id: receiver,
            receiver_id: user.info.id,
            chat: message,
        }).select().single();
        const { error: notifError } = await supabase
            .from('notifications')
            .insert([
                {
                    receiver_id: receiver,
                    sender_id: user.info.id,
                    type: 'chats',
                    table_type: 'chats',
                    table_id: data.id,
                    message: `${user.info.name} 님이 메세지를 보냈습니다.`,
                },
            ]);
        if (!error) inputRef.current.value = '';
        fetchChatLog();
    }, [talk]);

    const handleOrder = useCallback(async (e, item) => {
        e.preventDefault();
        if (item.trades.state >= 1) {
            alert('판매(공구) 종료되었거나, 예약중입니다.')
            return;
        }
        const { error } = await supabase.rpc('create_order_and_update_chat', {
            p_trades_id: item.trades_id,
            p_user_id: item.receiver.id,
            p_price: item.trades.price,
            p_quantity: item.trades_quantity
        });
        if (error) {
            console.error('거래 수락 실패:', error.message);
        } else {
            fetchChatLog();
        }
    }, [fetchChatLog]);

    if (!receiverName) {
        return (
            <p style={{ marginTop: '30px', padding: '10px', color: 'rgb(0,0,0,0.5)' }}>
                대화 상대를 찾을 수 없습니다.<br />뒤로 넘어가 주세요.
            </p>
        );
    }

    return (
        <div className="talkLog-wrapper">
            <div className="talkLog-container">
                <div ref={talkRef} className="talkLog-scroll">
                    {talk.length !== 0 ? (
                        talk.slice().reverse().map((o, k) => {
                            if (!o.trades?.id) {
                                return (
                                    <li
                                        key={k}
                                        className={`talkLog-item ${o.receiver.id === user.info.id ? 'is-me' : ''}`}
                                    >
                                        <strong className={`talkLog-username`}>
                                            {o.receiver.name}
                                        </strong>
                                        <span className={`talkLog-message ${o.receiver.id === user.info.id ? 'is-read' : ''}`}>
                                            <p>{o.chat}</p>
                                            <small>{new Date(o.create_date).toLocaleDateString('ko-KR')}</small>
                                        </span>
                                    </li>
                                )
                            }
                            else {
                                if (o.trades.category_id !== 7) {
                                    return (
                                        <li
                                            key={k}
                                            className={`talkLog-item ${o.receiver.id === user.info.id ? 'is-me' : ''}`}
                                        >
                                            <strong className={`talkLog-username`}>
                                                {o.receiver.name}
                                            </strong>
                                            <span className={`talkLog-message ${o.receiver.id === user.info.id ? 'is-read' : ''}`}>
                                                <p style={{ padding: '2.5px 0px' }}>{o.chat}</p>
                                                <div style={{ display: 'flex', height: '100%', flexDirection: 'row', marginTop: '5px' }}>
                                                    {o.receiver.id !== user.info.id && (
                                                        <img
                                                            src={`${getFinalUrl(o.trades.main_img)}`}
                                                            style={{ width: '100px', height: '100px' }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                nav(`/trade/${findById(o.trades.category_id).url}/${o.trades.id}?keyword=`)
                                                            }}
                                                        />
                                                    )}
                                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px', marginRight: "10px", height: '100%', }}>
                                                        <p style={{ fontSize: '1.1rem', fontWeight: '700', padding: '5px 0px', }}>{o.trades.title}</p>
                                                        <p style={{ fontSize: '0.9rem', padding: '0px 0px' }}>{o.trades.price} x {o.trades_quantity} = {o.trades.price * o.trades_quantity} 원</p>
                                                        {o.receiver.id !== user.info.id && (<>
                                                            <button
                                                                disabled={o.trades_state === true}
                                                                onClick={(e) => handleOrder(e, o)}
                                                                style={{ width: '100%', marginTop: '30px', background: o.trades_state ? 'whitesmoke' : 'rgb(255,173,198)', border: '0', padding: '5px', borderRadius: '5px' }}>
                                                                거래 수락 {o.trades_state && '완료'}
                                                            </button>
                                                        </>)}
                                                    </div>
                                                    {o.receiver.id === user.info.id && (
                                                        <img src={`${getFinalUrl(o.trades.main_img)}`} style={{ width: '100px', height: '100px' }} />
                                                    )}
                                                </div>
                                                <small>{new Date(o.create_date).toLocaleDateString('ko-KR')}</small>
                                            </span>
                                        </li>
                                    )
                                }
                                else {
                                    console.log('dd')
                                    return (<>
                                        <li
                                            key={k}
                                            className={`talkLog-item ${o.receiver.id === user.info.id ? 'is-me' : ''}`}
                                        >
                                            <strong className={`talkLog-username`}>
                                                {o.receiver.name}
                                            </strong>
                                            <span className={`talkLog-message ${o.receiver.id === user.info.id ? 'is-read' : ''}`}>
                                                <div style={{ display: 'flex', height: '100%', flexDirection: 'row', marginTop: '5px' }}>
                                                    {o.receiver.id !== user.info.id && (
                                                        <img
                                                            src={`${getFinalUrl(o.trades.main_img)}`}
                                                            style={{ width: '100px', height: '100px' }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                nav(`/trade/${findById(o.trades.category_id).url}/${o.trades.id}?keyword=`)
                                                            }}
                                                        />
                                                    )}
                                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px', marginRight: "10px", height: '100%', }}>
                                                        <p style={{ fontSize: '1.1rem', fontWeight: '700', padding: '5px 0px', }}>{o.trades.title}</p>
                                                        <p style={{ fontSize: '0.9rem', padding: '0px 0px' }}>{o.trades.price} x {o.trades_quantity} = {o.trades.price * o.trades_quantity} 원</p>
                                                        {o.receiver.id !== user.info.id && (
                                                            <p style={{ padding: '5px', paddingLeft: '0px' }}>{o.chat}</p>
                                                        )}
                                                        {o.receiver.id !== user.info.id &&
                                                            <button
                                                                disabled={o.trades_state === true}
                                                                onClick={(e) => handleOrder(e, o)}
                                                                style={{ width: '100%', marginTop: '5px', background: o.trades_state ? 'whitesmoke' : 'rgb(255,173,198)', border: '0', padding: '5px', borderRadius: '5px' }}
                                                            >
                                                                공동 구매 결제{o.trades_state ?' 완료':'하기'}
                                                            </button>
                                                        }
                                                    </div>
                                                    {o.receiver.id === user.info.id && (
                                                        <img src={`${getFinalUrl(o.trades.main_img)}`} style={{ width: '100px', height: '100px' }} />
                                                    )}
                                                </div>
                                                <small>{new Date(o.create_date).toLocaleDateString('ko-KR')}</small>
                                            </span>
                                        </li>
                                    </>)
                                }
                            }
                        })
                    ) : (
                        <div className="talkLog-empty">
                            <p style={{ fontSize: '1.2rem' }}>새로운 채팅방 입니다.</p>
                            <br />
                            <small style={{ fontSize: '0.8rem' }}>채팅을 입력해주세요</small>
                        </div>
                    )}
                </div>

                <form className="talkLog-form" onSubmit={handleSubmit}>
                    <textarea
                        ref={inputRef}
                        className="talkLog-textarea"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button type="submit" className="talkLog-button">전송</button>
                </form>
            </div>
        </div>
    );
}
