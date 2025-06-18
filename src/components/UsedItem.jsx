import { Card, Badge } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import { useEffect, useState } from "react";
import { useImage } from "../hooks/useImage";

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
        <Card
            className="h-100 shadow-sm border-0 rounded-4"
            style={{ width: "100%", maxWidth: 320, minHeight: 360, cursor: "pointer" }}
            onClick={handleDetail}
        >
            <div style={{ width: "100%", height: 180, overflow: "hidden", borderRadius: "1rem 1rem 0 0" }}>
                {used.main_img ? (<Card.Img
                    variant="top"
                    src={getImages(used.main_img)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt="썸네일"
                />) : (<div className="text-center p-5 text-muted" style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    이미지가 없습니다.
                </div>)}

            </div>
            <Card.Body className="p-3 d-flex flex-column justify-content-between" style={{ height: 180 }}>
                <div>
                {/* TODO: 글씨 크기 좀 더 줄이기 */}
                    <div className="d-flex justify-content-between align-items-end mt-auto">
                        <span className="text-secondary small mb-1 " style={{ height: 20, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            거래&gt;{used.categories?.name}
                        </span>
                        <span className="text-secondary small mb-1 ">조회수 {used.cnt} ❤️ {likesCount}  </span>
                    </div>
                    <Card.Title className="fw-bold fs-6 mb-1" style={{ minHeight: 22, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {used.title}
                    </Card.Title>
                    <Card.Text className="mb-2 text-truncate" style={{ minHeight: 32 }}>
                        {used.content}
                    </Card.Text>
                </div>
                <div className="d-flex justify-content-between align-items-end mt-auto">
                    <span className="fw-bold fs-6">
                        {used.category_id === 5
                            ? <Badge bg="success">나눔</Badge>
                            : `${Number(used.price).toLocaleString()}원`
                        }
                    </span>
                    <span className="small text-muted">{used.location} · {getDateDiff(baseTime)}{isEdited && ' (수정)'}</span>
                </div>
            </Card.Body>
        </Card>
    );
}
export default UsedItem;
