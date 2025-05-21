import { supabase } from '../supabase/supabase';

/** 세션에 들어가 있는 유저의 정보를 가져온다. */
export const getUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('세션 가져오기 오류:', error.message);
      return { user: null, error: error.message };
    }
    if (!session) {
      // 세션 없을 때 error 메시지 명확히
      return { user: null, error: '로그인 되지 않은 유저입니다.' };
    }

    return {
      user: {
        token: session.access_token,
        id: session.user.id,
        ...session.user.user_metadata,
      },
      error: null,
    };
  } catch (err) {
    console.error('getUser 예외 발생:', err);
    return { user: null, error: err.message || '알 수 없는 에러' };
  }
};