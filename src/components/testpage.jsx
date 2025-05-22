import { useRegion } from "../hooks/useRegion";

export function TestPage() {
    const {
        address,
        district
    } = useRegion();

    return (<>
        {address[0] + " / "+address[1]}
    </>);
}
