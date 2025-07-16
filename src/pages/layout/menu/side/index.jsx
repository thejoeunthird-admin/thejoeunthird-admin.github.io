import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FaDotCircle, FaRegCircle } from "react-icons/fa";
import * as S from './index.styled'
import { useCallback } from "react";

export function Side({ location, board }) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const handleNavigate = useCallback((e, path) => {
        e.preventDefault();
        const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
        navigate(`${path}?keyword=`);
    }, [navigate, searchParams, setSearchParams, location]);
    return (
        <S.Container>
            <S.Tabs
                $select={(location[2] === undefined || location[2] === 'all')}
                onClick={(e) => { handleNavigate(e, `/${board.url}`) }}
            >
                {location[1] === board.url ? <FaDotCircle /> : <FaRegCircle />}
                {location[1] === board.url ? '전체' : '내정보'}
            </S.Tabs>
            {board.children.map((o, k) => (
                <S.Tabs
                    key={k}
                    $select={o.url === location[2]}
                    onClick={(e) => { handleNavigate(e, `/${location[1]}/${o.url}`); }}
                >
                    {location[1] === board.url ? <FaDotCircle /> : <FaRegCircle />}
                    {o.name}
                </S.Tabs>
            ))}
        </S.Container>
    )
}