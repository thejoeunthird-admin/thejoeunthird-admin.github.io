import "../css/login.redirect.css"
import { useEffect, useRef, useState } from 'react';
import { getUser } from '../utils/getUser';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../hooks/useRegion';

const createNickname = async (ref, city, district) => {
  try {
    const { user } = await getUser();
    if (!user) throw new Error("로그인된 유저가 없습니다.");

    const nickname = ref.current.value;
    if (!nickname || nickname.trim() === "") {
      throw new Error("닉네임을 입력해주세요.");
    }

    const res = await fetch('https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: user.id, name: nickname, region:JSON.stringify([ city, district ]), }),
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
  const [ toggle, setToggle] = useState(false);
  const navigate = useNavigate();
  const { 
    city, setCity,
    district, setDistrict,
    citys, districts,
    setBoth,
  } = useRegion();

  useEffect(() => {
    const isTable = async () => {
      const { user } = await getUser();
      if (!user || !user.id) return false;
      const query = new URLSearchParams({ id: user.id, name: user.name, region:JSON.stringify([ city, district ]) }).toString();
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
    if(city !== undefined) {
      isTable().then((data) => {
        if (!data.created) {
          setBoth(data.user.region[0],data.user.region[1])
          //navigate('/'); 
        } 
        else {
          setToggle(data.created); 
        }
      });
    }
  }, [city]); 

  //f(!toggle) { return(<>로그인 시도중입니다.</>)}
  /*else*/ return(<>
    <form onSubmit={(e) => {
      e.preventDefault()
      setToggle(false)
      console.log(city,district)
      createNickname(inputRef, city, district).then(()=>{
        //navigate('/')
        console.log(city, district)
      })
    }}>
      <input placeholder='닉네임 입력' ref={inputRef} />
      <select 
      className="toogle_item" 
      name="region"
      value={city}
      onChange={(e) =>{
        e.preventDefault();
        setCity(e.target.value)
      }}
      >
        { citys.map((o,k)=>
          <option key={k} value={o}>{o}</option>
        )}
      </select>
      <select 
      className="toogle_item" 
      name="region"
      value={district}
      onChange={(e) =>{
        e.preventDefault();
        setDistrict(e.target.value)
      }}
      >
        { districts.map((o,k)=>
          <option key={k} value={o}>{o}</option>
        )}
      </select>
      <button type='submit' style={{ marginLeft: 10 }}>
        입력
      </button>
    </form>
  </>)
}
