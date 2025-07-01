import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { MyPageTalkLog } from './MyPage.Talk.Log';

export function MyPageTalk({ user }) {
    const nav = useNavigate();
    const [talkList, setTalkList] = useState([]);
    const { item } = useParams();

    const fetchChatLog = async () => {
        const { data, error } = await supabase.rpc('get_latest_chats_by_user', {
            p_user: user.info.id
        });
        if (error) console.error(error);
        else setTalkList([...data]);
    };

    useEffect(() => {
        fetchChatLog();
    }, []);

    useEffect(() => {
        const subscription = supabase
            .channel('chat-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chats',
            }, fetchChatLog)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chats',
            }, fetchChatLog)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (
        <div className="mytalk-wrapper">
            <ul className="mytalk-list">
                <span className="title">TALK 목록</span>
                <div className="mytalk-scroll">
                    {talkList.length !== 0 ? (
                        talkList.map((o, k) => {
                            let read = o.receiver.id === user.info.id;
                            let isUser = read;
                            if (!isUser) read = o.read;
                            return (
                                <li
                                    className="mytalk-item"
                                    key={k}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        nav(`/my/talk/${isUser ? o.sender.id : o.receiver.id}`);
                                    }}
                                >
                                    <strong className={`mytalk-name ${read ? '' : 'read'}`}>
                                        {isUser ? o.sender.name : o.receiver.name}
                                        <small>{new Date(o.create_date).toLocaleDateString('ko-KR')}</small>
                                    </strong>
                                    <span className="mytalk-preview">
                                        <p>{o.chat}</p>
                                    </span>
                                </li>
                            );
                        })
                    ) : (<div style={{ marginLeft: `10px`, }}>채팅이 없어요!</div>)}
                </div>
            </ul>
            {item !== undefined ? (
                <MyPageTalkLog item={talkList[item]} user={user} />
            ):( <>
                <div className='talkLog-scroll output'>
                    <p style={{ marginTop:'100px' }}>채팅방을 선택 해주세요!</p>
                </div>
            </>)}
        </div>
    );
}
