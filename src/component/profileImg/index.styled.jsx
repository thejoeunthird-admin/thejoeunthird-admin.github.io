import styled from 'styled-components';

export const ProfileImageBox = styled.label`
  width: 210px;
  height: 210px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;

  & > img {
    display: block;
    border-radius: 100%;
    width: calc(100% - 10px);
    aspect-ratio: 1;
    border: 5px solid var(--base-color-1);
  }

  & > div {
    all: unset;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ffffff;
    font-weight: bold;
    width: calc(100% );
    aspect-ratio: 1;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    font-size: 3rem;
    transition: opacity 0.3s ease;
  }

  &:hover div{
    opacity: 1;
  }
`;
