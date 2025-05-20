import { useEffect, useState } from "react";

export const useUserTable = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/functions/v1/userinfo", {
        method: "GET",
        credentials: "include" // 쿠키 기반 인증 필요 시
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.detail || "Failed to fetch user info");
      }

      const data = await res.json();
      setUserInfo(data);
    } catch (err) {
      setError(err.message);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return {
    userInfo,
    loading,
    error,
    refetch: fetchUserInfo
  };
};
