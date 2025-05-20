import { useEffect, useRef, useState } from 'react';
import { getUser } from '../utils/getUser';
import { useNavigate } from 'react-router-dom';

const createNickname = async (ref, navigate) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("로그인된 유저가 없습니다.");

    const nickname = ref.current.value;
    if (!nickname || nickname.trim() === "") {
      throw new Error("닉네임을 입력해주세요.");
    }

    const res = await fetch('https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,  // 토큰 넣기
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: user.id, name: nickname }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("닉네임 업데이트 실패:", errorData.error ?? res.statusText);
      return;
    }
    navigate("/");
  } catch (err) {
    console.error("예외 발생:", err.message);
  }
};


export function LoginRedirect() {
  const inputRef = useRef();
  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isTable = async () => {
      const user = await getUser();
      if (!user || !user.id) return false;
      const query = new URLSearchParams({ id: user.id, name: user.name }).toString();
      const url = `https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user?${query}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        console.error('서버 요청 실패:', res);
        return false;
      }

      const result = await res.json();
      return result.created;
    };

    isTable().then((created) => {
      if (!created) { navigate('/');} else { setToggle(created); }
    });
  }, []);

  if(!toggle) {return <div>로그인 처리 중입니다.</div>}
  else { return <>
    <form onSubmit={(e) => {
      e.preventDefault()
      setToggle(false)
      createNickname(inputRef, navigate)
    }}>
      <input placeholder='닉네임 입력' ref={inputRef} />
      <button type='submit'>
        입력
      </button>
    </form>
  </>}
}
