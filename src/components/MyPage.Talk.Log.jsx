import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { useSubscribe } from '../hooks/useSubscribe';
import '../css/MyPage.Talk.Log.css';

export function MyPageTalkLog({ user }) {
    const talkRef = useRef();
    const inputRef = useRef();
    const [talk, setTalk] = useState([]);
    const { item: receiver } = useParams(); // 보낸사람
    const [receiverName, setReceiverName] = useState(null);

    const fetchChatLog = async () => {
        if (!user) return;
        const { data, error } = await supabase.rpc('get_chats_by_sender_and_receiver', {
            p_sender: receiver,
            p_receiver: user.info.id
        });
        if (error) console.error(error);
        else setTalk([...data]);
    };

    useSubscribe({
        table: 'chats',
        schema: 'public',
        callback: ({ newData }) => {
            if (newData) fetchChatLog();
        },
    });

    const markAllAsRead = async () => {
        if (receiver === user.info.id) return;
        const { error } = await supabase.rpc('mark_all_chats_as_read', {
            p_sender: user.info.id,
            p_receiver: receiver,
        });
        if (error) console.error('채팅 읽음 처리 실패:', error);
    };

    useEffect(() => {
        const getReceiver = async () => {
            if (!receiver) return;
            const { data: { name }, error } = await supabase
                .from('users')
                .select('name')
                .eq('id', receiver)
                .single();
            if (!error) setReceiverName(name);
        };
        fetchChatLog();
        markAllAsRead();
        getReceiver();
    }, [receiver]);

    useEffect(() => {
        if (talkRef.current) {
            talkRef.current.scrollTo({
                top: talkRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    });

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const message = inputRef.current.value.trim();
        if (!message) return;
        const { error } = await supabase.from('chats').insert({
            sender_id: receiver,
            receiver_id: user.info.id,
            chat: message,
        });
        if (!error) inputRef.current.value = '';
        fetchChatLog();
    }, [talk]);

    if (!receiverName) {
        return (
            <p style={{ marginTop: '30px', padding: '10px', color: 'rgb(0,0,0,0.5)' }}>
                대화 상대를 찾을 수 없습니다.<br />뒤로 넘어가 주세요.
            </p>
        );
    }

    return (
        <div className="talkLog-wrapper">
            <div className="talkLog-container">
                <span className="talkLog-title">{receiverName}</span>

                <div ref={talkRef} className="talkLog-scroll">
                    {talk.length !== 0 ? (
                        talk.slice().reverse().map((o, k) => (
                            <li
                                key={k}
                                className={`talkLog-item ${o.receiver.id === user.info.id ? 'is-me' : ''}`}
                            >
                                <strong className={`talkLog-username ${o.read ? '' : 'is-read'}`}>
                                    {o.receiver.name}
                                </strong>
                                <span className="talkLog-message">
                                    <p>{o.chat}</p>
                                    <small>{new Date(o.create_date).toISOString().slice(0, 10)}</small>
                                </span>
                            </li>
                        ))
                    ) : (
                        <div className="talkLog-empty">
                            <p style={{ fontSize: '1.2rem' }}>새로운 채팅방 입니다.</p>
                            <br />
                            <small style={{ fontSize: '0.8rem' }}>채팅을 입력해주세요</small>
                        </div>
                    )}
                </div>

                <form className="talkLog-form" onSubmit={handleSubmit}>
                    <textarea
                        ref={inputRef}
                        className="talkLog-textarea"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button type="submit" className="talkLog-button">입력</button>
                </form>
            </div>
        </div>
    );
}
