import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase";
import "./BoardListPage.css";

// public/logo.png 경로로 접근
const IcecreamImg = "/logo.png";

const getImages = (path) =>
  `https://mkoiswzigibhylmtkzdh.supabase.co/storage/v1/object/public/images/${path}`;

export default function BoardListPage() {
  const shadowHostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);

  const { tap } = useParams();
  const [boards, setBoards] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Shadow DOM 설정
  useEffect(() => {
    if (shadowHostRef.current && !shadowRoot) {
      const shadow = shadowHostRef.current.attachShadow({ mode: 'open' });

      // Bootstrap CSS를 Shadow DOM에 추가
      const bootstrapLink = document.createElement('link');
      bootstrapLink.rel = 'stylesheet';
      bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
      shadow.appendChild(bootstrapLink);

      // Bootstrap JavaScript를 Shadow DOM에 추가
      const bootstrapScript = document.createElement('script');
      bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      bootstrapScript.async = true;
      shadow.appendChild(bootstrapScript);

      const mountPoint = document.createElement('div');
      shadow.appendChild(mountPoint);

      setShadowRoot(mountPoint);
    }
  }, [shadowRoot]);

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  useEffect(() => {
    async function fetchBoards() {
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
        } else {
          navigate("/life/all");
          return;
        }
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
    }

    fetchBoards();
  }, [tap, navigate]);

  const BoardListContent = () => {
    return (
      <div className="boardlist-wrapper" style={{ width: "80%", margin: "0 auto" }}>
        <div className="boardlist-header">
          <button className="detail-button" onClick={() => navigate("/life/write")}>
            글쓰기
          </button>
        </div>

        <div className="board-card-list">
          {boards.filter(Boolean).map((board) => (
            <div
              key={board.id}
              className="board-card"
              onClick={() => navigate(`/life/detail/${board.id}`)}
            >
              <div className="board-card-thumb">
                <img
                  src={board.main_img ? getImages(board.main_img) : IcecreamImg}
                  onError={(e) => (e.currentTarget.src = IcecreamImg)}
                  alt="썸네일"
                  style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover" }}
                />
              </div>
              <div className="board-card-content">
                <div className="board-card-name">
                  <div className="category">
                    {"생활 > "} {board.categories?.name || "-"}
                  </div>
                </div>
                <div className="board-card-meta">
                  <span className="author">{board.users?.name || "알수없음"}</span>
                  <span className="date">
                    {board.create_date ? new Date(board.create_date).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className="board-card-title">{board.title}</div>
                <div className="board-card-preview">
                  {board.contents?.slice(0, 50)}
                  {board.contents?.length > 50 ? "..." : ""}
                </div>
                <div className="board-card-footer">
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
      </div>
    );
  };

  return (
    <div>
      <div ref={shadowHostRef}></div>
      {shadowRoot && createPortal(<BoardListContent />, shadowRoot)}
    </div>
  );
}