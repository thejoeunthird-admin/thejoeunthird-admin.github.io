import { supabase } from '../supabase/supabase';

/** 세션에 들어가 있는 유저의 정보를 가져온다. */
export const getUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('세션 가져오기 오류:', error.message);
      return { };
    }
    if (!session) {
      console.error('세션 가져오기 오류:', error.message);
      return { error:'로그인 되지 않은 유저 입니다.' };
    }

    return {
        token: session.access_token,
        id:session.user.id,
        ...session.user.user_metadata,
    };
  } catch (err) {
    console.error('getUser 예외 발생:', err);
    return { };
  }
};