import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useEffect, useState } from "react";
import { useImage } from "../hooks/useImage";
import '../css/useditem.css'

export function UsedItem({ used }) {
    const navigate = useNavigate();
    const { item } = useParams();
    const [likesCount, setLikesCount] = useState(0);    // 좋아요 수

    // const getFinalUrl = (img) => {
    //     if (!img) return null;
    //     return img.startsWith("http") ? getImages(img) : img;
    // };

    const { images, setImages, getImages, initImage } = useImage();

    useEffect(() => {
        const fetchLikes = async () => {
            const { count, error: likeCountError } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', used.category_id)
                .eq('table_id', used.id);

            if (!likeCountError) {
                setLikesCount(count);
            } else {
                console.error('좋아요 수 불러오기 실패', likeCountError);
            }

            await supabase.rpc('increment_view_count', { trade_id: parseInt(item) });
        }
        fetchLikes();
    }, [item]);


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

    const handleDetail = () => navigate(`${used.id}`);
    // 등록시간과 수정시간이 다르면 true, 같으면 false (isEdited는 boolean 값을 담는 변수)
    const isEdited = used.create_date !== used.update_date;
    // true: 수정, false: 등록 -> baseTime 에 저장
    const baseTime = isEdited ? used.update_date : used.create_date;



    return (
        <div
            className="used-card"
            onClick={handleDetail}
        >
            <div className="used-img-wrap">
                {used.main_img ? (
                    <img
                        src={getImages(used.main_img)}
                        className="used-img"
                        alt="썸네일"
                    />
                ) : (
                    <div className="used-noimg">
                        이미지가 없습니다.
                    </div>
                )}
            </div>
            <div className="used-body">
                <div>
                    <div className="used-meta">
                        <span className="used-category">거래&gt;{used.categories?.name}</span>
                        <span className="used-count">조회수 {used.cnt} ❤️ {likesCount}</span>
                    </div>
                    <div className="used-title">{used.title}</div>
                    <div className="used-content">{used.content}</div>
                </div>
                <div className="used-bottom">
                    <span className={`used-price${used.category_id === 5 ? " used-share" : ""}`}>
                        {used.category_id === 5
                            ? <span className="used-badge-share">나눔</span>
                            : `${Number(used.price).toLocaleString()}원`
                        }
                    </span>
                    <span className="used-location">
                        {used.location} · {getDateDiff(baseTime)}{isEdited && ' (수정)'}
                    </span>
                </div>
            </div>
        </div>
    );

}
