import styled, { keyframes } from 'styled-components';

// Keyframes
const shaking = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
`;

// Layout Components
export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: fit-content;

  @media screen and (max-width: 720px) {
    align-items: flex-start;
  }
`;

export const Breakpoints = styled.div`
  width: 100%;
  min-width: var(--breakpoint-min);
  max-width: var(--breakpoint-max);
  margin: 10px 10px 0px 10px;

  &.header {
    margin: 0 0px 10px 0;

    .link {
      opacity: 0;
    }
  }

  &.main {
    margin: 0 0px 0 0px;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 60px);
    margin-top: 10px;
    gap: 10px;
  }

  @media screen and (max-width: 720px) {
    margin: 10px 0 10px 0;
  }
`;

// Header Components
export const LayoutHeader = styled.div`
  position: sticky;
  top: 0;
  min-width: calc(var(--breakpoint-min));
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 0px);
  height: 60px;
  background: var(--base-color-3);
  box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.1);
  transition: all 0.1s ease;
  z-index: 99;

  &.top,
  &.top .board-item,
  &.top .right .link,
  & .board-item,
  &.top .right .link.red {
    height: fit-content;
    opacity: 1;
  }

  &:hover {
    height: fit-content;
    overflow: visible;
    
    .layout_menu_top {
      opacity: 1;
    }

    .board-item {
      opacity: 1;
    }

    .breakpoints.header .link {
      opacity: 1;
    }
  }

  @media screen and (max-width: 720px) {
    align-items: normal;
    
    &.top .layout_menu_top {
      display: flex;
      opacity: 1;
      transform: translateY(0px);
    }
    
    .layout_menu_top {
      display: flex;
      opacity: 0;
      transform: translateY(0px);
    }
  }
`;

export const HeaderLogo = styled.div`
  width: 42px;
  height: 42px;
  margin-left: 10px;
  cursor: pointer;
`;

export const HeaderRight = styled.div`
  margin-left: auto;
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

export const HeaderLink = styled.a`
  width: 38px;
  height: 38px;
  background: var(--base-color-2);
  border-radius: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: #ffffff;

  &.shaking {
    background: var(--base-color-5);
    animation: ${shaking} 0.6s ease-in-out infinite;
  }
`;

export const HeaderImage = styled.img`
  width: 42px;
  height: 42px;
`;

// Link Components
export const Link = styled.span`
  display: inline-block;
  padding: 0px 2px 7.5px 2px;
  border-bottom: 3px solid var(--base-color-2);
  cursor: pointer;
  color: var(--base-color-2);
  font-weight: 750;
  transition: opacity 0.3s ease;
  margin-left: 5px;

  &.red {
    border-bottom: 3px solid var(--base-color-5);
    color: var(--base-color-5);
  }
`;

// Board Components
export const BoardItem = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 10px;
  cursor: pointer;
  padding: 5px 0px;
  font-weight: 750;
  color: var(--base-color-1);
  opacity: 0;
  transition: opacity 0.3s ease;

  &:hover {
    color: var(--base-color-5);
    
    .board-dropdown {
      display: block;
    }
  }

  &.red {
    color: var(--base-color-5);
  }

  .displayOn & {
    opacity: 0;
  }
`;

export const BoardDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: fit-content;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 99;
  display: none;
  background: var(--base-color-4);
  color: var(--base-color-1);
  overflow: hidden;
`;

export const BoardDropdownItem = styled.p`
  font-size: 14px;
  padding: 10px;
  white-space: nowrap;

  &:hover {
    background: var(--base-color-5);
    color: #ffffff;
  }
`;

// Menu Components
export const LayoutMenuTop = styled.div`
  position: sticky;
  top: 60px;
  min-width: calc(var(--breakpoint-min));
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  width: calc(100% - 0px);
  height: fit-content;
  background: var(--base-color-5);
  box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  transform: translateY(-40px);
  opacity: 0;
  display: none;

  &.none {
    opacity: 0;
    display: none;
  }
`;

export const MenuTopList = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  font-size: 0.9em;
  font-weight: 600;
  margin-left: 10px;
  color: #ffffff;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const MenuTopItem = styled.li`
  padding-right: 5px;
  padding-bottom: 5px;
  width: fit-content;
  display: flex;
  white-space: nowrap;

  &.select {
    padding-right: 5px;
    padding-bottom: 5px;
    width: fit-content;
    border-bottom: 2px solid #ffffff;
  }
`;

export const LayoutMenuUl = styled.ul`
  padding: 10px;
  padding-top: 10px;
  min-height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 1.1em;
  font-weight: 600;
  width: 200px;
  margin-top: 10px;

  @media screen and (max-width: 720px) {
    display: none;
  }
`;

export const MenuItem = styled.li`
  padding-right: 10px;
  padding-bottom: 5px;
  width: 100%;
  display: flex;
  flex-direction: row;    
  align-items: center;
  padding: 5px;
  font-size: 1.2rem;
  gap: 10px;
  color: #b0b0b0;
  border-bottom: 3px solid transparent;
  transition: all 0.15s ease-in;

  &.select {
    color: var(--base-color-5);
  }

  &:hover {
    border-bottom: 3px solid var(--base-color-1);
    color: var(--base-color-1);
  }

  &.select:hover {
    color: var(--base-color-5);
  }
`;

// Main Components
export const MainLayout = styled.div`
  height: auto;
  min-height: calc(100% - 60px);
  flex: 1;
  width: calc(100%);
  min-width: var(--breakpoint-min);
  max-width: var(--breakpoint-max);
`;

export const MainDiv = styled.div`
  height: 100vh;
  min-height: calc(100% - 60px);
  width: 100%;
  min-width: var(--breakpoint-min);
  max-width: var(--breakpoint-max);
`;

export const MainParagraph = styled.p`
  width: calc(70% - 30px);
  padding: 10px;
  margin-left: 5px;
  margin-right: 5px;
  background: linear-gradient(to right, var(--base-color-3) 0%, white 100%);
  font-weight: 600;
  border-radius: 5px;

  @media screen and (max-width: 720px) {
    width: calc(100% - 30px);
    background: var(--base-color-3);
  }
`;

export const StrongText = styled.strong`
  font-size: 1.1em;
  font-weight: 1000;
`;

// Toggle Components
export const ToggleItem = styled.div`
  margin-left: 10px;
  font-weight: 600;
  background: whitesmoke;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
`;

export const ToggleList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  z-index: 99;
  width: 100%;
  min-width: calc(100% - 2px);
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: scroll;

  &.hover {
    opacity: 0;
    pointer-events: none;
  }

  b {
    padding: 10px;

    &:hover {
      background: whitesmoke;
    }
  }
`;

// Input Components
export const InputBox = styled.div`
  width: 47.5%;
  max-width: 400px;
  height: 32px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  position: relative;
  padding: 10px;

  input {
    width: 100%;
    height: 100%;
    padding-left: 10px;
    border: 0;
    border-radius: 5px;
    z-index: 1;
    border: 3px solid transparent;
    background: rgb(245, 245, 245);

    &:focus {
      border: 2px solid var(--base-color-5);
      outline: 0;
    }
  }

  button {
    all: unset;
    position: absolute;
    width: 38px;
    height: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    right: 10px;
    cursor: pointer;
    z-index: 2;
    transition: all 0.2s ease;

    &.focused {
      color: var(--base-color-5);
      font-size: 20px;
      transform: rotate(360deg);
    }
  }

  @media screen and (max-width: 720px) {
    margin-top: 5px;
    margin-left: 5px;
    width: calc(100% - 30px);
    max-width: unset;
  }
`;

// Select Components
export const SelectRegion = styled.select`
  padding: 10px;
  margin-left: 5px;
  background: #ffffff;
  border: 1px solid whitesmoke;
  border-radius: 5px;
  font-weight: 600;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  option {
    font-weight: 600;

    &:hover {
      color: whitesmoke;
    }
  }
`;

// Footer Components
export const LayoutFooter = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: var(--breakpoint-min);
  background: var(--base-color-1);
  color: var(--base-color-3);
  box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.5);
`;

// Profile Components
export const Profile = styled.div`
  width: 42px;
  height: 42px;
  margin-left: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  svg {
    font-size: 35px;
    cursor: pointer;
    z-index: 99;
    color: var(--base-color-1);
    border-radius: 100%;

    &.red {
      border: 2px solid var(--base-color-5);
    }

    &.bell {
      position: absolute;
      font-size: 13px;
      cursor: pointer;
      right: -2px;
      top: -2px;
      color: var(--base-color-1);
      padding: 3px;
      background-color: var(--base-color-5);
      border-radius: 100%;
      display: none;
      z-index: 100;
    }

    &.bell.shaking {
      display: flex;
      animation: ${shaking} 0.6s ease-in-out infinite;
    }
  }
`;

export const SearchButton = styled.button`
  all: unset;
  margin-left: 5px;
  width: 0px;
  height: 42px;
  font-size: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--base-color-1);
  opacity: 0;
  transition: all 0.2s ease-in;

  &.show {
    opacity: 1;
    width: 42px;
  }
`;

export const Humbeger = styled.div`
  position: absolute;
  width: 100px;
  height: fit-content;
  background: white;
  border-radius: 5px;
  right: 10px;
  top: 45px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  box-shadow: 0px 5px 10px rgb(0,0,0,0.2);
  opacity: 0;
  z-index: 101;
  transition: all 0.1s ease-in;
  border-radius: 5px;
  pointer-events: none;

  &.on {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const HumbegerButton = styled.div`
  padding: 10px;
  width: calc(100% - 20px);
  text-align: right;
  border-top: 1px solid white;

  &:hover {
    background-color: #f0f0f0;
    border-top: 1px solid #f0f0f0;
  }

  &.logout {
    background: var(--base-color-5);
    color: #ffffff;

    &:hover {
      filter: brightness(0.95);
    }
  }
`;

export const DisplayOn = styled.div`
  width: calc(100% - 64px);
  display: none;
  height: 0px;

  @media screen and (max-width: 720px) {
    height: fit-content;
    display: block;
  }
`;

export const DisplayOff = styled.div`
  @media screen and (max-width: 720px) {
    display: none;
  }
`;  