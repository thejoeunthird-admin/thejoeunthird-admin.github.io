import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { supabase } from '../supabase/supabase';
import WritePage from './WritePage';

export default function EditPage() {
    const shadowHostRef = useRef(null);
    const [shadowRoot, setShadowRoot] = useState(null);

    const { id } = useParams();
    const [original, setOriginal] = useState(null);
    const [loading, setLoading] = useState(true);

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
            `;
            shadow.appendChild(style);

            const mountPoint = document.createElement('div');
            shadow.appendChild(mountPoint);

            setShadowRoot(mountPoint);
        }
    }, [shadowRoot]);

    useEffect(() => {
        async function fetchPost() {
            setLoading(true);
            const { data, error } = await supabase
                .from("boards")
                .select("*")
                .eq("id", id)
                .single();
            setOriginal(data);
            setLoading(false);
        }
        fetchPost();
    }, [id]);

    const LoadingContent = () => (
        <Container className="text-center py-5">
            <Spinner animation="border" className="me-2" />
            로딩중...
        </Container>
    );

    const ErrorContent = () => (
        <Container className="text-center py-5">
            <div className="alert alert-warning">
                게시글을 불러올 수 없습니다.
            </div>
        </Container>
    );

    // 로딩 중이거나 에러인 경우 Shadow DOM으로 처리
    if (loading) {
        return (
            <div>
                <div ref={shadowHostRef}></div>
                {shadowRoot && createPortal(<LoadingContent />, shadowRoot)}
            </div>
        );
    }

    if (!original) {
        return (
            <div>
                <div ref={shadowHostRef}></div>
                {shadowRoot && createPortal(<ErrorContent />, shadowRoot)}
            </div>
        );
    }

    // 정상적으로 데이터를 불러온 경우 WritePage 렌더링
    return <WritePage editMode={true} original={original} />;
}