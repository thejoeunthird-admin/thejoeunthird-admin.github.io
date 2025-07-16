import { useEffect, useCallback, useRef } from 'react';
import regions from '../utils/region.json';
import { regionAtom } from '@jotai';
import { useAtom } from 'jotai';
import { useToken } from './useToken';
import { layoutLoader } from '@pages';

// 기본 좌표
const DEFAULT_COORDS = {
    x: 126.9780,
    y: 37.5665,
};
const KAKAO = 'bc7544842f15980d1e228d96a24008e5';

export const useRegion = () => {
    const [region, setRegion] = useAtom(regionAtom);
    const { token } = useToken();

    const getAddressFromCoords = useCallback((x, y) => {
        const loadKakaoMap = () => {
            window.kakao.maps.load(() => {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.coord2Address(x, y, (result, status) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                        setRegion({
                            city: result[0].address.region_1depth_name,
                            district: result[0].address.region_2depth_name,
                        });
                    } else {
                        console.warn('주소 변환에 실패했습니다.');
                    }
                });
            });
        };

        if (!window.kakao) {
            const script = document.createElement('script');
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO}&libraries=services&autoload=false`;
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
    }, [setRegion]);

    const fetchAddress = useCallback(() => {
        // if (!region?.city || !region?.district) return;

        if (!navigator.geolocation) {
            console.warn('Geolocation을 지원하지 않는 브라우저입니다. 기본 좌표를 사용합니다.');
            getAddressFromCoords(DEFAULT_COORDS.x, DEFAULT_COORDS.y);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getAddressFromCoords(position.coords.longitude, position.coords.latitude);
            },
            (err) => {
                console.warn(`위치 정보를 가져오는데 실패했습니다: ${err.message}. 기본 좌표를 사용합니다.`);
                getAddressFromCoords(DEFAULT_COORDS.x, DEFAULT_COORDS.y);
            }
        );
    }, [getAddressFromCoords]);

    useEffect(() => {
        if (!region?.city || !region?.district) {
            (async () => {
                const userRegion = await layoutLoader();
                if (userRegion.region) {
                    if(!userRegion.region?.[0]){ fetchAddress(); }
                    else {
                        setRegion({
                            city: userRegion.region?.[0],
                            district: userRegion.region?.[1],
                        })
                    }
                }
            })();
        }
    }, [fetchAddress, token]);

    return {
        region,
        regionList: {
            city: Object.keys(regions) || ['서울'],
            district: regions[region?.city || '서울'],
        },
        setRegion: (key, value) => {
            setRegion((prev) => ({
                ...prev,
                [key]: value,
            }));
        },
        init: (city = null, district = null) => {
            if (!city && !district) {
                fetchAddress();
            } else {
                setRegion({ city, district });
            }
        },
    };
};
