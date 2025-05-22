import { useAddressLocation } from "../hooks/useAddressLocation";
import { useGeolocation } from "../hooks/useGeolocation";

export function TestPage() {
    const { location, fetchLocation } = useGeolocation();
    const address = useAddressLocation(location.x,location.y);
    return (<>
        {address[0] + " / "+address[1]}
    </>);
}
