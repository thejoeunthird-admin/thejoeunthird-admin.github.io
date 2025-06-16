import loading from '../public/Loading.png'
import Loadingfail from '../public/Loadingfail.png'

/**
 * 로딩 UI 컴포넌트 
 * @param {boolean} dontText - true일 경우 텍스트를 숨깁니다
 * @param {string} str - 표시할 텍스트 (기본값: '꿀 찾는중...')
 * @param {string} alignItems - 로딩 박스의 정렬 방식 ('start' | 'center' | 'end')
 */
export function LoadingCircle({fail, dontText, text = '꿀 찾는중...', alignItems='center' }) {
  let margin = '5px ';
  switch (alignItems) {
    case 'start': { margin += '0px 0px 5px' } break;
    case 'end': { margin += '5px 0px 0px' } break;
    default: { margin += '0px 0px 0px' } break;
  }
  if(!fail){ return (<>
        <div className="loading" style={{ alignItems: alignItems }}>
        <div className="loading_circle" />
        <div className="center-image" style={{ margin: margin }}>
            <img src={loading} style={{ borderRadius: '100%' }} />
        </div>
        {!dontText && (
            <p className="loading-text">
            {text}
            </p>
        )}
        </div>
    </>)}
    else { return(<>
        <div className="loading" style={{ alignItems: alignItems }}>
            <img src={Loadingfail} style={{ width:'50%', maxWidth:'400px' }} />
                    {!dontText && (
            <p className="loading-text">
            {'꿀통을 찾지 못했어요..\n로그인하거나, 새로고침 해주세요.'}
            </p>
        )}
        </div>
    </>)}
}
