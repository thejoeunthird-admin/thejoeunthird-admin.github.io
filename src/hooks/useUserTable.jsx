import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../utils/getUser";
import { setUserInfo, clearUserInfo } from "../store/userReducer";

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
    info: userInfo,
    loading: userInfo === null && error === null,
    error,
    refetch: fetchUserInfo,
  };
};
