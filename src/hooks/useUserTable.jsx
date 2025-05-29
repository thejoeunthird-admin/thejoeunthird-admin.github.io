import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../utils/getUser";
import { setUserInfo, clearUserInfo } from "../store/userReducer";

/**supabase 내의 유저 테이블을 가져오는 함수*/
export const useUserTable = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user.info);
  const [error, setError] = useState(null);

  /**supabase 내의 유저 테이블을 가져오는 함수*/
  const fetchUserInfo = useCallback(async (force = false) => {
    try {
      const { user } = await getUser();
      if (user === null) {
        dispatch(clearUserInfo());
        return;
      }

      // force가 true이거나 userInfo가 없을 때만 API 호출
      if (!force && userInfo) return;

      const res = await fetch(`https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/userinfo?${new URLSearchParams({
        id: user.id,
        name: user.name,
      })}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache"
      });
      if (!res.ok) throw new Error(await res.text());
      const { data } = await res.json();
      dispatch(setUserInfo(data));
      setError(null);
    } catch (err) {
      setError(err.message);
      dispatch(clearUserInfo());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const refetch = useCallback(async () => {
    fetchUserInfo(true); // 강제 리패치
  }, [fetchUserInfo]);

  return {
    /** 유저의 정보 */
    info: userInfo,
    /** 유저의 정보를 가져오는 중인지 */
    loading: userInfo === null && error === null,
    /** 오류 목록 */
    error,
    /** 유저 정보 다시 가져오기 */
    refetch,
  };
};