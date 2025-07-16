import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import { formatDateTime } from "../utils/formatDateTime";
import { useNavigate } from "react-router-dom";
import { useImage } from "../hooks/useImage";
import noImg from '../public/noImg.png'
import Loadingfail from '../public/Loadingfail.png'

export function MyPageBuy({ user }) {
    const { findById, findByUrl } = useCategoriesTable();
    const nav = useNavigate();
    const [buy, setbuy] = useState([]);
    const { getImages } = useImage();

    const fetchSellLog = useCallback(async () => {
        const { data, error } = await supabase.rpc('get_user_trades', { uid: user.info.id });
        setbuy(data);
        console.log(data)
    }, [])

    const getFinalUrl = (img) => {
        if (!img) return noImg;
        return img.startsWith("http") ? img : getImages(img);
    };

    const updateTradeState = async (tradeId, newState) => {
        const { data, error } = await supabase
            .rpc('update_trade_state', {
                trade_id: tradeId,
                new_state: Number(newState)
            })
            .select();
        if (error) {
            console.error('업데이트 실패:', error.message);
            throw error; // 에러를 호출자에게 전파
        } else {
            console.log('업데이트 성공:', data);
            setbuy(prevBuy =>
                prevBuy.map(item =>
                    item.id === tradeId
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

    useEffect(() => {
        fetchSellLog();
    }, []);

    return (
        <>
            <ul className="likes-list">
                <span className='likes-title'>👛 판매 목록</span>
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
                                            nav(`/${parntCategorie.url}/${categorie.url}/${o.trade_id}?keyword=`);
                                        }}
                                    >
                                        Link
                                    </button>
                                    <select defaultValue={o.state} style={{ height: '100%', width: '120px' }}
                                        onChange={(e) => {
                                            const selectedValue = parseInt(e.target.value);
                                            updateTradeState(o.trade_id, selectedValue);
                                        }}
                                    >
                                        {['판매중', '예약중', '판매완료'].map((oj, index) => (
                                            <option key={index} value={index}>{oj}</option>
                                        ))}
                                    </select>
                                </div>
                                {o.orders.length !== 0 && (<b style={{ fontWeight: 750 }}>구매자</b>)}
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
                                                {["거래중", '배송중', '거래완료'].map((oj, index) => (
                                                    <option key={index} value={index}>{oj}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="chat-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    nav(`/my/talk/${oj.user_id}`);
                                                }}
                                            >
                                                TALK
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* <div className="likes-plus-line">
                                <p>{o}</p>
                                <p>갯수</p>
                            </div> */}
                            </section>
                        </li>
                    )
                })}
            </ul>
        </>
    );
}