import { supabase } from '../supabase/supabase'


//** 로그인만들기 */
const signInWithGoogle = async (e) => {
  try {
        const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: "http://localhost:3000/login/redirect"
        }
        });

    if (error) {
        console.error("로그인 오류:", error.message);
    }
  } catch (error) {
    console.error("로그인 중 예외 발생:", error);
  }
};

export function Login(){
    return(<>
        <button
        onClick={(e)=>{signInWithGoogle(e)}}
        >구글 로그인</button>
    </>)
}