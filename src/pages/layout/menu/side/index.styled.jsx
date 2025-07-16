import styled, { css } from "styled-components";
import { media } from "../../../../utils/media";

export const Tabs = styled.li`
  ${({ $select }) => css`
    color: ${$select ? 'var(--base-color-5)' : '#b0b0b0'};
    &:hover {
        color: ${$select ? 'var(--base-color-5)' : 'var(--base-color-1)'};
    }
  `}
`

export const Container = styled.ul`
    padding: 10px;
    padding-top: 10px;
    min-height: calc(100vh - 50px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 1.1em;
    font-weight: 600;
    margin-top: 10px;
    & > ${Tabs} {
        padding-right: 10px;
        padding-bottom: 5px;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 5px;
        font-size: 1.2rem;
        gap: 10px;
        border-bottom: 3px solid transparent;
        transition: all 0.1s ease-in;
    }

    ${media.tablet`
        display: none;    
    `}
`