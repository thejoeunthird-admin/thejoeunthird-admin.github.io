import { useEffect } from "react";
import "../css/layout.css";
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
  let str = '';

  if (!dontText) {
    if (text !== null) {
      str = text; // text가 제공되면 그것을 사용
    } else {
      str = fail ? `꿀단지를 찾지 못했어요..\n새로고침 해주세요.` : `꿀단지 찾는중...`; // 기본 메시지
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
         <style>
          {`
                @keyframes shake {

            0%,
            100% {
                transform: rotate(0deg);
            }

            15% {
                transform: rotate(-5deg);
            }

            30% {
                transform: rotate(5deg);
            }

            45% {
                transform: rotate(-3deg);
            }

            60% {
                transform: rotate(3deg);
            }

            75% {
                transform: rotate(-1deg);
            }

            90% {
                transform: rotate(1deg);
            }
        }

            @keyframes rotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={{
            display:'flex', 
            flexDirection:'column', 
            alignItems: alignItems 
        }}>
          <div style={{
            width: '150px',
            height: '150px',
            background: `linear-gradient(135deg, var(--base-color-3) 10%, var(--base-color-1) 100%)`,
            position: 'relative',
            borderRadius: '100%',
            animation:'rotate 2s linear infinite'
          }}/>
          <div style={{ 
            margin: margin, 
            position:'absolute',
            transform:'translate(-50%,-50%)',
            width: '140px',
            height: '140px',
            background: 'var(--base-color-3)',
            borderRadius: '100%',
            display:'flex',
            justifyContent:'center',
            alignItems: 'center',
            zIndex:'10',
            animation: 'shake 2s ease-in-out infinite',
          }}>
            <img 
                src={loading} 
                style={{ borderRadius: '100%', width:'80%', height:'80%' }}
            />
          </div>
          {!dontText && (
            <p style={{
                fontWeight: 800,
                fontSize: '1.3rem', 
                color:'var(--base-color-1)',  
                padding:'10px',
                whiteSpace:'pre-line',
                textAlign:'center',
                lineHeight: '1.6'
            }}>
              {str}
            </p>
          )}
        </div>
      </>
    )
  } else { 
    return(
      <>
        <div style={{
            display:'flex', 
            flexDirection:'column', 
            alignItems: alignItems 
        }}>
          <img src={Loadingfail} style={{ width:'50%', maxWidth:'400px' }} />
          {!dontText && (
            <p style={{
                fontWeight: 800,
                fontSize: '1.3rem', 
                color:'var(--base-color-1)',  
                padding:'10px',
                whiteSpace:'pre-line',
                textAlign:'center',
                lineHeight: '1.6'
            }}>
              {str}
            </p>
          )}
        </div>
      </>
    )
  }
}