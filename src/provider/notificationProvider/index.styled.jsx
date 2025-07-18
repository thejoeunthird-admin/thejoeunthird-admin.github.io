import styled from "styled-components";

export const Container = styled.div`
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    transition: opacity 0.5s ease, transform 0.5s ease;
    position: fixed;
    top: 20px;
    left: calc(50%);
    width: calc(90% - 50px);
    /* 기본값: 화면 폭의 90% */
    max-width: 1440px;
    /* 최대 너비 제한 */
    z-index: 9999;
    /* 레이어층 (9999층 (맨위에)있다고 생각하면 됨)*/

    /* 반투명 밝은 회색 + 그라데이션 */
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.75), rgba(255, 253, 247, 0.836));
    /*background-color: rgba(255, 254, 249, 0.654);*/

    color: #222;

    /*box-shadow: 0 4px 12px rgba(255, 201, 201, 0.2);*/
    backdrop-filter: blur(4px);
    
    border-bottom: 1px solid rgba(123, 123, 123, 0.6); 
    border-radius: 20px;
    margin: 10px;
    padding: 30px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    ${({ $fadeOut }) => !$fadeOut && `
        opacity: 0;
        transform: translateX(-50%) translateY(-50px);
    `}

    /* 💻 데스크탑 */
    @media (min-width: 1024px) {
        width: calc(90% - 60px);
        padding: 30px;
        font-size: 18px;
    }

    & > div {
        display: flex;
        flex-direction: row;
        gap: 10px;
        & > button {
            background: none;
            margin-left: 10px;
            border: none;
            color: black;
            cursor: pointer;
            font-weight: bold;
        }
    }
    & > p {
        display: block;
        margin-left: auto;
    }
`