import { useNavigate } from "react-router-dom";
import { FaDotCircle } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";



// 여기 토글로 바꾸기
export function LayoutMenu({ board }) {
    const nav = useNavigate();
    return (<>
        <ul className="ul">
            <li
                style={ {color:'rgb(227,73,137)' }}
                className={board[1] === undefined ? 'layout_menu_li' : 'layout_menu_li'}
                onClick={(e) => {
                    e.preventDefault();
                    nav(`/${board[0].url}`);
                }}
            >
                <FaDotCircle style={{ fontSize:'1.2rem' } }/>
                {board[0].url !== 'my' ? "전체" : "내정보"}
            </li>
            <li
                style={ {color:'rgb(255,173,198)' }}
                className={board[1] === undefined ? 'layout_menu_li' : 'layout_menu_li'}
                onClick={(e) => {
                    e.preventDefault();
                    nav(`/${board[0].url}`);
                }}
            >
                <FaRegCircle style={{ fontSize:'1.2rem' } }/>
                호버 색상
            </li>
            {board[0].children.map((o, k) => (
                <li
                    key={k}
                    style={{ color:'#b0b0b0' } }
                    className={o.url === board[1]?.url ? 'layout_menu_li' : 'layout_menu_li'}
                    onClick={(e) =>{
                        e.preventDefault();
                        nav(`/${board[0].url}/${o.url}`)
                    }}
                >
                    <FaRegCircle/>
                    {o.name}
                </li>
            ))}
        </ul>

    </>)
}