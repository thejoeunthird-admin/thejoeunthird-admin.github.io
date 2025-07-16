import { supabase } from '@/supabase';
import axios from 'axios';

export const loader = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  const user = session?.user;
  let init = {
    access: null,
    region: [null, null]
  };
  if (user) {
    try {
      const res = await axios.get(
        'https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/userinfo',
        {
          params: { id: user.id, name: user.name },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      init = { ...res.data.data, access: session.access_token }
      sessionStorage.setItem('userData', JSON.stringify(init));
    } catch (err) {
      console.error('userData 실패:', err);
    }
  }
  return { ...init };
};
