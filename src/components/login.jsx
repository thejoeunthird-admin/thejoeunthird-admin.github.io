
import "../css/login.css"
import { supabase } from '../supabase/supabase'
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io";
import logo from '../public/logo.png';

const signInWithGoogle = async (e, path) => {
  e.preventDefault();
  
  // 개발/프로덕션 환경에 따른 리다이렉트 URL 설정
  const isLocalhost = window.location.hostname === "localhost";
  const baseUrl = isLocalhost 
    ? "http://localhost:3000" 
    : "https://thejoeunthird-admin.github.io";
  
  const redirectUrl = `${baseUrl}/#/login/redirect`;

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: path, // 'google'
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline', // refresh token 요청
          prompt: 'select_account', // 계정 선택 강제
          // 추가 Google OAuth 파라미터
          include_granted_scopes: 'true'
        },
        // PKCE 사용을 위한 추가 설정
        pkce: true,
        scopes: 'openid profile email' // 요청할 스코프
      }
    });

    if (error) throw error;
    
  } catch (error) {
    console.error("로그인 오류:", error.message);
    // 에러 처리 로직 추가 가능
    alert(`로그인 실패: ${error.message}`);
  }
};


export function Login() {
  return (<>
    <div className="login">
      <section className="login_sectoin_new">
        <img src={logo} alt="logo" />
        <div style={{ display:'flex', flexDirection:'column', justifyContent: 'center',}}>
          <h2 className="h2">
            꿀 찾으러 가는 중... 🌼
          </h2>
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div
              className="glass-btn"
              onClick={(e) => { signInWithGoogle(e, 'google') }}
            >
              <FcGoogle style={{ padding: '0px 10px', paddingLeft:'0px'}}/>으로 로그인하기
            </div>
            <div
              className="glass-btn"
              onClick={(e) => signInWithGoogle(e, 'github')}
            >
              <IoLogoGithub style={{ padding: '0px 10px', paddingLeft:'0px' }}/>으로 로그인하기
            </div>
          </div>
        </div>
      </section>
    </div>
  </>)
}