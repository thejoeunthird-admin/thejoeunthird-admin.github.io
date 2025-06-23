import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase/supabase';
import { useUserTable } from "../hooks/useUserTable";
import { useCategoriesTable } from "../hooks/useCategoriesTable";
import { useImage } from "../hooks/useImage";
import { useRegion } from "../hooks/useRegion";
import { LoadingCircle } from "./LoadingCircle";
import '../css/TradeForm.css';

export function TradeForm({ tap = 'gonggu', id }) {
  const navigate = useNavigate();
  //const { tap } = useParams(); // e.g. /trade/electronics/register
  const isGonggu = tap === 'gonggu';
  const isEditMode = Boolean(id);

  const { info: userInfo } = useUserTable();
  const { info: categories, findByUrl, loading: categoriesLoading } = useCategoriesTable();
  const { images, setImages, getImages, initImage } = useImage();
  // 이미지 관련 상태
  const [mainImg, setMainImg] = useState('');
  const [detailImgs, setDetailImgs] = useState(['', '', '', '']);
  const filteredUrls = detailImgs?.filter(url => url && url.trim() !== '') || [];
  const [isMainImgUploading, setIsMainImgUploading] = useState(false);
  const [isDetailImgsUploading, setIsDetailImgsUploading] = useState(false);

  // 카테고리 관련 상태
  const [superCategory, setSuperCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');

  // 상품 등록 관련 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const now = new Date();
  const [sales_begin, setSalesBegin] = useState('');
  const [sales_end, setSalesEnd] = useState('');
  const [limit, setLimit] = useState('');
  const [limit_type, setLimitType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 위치정보
  const { city, citys, district, districts } = useRegion();
  const regionString = `${city} ${district}`;

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  useEffect(() => {
    if (keyword !== null && keyword !== 'null') {
      console.log('keyword = [' + keyword + ']');
      navigate(`/trade/${tap}?keyword=${keyword}`);
    }
  }, [keyword]);

  // 초기 카테고리 선택 (tap 기준)
  useEffect(() => {
    console.log(tap)
    if (!tap || !categories) return;
    const tapChange = tap == 'deal' ? 'sell' : tap;
    const current = findByUrl(tapChange);
    if (!current) return;

    if (current.parent_id === 0 || current.parent_id === null) {
      setSuperCategory(current.id);
      setSubCategory('');
    } else {
      setSuperCategory(current.parent_id);
      setSubCategory(current.id);
    }
  }, [tap, categories]);

  const currentSubCategories = categories?.find(cat => cat.id === Number(superCategory))?.children || [];

  useEffect(() => {
    if (!isEditMode) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('상품 정보를 불러올 수 없습니다.');
        return;
      }

      // 기존 데이터 상태 반영
      setSuperCategory(data.super_category_id);
      setSubCategory(data.category_id);
      setTitle(data.title);
      setContent(data.content);
      setPrice(data.price);
      setSalesBegin(isEditMode && data.sales_begin
        ? new Date(data.sales_begin).toISOString().slice(0, 16)
        : now.toISOString().slice(0, 16));
      setSalesEnd(isEditMode && data.sales_end
        ? new Date(data.sales_end).toISOString().slice(0, 16)
        : now.toISOString().slice(0, 16));
      setLimit(data.limit);
      setLimitType(data.limit_type);
      setMainImg(data.main_img);
      setDetailImgs([
        data.detail_img1 || '',
        data.detail_img2 || '',
        data.detail_img3 || '',
        data.detail_img4 || '',
      ]);
    };



    fetchData();
  }, [isEditMode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      alert("로그인해야 글작성이 가능합니다.");
      navigate('/login');
      return;
    }
    if (!subCategory) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    if (!title || !content) {
      alert("제목과 내용을 모두 작성해주세요.");
      return;
    }
    if (subCategory !== "5" && !price) {
      alert("가격을 입력해주세요.");
      return;
    }
    if (subCategory == 7) {
      const begin = new Date(sales_begin);
      const end = new Date(sales_end);
      if (begin == end) {
        setError('시작 시간과 종료 시간은 같을 수 없습니다.');
        window.scrollTo(0, 0);
        setLoading(false);
        return;
      }
      if (begin >= end) {
        setError('시작 시간은 종료 시간보다 이전이어야 합니다.');
        //setError('종료 시간은 시작 시간보다 이후이어야 합니다.');
        window.scrollTo(0, 0);
        setLoading(false);
        return;
      }
    }
    if (!confirm('게시글을 등록할까요?')) {
      return;
    }
    setLoading(true);
    setError(null);


    if (!isEditMode) {
      const { error: insertError } = await supabase.from('trades').insert([{
        super_category_id: Number(superCategory),
        category_id: Number(subCategory),
        title,
        content,
        price: Number(price),
        sales_begin: Number(subCategory) == 7 ? sales_begin : null,
        sales_end: Number(subCategory) == 7 ? sales_end : null,
        limit: Number(subCategory) == 7 ? Number(limit) : null,
        limit_type: Number(subCategory) == 7 ? Number(limit_type) : null,
        state: Number(0),
        main_img: mainImg,
        detail_img1: detailImgs[0],
        detail_img2: detailImgs[1],
        detail_img3: detailImgs[2],
        detail_img4: detailImgs[3],
        user_id: userInfo.id,
        location: regionString,
      }])
      if (insertError) {
        setError('상품 등록 실패: ' + insertError.message);
      } else {
        navigate(`/trade`);
      }
    } else {
      const { error: updateError } = await supabase
        .from('trades')
        .update({
          super_category_id: Number(superCategory),
          category_id: Number(subCategory),
          title,
          content,
          price: Number(price),
          sales_begin: Number(subCategory) == 7 ? sales_begin : null,
          sales_end: Number(subCategory) == 7 ? sales_end : null,
          limit: Number(subCategory) == 7 ? Number(limit) : null,
          limit_type: Number(subCategory) == 7 ? Number(limit_type) : null,
          main_img: mainImg,
          detail_img1: detailImgs[0],
          detail_img2: detailImgs[1],
          detail_img3: detailImgs[2],
          detail_img4: detailImgs[3],
          user_id: userInfo.id,
          location: regionString,
        })
        .eq('id', id);

      if (updateError) {
        setError('상품 수정 실패: ' + updateError.message);
      } else {
        navigate(`/trade`);
      }
    }
    setLoading(false);
  };

  const handleMultipleImageUpload = async (e) => {
    setIsMainImgUploading(true);
    setIsDetailImgsUploading(true);
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const urls = await setImages({ target: { files } }); // 기존 hooks 사용
    if (urls && urls.length > 0) {
      setMainImg(urls[0]);

      const detailImgs = urls.slice(1, 5); // 최대 4장
      setDetailImgs(detailImgs);
    }
    setIsMainImgUploading(false);
    setIsDetailImgsUploading(false);
  };
  const handleMainImgRemove = () => {
    // 현재 main 이미지 제거 → detailImgs 중 첫 번째 유효 이미지로 대체
    const remainingImgs = filteredUrls.filter(url => url && url !== mainImg);
    const newMain = remainingImgs.length > 0 ? remainingImgs[0] : '';

    setMainImg(newMain);

    setDetailImgs(prevImgs =>
      prevImgs
        .map(img => img === mainImg ? '' : img) // 메인이미지 제거
        .filter(img => img !== '')              // 빈 값 제거
        .slice(0, 4)                            // 최대 4장 유지
    );
  };


  return (<>
    <style>{`.inputBox{
      display: none !important;
    }`}</style>
    <div className="product-form-container">
      {loading && <div className="text-center"><span className="loading-circle" /></div>}
      <div className="product-form-card">
        <h3 className="form-title">{isGonggu ? '공동구매' : '거래'} {isEditMode ? '수정' : '등록'}</h3>
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>카테고리</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              disabled={subCategory === 7}
            >
              <option value="">선택하세요</option>
              {currentSubCategories
                .filter(child => isGonggu ? child.id === 7 : child.id !== 7)
                .map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>제목</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="제목" />
          </div>

          <div className="form-group full-width">
            <label>상세 설명</label>
            <textarea rows="3" value={content} onChange={e => setContent(e.target.value)} required placeholder="상품의 상세 설명을 입력해주세요." />
          </div>

          <div className="form-group">
            <label>가격</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder={subCategory === "5" ? "나눔" : "가격"}
                disabled={subCategory === "5"}
                min={0}
                required={subCategory !== "5"}
              />
              {subCategory !== "5" && <span>원</span>}
            </div>
          </div>

          <div className="form-group">
            <label>거래 희망 장소</label>
            <div className="location-group">
              <select value={city} onChange={e => setCity(e.target.value)} disabled required>
                <option value="">시 선택</option>
                {citys.map((o, k) => (
                  <option key={k} value={o}>{o}</option>
                ))}
              </select>
              <select value={district} onChange={e => setDistrict(e.target.value)} disabled required>
                <option value="">군구 선택</option>
                {districts.map((o, k) => (
                  <option key={k} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {subCategory == 7 && (
            <>
              <div className="form-group">
                <label>제한 유형</label>
                <select value={limit_type} onChange={e => setLimitType(e.target.value)} required>
                  <option value="">선택하세요</option>
                  <option value="1">인원 제한</option>
                  <option value="2">수량 제한</option>
                </select>
              </div>

              <div className="form-group">
                <label>제한 수</label>
                <input type="number"
                  value={limit}
                  onChange={
                    //e => setLimit(e.target.value1)
                    (e) => {
                      let input = e.target.value;
                      if (input == '') setLimit(Number(0));
                      let value = Number(input);
                      if (value < 0) {
                        //  alert('제한 수가 0보다 작을 수 없습니다.');
                        value = 1;
                      }
                      setLimit(value);
                    }
                  }
                  required
                  min={1}
                />
              </div>

              <div className="form-group">
                <label>시작 시간</label>
                <input type="datetime-local"
                  value={sales_begin}
                  onChange={e => setSalesBegin(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>종료 시간</label>
                <input type="datetime-local"
                  value={sales_end}
                  onChange={e => setSalesEnd(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="image-preview">
            <strong>대표 이미지:</strong><br />
            {isMainImgUploading ? (
              <span className="spinner" />
            ) : mainImg ? (
              <div className="img-wrapper">
                <img src={getImages(mainImg)} alt="Main" />
                <button type="button" className="img-remove" onClick={() => handleMainImgRemove()}>×</button>
              </div>
            ) : null}
          </div>

          <div className="image-preview">
            <strong>상세 이미지 최대 4장:</strong><br />
            {isDetailImgsUploading ? (
              <span className="spinner" />
            ) : filteredUrls.map((url, idx) => (
              <div key={idx} className="img-wrapper">
                <img
                  src={getImages(url)}
                  alt={`Detail ${idx + 1}`}
                  className={url === mainImg ? 'selected' : ''}
                  onClick={() => {
                    setMainImg(url);
                    setDetailImgs(prevImgs => {
                      const filtered = prevImgs.filter(img => img !== url);
                      if (mainImg && mainImg.trim() !== '' && !filtered.includes(mainImg)) {
                        filtered.unshift(mainImg);
                      }
                      return filtered.slice(0, 4);
                    });
                  }}
                />
                <button type="button" className="img-remove" onClick={() => {
                  setDetailImgs(prevImgs => {
                    const newImgs = [...prevImgs];
                    const idxInOriginal = newImgs.findIndex(img => img === url);
                    if (idxInOriginal !== -1) {
                      newImgs[idxInOriginal] = '';
                    }
                    return newImgs;
                  });
                  if (mainImg === url) setMainImg('');
                }}>×</button>
              </div>
            ))}
          </div>
          <div className="form-group full-width">
            <label>이미지 업로드</label>
            <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} />
            <small>첫 번째 이미지는 메인 이미지입니다 (최대 5장).</small>
          </div>

          <div className="form-group full-width">
            <button type="submit"
              className="submit-btn"
              style={{ background: "var(--base-color-5)", border: "none" }}
              disabled={loading}
            >
              {loading ? '처리 중...' : isEditMode ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div >
    </div >
  </>);
}