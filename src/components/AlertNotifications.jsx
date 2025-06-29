import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import { Alert } from 'react-bootstrap';
import { FaBell, FaTimes } from 'react-icons/fa';
import { supabase } from '../supabase/supabase';
import { useFetcher, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useUserTable } from '../hooks/useUserTable';
import '../css/AlertNotifications.css';

// NotificationContext 생성
const NotificationContext = createContext();

// 알림을 제어하는 커스텀 훅
export const useNofitication = () => {
    return useContext(NotificationContext);
};

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

    // if (days >= 7) {
    //     // 7일 초과 시: '2025년 05월 19일 오후 2:20' 형식
    //     const year = time.getFullYear();
    //     const month = String(time.getMonth() + 1).padStart(2, '0');
    //     const date = String(time.getDate()).padStart(2, '0');

    //     let hour = time.getHours();
    //     const minute = String(time.getMinutes()).padStart(2, '0');
    //     const isPM = hour >= 12;
    //     const ampm = isPM ? '오후' : '오전';
    //     hour = hour % 12 || 12; // 12시간제로 변환

    //     return `${year}년 ${month}월 ${date}일 ${ampm} ${hour}:${minute}`;
    // }

    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    if (hrs < 24) return `${hrs}시간 전`;
    return `${days}일 전`; // 계속 -일 전 형태로 반환 (ex. 31일전)
};

// NotificationProvider 컴포넌트
export const NotificationProvider = ({ children }) => {
    const [message, setMessage] = useState(''); // 알림메세지
    const [notifications, setNotifications] = useState([]); // 이건 임시..
    const { info: userInfo, loading: userLoading } = useUserTable(); // 현재 사용자
    const [currentNotification, setCurrentNotification] = useState(null);
    // const [isToggled, setIsToggled] = useState(true);

    // user noti_enabled 가져오기
    // const fetchToggleSetting = async () => {
    //     const { data, error } = await supabase
    //         .from('users')
    //         .select('noti_enabled')
    //         .eq('id', userInfo.id)
    //         .single();

    //     if (!error && data) {
    //         setIsToggled(data.noti_enabled);
    //     };

    //     fetchToggleSetting();
    // }



    const showAlert = (msg) => {
        setMessage(msg); // 알림 내용 설정
    };

    const hideAlert = () => {
        setMessage(''); // 알림 숨기기
    };

    useEffect(() => {
        if (!userInfo) {
            console.log('로그인된 사용자가 없습니다.');
            return;
        }

                // // user noti_enabled 가져오기
                // const fetchToggleSetting = async () => {
                //     const { data, error } = await supabase
                //         .from('users')
                //         .select('noti_enabled')
                //         .eq('id', userInfo.id)
                //         .single();
        
                //     if (!error && data) {
                //         setIsToggled(data.noti_enabled);
                //     };
        
                //     fetchToggleSetting(); // 호출
                // }
        

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('receiver_id', userInfo.id)
                .eq('is_read', false)
                .order('created_at', { ascending: false }); // 최신순

            if (error) {
                console.error('알림 불러오기 실패', error);
            } else {
                // setNotifications(data);
                // if (data.length > 0) {
                //     showAlert(data[0].message, data[0].created_at); //첫 번째 알림 하나만 사용자에게 보여주는 효과
                // }
                setNotifications(data);
                if (data.length > 0) {
                    setCurrentNotification(data[0]);
                }
            }
        };
        fetchNotifications();
    }, [userInfo]);

    useEffect(() => {
        if (notifications.length > 0) {
            setCurrentNotification(notifications[0]);
        } else {
            setCurrentNotification(null);
        }
    }, [notifications]);

    const handleCloseCurrent = () => {
        const newQueue = [...notifications];
        newQueue.shift(); // 현재 알림제거
        setNotifications(newQueue);
        setCurrentNotification(newQueue[0] || null);
    }

    return (
        <NotificationContext.Provider value={{ showAlert, hideAlert}}>
            {/* {children}
            <AlertNotifications message={message}  create_at={notifications?.created_at} onClose={hideAlert}
            />  알림 표시 컴포넌트 */}

            {children}
            {currentNotification && (
                <AlertNotifications
                    notification={currentNotification}
                    onClose={handleCloseCurrent}
                    onAllClose={() => {
                        setNotifications([]);
                        setCurrentNotification(null);
                    }}
                />
            )}
        </NotificationContext.Provider>
    );
};

// ALertNotification 컴포넌트
export function AlertNotifications({ notification, onClose, onAllClose }) {
    const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);
    // const { isToggled} = useNofitication(); // isToggled 를 받음

    // if (!isToggled) return null;

    useEffect(() => {
        setFadeOut(false);
    }, [notification]);

    const handleMessageClick = () => {
        setFadeOut(true);
        console.log("Navigating to /notification");  // 로그 추가
        // onAllClose();
        // navigate('/notification');
        setTimeout(() => {
            onAllClose();
            navigate('/notification');
        }, 500); // fade-out 시간과 일치
    }

    // close 버튼
    const handleCloseClick = (e) => {
        e.stopPropagation(); // 클릭 이벤트가 상위로 전파되는거 막음.
        // onClose();
        setFadeOut(true);
        setTimeout(() => {
            onClose();
        }, 500); // fade-out 시간과 일치
    }


    // useEffect
    useEffect(() => {

        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                onClose();
            }, 500);
        }, 5000);

        return () => clearTimeout(timer);

    }, [notification, onClose]);

    // return ReactDOM.createPortal(
    //     message ? (
    //         <div id='notification-alert'
    //             onClick={handleMessageClick} // 메시지 클릭 시 페이지로 이동
    //         >
    //             <span className='alert-left'><FaBell /> {message}</span> <br />
    //             <span className='alert-date'>{formatRelativeTime(create_at)}</span>

    //             <button className='alert-delete'
    //                 onClick={handleCloseClick} // X 버튼 클릭 시 알림 숨기기
    //             >
    //                 <FaTimes />
    //             </button>
    //         </div>
    //     ) : null,
    //     document.body
    // );
    return ReactDOM.createPortal(
        <div id='notification-alert' onClick={handleMessageClick} className={fadeOut ? 'fade-out' : ''}>
            <span className='alert-left'>
                <FaBell /> {notification.message}
            </span><br />
            <span className='alert-date'>{formatRelativeTime(notification.created_at)}</span>
            <button className='alert-delete' onClick={handleCloseClick}>
                <FaTimes />
            </button>
        </div>,
        document.body
    );
}