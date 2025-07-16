import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { supabase } from '../supabase';
import { useUserTable } from "../hooks/useUser";
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import { LoadingCircle } from "./LoadingCircle";
import { useImage } from "../hooks/useImage";
import { useRegion } from "../hooks/useRegion";
import { timeAgo, timeAgoOrClosed, getCategoryFullName, getCategoryFullNameTag, getCategoryUrl } from '../utils/utils';
import '../css/trade.css'
import noImg from '../public/noImg.png'
import Loadingfail from '../public/Loadingfail.png'

export function Trade({ tap }) {
  const user = useUserTable();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);
  const [fetchTradesError, setTradesFetchError] = useState(null);
  const [orderBy, setOrderBy] = useState('create_date');

  const categoriesAll = useSelector(state => state.categories.all);
  // const { tap } = useParams();
  const normalizedTap = tap === 'all' ? null : tap;
  const { info: categories, findByUrl, loading: categoriesLoading } = useCategoriesTable();
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);
  const { images, setImages, getImages, initImage } = useImage();
  const { city, district } = useRegion();
  const location = `${city} ${district}`;
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  useEffect(() => {
    if (!location || !categoriesAll.length) return;

    const fetchData = async () => {
      const foundCategory = normalizedTap ? findByUrl(normalizedTap) : null;
      if (normalizedTap && !foundCategory) {
        console.warn(`❗ 유효하지 않은 카테고리 URL: ${normalizedTap}`);
        return;
      }
      const isTopLevel = foundCategory?.parent_id === 0;
      const super_category_id = isTopLevel ? foundCategory?.id : foundCategory?.parent_id;
      const category_id = !isTopLevel ? foundCategory?.id : null;

      setLoading(true);
      setTradesFetchError(null);
      setTrades([]);
      try {
        const { data, error } = await supabase.rpc('get_trades_list_location', {
          p_super_category_id: super_category_id,
          p_category_id: category_id,
          p_location: location,
          p_order_by: orderBy,
          p_keyword: keyword,
        });
        if (error) throw error;
        if (data) setTrades(data || []);
      } catch (error) {
        console.error('❌ Error fetching trades:', error);
        setTradesFetchError('게시글을 가져오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoriesLoading, normalizedTap, keyword, location]);

  return (
    <div className="page-container">
      {loading && (
        <div className="centered-loading"><LoadingCircle /></div>
      )}

      {fetchTradesError && (
        <div className="error-alert">{fetchTradesError}</div>
      )}

      {!loading && !fetchTradesError && (
        <>
          {user?.info?.id && (
            <div className="floating-button-container">
              <button className="write-button" onClick={() => setShowRegisterMenu(prev => !prev)}>
                + 글쓰기
              </button>

              {showRegisterMenu && (
                <div className="write-menu">
                  {['거래 등록', '공구 등록'].map((label, idx) => {
                    // `/trade/${tap}/form` - 하위카테고리 위치에서 등록버튼 처리
                    // `/trade/deal/form` - 전체페이지 위치에서 등록버튼 처리
                    const path = label === '거래 등록'
                      ? tap ? `/trade/all/creative` : `/trade/all/creative`
                      : tap ? `/trade/${tap}/creative` : `/trade/gonggu/creative`
                    return (
                      <button
                        key={idx}
                        className="write-menu-item"
                        onClick={() => navigate(path)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {trades.length === 0 ? (<div style={{ display: 'flex', width: '100%', alignItems: 'center', flexDirection: 'column' }}>
            <img src={Loadingfail} style={{ width: '50%' }} />
            <p style={{ fontSize: '1.rem', fontWeight: '700', color: 'var(--base-color-1)' }}>
              검색 조건이 없거나, 아직 게시글이 없어요!
            </p>
          </div>)
            : trades.map(trade => {
              const progressPercent = trade.limit && trade.order_count
                ? Math.min(100, Math.round((trade.order_count / trade.limit) * 100))
                : 0;

              return (
                <div
                  key={trade.id}
                  className="custom-card"
                  onClick={() => navigate(`/trade/${getCategoryUrl(trade.category_id, categoriesAll)}/${trade.id}?keyword=`)}
                  style={trade.category_id == 7 ? { border: '1px solid var(--base-color-5) !important' } : {}}
                >
                  {trade.category_id === 7 && (
                    <div className="progress-bar-container">
                      <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}>
                        &nbsp;&nbsp;&nbsp;{progressPercent}%
                      </div>
                    </div>
                  )}

                  <div className="card-body">
                    <img
                      src={trade.main_img ? getImages(trade.main_img) : noImg}
                      alt="대표 이미지"
                      className="card-thumbnail"
                    />

                    <div className="card-content">
                      <div className="text-muted small">{getCategoryFullName(trade.category_id, categoriesAll)} | <strong>{trade.location || '지역 알 수 없음'}</strong></div>
                      <div className="text-secondary small">
                        <strong>{trade.user_name || '알 수 없음'}</strong> | {timeAgo(trade.update_date)}
                      </div>

                      <h3 className="card-title">{trade.title}</h3>
                      <p className="card-desc">{trade.content}</p>

                      <div className="card-badges">
                        <span className="badge">💰 {trade.price.toLocaleString()}원</span>
                        <span className="badge">👁️ {trade.cnt}</span>
                        <span className="badge">❤️ {trade.like_count}</span>
                        <span className="badge">💬 {trade.comment_count}</span>

                        {trade.category_id === 7 && trade.sales_end && (
                          <span className="badge deadline">
                            {timeAgoOrClosed(trade.sales_end)}
                          </span>
                        )}
                      </div>

                      {/* {trade.category_id === 7 && new Date() < new Date(trade.sales_end) && (
                        <div className="card-actions">
                          <button className="btn-join" onClick={() => { }}>참여하기</button>
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}
