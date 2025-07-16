import { useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Breakpoint } from '../../index.styled';
import * as S from './index.styled'

// 이거 드래그가 안됨 
export const Top = ({ location, board }) => {
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 드래그 상태를 ref로 관리 (컴포넌트 렌더링과 무관하게 값 유지)
    const dragState = useRef({
        isDown: false,
        startX: 0,
        scrollLeft: 0,
    });

    // 선택된 탭 위치로 자동 스크롤 이동
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const selected = container.querySelector('li.select');
        if (!selected) return;

        const elLeft = selected.offsetLeft;
        const elRight = elLeft + selected.offsetWidth;
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;

        if (elLeft < scrollLeft) {
            container.scrollTo({ left: elLeft - 12, behavior: 'smooth' });
        } else if (elRight > scrollLeft + containerWidth) {
            container.scrollTo({ left: elRight - containerWidth + 12, behavior: 'smooth' });
        }
    }, [board]); // board가 바뀔 때마다 실행

    // 이동 제한 (드래그가 아닌 일반 클릭 시만 navigate)
    const handleNavigate = useCallback((e, path) => {
        e.preventDefault();
        const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';
        navigate(`${path}?keyword=`);  
    }, [navigate, searchParams, setSearchParams]);

    // 드래그 이벤트 핸들러들
    const onMouseDown = (e) => {
        const el = scrollRef.current;
        if (!el) return;
        dragState.current.isDown = true;
        dragState.current.startX = e.pageX - el.offsetLeft;
        dragState.current.scrollLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
        const el = scrollRef.current;
        if (!el || !dragState.current.isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - dragState.current.startX) * 1.5;
        el.scrollLeft = dragState.current.scrollLeft - walk;
    };

    const onMouseUp = () => {
        const el = scrollRef.current;
        if (!el) return;
        dragState.current.isDown = false;
        el.style.cursor = 'grab';
    };

    const onMouseLeave = () => {
        const el = scrollRef.current;
        if (!el) return;
        dragState.current.isDown = false;
        el.style.cursor = 'grab';
    };

    return(
        <Breakpoint>
            <S.Container>
                <ul
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseLeave}
                >
                    <S.Tabs 
                        $select={(location[2] === undefined || location[2] === 'all')}
                        onClick={(e) => { handleNavigate(e,`/${board.url}`) }} >
                        {location[1] === board.url ? '전체' : '내정보'}
                    </S.Tabs>
                    { board.children.map((o, k) => (
                        <S.Tabs
                            key={k}
                            $select={o.url === location[2]}
                            onClick={(e) => { handleNavigate(e, `/${board.url}/${o.url}`); }}
                        >
                            {o.name}
                        </S.Tabs>
                    ))}
                </ul>
            </S.Container>
        </Breakpoint>
    )
};
