import { useEffect, useState } from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import * as S from './index.styled'

// 알림 시간 표시 함수 
const formatRelativeTime = (timestamp) => {
    const now = new Date();

    const utcDate = new Date(timestamp); // supabase에서 받은 UTC 시간
    const time = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // UTC > KST로 변환
    // const time = new Date(timestamp);
    const diff = now - time;

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days >= 7) {
        // 7일 초과 시: '2025년 05월 19일 오후 2:20' 형식
        const year = time.getFullYear();
        const month = String(time.getMonth() + 1).padStart(2, '0');
        const date = String(time.getDate()).padStart(2, '0');

        let hour = time.getHours();
        const minute = String(time.getMinutes()).padStart(2, '0');
        const isPM = hour >= 12;
        const ampm = isPM ? '오후' : '오전';
        hour = hour % 12 || 12; // 12시간제로 변환

        return `${year}년 ${month}월 ${date}일 ${ampm} ${hour}:${minute}`;
    }

    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    if (hrs < 24) return `${hrs}시간 전`;
    return `${days}일 전`; // 계속 -일 전 형태로 반환 (ex. 31일전)
};

export function Notifications({ notification, setNotification }){
    const [fadeOut, setFadeOut] = useState(true);

    const handleMessageClick = (e) => {
        e.preventDefault();
        setFadeOut(true);
        window.location.href = '/#/my/notification';
        setTimeout(() => {
            setNotification([]) // 모든 알람 삭제 
        }, 500); // fade-out 시간과 일치
    }

    // close 버튼
    const handleCloseClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFadeOut(false);
        setTimeout(() => {
            setNotification(prev => prev.slice(1));
            setFadeOut(true);       
        }, 500); // fade-out 시간과 일치
    }

    useEffect(()=>{
        if(notification.length !== 0) {
            setTimeout(() => {
                setFadeOut(false);  
                setTimeout(() => {
                    setNotification(prev => prev.slice(1));
                    setFadeOut(true);  
                }, 500); 
            }, 3000); 
        }
    },[notification])

    if(notification.length === 0) { return; }
    return(<>
        <S.Container 
            $fadeOut={fadeOut}
            onClick={(e)=>{handleMessageClick(e)}}
        > 
            <div> 
                <FaBell /> 
                { notification[0].message }
            </div>
            <div>
                <p>
                    {formatRelativeTime(notification.created_at)}
                </p>
                <button onClick={handleCloseClick} >
                    <FaTimes />
                </button>
            </div>
        </S.Container>
    </>)
}