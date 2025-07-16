import styled from "styled-components";
import { media } from "../../utils";

export const WriteBtn = styled.button`
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 1050;
  width: 100px;
  height: 50px;

  background-color: #dc3545;
  color: #fff;

  font-weight: 700;
  font-size: 16px;

  border: none;
  border-radius: 12px;

  box-shadow: 0 4px 8px #0003;

  display: flex;
  justify-content: center;
  align-items: center;

  transition: background-color 0.2s ease;
`;

export const Container = styled.div`
    width: calc(100% - 20px);
    margin-left: 10px;
    margin-right: 10px;

    & > .messing {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;

        & > img { width: 50%; }
        & > p {
            font-size: 1.rem, 
            font-weight: 700, 
            color: var(--base-color-1)
        }
    }
    & > ul {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin-top: 10px;
        & > li {
            display: flex;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 1px 12px 0 rgba(60, 60, 60, 0.10);
            cursor: pointer;
            padding: 18px 0px;
            align-items: center;
            transition: box-shadow 0.15s;
            gap: 20px;
            height: fit-content;
            overflow: hidden;
            width: 100%;
            min-width: 0;

            ${media.tablet`
              padding: 12px 0px;
              gap: 12px;
              align-items: flex-start;  
            `}

            & > .img-content {
               flex-shrink: 0;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 20px;
                transition: all 0.3s ease;
                ${media.tablet`
                  width: 75px;
                  height: 75px;
                  margin-left: 12px;
                `}
                
                & > img {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    border-radius: 10px;
                    object-fit: cover;
                    background: #fafafd;
                    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
                }
            }

            & > .content {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                text-overflow: hidden;
                min-width: 0;
                padding-right: 20px;
                transition: all 0.3s ease;

                & > p { display: black; }
                & > .name {
                    color: #888;
                    font-size: 13px;
                    margin-bottom: 10px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    width: 100%;
                    ${media.tablet`
                      font-size: 11px;
                      margin-bottom: 6px;
                      flex-direction: column;
                      align-items: flex-start;
                      gap: 4px;  
                    `}
                    & > .meta {
                        color: #888;
                        font-size: 13px;
                        display: flex;
                        gap: 10px;
                        align-items: center;
                        margin-left: auto;
                        ${media.tablet`
                          font-size: 11px;
                          margin-left: 0 !important;
                        `}
                    }
                }
                & > .title {
                    font-weight: bold;
                    font-size: 18px;
                    margin-bottom: 6px;
                    color: #222;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 100%;
                    width: 100%;
                    transition: font-size 0.3s ease;
                }
                & > .preview {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 8px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    transition: font-size 0.3s ease;    
                }
                & > .footer {
                    color: #bbb;
                    font-size: 15px;
                    display: flex;
                    gap: 0px;
                    align-items: center;
                    margin-top: 6px;
                    & > span {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-weight: 500;
                    }
                }
            }
        }
    }
`