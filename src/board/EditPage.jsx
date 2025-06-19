import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { supabase } from '../supabase/supabase';
import WritePage from './WritePage';

export default function EditPage() {
    const { id } = useParams();
    const [original, setOriginal] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '200px',
                padding: '50px 20px' 
            }}>
                <div style={{ 
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #007bff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                }}>
                </div>
                <div style={{ 
                    fontSize: '16px', 
                    color: '#666',
                    fontWeight: '500'
                }}>
                    게시글을 불러오는 중...
                </div>
                <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
            </div>
        );
    }

    if (!original) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px',
                padding: '50px 20px' 
            }}>
                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffecb5',
                    borderRadius: '8px',
                    padding: '20px',
                    color: '#856404',
                    maxWidth: '500px',
                    textAlign: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                        ⚠️ 게시글을 찾을 수 없습니다
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        요청하신 게시글이 삭제되었거나 존재하지 않습니다.
                    </div>
                </div>
            </div>
        );
    }

    // 정상적으로 데이터를 불러온 경우 WritePage 렌더링
    return <WritePage editMode={true} original={original} />;
}