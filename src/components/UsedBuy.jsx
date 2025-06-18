import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabase/supabase";
import { UsedItem } from './UsedItem';
import { LoadingCircle } from './LoadingCircle';
import { useLocation } from 'react-router-dom';

export function UsedBuy() {
    const shadowHostRef = useRef(null);
    const [shadowRoot, setShadowRoot] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showRegisterMenu, setShowRegisterMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const keyword = query.get('keyword') || '';

    // Shadow DOM 설정
    useEffect(() => {
        if (shadowHostRef.current && !shadowRoot) {
            const shadow = shadowHostRef.current.attachShadow({ mode: 'open' });

            // Bootstrap CSS를 Shadow DOM에 추가
            const bootstrapLink = document.createElement('link');
            bootstrapLink.rel = 'stylesheet';
            bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
            shadow.appendChild(bootstrapLink);

            // Bootstrap JavaScript를 Shadow DOM에 추가
            const bootstrapScript = document.createElement('script');
            bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
            bootstrapScript.async = true;
            shadow.appendChild(bootstrapScript);

            // 추가 스타일링
            const style = document.createElement('style');
            style.textContent = `
                .hover-shadow:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    transition: box-shadow 0.2s ease;
                }
                .position-fixed {
                    position: fixed !important;
                }
                .bottom-0 {
                    bottom: 0 !important;
                }
                .start-0 {
                    left: 0 !important;
                }
                .position-absolute {
                    position: absolute !important;
                }
            `;
            shadow.appendChild(style);

            const mountPoint = document.createElement('div');
            shadow.appendChild(mountPoint);

            setShadowRoot(mountPoint);
        }
    }, [shadowRoot]);

    // 아이템 조회+검색
    useEffect(() => {
        const fetchPosts = async () => {
            let supa = supabase
                .from('trades')
                .select('*,categories(name), users(name)')
                .eq('category_id', 6)
                .eq('super_category_id', 3)
                .order('create_date', { ascending: false });
            if (keyword) {
                supa = supa.or(
                    `title.ilike.%${keyword}%,content.ilike.%${keyword}%,location.ilike.%${keyword}%`
                );
            }

            const { data, error } = await supa;
            if (error) {
                console.log("error: ", error);
            }
            if (data) {
                setPosts(data);
            }
        }
        fetchPosts();
    }, [keyword]); // <- keyword 추가!

    // 글쓰기 등록버튼 처리
    const handleToggleMenu = () => {
        setShowRegisterMenu(prev => !prev);
    };

    const handleRegisterNavigate = (path) => {
        console.log('Navigate to', path);
        setShowRegisterMenu(false);
        navigate(path);
    };

    const UsedBuyContent = () => {
        if (!posts) return <LoadingCircle />;
        return (
            <Container className="mt-4">
                <Row className="g-4">
                    {posts.map((used) => (
                        <Col key={used.id} xs={12} sm={6} md={4} lg={3}>
                            <UsedItem used={used} />
                        </Col>
                    ))}
                </Row>
                <div
                    className="position-fixed bottom-0 start-0 m-4"
                    style={{ zIndex: 1050 }}
                >
                    <Button
                        variant="danger"
                        className="d-flex justify-content-center align-items-center shadow rounded-3"
                        style={{ width: '100px', height: '50px', whiteSpace: 'nowrap' }}
                        onClick={handleToggleMenu}
                    >
                        + 글쓰기
                    </Button>

                    {showRegisterMenu && (
                        <div
                            className="bg-danger rounded-3 shadow p-2 mt-3 position-absolute start-0"
                            style={{
                                bottom: '70px',
                                width: '200px',
                                userSelect: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        >
                            {['거래 등록', '공구 등록'].map((label, idx) => {
                                const path = label === '거래 등록'
                                    ? '/trade/deal/register'
                                    : '/trade/gonggu/register';

                                return (
                                    <Button
                                        key={idx}
                                        variant="danger"
                                        className="w-100 text-start mb-2 rounded-2"
                                        onClick={() => handleRegisterNavigate(path)}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Container>
        );
    };

    return (
        <div>
            <div ref={shadowHostRef}></div>
            {shadowRoot && createPortal(<UsedBuyContent />, shadowRoot)}
        </div>
    );
}