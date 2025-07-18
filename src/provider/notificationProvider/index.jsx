import { useEffect, useState } from "react";
import { useToken } from "@hooks";
import { supabase } from "@/supabase";
import { Notifications } from './notifications'

export function NotificationProvider({ children }) {
    const { token, ready } = useToken();
    const [ notification, setNotification ] = useState([]);
    
    useEffect(() => {
        if (!token) { console.warn('로그인된 사용자가 없습니다.'); return; }
        const fetchNotifications = async () => {
            try {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('receiver_id', token.id)
                    .eq('is_read', false)
                    .order('created_at', { ascending: false }); // 최신순
                if (error) { throw error }
                setNotification(data);
            } catch (error) { return error; }
        };
        fetchNotifications();
    }, [token]);

    if(!ready) { return; }
    return (<>
        {children}
        { notification &&(<Notifications notification={notification} setNotification={setNotification}/>)}
    </>)
}