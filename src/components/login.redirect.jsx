import "../css/login.css"
import { useEffect, useRef, useState } from 'react';
import { getUser } from '../utils/getUser';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../hooks/useRegion';
import { useUserTable } from "../hooks/useUserTable";
import loginRedirectBee from '../public/loginRedirectBee.png'
import loginRedirectHoney from '../public/loginRedirectHoney.png'
import profile from '../public/profile.png'
import { FiPlusCircle } from "react-icons/fi";
import { useImage } from "../hooks/useImage";


const createNickname = async (name, city, district, img) => {
  try {
    const { user } = await getUser();
    if (!user) throw new Error("로그인된 유저가 없습니다.");
    const res = await fetch('https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: user.id, name: name, region: JSON.stringify([city, district]), email: user.email, img:img }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("닉네임 업데이트 실패:", errorData.error ?? res.statusText);
      return;
    }
  } catch (err) {
    console.error("예외 발생:", err.message);
  }
};

export function LoginRedirect() {
  const inputRef = useRef();
  const [toggle, setToggle] = useState(true);
  const [ returnData, setReturnData ] = useState({ })
  const {
    images,
    setImages,
    getImages,
  } = useImage();
  const navigate = useNavigate();

  const {
    city, setCity,
    district, setDistrict,
    citys, districts,
  } = useRegion();

    useEffect(() => {
    // 1. 해시에서 access_token 등 토큰 추출
    const hash = window.location.hash; // 예: "#/login/redirect#access_token=..."
    if (hash.includes('access_token=')) {
      // 예: 해시가 두 개 (#/login/redirect#access_token=...) 형태임
      // split('#access_token=') 로 분리하고, 필요하면 토큰 저장 작업 수행
      const parts = hash.split('#access_token=');
      const pathPart = parts[0]; // '#/login/redirect'
      const tokenPart = parts[1].split('&')[0]; // 토큰 문자열만 추출 (access_token=토큰&다음파라미터...)

      // TODO: 이 토큰으로 supabase에 로그인 처리 등 필요한 작업 수행
      // 예를 들어 localStorage 등에 저장하거나, getUser() 같은 함수와 연동

      // 2. 주소창에서 해시 부분 정리 (토큰 제거)
      window.history.replaceState(null, '', window.location.pathname + pathPart);
    }
  }, []);

  useEffect(() => {
    const isTable = async () => {
      const { user } = await getUser();
      if (!user || !user.id) return false;
      const query = new URLSearchParams({ id: user.id, name: user.name, region: JSON.stringify([city, district]) }).toString();
      const url = `https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user?${query}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        return false;
      }
      const result = await res.json();
      return result;
    };
    if (city !== undefined) {
      isTable().then((data) => {
        setReturnData(data.user)
        setToggle(false);
      });
    }
  }, []);
  return (<>
    <div className="login">
      <section
        className={`login_sectoin redirect ${!toggle ? 'full' : ''}`}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', display: `${toggle ? 'flex' : 'none'}` }}>
          <img
            style={{ animation: 'fly-vertical 1.5s infinite ease-in-out' }}
            src={loginRedirectBee}
          />
          <img
            className="honey"
            style={{ width: '100px', height: '100px', marginLeft: '-50px' }}
            src={loginRedirectHoney}
          />

        </div>
        <div className="profile_img" style={{ display: toggle ? 'none' : 'flex' }} >
          <img src={images.length === 0?profile:getImages(images[images.length -1])}/>
          <div onClick={(e) => {
            e.preventDefault();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.style.display = 'none';
            input.onchange = (event) => {
              setImages(event);
              document.body.removeChild(input); // 생성한 input 제거
            };
            document.body.appendChild(input); // 반드시 DOM에 붙여야 함
            input.click();
          }}>
            <FiPlusCircle />
          </div>
        </div>

        <h2 className="loding">
          맞는 꿀단지 찾는 중 ...
        </h2>
        <form
          className={`box ${toggle ? "" : "out"}`}
          onSubmit={(e) => {
            e.preventDefault();
            const name = inputRef.current.value === "" ? inputRef.current.placeholder : inputRef.current.value
            const profileImg = images.length === 0?(returnData?.img):(images[images.length-1]);
            // 버튼
            createNickname(name, city, district, profileImg).then(() => {
              alert(`${name} 님\n회원가입을 환영합니다.`)
              navigate('/')
            });
          }}
        >
          <span className="welcome">
            <span >🎉</span>
            가입을 환영합니다!
            <span>🎉</span>
          </span>
          <small>초기 닉네임과 주소를 입력해주세요.</small>
          <input placeholder={returnData.name} ref={inputRef} />
          <div className="toggleBox">
            <select
              className="toogle_item"
              name="region"
              value={city}
              onChange={(e) => {
                e.preventDefault();
                setCity(e.target.value)
              }}
            >
              {citys.map((o, k) => <option key={k} value={o}>{o}</option>)}
            </select>
            <select
              className="toogle_item"
              name="region"
              value={district}
              onChange={(e) => {
                e.preventDefault();
                setDistrict(e.target.value)
              }}
            >
              {districts.map((o, k) =>
                <option key={k} value={o}>{o}</option>
              )}
            </select>
          </div>
          <button type='submit'>
            입력
          </button>
        </form>
      </section>
    </div>
  </>)
}
