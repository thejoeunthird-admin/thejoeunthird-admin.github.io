import { noImg, Loadingfail } from '@img'
import { useLoaderData, useLocation, useNavigate, useParams, useRevalidator, useRouteLoaderData } from 'react-router-dom'
import { useImage } from '../../hooks/useImage';
import * as S from './index.styled'
import { useCallback, useEffect } from "react";
import { useCategories } from '../../hooks/useCategories';

export { loader } from './loader'
export function Community() {
    const { revalidate, state } = useRevalidator();
    const location = useLocation();
    const user = useRouteLoaderData('user');
    const communityData = useRouteLoaderData('community');
    const { findById } = useCategories();
    const { getImages } = useImage();
    const navigate = useNavigate();
    const handleNavigate = useCallback((e, path) => {
        e.preventDefault();
        const search = location.search; // ?category=free 이런 거
        navigate(path + search);
    }, [navigate])

    useEffect(() => {
        revalidate();
    }, [location.pathname, location.search])

    return (<>
        {user && (
            <S.WriteBtn
                onClick={(e) => {
                    e.preventDefault();
                    const p = location.pathname === '/life' ? location.pathname + '/all' : location.pathname
                    const search = location.search; // ?category=free 이런 거
                    navigate(p + '/write/' + search);
                }}
            >
                + 글쓰기
            </S.WriteBtn>
        )}
        { state === 'loading' ? <></>
            :<S.Container>
                {communityData.length !== 0 ? (
                    <ul>
                        {communityData.filter(Boolean).map((board) => (
                            <li
                                key={board.id}
                                onClick={(e) => { handleNavigate(e, `/life/${findById(board.category_id).url}/${board.id}`) }}
                            >
                                <div className="img-content">
                                    <img
                                        src={board.main_img ? getImages(board.main_img) : noImg}
                                        onError={(e) => (e.currentTarget.src = noImg)}
                                        alt="썸네일"
                                    />
                                </div>
                                <div className="content">
                                    <div className="name">
                                        <p> {"생활 > "} {board.categories?.name || "-"}</p>
                                        <div className="meta">
                                            <p>{board.users?.name || "알수없음"}</p>
                                            -
                                            <p>
                                                {board.create_date ? new Date(board.create_date).toLocaleDateString() : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="title">{board.title}</div>
                                    <div className="preview">
                                        {board.contents?.slice(0, 50)}
                                        {board.contents?.length > 50 ? "..." : ""}
                                    </div>
                                    <div className="footer" style={{ marginLeft: 'auto' }}>
                                        <span title="조회수">👁️ {typeof board.cnt === "number" ? board.cnt : 0}</span>
                                        <span title="댓글수" style={{ marginLeft: 14 }}>
                                            💬 {board.commentsCount}
                                        </span>
                                        <span title="좋아요" style={{ marginLeft: 14, color: "#e14989" }}>
                                            ❤️ {board.likesCount}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="messing">
                        <img src={Loadingfail} style={{ width: '50%' }} />
                        <p> 검색 조건이 없거나, 아직 게시글이 없어요!</p>
                    </div>
                )}
            </S.Container>
        }
    </>);
}