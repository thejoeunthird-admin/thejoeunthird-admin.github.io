import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase/supabase";
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import { formatDateTime } from "../utils/formatDateTime";
import { useNavigate } from "react-router-dom";
import { useImage } from "../hooks/useImage";
import Loadingfail from '../public/Loadingfail.png'
import noImg from '../public/noImg.png'

export function MyPageGroupBuy({ user }) {
    const { findById, findByUrl } = useCategoriesTable();
    const nav = useNavigate();
    const [buy, setbuy] = useState([]);
    const selectRef = useRef();
    const { getImages } = useImage();

    const fetchSellLog = useCallback(async () => {
        const { data, error } = await supabase.rpc('get_groups_trades', { uid: user.info.id });
        setbuy(data);
    }, [])

    const updateTradeState = async (tradeId, newState) => {
        const { error } = await supabase.rpc('update_trade_state', {
            trade_id: tradeId,
            new_state: Number(newState)
        }); 

        if (error) {
            console.error('업데이트 실패:', error.message);
            throw error;
        } else {
            console.log('업데이트 성공');
            setbuy(prevBuy =>
                prevBuy.map(item =>
                    item.trade_id === tradeId
                        ? { ...item, state: Number(newState) }
                        : item
                )
            );
        }
    };


    const updateOderState = async (orderId, newState, tradeId) => {
        console.log('updateOderState 호출:', orderId, newState);

        const { data, error } = await supabase
            .rpc('update_order_state', {
                order_id: orderId,
                new_state: Number(newState)
            })
            .select();

        if (error) {
            console.error('업데이트 실패:', error.message);
            throw error;
        } else {
            console.log('주문 업데이트 성공:', data);
            setbuy(prevBuy =>
                prevBuy.map(trade =>
                    trade.trade_id === tradeId
                        ? {
                            ...trade,
                            orders: trade.orders.map(order =>
                                order.id === orderId
                                    ? { ...order, state: Number(newState) }
                                    : order
                            )
                        }
                        : trade
                )
            );
        }
    };

    const buyTalk = async (orders, title) => {
        const results = await Promise.all(
            orders.map(async (o) => {
                const { error } = await supabase.from('chats').insert({
                    sender_id: o.user_id,
                    receiver_id: user.info.id,
                    chat: `${title} 공구 결제 해주세요!`,
                    trades_id: o.table_id,
                    trades_quantity: o.quantity,
                });
                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert([
                        {
                            receiver_id: o.user_id,
                            sender_id: user.info.id,
                            type: 'chats',
                            table_type: 'trades',
                            table_id: o.table_id,
                            message: `${title} 공구 결제요청 메세지가 도착했습니다.`,
                        },
                    ]);
                if (error) console.error('채팅 전송 실패:', error.message);
                return error;
            })
        );
    };

    const getFinalUrl = (img) => {
        if (!img) return noImg;
        return img.startsWith("http") ? img : getImages(img);
    };

    useEffect(() => {
        fetchSellLog();
    }, []);

    return (
        <>
            <ul className="likes-list">
                <span className='likes-title'>👛 공구 판매 목록</span>
                {buy.length === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={Loadingfail} style={{ width: '100%' }} />
                    <h2 style={{ fontWeight: 'bold' }}>{`판매 목록이 없거나\n정보를 찾지 못했어요.`}</h2>
                </div>}
                {buy.map((o) => {
                    const categorie = findById(o.category_id);
                    const parntCategorie = findById(o.super_category_id);
                    return (
                        <li
                            key={o.trade_id}
                            className={`likes-item`}
                        >
                            <section className="likes-card">
                                <img alt="main" src={getFinalUrl(o.main_img)} className="likes-img" />
                                <span className="likes-category">
                                    {`${parntCategorie.name} > ${categorie.name}`}
                                    {/* <small>{ findById(o.state).name }</small> */}
                                </span>
                                <div className="likes-title">{o.title}</div>
                                <div className="likes-content">
                                    <p className="likes-date">{formatDateTime(o.create_date)}</p>
                                </div>
                                <div className="likes-footer">
                                    <button
                                        className="likes-link-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log(o)
                                            nav(`/${parntCategorie.url}/${categorie.url}/${o.trade_id}?keyword=`);
                                        }}
                                    >
                                        Link
                                    </button>
                                    <select ref={selectRef} defaultValue={o.state} style={{ height: '100%', width: '120px' }}
                                        onChange={(e) => {
                                            const selectedValue = parseInt(e.target.value);
                                            updateTradeState(o.trade_id, selectedValue);
                                        }}
                                    >
                                        {['모집중', '모집완료', '모집실패', '판매완료'].map((oj, index) => (
                                            <option key={index} value={index}>{oj}</option>
                                        ))}
                                    </select>
                                </div>
                                {o.orders.length !== 0 && <>
                                    <b style={{ fontWeight: 750 }}>참여자</b>
                                    {/* 모집 완료시? */}
                                    {console.log(selectRef.current?.value)}
                                    {selectRef.current?.value === "1" && (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div />
                                        <button
                                            className="likes-link-btn"
                                            style={{ background: 'green' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                buyTalk(o.orders, o.title)
                                            }}
                                        >
                                            일괄 거래 메세지
                                        </button>
                                    </div>
                                    )}
                                </>}
                                {o.orders.map((oj, k) =>
                                    <div className="likes-plus-line" key={k}>
                                        <p style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                                            <strong style={{ marginRight: '10px' }}>{oj.user_name}</strong>
                                            {(oj.price).toLocaleString()}<small style={{ fontSize: '0.8rem' }}>(개당)</small> x {oj.quantity}<small style={{ fontSize: '0.8rem' }}>(수량)</small>
                                        </p>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px', }}>
                                            <select defaultValue={oj.state}
                                                onChange={(e) => {
                                                    const selectedValue = parseInt(e.target.value);
                                                    updateOderState(oj.id, selectedValue);
                                                }}
                                            >
                                                {['참여중', "거래중", '배송중', '거래완료'].map((oj, index) => (
                                                    <option key={index} value={index}>{oj}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="likes-link-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    buyTalk([oj], o.title)
                                                }}
                                            >
                                                거래 메세지
                                            </button>
                                            <button
                                                className="chat-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    nav(`/my/talk/${oj.user_id}`)
                                                }}
                                            >
                                                TALK
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </li>
                    )
                })}
            </ul>
        </>
    );
}