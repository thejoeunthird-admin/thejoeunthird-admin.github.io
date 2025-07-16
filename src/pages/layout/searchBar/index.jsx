import React, { forwardRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowAltCircleRight } from 'react-icons/fa';
import * as S from './index.styled'


export const SearchBar = forwardRef(({ }, ref) => {
    const navigate = useNavigate();
    const [isFocused, setIsFocused] = useState(false);
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get('keyword') || '';
    return (<>
        <S.Container
            onSubmit={(e) => {
                e.preventDefault();
                const value = ref.current?.value.trim();
                navigate(`?keyword=${encodeURIComponent(value)}`);
                ref.current.value = '';
            }}
            onClick={(e) => {
                if (e.target.tagName === 'BUTTON') {
                    e.preventDefault();
                    const value = ref.current?.value.trim();
                    navigate(`?keyword=${encodeURIComponent(value)}`);
                    ref.current.value = '';
                }
            }}
        >
            <input
                ref={ref}
                placeholder="검색어를 입력해주세요..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            <S.Button
                $focuse={isFocused} 
                type="submit"
            >
                {isFocused ? <FaArrowAltCircleRight /> : <FaSearch />}
            </S.Button>
        </S.Container>
        {keyword !== '' && <div style={{ marginLeft: "15px", fontWeight: '700', fontSize: '0.8rem', color: 'rgb(0,0,0,0.5)', padding: '5px 0px' }}>
            '{keyword}' 으로 검색된 결과입니다.
        </div>}
    </>);
});