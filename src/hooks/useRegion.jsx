import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setRegionAddress, resetRegion, setRegionBoth } from '../store/redux';
import region from '../utils/region.json';

/** 시청의 기본 x,y 값 */
const DEFAULT_COORDS = {
    x: 126.9780,
    y: 37.5665
};
const KAKAOKEY = 'bc7544842f15980d1e228d96a24008e5'

/**자신의 위치를 기반하여, 시군구 데이터를 내보내는 훅*/
export const useRegion = () => {
    const dispatch = useDispatch();
    const { address } = useSelector((state) => state.region);

    const getAddressFromCoords = useCallback((x, y) => {
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
            };

            document.head.appendChild(script);
            return () => document.head.removeChild(script);
        } else {
            loadKakaoMap();
        }
    }, [dispatch]);

    const fetchAddress = useCallback(() => {
        dispatch(resetRegion());

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
        /** 시 */
        city: address[0],
        /** 시 변환 */
        setCity,
        /** 시 목록 (utils.region) */
        citys: Object.keys(region),
        /** 군구 */
        district: address[1],
        /** 군구 변환 */
        setDistrict,
        /** 시 에 포함된 군구 목록 */
        districts: region[address[0]] || [],
        /** 시, 군구 동시 변환 */
        setBoth,
        /** 데이터가 도착 여부 */
        isLoading: address.length !== 0?true:false,
        /** 자신 위치에서 다시 시군구 찾기 */
        refetch: fetchAddress
    };
};
