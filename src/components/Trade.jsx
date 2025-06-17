import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Spinner, Alert, Badge, Image, Button } from "react-bootstrap";
import { supabase } from '../supabase/supabase';
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import { LoadingCircle } from "./LoadingCircle";

export function Trade() {
  const navigate = useNavigate();
  const location = useLocation();
  const shadowHostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);

  const { info: categories, loading: categoriesLoading } = useCategoriesTable();
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);
  const [fetchTradesError, setTradesFetchError] = useState(null);
  const [orderBy, setOrderBy] = useState('create_date');

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentCategoryUrl = pathSegments[pathSegments.length - 1] || 'trade';
  const currentCategory = categories?.find(c => c.url.replace(/\/$/, '') === currentCategoryUrl);

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

      // 추가 스타일링
      const style = document.createElement('style');
      style.textContent = `
        .hover-shadow:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transition: box-shadow 0.2s ease;
        }
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `;
      shadow.appendChild(style);

      const mountPoint = document.createElement('div');
      shadow.appendChild(mountPoint);
      
      setShadowRoot(mountPoint);
    }
  }, [shadowRoot]);

  useEffect(() => {
    const fetchTrades = async () => {
      if (!currentCategory) {
        setTrades([]);
        setLoading(false);
        return;
      }
      console.log('query - parent_id : ' + currentCategory.parent_id);
      console.log('query - id : ' + currentCategory.id);
      let query = supabase
        .from('trades')
        .select();
      if (currentCategory.parent_id == 0) {
        query = query
          .eq('super_category_id', currentCategory.id)
      } else {
        query = query
          .eq('super_category_id', currentCategory.parent_id)
          .eq('category_id', currentCategory.id);
      }

      if (orderBy) query = query.order(orderBy, { ascending: false });

      const { data, error } = await query;

      if (error) {
        setTradesFetchError('게시글을 가져오는 데 실패했습니다.');
        setTrades([]);
        setLoading(false);
        return;
      }

      // 사용자 정보 가져오기 (users 테이블에서)
      const tradesWithUsers = await Promise.all(
        data.map(async (trade) => {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('name')
            .eq('id', trade.user_id)
            .single();
          return {
            ...trade,
            userInfo: user || { name: '알 수 없음' },
          };
        })
      );

      setTrades(tradesWithUsers);
      setTradesFetchError(null);
      setLoading(false);
    };

    fetchTrades();
  }, [currentCategory, orderBy]);

  function timeAgoOrClosed(salesEnd) {
    const now = new Date();
    const end = new Date(salesEnd);

    if (!salesEnd) return '마감일 없음';

    if (now > end) return '공동구매 종료';

    const diff = now - end;
    const mins = Math.floor(Math.abs(diff) / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}시간 전`;
    const days = Math.floor(hrs / 24);
    return `${days}일 전`;
  }

  const TradeContent = () => {
    if (loading) return <Container className="text-center mt-5"><LoadingCircle/></Container>;
    if (fetchTradesError) return <Container className="mt-5"><Alert variant="danger">{fetchTradesError}</Alert></Container>;

    return (
      <Container className="p-0">
        {trades.map(trade => (
          <div
            key={trade.id}
            className="p-3 border-bottom hover-shadow"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/product/${trade.id}`)}
          >
            <div className="d-flex align-items-center mb-2">
              <Image
                src={trade.main_img}
                rounded
                style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '15px' }}
              />

              <div className="flex-grow-1">
                <div className="text-muted small mb-1">
                  <strong>{trade.userInfo.name}</strong> | {timeAgoOrClosed(trade.sales_end)}
                </div>
                <h5 className="fw-bold mb-1">{trade.title}</h5>
                <p className="mb-1 text-truncate">{trade.content}</p>
                <div className="d-flex gap-2 flex-wrap small">
                  <Badge bg="light" text="dark">💰 {trade.price.toLocaleString()}원</Badge>
                  <Badge bg="light" text="dark">👀 {trade.cnt}</Badge>
                  <Badge bg="light" text="dark">❤️ {trade.likes}</Badge>
                </div>
              </div>

              {trade.category === 7 ? (
                <Button
                  variant="danger"
                  size="sm"
                  className="rounded-pill"
                  disabled={new Date() > new Date(trade.sales_end)}
                >
                  {new Date() > new Date(trade.sales_end) ? '공동구매 종료' : '참여하기'}
                </Button>
              ) : (
                null
              )}

            </div>
          </div>
        ))}
      </Container>
    );
  };
  return (
    <div>
      <div ref={shadowHostRef}></div>
      {shadowRoot && createPortal(<TradeContent />, shadowRoot)}
    </div>
  );
}