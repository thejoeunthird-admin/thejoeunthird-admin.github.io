import { profile } from '@img'
import { FiPlusCircle } from "react-icons/fi";
import * as S from './index.styled'
import { useLoaderData, useNavigate, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { useImage, useRegion } from '../../../hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProfileImage } from '@components';

const userEditor = async (defaultData, name, city, district, img) => {
  try {
    const res = await fetch('https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${defaultData.access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: defaultData.id, name: name, region: JSON.stringify([city, district]), email: defaultData.email, img: img }),
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


// 테이블이 있는지 확인하는 로더?

export { loader } from './loader'
export function Redirect() {
  const inputRef = useRef();
  const redirect = useLoaderData();
  const user = useRouteLoaderData('user');
  const [membership, setMembership] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const image = useImage();

  useEffect(() => {
    if (redirect.error) { return; } // 에러니까 꺼져
    // if(!redirect.created && !redirect.error){
    //   const redirectUrl = searchParams.get('redirectFrom');
    //   searchParams.delete('redirectFrom');
    //   navigate(redirectUrl);
    // } else { setMembership(true); }
    setMembership(true); // 임시 
  }, [redirect])

  const { region, regionList, setRegion } = useRegion();

  const handleRegion = useCallback((e, path) => {
    e.preventDefault();
    setRegion(path, e.target.value);
  }, [setRegion])

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    const name = inputRef.current.value === "" ? inputRef.current.placeholder : inputRef.current.value
    const profileImg = image.images.length === 0 ? (user?.img) : (image.images[image.images.length - 1]);
    userEditor(user, name, region.city, region.district, profileImg).then(() => {
      const redirectUrl = searchParams.get('redirectFrom');
      searchParams.delete('redirectFrom');
      navigate(redirectUrl);
      alert(`${name} 님\n회원가입을 환영합니다.`)
    }).catch((error)=>{
      console.error("회원정보 업데이트 중 오류:", error);
      alert("회원가입 처리 중 오류가 발생했습니다.\n다시 시도해주세요.");
    });
  })


  return (<>
    <S.Container>
      <section>
        <ProfileImage image={image} />
        <form onSubmit={(e) => { onSubmit(e) }}>
          <span>
            <span >🎉</span>
            가입을 환영합니다!
            <span>🎉</span>
          </span>
          <small>초기 닉네임과 주소를 입력해주세요.</small>
          <input placeholder={user.name} ref={inputRef} />
          <div className="region">
            <select
              className="toogle_item"
              name="region"
              value={region.city}
              onChange={(e) => {
                handleRegion(e, 'city');
              }}
            >
              {regionList.city.map((o, k) => <option key={k} value={o}>{o}</option>)}
            </select>
            <select
              className="toogle_item"
              name="region"
              value={region.district}
              onChange={(e) => { handleRegion(e, 'district') }}
            >
              {regionList.district.map((o, k) =>
                <option key={k} value={o}>{o}</option>
              )}
            </select>
          </div>
          <button type='submit'>
            입력
          </button>
        </form>
      </section>
    </S.Container>
  </>)
}
