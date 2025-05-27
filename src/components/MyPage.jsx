import { useEffect, useState } from 'react';
import '../css/MyPage.css'
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { getUser } from '../utils/getUser';

function Default(){

    return(<>
        내정보창 디폴트입니다.
    </>)
}

function Talk(){
    const [ talkList, setTalkList ] = useState([]);
    
    useEffect(()=>{
        const fetchChatLog = async () => {
            const { user } = await getUser();
            const { data, error } = await supabase.rpc('get_latest_chats_by_receiver', {
            p_sender: user.id
            });
            if (error) console.error(error);
            else setTalkList(data)
        };
        fetchChatLog();
    },[])

    const markAsRead = async (id) => {
        const { error } = await supabase.rpc('mark_chat_as_read', { chat_id: id });
        if (error) return console.error(error);
        setTalkList((prev) =>
            prev.map(chat =>
                chat.id === id ? { ...chat, read: true } : chat
            )
        );
    };
 
    return(<>
        <div className='talk_div'>
            <ul className='talkList'>
                <span className='span'>보낸사람</span>
                { talkList.map((o,k)=>
                    <li key={k}
                    onClick={(e)=>{
                        e.preventDefault();
                        markAsRead(o.id);
                    }}
                    >
                        <strong 
                        className={`${o.read?'':'read'}`}
                        >
                            {o.receiver.name}
                        </strong>
                        <span>
                            <p>{o.chat}</p>
                            <small>{ new Date(o.create_date).toISOString().slice(0, 10) }</small>
                        </span>
                    </li>
                )}
            </ul>
            <div className='talkLog'>
                
            </div>
        </div>
    </>)
}

export function MyPage() {
    const { tap } = useParams();
    
    
    // 내정보, 채팅, 좋아요 누른 게시판 

    switch(tap){
        case 'talk':{ return<Talk />  }
        default: { return <Default/> } break;
    }
}

