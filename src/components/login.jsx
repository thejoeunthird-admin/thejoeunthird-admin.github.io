
import "../css/login.css"
import { supabase } from '../supabase/supabase'

//** 로그인만들기 */
const signInWithGoogle = async (e, path) => {
  e.preventDefault();
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: path, // 일반적으로 'google'
      options: {
        redirectTo: "http://localhost:3000/login/redirect",
        queryParams: {
          prompt: 'select_account' // ← 핵심 옵션
        }
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
    <div className="login">
      <section className="login_sectoin">
        <img />
        <div 
        className="forWeb"
        onClick={(e)=>{signInWithGoogle(e,'google')}}
        >
          <div className="logobox">
            <img /> 
          </div>
          <h2>for Google</h2>
        </div>
        <div 
        className="forWeb github"
        onClick={(e)=>signInWithGoogle(e,'github')}
        >
          <div className="logobox">
            <img /> 
          </div>
          <h2>for GitHub</h2>
        </div>
      </section>        
    </div>  
  </>)
}