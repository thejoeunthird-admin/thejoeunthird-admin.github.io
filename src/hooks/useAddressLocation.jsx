import { useState, useEffect } from 'react';

/** 좌표값을 주소값으로 바꿔주는 훅 */
export const useAddressLocation = (x, y) => {
    const [address, setAddress] = useState([]);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${'bc7544842f15980d1e228d96a24008e5'}&libraries=services&autoload=false`;
        script.async = true;
        script.onload = () => {
            kakao.maps.load(() => {
                const geocoder = new kakao.maps.services.Geocoder();
                geocoder.coord2Address(x, y, (result, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        setAddress([
                            result[0].address.region_1depth_name,
                            result[0].address.region_2depth_name,
                        ]);
                    }
                });
            });
        };
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, [x, y]);

    return address;
};