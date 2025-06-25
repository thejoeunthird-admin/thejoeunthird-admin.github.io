import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabase';
import { useUserTable } from '../hooks/useUserTable';
import { Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { FaToggleOn, FaToggleOff, FaBell, FaRegTrashAlt, FaRegHeart } from 'react-icons/fa';
import '../css/notifications.css';
import { useNavigate } from 'react-router-dom';
import { useImage } from "../hooks/useImage";
import { MdOutlineComment } from 'react-icons/md';
import { IoLogoWechat } from 'react-icons/io5';
import { TbMessageChatbot } from 'react-icons/tb';
import { getCategoryUrl } from '../utils/utils';
import { useCategoriesTable } from "../hooks/useCategoriesTable";




export function Notifications() {
    const { info: userInfo, loading: userLoading } = useUserTable();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggled, setIsToggled] = useState(true); // toggle on/ogg
    const [seletedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate(); // 댓글 이동
    const { images, setImages, getImages, initImage } = useImage(); // 이미지 
    const [allSelected, setAllSelected] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    // const [newNotificationCount, setNewNotificationCount] = useState(0);
    const { findById } = useCategoriesTable();
    const [trades, setTrades] = useState([]);


    // on/off 토글 함수
    const handleToggle = async () => {
        // const newToggle = !isToggled;

        setIsToggled(prev => !prev);

        // const {error} = await supabase
        //     .from('users')
        //     .update({noti_enabled: newToggle})
        //     .eq('id', userInfo.id)
        //     .select();

        // if (error) console.error("알림 설정 저장 실패", error);

    };

    // 체크박스 토글 핸들러
    const handleCheckboxChange = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 알림 삭제 함수
    const handleDelete = async () => {
        if (seletedIds.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .delete()
            .in('id', seletedIds);

        if (error) {
            console.log("알림 삭제 실패", error);
            setAlertMessage("알림 삭제 중 오류발생");
            setShowAlert(true);
        } else {
            setNotifications(prev => prev.filter(n => !seletedIds.includes(n.id)));
            setSelectedIds([]); // 체크박스 초기화
        }
    }

    // 알림 이동 함수 (navigate)
    const handleNotificationClick = async (noti) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', noti.id);

        if (error) {
            console.error("알림 상태 업데이트 실패", error);
            return;
        }

        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === noti.id ? { ...notification, is_read: true } : notification
            )
        );

        // 채팅 상세페이지 이동
        if (noti.type === 'chats' && noti.table_id) {
            navigate(`/my/talk/${noti.sender_id}`)
        }
        // trades 상세 페이지 이동
        else if (noti.table_type === 'trades' && noti.table_id) {

            // trades 테이블에서 category_id 찾기 
            const {data:tradeData, error:tradeError} = await supabase 
                .from('trades')
                .select('category_id')
                .eq('id', noti.table_id)
                .single();

            if(tradeError) {
                console.error(tradeError);
                return;
            }

            // findById(categories Hook)으로 categories 테이블에서 url컬럼 찾기
            navigate(`/trade/${findById(tradeData.category_id).url}/${noti.table_id}?keyword=`);

        } 
        // boards 상세페이지 이동
        else if (noti.table_type === "boards" && noti.table_id) {
            const {data:boardData, error:boardError} = await supabase
                .from('boards')
                .select('category_id')
                .eq('id', noti.table_id)
                .single();

            if(boardError){
                console.error(boardError);
                return;
            }

            navigate(`/board/${findById(boardData.category_id).url}/${noti.table_id}?keyword=`)
        }
    };

    // checkBox 전체선택
    const handleAllCheck = () => {
        if (allSelected) {
            setSelectedIds([]); // 모두 해제
        } else {
            const allIds = notifications.map(noti => noti.id);
            setSelectedIds(allIds); // 모두 선택
        }
        setAllSelected(prev => !prev);
    }

    // type마다 아이콘 렌더링
    const getTypeIcon = (type) => {
        switch (type) {
            case 'comment':
                return <MdOutlineComment className='noti-type-icon' />
            case 'chats':
                return <TbMessageChatbot className='noti-type-icon' />
            case 'likes':
                return <FaRegHeart className='noti-type-icon' />
        }
    }

    // useEffect
    useEffect(() => {
        if (!userInfo) {
            console.log('로그인 된 사용자 없음');
            // setShowAlert(true);
            return;
        }
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

        //     fetchToggleSetting(); // 호출
        // }


        const fetchNotification = async () => {
            setLoading(true);

            // 알림을 가져오는 API 호출
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('receiver_id', userInfo.id)
                .order('created_at', { ascending: false });


            if (error) {
                console.error('알림 불러오기 실패', error);
            } else {
                // 알림에서 table_type과 table_id를 이용해 게시글 정보 가져오기
                const notificationsWithDetails = await Promise.all(data.map(async (noti) => {
                    let detailContent = '';
                    let mainImg = null;

                    // 댓글 내용 가져오기
                    if (noti.type === 'comment') {
                        const { data: commentData, error: commentError } = await supabase
                            .from('comments')
                            .select('comment')
                            .eq('id', noti.related_id)
                            .single();

                        if (commentError) {
                            console.error('게시글 내용 불러오기 실패', commentError);
                        } else {
                            detailContent = commentData.comment;
                        }
                    } else if (noti.type === 'chats') { // 채팅내용 가져오기
                        const { data: chatData, error: chatsError } = await supabase
                            .from('chats')
                            .select('chat')
                            .eq('id', noti.related_id !== null ? noti.related_id : noti.table_id)
                            .single();

                        if (chatsError) {
                            console.error('채팅 내용 불러오기 실패', chatsError);
                        } else {
                            if (chatData) {
                                detailContent = chatData.chat;
                                console.log(chatData);
                            } else {
                                console.log('채팅 내용이 존재하지 않습니다.');
                            }
                        }
                    }

                    // 게시물 이미지 가져오기
                    if (noti.table_type && noti.table_id) {
                        const tablesWithImage = ['trades', 'boards'];

                        if (tablesWithImage.includes(noti.table_type)) {
                            const { data: postData, error: postError } = await supabase
                                .from(noti.table_type)
                                .select('main_img')
                                .eq('id', noti.table_id)
                                .single();

                            if (!postError && postData) {
                                mainImg = postData.main_img;
                            }

                        }
                    }

                    return { ...noti, detailContent, mainImg };
                }))

                setNotifications(notificationsWithDetails);
                // setNewNotoficationCount(notificationsWithComment.filter(noti => !noti.is_read).length);

                // 새로 읽지 않은 알림 수를 업데이트
                // const unreadNotifications = notificationsWithDetails.filter(noti => !noti.is_read);
                // setNewNotificationCount(unreadNotifications.length);

            }

            setLoading(false);
        };

        fetchNotification();
    }, [userInfo]);


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
        return `${days}일 전`;
    };

    return (
        <div id="notification-list">
            <div className='noti-header'>
                <div className='header-box'>
                    <div className='header-center'>
                        <FaBell className='noti-icon' />알림
                        {/* {newNotificationCount > 0 && (
                        <Badge bg="danger" className="ms-2">
                        {newNotificationCount} new
                        </Badge>
                        )} */}
                    </div>
                    <div className='header-right'>
                        <button className='header-allCheck' onClick={handleAllCheck}>
                            {/* {allSelected ? '전체해제' : '전체선택'} */}
                            전체선택
                        </button>
                        <button className='header-icon' onClick={handleDelete}>
                            <FaRegTrashAlt />
                        </button>
                        <button onClick={handleToggle} className='header-icon'>
                            {isToggled ? (<FaToggleOn />) : (<FaToggleOff />)}
                        </button>
                    </div>

                </div>
            </div>
            {loading ? (
                <Spinner animation="border" variant="primary" />
            ) : (
                <ListGroup className='list-group'>
                    {notifications.map((noti) => (
                        <ListGroup.Item
                            key={noti.id}
                            className={`noti-items ${noti.is_read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(noti)}
                            style={{ cursor: 'pointer' }}
                        >

                            <div className='noti-checked' onClick={(e) => e.stopPropagation()}>
                                <input
                                    type='checkbox'
                                    checked={seletedIds.includes(noti.id)}
                                    onChange={() => handleCheckboxChange(noti.id)}
                                />
                            </div>
                            <div className='noti-type'>
                                {getTypeIcon(noti.type)}
                            </div>
                            <div className='noti-content'>
                                {!noti.is_read && <span className='badge'>New</span>}

                                <div className='noti-message'>{noti.message}</div>
                                <div className='noti-detail'>{noti.detailContent} </div>
                                {/* <small className="text-muted">{new Date(noti.created_at).toLocaleString()}</small> */}
                                <small className="text-muted">{formatRelativeTime(noti.created_at)}</small>
                            </div>
                            {noti.mainImg && (
                                <div className="noti-image">
                                    <img src={getImages(noti.mainImg)} alt="main" />
                                </div>
                            )}

                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
}