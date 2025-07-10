import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase/supabase";
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import { formatDateTime } from "../utils/formatDateTime";
import { useNavigate } from "react-router-dom";
import { useImage } from "../hooks/useImage";
import Loadingfail from '../public/Loadingfail.png'
import noImg from '../public/noImg.png'

export function MyPageGroupSell({ user }) {
    const { findById } = useCategoriesTable();
    const nav = useNavigate();
    const [sell, setSell] = useState([]);
    const { getImages } = useImage();

    const fetchSellLog = useCallback(async () => {
        const { data, error } = await supabase.rpc('get_group_trade_orders', { uid: user.info.id });
        setSell(data);
    }, [])

    const getFinalUrl = (img) => {
        if (!img) return noImg;
        return img.startsWith("http") ? img : getImages(img);
    };


    useEffect(() => {
        fetchSellLog();
    }, []);


    if (sell.length !== 0) {
        console.log(sell[0])
    }
    return (
        <>
            <ul className="likes-list">
                <span className='likes-title'>💸 공구 구매 목록</span>
                {sell.length === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={Loadingfail} style={{ width: '100%' }} />
                    <h2 style={{ fontWeight: 'bold' }}>{`구매 목록이 없거나\n정보를 찾지 못했어요.`}</h2>
                </div>}
                {sell.map((o, k) => {
                    const categorie = findById(o.trade_category_id);
                    const parntCategorie = findById(categorie.parent_id);

                    return (
                        <li
                            key={o.id}
                            className={`likes-item`}
                        >
                            <section className="likes-card">
                                <img alt="main" src={getFinalUrl(o.trade_main_img)} className="likes-img" />
                                <span className="likes-category">
                                    {`${parntCategorie.name} > ${categorie.name}`}
                                    <small>{['참여중', '거래중', '배송중', '거래완료'][o.state]}</small>
                                </span>
                                <div className="likes-title">
                                    {o.trade_title}
                                    <small style={{ fontSize: '0.75rem', marginLeft: '5px' }}>
                                        ( {['모집중', '모집완료', '모집실패', '판매완료'][o.trade_state]} )
                                    </small>
                                </div>
                                <div className="likes-content">
                                    {(o.price).toLocaleString()}<small>(개당)</small> x {o.quantity}<small>(수량)</small> = {(o.price * o.quantity).toLocaleString()} 원
                                </div>
                                <div className="likes-footer">
                                    <p className="likes-date">{formatDateTime(o.create_date)}</p>
                                    <button
                                        className="likes-link-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            nav(`/${parntCategorie.url}/${categorie.url}/${o.table_id}?keyword=`);
                                        }}
                                    >
                                        Link
                                    </button>
                                    <button className="chat-btn"
                                        onClick={(e) => {
                                            nav(`/my/talk/${o.trade_user_id}`)
                                        }}>
                                        TALK
                                    </button>
                                </div>
                            </section>
                        </li>
                    )
                })}
            </ul>
        </>
    );
}