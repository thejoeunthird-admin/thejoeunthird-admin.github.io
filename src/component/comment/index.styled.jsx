import styled from "styled-components";

export const SmallButton = styled.button`
    padding: 3px;
    margin-left: auto;
    border: none;
    background-color: white;
    & > svg {
        font-size: 15px;
        color: #898989;
    }
`

export const Input = styled.input`
                    width: 100%;
                padding: 10px;
                resize: none;
                font-size: 1rem;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: #fff;
                height: 80px;
                &:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
                    outline: none;
    }
`

export const CommentsItem = styled.div`
    ${({ $notBox }) => `
        ${!$notBox ?(`
            margin-bottom: 15px;
            background-color: #fff;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
        `)
        :(`    
            border-top: 1px solid lightgray;
            padding: 10px 0;
            margin: 10px 0 10px 20px;
        `)}

            & > .comment-header {
                display: flex;
                justify-content: space-between;
                position: relative;
                & > strong {
                    font-size: 1.1rem;
                    color: #007bff;
                }
                & > div > ul {
                    position: absolute; 
                    border-radius: 5px;
                    top: 100%;
                    right: 0;
                    z-index: 10;
                    display: flex; /* Flexbox로 설정 */
                    flex-direction: column; /* 버튼들이 세로로 쌓이게 함 */
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 그림자 추가 */
                    border-radius: 5px;
                    overflow: hidden; /* 드롭다운 내용이 부모 요소 밖으로 나가지 않게 처리 */        
                    & > li{
                        padding: 8px 15px;
                        /* text-align: right;  */
                        font-size: 0.9rem;
                        cursor: pointer;
                        background-color: white; /* 배경색 */
                        border: none; /* 테두리 없애기 */
                    }
                }
            }
            & > .comment-date {
                display: flex;
                flex-direction: row;
                & > small {
                    display: block;
                    font-size: .9rem;
                    color: #888;
                }
            }
            & > .edit {
                display: flex; /* 부모 요소를 flexbox로 설정 */
                flex-direction: column; /* 자식 요소들을 세로로 배치 */
                & > ${Input} {
                    display: block;
                    width: calc(100% - 20px);
                    margin: 10px 0;
                }
                & > button {
                    display: inline-block; /* 버튼을 인라인 블록으로 설정 */
                    margin-left: auto; /* 왼쪽 여백을 자동으로 설정하여 오른쪽으로 밀기 */
                    margin-bottom: 10px;
                    padding: 8px 16px;
                    background-color: #FFADC6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                }
            }

            & > p,
            & > div > p {
                margin-top: 10px;
                font-size: 1rem;
                color: #555;
            }
        `}
`

export const Container = styled.div`
    margin-top: 30px;
    background-color: white;
    border-radius: 10px;
    height: fit-content;

    & > .comments-top {
        & > h4 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            font-weight: bold;
            color: #333;
        }
        & > form {
            display: flex;
            flex-direction: row;
            gap: 10px;
            margin-top: 20px;
            margin-bottom: 20px;
            & > div {
                font-size: 1rem;
                font-weight: bold;
                color: black;
                margin-bottom: 10px;
                white-space: nowrap; 
                margin-bottom: 0;
                padding-top: 10px;
                & > strong {
                    padding: 5px 10px;
                    background-color: #dcdcdc;
                }
            }
            & > textarea {
                width: 100%;
                padding: 10px;
                resize: none;
                font-size: 1rem;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: #fff;
                height: 80px;
                &:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
                    outline: none;
                }
            }
            & > button {
                width: 130px;
                height: 100px;
                padding: 12px 20px;
                font-size: 1rem;
                background-color: #FFADC6;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                &:hover {
                    background-color: #e34989;
                }
                &:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
            }
        }
    }
    & > .comments-list {
        margin-bottom: 20px;
    }
`