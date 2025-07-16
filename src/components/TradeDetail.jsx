import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '../supabase';
import { useUserTable } from "../hooks/useUser";
import { useImage } from "../hooks/useImage";
import { Comments } from './Comments';
import { Likes } from './Likes';
import { LoadingCircle } from "./LoadingCircle";
import { CustomCarousel } from "./CustomCarousel";
import { timeAgo, timeAgoOrClosed, getCategoryFullName, getCategoryFullNameTag, getCategoryUrl } from '../utils/utils';
import '../css/tradeDetail.css'
import '../css/trade.css'

export function TradeDetail() {
  const navigate = useNavigate();
  const { getImages } = useImage();
  const userInfo = useUserTable();
  const currentUserId = userInfo?.info?.id ?? null;
  const { item } = useParams();

  const [detail, setDetail] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [detailImages, setDetailImages] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [gongguState, setGongguState] = useState({
    likesCount: 0,
    progressPercent: 0,
    isGonggued: false,
    isGongguing: false,
    isGongguClosed: false,
  });


  const categoriesAll = useSelector(state => state.categories.all);
  const now = new Date();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  useEffect(() => {
    if (keyword !== null && keyword !== 'null') {
      console.log('keyword = [' + keyword + ']');
      // navigate(`/trade/${getCategoryUrl(detail.category_id, categoriesAll)}?keyword=${keyword}`);
    }
  }, [keyword, detail?.category_id, categoriesAll]);

  // 상품 정보, 판매자 정보, 좋아요 수, 현재 유저 좋아요/공동구매 상태 조회
  useEffect(() => {
    const fetchDetailData = async () => {
      if (!item) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_trade_detail', {
          input_table_id: parseInt(item, 10),
          input_user_id: userInfo?.info?.id ?? null,
        }).single();

        if (error || !data || data.length === 0) {
          console.error('get_trade_detail 오류:', error);
          throw new Error('상품 정보를 불러오지 못했습니다.');
        }

        const detail = data;
        setDetail(data);
        setDetailImages(
          [detail.detail_img1, detail.detail_img2, detail.detail_img3, detail.detail_img4].filter(Boolean)
        );
        setDetailUser({ id: detail.user_id, name: detail.user_name, img: detail.user_img });

        // 조회수 증가 처리
        await supabase.rpc('increment_view_count', {
          trade_id: parseInt(item, 10)
        });

      } catch (err) {
        console.error('상품 데이터 불러오기 오류:', err);
        setError(err.message || '데이터 로드 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
  }, [item]);

  useEffect(() => {
    if (!detail) return;

    // 공통값
    setGongguState(prev => ({
      ...prev,
      likesCount: detail.likes_count,
    }));

    // 공동구매일 경우
    if (detail.category_id === 7) {
      setGongguState(prev => ({
        ...prev,
        isGonggued: Boolean(detail.is_ordered),
      }));

      const now = new Date();
      const isClosed =
        detail.state !== 0 ||
        now > new Date(detail.sales_end) ||
        (detail.limit_type === 1 && detail.order_count >= detail.limit);

      setGongguState(prev => ({
        ...prev,
        isGongguClosed: isClosed,
        progressPercent: Math.min(100, Math.round((detail.order_count / detail.limit) * 100)),
      }));
    }
  }, [detail]);

  const refreshDetail = async () => {
    const { data, error } = await supabase.rpc('get_trade_detail', {
      input_table_id: detail.id,
      input_user_id: currentUserId
    }).single();
    if (error) {
      console.error('상세 정보 재조회 오류:', error.message);
      return;
    }
    setDetail(data);
  };


  // 글 삭제
  const handleDeleteDetails = async () => {
    if (!confirm('게시글을 삭제할까요?')) {
      return;
    }
    const { data, error } = await supabase
      .from('trades')
      .delete()
      .eq('id', item)
      .select();
    if (error) {
      alert('삭제에 실패했습니다.');
      console.log('delete error', error);
      return;
    }
    if (data) {
      alert('게시글이 삭제되었습니다.');
      navigate(`/trade/${detail.category_id}`);
    }
  }

  // 작성자 공구마감 처리
  const handleGongguCloseClick = async () => {
    if (detail.user_id !== currentUserId) return;
    if (detail.category_id != 7) {
      alert('공구 상품이 아닙니다.');
      return;
    }
    try {
      // 마감 취소 or 마감 // trades 0모집중 1모집완료 2모집실패 3판매완료
      const newState = isGongguClosed ? 0 : 1;
      const { error } = await supabase
        .from('trades')
        .update({ state: newState })
        .eq('id', detail.id)
        .eq('user_id', currentUserId);
      if (error) {
        console.error('공동구매 상태 변경 오류:', error);
        alert(`공동구매 상태 변경 중 오류: ${error.message}`);
      } else {
        alert(newState === 1 ? '공동구매를 마감했습니다.' : '공동구매 마감을 취소했습니다.');
        if (newState === 1) {
          setGongguState(prev => ({
            ...prev,
            isGongguClosed: true
          }));
        } else {
          setGongguState(prev => ({
            ...prev,
            isGongguClosed: false
          }));
        }
        // 상태 반영을 위해 detail state 업데이트
        setDetail(prev => ({ ...prev, state: newState }));
      }
    } catch (error) {
      console.error('예상치 못한 오류:', error);
      alert(`공동구매 상태 변경 중 오류가 발생했습니다: ${error.message}`);
      return;
    }
  };

  // 공동구매 참여/취소 핸들러
  const handleGongguClick = async () => {
    if (!currentUserId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (detail.category_id != 7) {
      alert('공구 상품이 아닙니다.');
      return;
    }
    /*
        setGongguState(prev => ({
          ...prev,
          isGongguing: true
        }));
        */
    try {
      // 🔒 최신 상태 다시 확인 (마감됐는지 체크)
      const { data: latestOrder, error: stateCheckError } = await supabase
        .from('trades')
        .select('state')
        .eq('id', detail.id)
        .eq('user_id', detail.user_id) // 작성자 ID 기준
        .maybeSingle();

      if (stateCheckError) {
        alert(`공동구매 상태 확인 중 오류가 발생했습니다. : ${stateCheckError}`);
        setGongguState(prev => ({
          ...prev,
          isGongguing: false
        }));
        return;
      }
      if (latestOrder && latestOrder.state !== 0) {
        alert('이 공동구매는 마감되었습니다.');
        setGongguState(prev => ({
          ...prev,
          isGongguing: false,
          isGongguClosed: true
        }));
        return;
      }
      // 🔢 수량 유효성 검사
      if (detail.limit_type === 2) {
        const { data, error } = await supabase
          .from('trades_order')
          .select('quantity')
          .eq('table_id', detail.id);
        if (error) {
          console.error('Delete error:', error);
          alert(`공동구매 수량 조회 중 오류: ${error.message}`);
        } else {
          setGongguState(prev => ({
            ...prev,
            isGonggued: false
          }));
          alert('공동구매 수량 확인에 문제가 발생했습니다.');
        }
        const totalOrdered = data.reduce((sum, row) => sum + row.quantity, 0);
        const available = detail.limit - totalOrdered;
        if (quantity < 1 || quantity > available) {
          alert(`1개 이상 ${available}개 이하로 입력해주세요`);
          setGongguState(prev => ({
            ...prev,
            isGongguing: false
          }));
          return;
        }
      }

      if (gongguState.isGonggued) { // 공구 취소
        const { error } = await supabase
          .from('trades_order')
          .delete()
          .eq('table_id', detail.id)
          .eq('user_id', currentUserId);
        if (error) {
          console.error('Delete error:', error);
          alert(`공동구매 취소 중 오류: ${error.message}`);
        } else {
          setGongguState(prev => ({
            ...prev,
            isGonggued: false
          }));
          await updateProgress();
          await refreshDetail();
          alert('공동구매 참여가 취소되었습니다.');
        }
      } else {  // 공구 신청
        const insertQuantity = detail.limit_type === 2 ? Number(quantity) : 1;

        const { data, error } = await supabase
          .from('trades_order')
          .insert({
            table_id: detail.id,
            user_id: currentUserId,
            price: detail.price,
            quantity: insertQuantity,
            state: 0,
          });

        if (error) {
          console.error('Insert error:', error);
          alert(`공동구매 참여 중 오류: ${error.message}`);
        } else {
          setGongguState(prev => ({
            ...prev,
            isGonggued: true
          }));
          await updateProgress();
          await refreshDetail();
          alert('공동구매에 참여했습니다.');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`공동구매 처리 중 오류: ${error.message}`);
    } finally {
      setGongguState(prev => ({
        ...prev,
        isGongguing: false
      }));
    }
  };

  const getRequestButtonText = (categoryId) => {
    switch (categoryId) {
      case 4:
        return '🛒 구매 요청';
      case 5:
        return '🎁 나눔 요청';
      case 6:
        return '💰 판매 요청';
      default:
        return '요청';
    }
  };

  // 구매하기/나눔받기/팔기 -> 판매자 채팅으로
  const makeChats = async () => {
    if (!currentUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!confirm('거래 요청 메시지를 보낼까요?')) return;
    const { data, error } = await supabase
      .from('chats')
      .insert([{
        sender_id: detail?.user_id, // 게시물 작성자(detail.user_id)
        receiver_id: userInfo?.info.id, // 로그인한 사람 id(userInfo.id)
        chat:
          detail?.category_id == 4
            ? '벼룩해요!'
            : detail?.category_id == 5
              ? '드림해요!'
              : detail?.category_id == 6
                ? '구해요!'
                : detail?.category_id == 7
                  ? '공구해요!'
                  : '거래해요!?',
        create_date: now,
        read: false,
        trades_id: detail.id,
        trades_quantity: 1
      }])
      .select()
    if (error) {
      console.log('error: ', error);
    }
    if (data) {
      console.log('data: ', data);
      navigate(`/my/talk/${detail?.user_id}`)
    }
  }

  const updateProgress = async () => {
    const { data, error } = await supabase
      .from('trades_order')
      .select('quantity')
      .eq('table_id', detail.id);

    if (error) {
      console.error('공동구매 수량 조회 오류:', error.message);
      return;
    }

    const totalOrdered = data.reduce((sum, row) => sum + row.quantity, 0);
    const percent = Math.min(100, Math.round((totalOrdered / detail.limit) * 100));

    setGongguState(prev => ({
      ...prev,
      progressPercent: percent
    }));
  };


  if (loading) {
    return (
      <div className="loading-wrapper">
        <LoadingCircle />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-wrapper">
        <div className="alert error-alert">{error}</div>
      </div>
    );
  }

  if (!loading && userInfo?.info && !detail) {
    return (
      <div className="warning-wrapper">
        <div className="alert warning-alert">상품 정보가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="detail-wrapper">
      <div className="detail-card">
        {detail.limit_type === 1 && (
          // <div className="progress-wrapper">
          <div className="progress-bar-container">
            <div
              className="progress-bar-inner"
              style={{ width: `${gongguState.progressPercent}%` }}
            >
              &nbsp;&nbsp;&nbsp;{gongguState.progressPercent}%
            </div>
          </div>
          // </div>
        )}

        <div className="detail-content">
          {/* 좌측 이미지 */}
          <div className="detail-left">
            <div className="image-carousel">
              <CustomCarousel
                images={[detail.main_img, ...detailImages]}
                getImages={getImages}
              />
            </div>

            {/* 좌측 하단 작성자 정보 */}
            <div className="author-info">
              <div className="author-avatar">
                {detailUser?.img ? (
                  <img src={getImages(detailUser.img)} alt="프로필" />
                ) : (
                  <span>{detailUser?.name?.charAt(0) ?? 'U'}</span>
                )}
              </div>
              <span className="author-name">
                {detailUser?.name ?? '알 수 없음'}
              </span>
            </div>
          </div>

          {/* 우측 상품 정보 */}
          <div className="detail-right">

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              &nbsp;{detail.title}
            </h2>
            <div className="meta">
              <span>
                {getCategoryFullNameTag(detail.category_id, categoriesAll)} |{' '}
                {timeAgo(detail.create_date)}
              </span>
            </div>

            <div className="price-location">
              <h3>거래희망장소: {detail.location}</h3>
              <h3>{Number(detail.price).toLocaleString()}원</h3>
            </div>

            {/* <div className="owner-info">
              <p>❤️ 좋아요 {likesCount} | 👁 조회수 {detail.cnt}</p>
              {detail.category_id === 7 && (
                <div style={{ paddingTop:'10px', lineHeight:'1.5', fontSize:'0.9rem' }}>
                  <small>시작: {new Date(detail.sales_begin).toLocaleString()}</small>
                  <br />
                  <small>종료: {new Date(detail.sales_end).toLocaleString()}</small>
                </div>
              )}
            </div> */}

            <Likes
              categoryId={detail.category_id}
              tableId={detail.id}
              userInfo={userInfo?.info}
              detailCnt={detail.cnt}
            />
            {detail.category_id === 7 && (
              <div style={{ paddingTop: '10px', lineHeight: '1.5', fontSize: '0.9rem' }}>
                <small>시작: {new Date(detail.sales_begin).toLocaleString()}</small>
                <br />
                <small>종료: {new Date(detail.sales_end).toLocaleString()}</small>
              </div>
            )}

            {/* 공구 정보 */}
            {detail.category_id === 7 && (
              <div className="gonggu-status" style={{ marginTop: '10px' }}>
                <label>{detail.state == 0 ? '[모집중] '
                  : detail.state == 1 ? '[모집완료] '
                    : detail.state == 2 ? '[모집실패] '
                      : '[판매완료] '}
                  공구 진행률 : &nbsp;
                </label>
                {detail.limit_type === 1 ? (
                  <>
                    <span>
                      최대 {detail.limit}명 / {detail.order_count}명 참여 중
                    </span>
                    <div className="progress-bar-container" style={{ marginTop: '10px' }}>
                      <div
                        className="progress-bar-inner"
                        style={{ width: `${gongguState.progressPercent}%` }}
                      >
                        &nbsp;&nbsp;&nbsp;{gongguState.progressPercent}%
                      </div>
                    </div>
                  </>
                ) : (
                  <span>
                    최대 1인당 {detail.limit}개 / {detail.order_count}명 참여 중
                  </span>
                )}
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="action-buttons">
              {currentUserId === detail.user_id ? (
                <>
                  <div className="button-group">
                    <button
                      className="btn outline-primary"
                      onClick={() =>
                        navigate(
                          `/trade/${getCategoryUrl(detail.category_id, categoriesAll)}/update/${detail.id}`
                        )
                      }
                    >
                      ✏️ 수정
                    </button>
                    <button
                      className="btn outline-secondary"
                      onClick={handleDeleteDetails}
                    >
                      ❌ 삭제
                    </button>
                  </div>

                  {detail.category_id === 7 && (
                    <div className="button-group">
                      <button
                        className={`btn ${detail.state !== 0
                          ? 'outline-success'
                          : 'outline-danger'
                          }`}
                        onClick={handleGongguCloseClick}
                        disabled={
                          detail.super_category_id === 1 ||
                          !detail.sales_end ||
                          new Date() > new Date(detail.sales_end)
                        }
                      >
                        {gongguState.isGongguClosed ? '✅ 마감 취소' : '🚫 마감'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="button-group">
                  {detail.category_id === 7 ? (
                    <>
                      {!gongguState.isGongguClosed && (
                        <button
                          className="btn outline-secondary"
                          onClick={() => {
                            makeChats();
                          }}
                        >
                          💬 문의하기
                        </button>
                      )}
                      <button
                        className="btn secondary"
                        onClick={handleGongguClick}
                        disabled={gongguState.isGongguing || gongguState.isGongguClosed && !gongguState.isGonggued}
                      >
                        {
                          //isGonggued ? '❌ 참여 취소' : '🤝 공구 참여'
                          gongguState.isGongguClosed
                            ? (gongguState.isGonggued ? '❌ 참여 취소' : '⛔ 공구 종료')
                            : (gongguState.isGonggued ? '❌ 참여 취소' : '🤝 공구 참여')
                        }
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn outline-secondary"
                        onClick={makeChats}
                      >
                        {getRequestButtonText(detail.category_id)}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 설명 */}
      <div className="detail-description">
        <h5>📄 상세 설명</h5>
        <div className="description-box">
          <p>{detail.content}</p>
        </div>
      </div>

      <Comments productId={item} categoryId={detail.category_id} />
    </div>

  );
}
