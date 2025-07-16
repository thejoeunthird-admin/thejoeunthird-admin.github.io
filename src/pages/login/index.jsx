
// import "../css/login.css"
import { supabase } from '@/supabase'
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io";
import { logo } from '@img';
import * as S from './index.styled'
import { useSearchParams } from 'react-router-dom';

const signInWith = async (e, searchParams, path) => {
  e.preventDefault();
  const isLocalhost = window.location.hostname === "localhost";
  const baseUrl = isLocalhost 
    ? "http://localhost:3000" 
    : "https://thejoeunthird-admin.github.io";
  const redirectUrl = `${baseUrl}/#/login/redirect?redirectFrom=${searchParams.get('redirectFrom') ||''}`;
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: path, // 'google'
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
          include_granted_scopes: 'true'
        },
        pkce: true,
        scopes: 'openid profile email'
      }
    });

    if (error) throw error;
    
  } catch (error) {
    alert(`로그인 실패: ${error.message}`);
  }
};

export function Login() {
  const [ searchParams, setSearchParams ] = useSearchParams();
  return (<>
    <S.Container>
      <section>
        <img src={logo} alt="logo" />
        <div className='contents'>
          <h2>꿀 찾으러 가는 중... 🌼</h2>
          <div>
            <button onClick={(e)=>signInWith(e,searchParams,'google')}>
              <FcGoogle style={{ padding: '0px 10px', paddingLeft:'0px'}}/>으로 로그인하기
            </button>
            <button onClick={(e)=>signInWith(e,searchParams,'github')}>
              <IoLogoGithub style={{ padding: '0px 10px', paddingLeft:'0px'}}/>으로 로그인하기
            </button>
          </div>
        </div>
      </section>
    </S.Container>
  </>)
}