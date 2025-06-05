import { useNavigate } from "react-router-dom";
import { FaDotCircle, FaRegCircle } from "react-icons/fa";

// 여기 토글로 바꾸기
export function LayoutMenu({ board }) {
    const nav = useNavigate();
    return (<>
        <ul className="ul">
            <li
                className={board[1] === undefined ? 'layout_menu_li select' : 'layout_menu_li'}
                onClick={(e) => {
                    e.preventDefault();
                    nav(`/${board[0].url}`);
                }}
            >
                { board[1] === undefined?<FaDotCircle/>:<FaRegCircle/> }
                { board[0].url !== 'my' ? "전체" : "내정보" }
            </li>
            {board[0].children.map((o, k) => (
                <li
                    key={k}
                    className={o.url === board[1]?.url ? 'layout_menu_li select' : 'layout_menu_li'}
                    onClick={(e) =>{
                        e.preventDefault();
                        nav(`/${board[0].url}/${o.url}`)
                    }}
                >
                    { o.url === board[1]?.url?<FaDotCircle/>:  <FaRegCircle/>}
                    { o.name }
                </li>
            ))}
        </ul>

    </>)
}