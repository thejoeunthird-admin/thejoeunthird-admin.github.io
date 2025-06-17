import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from "react-router-dom";
import { supabase } from "../supabase/supabase.jsx";

/**
 * Boards.jsx
 * - 게시글 리스트(썸네일, 작성자, 미리보기)
 */
export default function Boards({ category, tap }) {
  const shadowHostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchBoards = async () => {
      setLoading(true);
      let query = supabase.from("boards").select("*, users(name), images(img)");
      if (category && category !== "전체") {
        const { data: catData } = await supabase
          .from("categories").select("id").eq("url", category).single();
        if (catData) query = query.eq("category", catData.id);
      }
      if (tap) {
        const { data: tapData } = await supabase
          .from("categories").select("id").eq("url", tap).single();
        if (tapData) query = query.eq("category", tapData.id);
      }
      const { data, error } = await query.order("id", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchBoards();
  }, [category, tap]);

  const buildDetailUrl = (post) => {
    if (tap) return `/${category}/${tap}/${post.id}`;
    if (category) return `/${category}/${post.id}`;
    return `/${post.id}`;
  };

  const BoardsContent = () => {
    if (loading) return <div>로딩중...</div>;
    if (!posts || posts.length === 0) return <div>게시글 없음</div>;

    return (
      <div>
        <ul style={{ padding: 0 }}>
          {posts.map(post => (
            <li key={post.id} style={{
              border: "1px solid #eee", margin: "0 0 10px 0",
              padding: 12, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center"
            }}>
              {/* 이미지 썸네일 */}
              {post.img && (
                <img src={post.img} alt="thumbnail"
                  style={{ width: 80, height: 80, objectFit: "cover", marginRight: 20, borderRadius: 5 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <Link to={buildDetailUrl(post)} style={{ color: "#333", fontWeight: "bold", fontSize: 17, textDecoration: "none" }}>
                  {post.title}
                </Link>
                <div style={{ color: "#888", fontSize: 13, margin: "3px 0 0 0" }}>
                  {post.users?.name || post.author || "익명"} {/* 작성자 */}
                </div>
                <div style={{ marginTop: 6, color: "#444" }}>
                  {post.contents.slice(0, 80)}
                  {post.contents.length > 80 ? "..." : ""}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <div ref={shadowHostRef}></div>
      {shadowRoot && createPortal(<BoardsContent />, shadowRoot)}
    </div>
  );
}