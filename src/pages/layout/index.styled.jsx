import styled, { css } from "styled-components";
import { media } from '@utils'

export const Layout = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: fit-content;
    ${media.tablet`
        align-items: flex-start;
    `}
`
export const Breakpoint = styled.div`
    width: 100%;
    min-width: var(--breakpoint-min);
    max-width: var(--breakpoint-max);
    margin: 5px 10px 0px 10px;
`

export const TopCategorieTabs = styled.p`
    ${({ $select }) => css`
        color: var(--base-color-${$select === 'true' ? 5 : 1});
    `}
`
export const underCategorieTab = styled.p`
    ${({ $select }) => css`
        color: var(--base-color-${$select === 'true' ? 5 : 1});
    `}
`

export const SearchButton = styled.button`
    ${({ $active })=>css`
        all: unset;
        margin-left: 5px;
        width: 0px;
        height: 42px;
        font-size: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--base-color-1);
        
        opacity: ${$active?"0":"1"};
        width: ${$active?"0":"30"}px;
        transition: all 0.2s ease-in;
    `}   
`

export const Container = styled.div`
    ${({$flex})=>css`
        margin: 0 0px 0 0px;
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 60px);
        margin-top: 10px;
        gap: 10px;

        width: 100%;
        min-width: var(--breakpoint-min);
        max-width: var(--breakpoint-max);
        & > .grid {
            margin-bottom: 50px;
            display: ${$flex?'grid':'flex'};
            width: 100%;
            grid-template-columns: fit-content(200px) calc(100% - 200px);   
            ${media.tablet`
                display: flex;
            `}
        }
    `}
`

export const HambegerMenu = styled.div`
    ${({$active})=>css`
        position: absolute;
        width: 100px;
        height: fit-content;
        background: white;
        border-radius: 5px;
        right: 0px;
        top: 47.5px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        box-shadow: 0px 5px 10px rgb(0, 0, 0, 0.2);
        opacity: 0;
        z-index: 101;
        border-radius: 5px;
        pointer-events: none;

        ${$active && `
            opacity: 1;
            pointer-events: auto;
        `}
        transition: all 0.1s ease-in;

        & > b {
            padding: 10px;
            width: calc(100% - 20px);
            text-align: right;
            border-top: 1px solid white; 
            
            &:last-child {
                background: var(--base-color-5);
                color: #ffffff;
                border-top: 1px solid var(--base-color-5);
                &:hover { filter: brightness(0.9); }
            }

            &:not(:last-child):hover {
                background-color: #f0f0f0;
                border-top: 1px solid #f0f0f0;
            }        
        }
    `}
`
export const Header = styled.header` 
    ${({ $state }) => css`
        position: sticky;
        top: 0;
        min-width: calc(var(--breakpoint-min));
        display: flex;
        flex-direction: column;
        align-items: center;
        width: calc(100% - 0px);
        height: fit-content;
        background: var(--base-color-3);
        box-shadow: 0px 0px 10px rgb(0, 0, 0, 0.1);
        transition: all 0.1s ease;
        z-index: 99;  
        & > ${Breakpoint} {
            display: flex;
            align-items: center;
            & > .logo {
                display: flex;
                flex-direction: row;
                width: fit-content;
                align-items: center;
                & > img {
                    width: 42px;
                    height: 42px;
                    margin-left: 10px;
                    cursor: pointer;
                }
                & > p {
                    font-weight: 800;
                    font-size: 1.1rem;
                    margin-left: 5px;
                    cursor: pointer;
                    color: var(--base-color-${$state?.url ? `1` : '5'});
                }
                &:hover > p {
                    color: var(--base-color-5);
                }
            }

            & > .topCategorie {
                ${media.tablet` display: none; `}
                & > ${TopCategorieTabs} {
                    position: relative;
                    display: inline-block;
                    margin-left: 10px;
                    cursor: pointer;
                    padding: 5px 0px;
                    font-weight: 750;
                    transition: opacity 0.3s ease;
                    &:hover {
                        color: var(--base-color-5);
                    }
                }
            }
            
            & > .underCategorie {
                ${media.tablet` display: flex; `}
                display: none;
                alignItems: 'flex-start';
                gap: 1px;
                margin-left: 5px;
                & > ${underCategorieTab} {
                    padding-bottom: 10px;                    
                    position: relative;
                    display: inline-block;
                    margin-left: 10px;
                    cursor: pointer;
                    font-weight: 750;
                    transition: opacity 0.3s ease;
                }
            }
            
            & > .right {
                margin-left: auto;
                margin-right: 10px;
                display: flex;
                align-items: center;
                & > .region {
                    display: flex;
                    width: fit-content;
                    & > select{
                        padding: 10px;
                        margin-left: 5px;
                        background: transparent;
                        border: 1px solid transparent;
                        border-radius: 5px;
                        font-weight: 600;
                    }

                }
                & > .search {
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

                    opacity: 1;
                    width: 30px;
                }
                & > .loginButton {
                    display: inline-block;
                    padding: 0 2px;
                    cursor: pointer;
                    color: var(--base-color-2);
                    font-weight: 750;
                    transition: opacity .3s ease;
                    margin-left: 5px;
                }
                & > .profile {
                    width: 45px;
                    height: 45px;
                    margin-left: 5px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;

                    & > .imgContent {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        & > img {
                            display: block;
                            border-radius: 100%;
                            width: calc(100% - 10px);
                            aspect-ratio: 1;
                            border: 2px solid var(--base-color-1);
                        }
                    }
                }
            }
        }
    `}
`