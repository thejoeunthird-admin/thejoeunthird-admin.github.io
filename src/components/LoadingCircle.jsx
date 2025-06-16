import loading from '../public/Loading.png'
import Loadingfail from '../public/Loadingfail.png'

/**
 * 로딩 UI 컴포넌트 
 * @param {boolean} fail - true일 경우 실패 상태를 표시합니다
 * @param {boolean} dontText - true일 경우 텍스트를 숨깁니다
 * @param {string} text - 표시할 텍스트 (기본값: null)
 * @param {string} alignItems - 로딩 박스의 정렬 방식 ('start' | 'center' | 'end')
 */
export function LoadingCircle({fail, dontText, text = null, alignItems='center' }) {
  let margin = '5px ';
  
  // 문자열 로직 수정
  let str = '';
  if (!dontText) {
    if (text !== null) {
      str = text; // text가 제공되면 그것을 사용
    } else {
      str = fail ? `꿀통을 찾지 못했어요..\n새로고침 해주세요.` : `꿀통 찾는중...`; // 기본 메시지
    }
  }
  
  switch (alignItems) {
    case 'start': { margin += '0px 0px 5px' } break;
    case 'end': { margin += '5px 0px 0px' } break;
    default: { margin += '0px 0px 0px' } break;
  }
  if(!fail){ 
    return (
      <>
        <div className="loading" style={{ alignItems: alignItems }}>
          <div className="loading_circle" />
          <div className="center-image" style={{ margin: margin }}>
            <img src={loading} style={{ borderRadius: '100%' }} />
          </div>
          {!dontText && (
            <p className="loading-text">
              {str}
            </p>
          )}
        </div>
      </>
    )
  } else { 
    return(
      <>
        <div className="loading" style={{ alignItems: alignItems }}>
          <img src={Loadingfail} style={{ width:'50%', maxWidth:'400px' }} />
          {!dontText && (
            <p className="loading-text">
              {str}
            </p>
          )}
        </div>
      </>
    )
  }
}