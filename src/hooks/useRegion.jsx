import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setRegionAddress, setRegionLoading, resetRegion, setRegionBoth } from '../store/redux';
import region from '../utils/region.json';

export const useRegion = () => {
    const dispatch = useDispatch();
    const { address, isLoading } = useSelector((state) => state.region);

    const DEFAULT_COORDS = {
        x: 126.9780,
        y: 37.5665
    };

    const getAddressFromCoords = useCallback((x, y) => {
        dispatch(setRegionLoading(true));
        const loadKakaoMap = () => {
            window.kakao.maps.load(() => {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.coord2Address(x, y, (result, status) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                        dispatch(setRegionAddress([
                            result[0].address.region_1depth_name,
                            result[0].address.region_2depth_name
                        ]));
                    } else {
                        console.warn('주소 변환에 실패했습니다.');
                    }
                    dispatch(setRegionLoading(false));
                });
            });
        };

        if (!window.kakao) {
            const script = document.createElement('script');
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=bc7544842f15980d1e228d96a24008e5&libraries=services&autoload=false`;
            script.async = true;

            script.onload = loadKakaoMap;
            script.onerror = () => {
                console.warn('카카오맵 스크립트 로드에 실패했습니다.');
                dispatch(setRegionLoading(false));
            };

            document.head.appendChild(script);
            return () => document.head.removeChild(script);
        } else {
            loadKakaoMap();
        }
    }, [dispatch]);

    const fetchAddress = useCallback(() => {
        dispatch(resetRegion());
        dispatch(setRegionLoading(true));

        if (!navigator.geolocation) {
            console.warn('Geolocation을 지원하지 않는 브라우저입니다. 기본 좌표를 사용합니다.');
            getAddressFromCoords(DEFAULT_COORDS.x, DEFAULT_COORDS.y);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                getAddressFromCoords(
                    position.coords.longitude,
                    position.coords.latitude
                );
            },
            (err) => {
                console.warn(`위치 정보를 가져오는데 실패했습니다: ${err.message}. 기본 좌표를 사용합니다.`);
                getAddressFromCoords(DEFAULT_COORDS.x, DEFAULT_COORDS.y);
            }
        );
    }, [dispatch, getAddressFromCoords]);

    useEffect(() => {
        if (address.length === 0) {
            fetchAddress();
        }
    }, [fetchAddress]);

    const setCity = (city) => {
        dispatch(setRegionAddress([
            city,
            region[city][0],
        ]));
    };

    const setDistrict = (district) => {
        dispatch(setRegionAddress([
            address[0],
            district,
        ]));
    };

    const setBoth = (city, district) => {
        dispatch(setRegionBoth(city, district));
    };


    return {
        city: address[0],
        setCity,
        citys: Object.keys(region),
        district: address[1],
        setDistrict,
        setBoth,
        districts: region[address[0]] || [],
        isLoading,
        refetch: fetchAddress
    };
};
