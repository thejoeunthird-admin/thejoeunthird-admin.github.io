import styled, { css } from "styled-components";
import { media } from '@utils'

export const Tabs = styled.li`
    ${({$select})=>css`
        ${$select &&`
            padding-bottom: 5px;
            border-bottom: 2px solid #ffffff;    
        `}
    `}
`

export const Container = styled.div`
    ${({})=>css`
        
        min-width: calc(var(--breakpoint-min));
        display: none;
        flex-direction: column;
        overflow: visible;
        width: calc(100% - 0px);
        height: fit-content;
        background: var(--base-color-5);
        box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.1);
        transition: all 0.2s ease;

        ${media.tablet` display: flex; `}
        
        & > ul {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            font-size: 0.9em;
            font-weight: 600;
            margin-left: 10px;
            color: #fff;
            overflow-x: scroll;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding: 7.5px 0px;
            & > li {
                white-space: nowrap;
            }
        }
    `}
`