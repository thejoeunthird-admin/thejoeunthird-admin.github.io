import { useEffect, useRef, useState } from 'react';
import '../css/MyPage.css'
import { useNavigate, useNavigation, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { getUser } from '../utils/getUser';
import { useUserTable } from '../hooks/useUserTable'
import { useSubscribe, EVENT_TYPES } from '../hooks/useSubscribe'

function Default() {

    return (<>
        내정보창 디폴트입니다.
    </>)
}

function TalkLog({ item, user }) {
    const talkRef = useRef();
    const [talk, setTalk] = useState([]);

    // 🔧 함수 위치 옮김 (컴포넌트 스코프 안에서 재사용 가능하게)
    const fetchChatLog = async () => {
        if (!item) return;
        const { data, error } = await supabase.rpc('get_chats_by_sender_and_receiver', {
            p_sender: item.sender.id,
            p_receiver: item.receiver.id
        });
        if (error) console.error(error);
        else setTalk(data);
    };

    useSubscribe({
        table: 'chats',
        schema: 'public',
        callback: ({ newData }) => {
            if (!item || !newData) return;
            const isRelated =
                (newData.sender_id === item.sender.id && newData.receiver_id === item.receiver.id) ||
                (newData.sender_id === item.receiver.id && newData.receiver_id === item.sender.id);
            if (isRelated) {
                fetchChatLog(); // ✅ 이제 접근 가능

            }
        },
    });

    useEffect(() => {
        fetchChatLog();
    }, [item]);

    useEffect(() => {
        if (talkRef.current) {
            talkRef.current.scrollTo({
                top: talkRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [talk]);

    if (talk.length === 0) return null;
    return (
        <div className='talkLog'>
            <span className='span'>(유저이름) TALK </span>
            <div ref={talkRef}>
                {talk.slice().reverse().map((o, k) =>
                    <li key={k} className={`${o.receiver.id === user.info.id ? 'red' : ''}`}>
                        <strong className={`${o.read ? '' : 'read'}`}>
                            {o.receiver.name}
                        </strong>
                        <span>
                            <p>{o.chat}</p>
                            <small>{new Date(o.create_date).toISOString().slice(0, 10)}</small>
                        </span>
                    </li>
                )}
            </div>
        </div>
    );
}


function Talk() {
    const nav = useNavigate();
    const user = useUserTable();
    const [talkList, setTalkList] = useState([]);
    const { item } = useParams();

    useEffect(() => {
        const fetchChatLog = async () => {
            const { user } = await getUser();
            const { data, error } = await supabase.rpc('get_latest_chats_by_receiver', {
                p_sender: user.id
            });
            if (error) console.error(error);
            else setTalkList(data)
        };
        fetchChatLog();
    }, [])

    const markAsRead = async (id) => {
        const { error } = await supabase.rpc('mark_chat_as_read', { chat_id: id });
        if (error) return console.error(error);
        setTalkList((prev) =>
            prev.map(chat =>
                chat.id === id ? { ...chat, read: true } : chat
            )
        );
    };

    if (user.loading) { return; }
    return (<>
        <div className='talk_div'>
            <ul className='talkList'>
                <span className='span'>TALK</span>
                <div>
                    {talkList.map((o, k) =>
                        <li key={k}
                            onClick={(e) => {
                                e.preventDefault();
                                markAsRead(o.id);
                                nav(`/my/talk/${k}`);
                            }}
                        >
                            <strong
                                className={`${o.read ? '' : 'read'}`}
                            >
                                {o.receiver.name}
                            </strong>
                            <span>
                                <p>{o.chat}</p>
                                <small>{new Date(o.create_date).toISOString().slice(0, 10)}</small>
                            </span>
                        </li>
                    )}
                </div>
            </ul>
            {item !== undefined
                ? <TalkLog item={talkList[item]} user={user} />
                : <section></section>
            }
        </div>
    </>)
}

export function MyPage() {
    const { tap } = useParams();


    // 내정보, 채팅, 좋아요 누른 게시판 

    switch (tap) {
        case 'talk': { return <Talk /> }
        default: { return <Default /> } break;
    }
}

