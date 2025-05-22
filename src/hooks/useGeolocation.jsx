import { useState, useEffect, useCallback } from 'react';

// 카카오지도 연계? 고민좀
export const useGeolocation = () => {
    const [location, setLocation] = useState({ x: 126.9780, y: 37.5665 });

    const fetchLocation = useCallback(() => {
        if (!navigator.geolocation) {
            console.warn('Geolocation을 지원하지 않는 브라우저입니다.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    x: position.coords.longitude,
                    y: position.coords.latitude,
                });
            },
            (err) => {
                console.warn(`위치 정보를 가져오는데 실패했습니다: ${err.message}`);
            }
        );
    }, []);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    return { location, fetchLocation };
};