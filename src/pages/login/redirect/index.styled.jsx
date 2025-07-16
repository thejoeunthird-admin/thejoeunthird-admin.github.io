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
    flex-direction: column;
    align-items: center;
    width: 300px;
    height: fit-content;
    gap: 10px;
    padding: 40px 0;
    border-radius: 10px;
    margin-top: 40px;
    box-shadow: 1px 5px 10px #0000001a;
    border: 1px solid #e1e3e5;
    & > form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      & > span {
        font-size: 1.3rem;
        font-weight: 600;
        display: inline-block;
        & > span:nth-of-type(2) {
          display: inline-block;
          transform: scaleX(-1);
        }
      }
      & > input {
        width: 90%;
        aspect-ratio: 1 / .15;
        padding-left: 10px;
        border: 1px solid #ccc;
        box-sizing: border-box;
        margin-top: 10px;
      }
      & > .region {
        width: 90%;
        aspect-ratio: 1 / .15;
        & > select {
          width: 50%;
          height: 100%;
        }
      }
      & > button {
        width: 90%;
        aspect-ratio: 1 / .15;
        padding-left: 10px;
        border: 1px solid var(--base-color-4);
        box-sizing: border-box;
        background: var(--base-color-4);
        font-weight: 600;
        border-radius: 5px;
      } 
    }
  }
`