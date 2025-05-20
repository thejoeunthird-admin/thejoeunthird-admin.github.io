import { useEffect, useState } from "react";
import { getUser } from "../utils/getUser";

export const useUserTable = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const user = await getUser();
      setLoading(true);
      
      const query = new URLSearchParams({ id: user.id, name: user.name }).toString();
      const res = await fetch(`https://mkoiswzigibhylmtkzdh.supabase.co/functions/v1/userinfo?${query}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.detail || "Failed to fetch user info");
      }
      const { data } = await res.json();
      setUserInfo(data);
    } catch (err) {
      setError(err.message);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserInfo(); }, []);
  
  return {
    info: userInfo,
    loading,
    error,
    refetch: fetchUserInfo 
  };
};
