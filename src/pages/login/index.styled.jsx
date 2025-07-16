import styled, { keyframes } from 'styled-components';
import { media } from '@utils';

export const flyVertical = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

export const beeWobble = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(2deg);
  }
  75% {
    transform: rotate(-2deg);
  }
`;

export const Container = styled.div`
  display: flex;
  justify-content: center;
  & > section {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    width: fit-content;
    height: fit-content;
    gap: 10px;
    padding: 40px 0px;
    border-radius: 10px;
    margin-top: 40px;
    box-shadow: 1px 5px 10px rgb(0, 0, 0, 0.1);
    border: 1px solid #e1e3e5;
    & > img {
      width: 180px;
      aspect-ratio: 1;
      animation:
        ${flyVertical} 1.5s infinite ease-in-out,
        ${beeWobble} 1.5s infinite ease-in;
    }
    & > .contents {
      display: flex;
      flex-direction: column;
      justify-content: center;
      & > h2 {
        font-size: 1.3rem;
        font-weight: 750;
        margin-bottom: 10px;
        padding-right: 20px;
        color: var(--base-color-1);
      }
      & > div {
        display: flex;
        flex-direction: column;
        & > button {
          width: calc(100% - 50px);
          height: fit-content;
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 32px;
          transition: all 0.3s ease;
          font-size: 1rem;
          font-weight: 800;
          color: var(--base-color-1);
          svg {
            font-size: 2rem;
            padding: 0px 10px, 
            padding-left: 0px;
          }
        }
      }
    }

    ${media.tablet`
        flex-direction: column;
        align-items: center;
        width: 355px;
        & > h2 {
          padding: 5px 20px;
          margin-bottom: 0;
        }
        & > div > button {
          width: 100%;
          justify-content: center;
          margin-top: 5px;
        }
    `}
  }
`