import { useCallback, useEffect, useRef, useState } from 'react';
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

// 리시버 보낸사람
// 샌더 받는 사람

function TalkLog({ user }) {
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
            if (!newData) return;
            fetchChatLog();
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
                .single(); // 결과가 하나일 경우
            if (!error) { setReceiverName(name) }
        }
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
    }, [talk])
    if (!receiverName) {
        return (<>
            <p style={{ marginTop: '30px', padding: '10px', color: 'rgb(0,0,0,0.5)' }}>
                대화 상대를 찾을 수 없습니다.
                <br />
                뒤로 넘어 가주세요.
            </p>
        </>)
    }
    console.log(talk)
    return (
        <div className='sen'>
            <div className='talkLog'>
                <span className='span'>TALK </span>
                {talk.length !== 0 ? (
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
                ) : (<>
                    <div ref={talkRef}>
                        <div className='newChat'>
                            <p style={{ fontSize: '1.2rem' }}>새로운 채팅방 입니다.</p>
                            <br />
                            <small style={{ fontSize: '0.8rem' }}>채팅을 입력해주세요</small>
                        </div>
                    </div>
                </>)}
                <form onSubmit={handleSubmit}>
                    <textarea
                        ref={inputRef}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button type='submit'>입력</button>
                </form>
            </div>
        </div>
    );
}

function Talk({ user }) {
    const nav = useNavigate();
    const [talkList, setTalkList] = useState([]);
    const { item } = useParams();

    const fetchChatLog = async () => {
        const { data, error } = await supabase.rpc('get_latest_chats_by_user', {
        p_user: user.info.id
        });
        if (error) console.error(error);
        else setTalkList([...data])
    };

    useEffect(() => {
        fetchChatLog();
    }, [])

    // 예: 직접 구현 시
    useEffect(() => {
        const subscription = supabase
            .channel('chat-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chats',
            }, (payload) => {
                fetchChatLog();
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chats',
            }, (payload) => {
                fetchChatLog();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return (<>
        <div className='talk_div'>
            <ul className='talkList'>
                <span className='span'>TALK</span>
                <div>
                    {talkList.length !== 0 ? (talkList.map((o, k) =>{
                        //sender
                        let read = o.receiver.id === user.info.id;
                        let isUser = read;
                        if(!isUser) { read = o.read }
                        return(
                        <li key={k}
                            onClick={(e) => {
                                e.preventDefault();
                                nav(`/my/talk/${isUser?o.sender.id:o.receiver.id}`);
                            }}
                        >
                            {/* 여길 자신일경우 제외 */}
                            <strong className={`${read ? '' : 'read'}`}>
                                { isUser?o.sender.name:o.receiver.name }
                            </strong>
                            <span>
                                <p>{o.chat}</p>
                                <small>{new Date(o.create_date).toISOString().slice(0, 10)}</small>
                            </span>
                        </li>)
                    }))
                        : (<div className='newChat'>
                            <p style={{ fontSize: '1.2rem' }}>채팅이 없습니다.</p>
                        </div>)}
                </div>
            </ul>
            {item !== undefined
                ? (<TalkLog item={talkList[item]} user={user} />)
                : (<p style={{ marginTop: '30px', padding: '10px', color: 'rgb(0,0,0,0.5)' }}>
                    {talkList.length !== 0 && '채팅방을 선택 해주세요.'}
                </p>)
            }
        </div>
    </>)
}

export function MyPage() {
    const user = useUserTable();
    const { tap, item } = useParams();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkSize = () => {
            setIsMobile(window.innerWidth < 940);
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    if (user.loading) { return <>로딩중</> }
    switch (tap) {
        case 'talk': {
            if (isMobile) {
                if (!item) { return (<Talk user={user} />) }
                else { return (<TalkLog user={user} />) }
            }
            else return (<Talk user={user} />)
        } break;
        case 'like': {
            return (<> 라이크는 어떻게 구현해야될까 </>);
        } break;
        default: { 

            return(<>{user.info.name}</>)
        } break;
    }
}

