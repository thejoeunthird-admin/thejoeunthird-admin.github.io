import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import { useEffect, useState } from "react";
import { useImage } from "../hooks/useImage";
import noImg from '../public/noImg.png';
import '../css/useditem.css'

export function UsedItem({ used }) {
    const navigate = useNavigate();


    const { images, setImages, getImages, initImage } = useImage();

    const getDateDiff = (date) => {
        const created = new Date(date);
        created.setHours(created.getHours() + 9);
        const now = new Date();
        const diffMs = now - created;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffDay > 0) return `${diffDay}일 전`;
        if (diffHour > 0) return `${diffHour}시간 전`;
        if (diffMin > 0) return `${diffMin}분 전`;
        return "방금 전";
    };

    const handleDetail = () => navigate(`${used.id}?keyword=`);
    // 등록시간과 수정시간이 다르면 true, 같으면 false (isEdited는 boolean 값을 담는 변수)
    const isEdited = used.create_date !== used.update_date;
    // true: 수정, false: 등록 -> baseTime 에 저장
    const baseTime = isEdited ? used.update_date : used.create_date;



    return (
    <div
        className="used-list-card"
        onClick={handleDetail}
    >
        <div className="used-list-thumb">
            <img
                src={used.main_img ? getImages(used.main_img) : noImg}
                alt="썸네일"
            />
        </div>
        <div className="used-list-content">
            <div className="used-list-header">
                <span className="used-list-category">
                    거래&gt;{used.categories?.name}
                </span>
                <div className="used-list-location">
                    {used.location} · {getDateDiff(baseTime)}{isEdited && ' (수정)'}
                </div>
            </div>
            <span className="used-list-title">{used.state === 2 && '[거래완료] '}{used.title}</span>
            <span className="used-list-body">{used.content}</span>
            <span className="used-list-footer">
                <div className={`used-list-price${used.category_id === 5 ? " used-list-share" : ""}`}>
                    {used.category_id === 5
                        ? <span className="used-list-badge-share">나눔</span>
                        : `${Number(used.price).toLocaleString()}원`
                    }
                </div>
                <div className="used-list-meta">
                    <span>조회수 {used.cnt}</span>
                    <span style={{ marginLeft: 12 }}>❤️ {used.likesCount}</span>
                    <span style={{ marginLeft: 12 }}>💬 {used.commentsCount}</span>
                </div>
            </span>
        </div>
    </div>
);


}
