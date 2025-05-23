import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../utils/getUser";
import { setUserInfo, clearUserInfo } from "../store/userReducer";

/**supabase 내의 유저 테이블을 가져오는 함수*/
export const useUserTable = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user.info);
  const [error, setError] = useState(null);

  const fetchUserInfo = async () => {
    const { user } = await getUser();
    if (user === null) { return; }
    if (userInfo) { return; }
    try {      
      const query = new URLSearchParams({ id: user.id, name: user.name }).toString();
      const res = await fetch(`https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/userinfo?${query}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.detail || "Failed to fetch user info");
      }

      const { data } = await res.json();
      dispatch(setUserInfo(data));
    } catch (err) {
      setError(err.message);
      dispatch(clearUserInfo());
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return {
    /** 유저의 정보 */
    info: userInfo,
    /** 유저의 정보를 가져오는 중인지 */
    loading: userInfo === null && error === null,
    /** 오류 목록 */
    error,
    /** 유저 정보 다시 가져오기 */
    refetch: fetchUserInfo,
  };
};
