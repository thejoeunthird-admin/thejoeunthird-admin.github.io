import "../css/login.css"
import { useEffect, useRef, useState } from 'react';
import { getUser } from '../utils/getUser';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../hooks/useRegion';
import { useUserTable } from "../hooks/useUserTable";

const createNickname = async (name, city, district) => {
  try {
    const { user } = await getUser();
    if (!user) throw new Error("로그인된 유저가 없습니다.");

    const res = await fetch('https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: user.id, name: name, region: JSON.stringify([city, district]), email:user.email }),
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
  const [ name, setName] = useState('');
  const navigate = useNavigate();

  const {
    city, setCity,
    district, setDistrict,
    citys, districts,
  } = useRegion();

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
        console.log(data)
        if (!data.created) {
          alert(`로그인 되었습니다.`)
          navigate('/');
        }
        else {
          setName(data.user[0].name)
          setToggle(false);
        }
      });
    }
  }, []);

  return (<>
    <div className="login">
      <section className="login_sectoin">
        <img />
        <div className={`bouncyingBox ${toggle ? "" : "out"}`}>
          <div className="ball" />
          <div className="ball" />
          <div className="ball" />
          <div className="ball" />
        </div>
        <form 
        className={`box ${toggle ? "" : "out"}`}
        onSubmit={(e)=>{
          e.preventDefault();
          const name = inputRef.current.value === ""?inputRef.current.placeholder:inputRef.current.value
          createNickname(name,city,district).then(()=>{
            alert(`${name} 님\n회원가입을 환영합니다.`)
          });
        }}
        >
          <span className="welcome">
            <span >🎉</span>
            가입을 환영합니다!
            <span>🎉</span>
          </span>
          <small>초기 닉네임과 주소를 입력해주세요.</small>
          <input placeholder={name} ref={inputRef}/>
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
