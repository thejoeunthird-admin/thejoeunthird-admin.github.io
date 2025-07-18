import { supabase } from "@/supabase";
import { TbRuler } from "react-icons/tb";
const init = {
    data: [],
    ready: false,
}

export async function loader({ },) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
        try {
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('receiver_id', session.user.id)
                .order('created_at', { ascending: false });
            if (error) { throw error }
            if (notifications.length === 0) { return { ...init, ready:true }; }
            const detailPromises = notifications.map(async (noti) => {
                switch (noti.type) {
                    case 'comment': {
                        const { data, error: dataError } = await supabase
                            .from('comments')
                            .select('comment')
                            .eq('id', noti.related_id)
                            .single();
                        if (dataError) throw dataError;
                        return { ...noti, content: data.comment }
                    }
                    case 'chats': {
                        const { data, error: dataError } = await supabase
                            .from('chats')
                            .select('chat')
                            .eq('id', noti.related_id !== null ? noti.related_id : noti.table_id)
                            .single();
                        if (dataError) throw dataError;
                        return { ...noti, content: data.chat }
                    }
                    default: {
                        const tablesWithImage = ['trades', 'boards'];
                        if (tablesWithImage.includes(noti.table_type)) {
                            const { data, error } = await supabase
                                .from(noti.table_type)
                                .select('*')
                                .eq('id', noti.table_id)
                                .single();
                            if (!error && !data) { throw error }
                            return { ...noti, mainImg: data.main_img }
                        }
                    }
                }
            });
            return { ...init,
                ready: true,
                data: [ ...await Promise.all(detailPromises) ]
            }
        } catch (error) { return init; }
    } return init;
}