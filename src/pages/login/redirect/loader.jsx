import { supabase } from '@/supabase';
import axios from 'axios';
import { getDefaultStore } from 'jotai';
import { userTokenAtom } from '@jotai';
import { regionAtom } from '../../../jotai';

const init = { user: null, created: false, error:false }

export async function loader({ },) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if(session) {
        const token = session.user.user_metadata;
        const query = new URLSearchParams({
            id: session.user.id,
            name: token.name,
            email: token.email,
        }).toString();
        try {
            const res = await axios.get(`https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user?${query}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });
            return { ...res.data, error: false };
        } catch (error) {
            return { ...init, error: true };
        }
    } else { return init; }
}
