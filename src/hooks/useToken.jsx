import { useAtom } from 'jotai';
import { userTokenAtom, initUserToken } from '@jotai';
import { useCallback, useEffect, useState } from 'react';
import { getUser } from '../utils';

export const useToken = () => {
    const [token, setToken] = useAtom(userTokenAtom);

    const init = useCallback(() => {
        setToken({ ...initUserToken });  // ❗️ 꼭 새 객체로
    }, [setToken]);

    useEffect(() => {
        if (!token.data && !token.state) {
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
                    result.state = true;
                    setToken(result);
                }
            };
            fetchToken();
        }
    }, [token.data]);

    return {
        token: token.data,
        ready: token.state,
        init,
    };
};
