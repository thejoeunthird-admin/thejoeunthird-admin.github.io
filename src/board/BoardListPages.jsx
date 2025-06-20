import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import Loadingfail from '../public/Loadingfail.png'
import { LoadingCircle } from '../components/LoadingCircle'; // 기존 로딩 컴포넌트 import
import "./BoardListPage.css";
import noImage from '../public/noImages.png'

// public/logo.png 경로로 접근
const IcecreamImg = "/logo.png";

const getImages = (path) =>
  `https://mkoiswzigibhylmtkzdh.supabase.co/storage/v1/object/public/images/${path}`;

export default function BoardListPage() {
  const { tap } = useParams();
  const [boards, setBoards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get('keyword');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  useEffect(() => {
    async function fetchBoards() {
      setLoading(true); // 로딩 시작
      
      try {
        let query = supabase
          .from("boards")
          .select(`
            id, title, contents, create_date, category_id, main_img, cnt,
            user_id, users(name), categories(name)
          `)
          .order("create_date", { ascending: false });

        if (tap && tap !== "all") {
          const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .eq("url", tap)
            .single();

          if (cat?.id) {
            query = query.eq("category_id", cat.id);
          }
        }

        if (keyword && keyword !== '') {
          query = query.or(`title.ilike.%${keyword}%,contents.ilike.%${keyword}%`);
        }

        const { data: boardsData } = await query;

        const boardsWithCounts = await Promise.all(
          (boardsData || []).map(async (board) => {
            const { count: commentsCount } = await supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("table_id", board.id);

            const { count: likesCount } = await supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("table_id", board.id);

            return {
              ...board,
              commentsCount: commentsCount || 0,
              likesCount: likesCount || 0,
            };
          })
        );
        setBoards(boardsWithCounts);
      } catch (error) {
        console.error("게시글 로딩 에러:", error);
        setBoards([]);
      } finally {
        setLoading(false); // 로딩 완료
      }
    }

    fetchBoards();
  }, [tap, navigate, keyword]);


  return (
    <div className="boardlist-wrapper" style={{ width:'calc( 100% - 20px )', marginLeft:'10px', marginRight:'10px' }}>
      {loading ? (
        <div style={{ marginTop:'10px' }}>
          <LoadingCircle/>
        </div>
      ) : boards.length !== 0 ? (
        <div className="board-card-list">
          {boards.filter(Boolean).map((board) => (
            <div
              key={board.id}
              className="board-card"
              onClick={() => navigate(`/life/detail/${board.id}?keyword=`)}
            >
              <div className="board-card-thumb">
                <img
                  src={board.main_img ? getImages(board.main_img) : noImage}
                  onError={(e) => (e.currentTarget.src = noImage)}
                  alt="썸네일"
                  style={{ borderRadius: 10, objectFit: "cover" }}
                />
              </div>
              <div className="board-card-content">
                <div className="board-card-name">
                  <div className="category">
                    {"생활 > "} {board.categories?.name || "-"}
                  </div>
                  <div className="board-card-meta" style={{ marginLeft:'auto' }}>
                    <span className="author">{board.users?.name || "알수없음"}</span>
                    -
                    <span className="date">
                      {board.create_date ? new Date(board.create_date).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
                <div className="board-card-title">{board.title}</div>
                <div className="board-card-preview">
                  {board.contents?.slice(0, 50)}
                  {board.contents?.length > 50 ? "..." : ""}
                </div>
                <div className="board-card-footer" style={{ marginLeft:'auto' }}>
                  <span title="조회수">👁️ {typeof board.cnt === "number" ? board.cnt : 0}</span>
                  <span title="댓글수" style={{ marginLeft: 14 }}>
                    💬 {board.commentsCount}
                  </span>
                  <span title="좋아요" style={{ marginLeft: 14, color: "#e14989" }}>
                    ❤️ {board.likesCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) :(<div style={{ display:'flex', width:'100%',  alignItems:'center', flexDirection:'column' }}>
              <img src={Loadingfail} style={{ width:'50%' }}/>
              <p style={{ fontSize:'1.rem', fontWeight:'700', color:'var(--base-color-1)' }}>
                검색 조건이 없거나, 아직 게시글이 없어요!
              </p>
        </div>)}
    </div>
  );
}