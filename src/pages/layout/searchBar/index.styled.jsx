import styled, { css } from "styled-components";
import { media } from '@utils'

export const Button = styled.button`
    ${({$focuse})=>css`
        ${$focuse &&`
            color: var(--base-color-5);
            font-size: 20px;
            transform: rotate(360deg);        
        `}
    `}
`
export const Container = styled.form`
    width: 47.5%;
    max-width: 400px;
    height: 32px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    position: relative;
    padding: 10px;

    & > input {
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
    & > button {
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
    }

    
    ${media.tablet`
        margin-top: 5px;
        margin-left: 5px;
        width: calc(100% - 30px);
        max-width: unset;          
    `}
`