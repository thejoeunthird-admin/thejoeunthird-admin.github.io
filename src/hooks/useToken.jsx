import { useAtom } from 'jotai';
import { userTokenAtom, initUserToken } from '@jotai';
import { useCallback, useEffect, useState } from 'react';
import { getUser } from '../utils';

export const useToken = () => {
    const [token, setToken] = useAtom(userTokenAtom);
    const [ready, setReady] = useState(false);

    const init = useCallback(() => {
        console.log('ddd'); // ✅ 여기 반드시 찍힘
        setToken({ ...initUserToken });  // ❗️ 꼭 새 객체로
        setReady(false);
    }, [setToken]);

    useEffect(() => {
        if (!token.data && !ready) {
            const fetchToken = async () => {
                const result = { ...initUserToken };

                try {
                    const res = await getUser();
                    if (res?.user) {
                        result.data = res.user;
                    }
                } catch (err) {
                    console.warn("getUser() 오류:", err);
                } finally {
                    setToken(result);
                    setReady(true);
                }
            };

            fetchToken();
        }
    }, [token.data, ready]); // 정확한 의존성 사용

    return {
        token,
        ready,
        init,
    };
};
