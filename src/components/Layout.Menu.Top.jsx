import { useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const LayoutMenuTop = ({ board }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

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
  const handleNavigate = useCallback(
    (e, path) => {
      if (Math.abs(e.movementX) < 5 && Math.abs(e.movementY) < 5) {
        e.preventDefault();
        navigate(path);
      }
    },
    [navigate]
  );

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

  return (
    <div className="layout_menu_top">
      <div className="breakpoints" style={{ padding:'5px 0px' }}>
        <div className="layout_menu_top_wrapper"></div>
        <ul
          className="layout_menu_top_ul"
          ref={scrollRef}
          style={{ paddingRight: '5px', cursor: 'grab', userSelect: dragState.current.isDown ? 'none' : 'auto' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <li
            style={{ paddingRight: '0' }}
            className={board[1] === undefined ? 'layout_menu_top_li select' : 'layout_menu_top_li'}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${board[0].url}?keyword=`);
            }}
          >
            {board[0].url !== 'my' ? '전체' : '내정보'}
          </li>
          {board[0].children.map((o, k) => (
            <li
              style={{ paddingRight: '0', marginTop:'0px' }}
              key={k}
              className={o.url === board[1]?.url ? 'layout_menu_top_li select' : 'layout_menu_top_li'}
              onClick={(e) => {
                handleNavigate(e, `/${board[0].url}/${o.url}/?keyword=`);
              }}
            >
              {o.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
