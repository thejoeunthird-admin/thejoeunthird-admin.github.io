import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase/supabase";
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import { formatDateTime } from "../utils/formatDateTime";
import { useNavigate } from "react-router-dom";
import { useImage } from "../hooks/useImage";

export function MyPageSell({ user }) {
    const { findById } = useCategoriesTable();
    const nav = useNavigate();
    const [sell, setSell] = useState([]);
    const {getImages } = useImage();

    const fetchSellLog = useCallback(async () => {
        const { data, error } = await supabase.rpc('get_user_trade_orders', { uid: user.info.id });
        setSell(data);
    }, [])

    useEffect(() => {
        fetchSellLog();
    }, []);

    const getFinalUrl = (img) => {
        if (!img) return null;
        return img.startsWith("http") ? img : getImages(img);
    };

    if(sell.length !== 0){
        console.log(sell[0])
    }
    return (
        <>
            <ul className="likes-list">
                <span className='likes-title'>💸 구매 목록</span>
                {sell.map((o, k) =>{ 
                    const categorie = findById(o.trade_category_id);
                    const parntCategorie = findById(categorie.parent_id);

                    return(
                    <li
                        key={o.id}
                        className={`likes-item`}
                        onTransitionEnd={(e) => {
                            if (e.propertyName === 'transform' && o.is_liked) {
                                // setLikes(prev => prev.filter(like => like.id !== o.id));
                            }
                        }}
                    >
                        <section className="likes-card">
                            <img alt="main" src={getFinalUrl(o.trade_main_img)} className="likes-img" />
                            <span className="likes-category">
                                {`${parntCategorie.name} > ${categorie.name}`}
                                <small>{['거래중', '배송중', '거래완료'][o.state]}</small>
                            </span>
                            <div className="likes-title">{o.trade_title}</div>
                            <div className="likes-content">
                                {(o.price).toLocaleString()}<small>(개당)</small> x { o.quantity }<small>(수량)</small> = { (o.price*o.quantity).toLocaleString() } 원
                            </div>
                            <div className="likes-footer">
                                <p className="likes-date">{formatDateTime(o.create_date)}</p>
                                <button
                                    className="likes-link-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        nav(`/${parntCategorie.url}/${categorie.url}/${o.table_id}`);
                                    }}
                                >
                                    Link
                                </button>
                                <button className="chat-btn" 
                                onClick={(e) =>{
                                    nav(`/my/talk/${o.trade_user_id}`)
                                }}>
                                    TALK
                                </button>
                            </div>
                        </section>
                    </li>
                )})}
            </ul>
        </>
    );
}