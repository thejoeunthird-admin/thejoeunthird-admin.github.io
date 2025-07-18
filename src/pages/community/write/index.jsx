import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLoaderData, useLocation, useNavigate, useParams, useRouteLoaderData, useSearchParams } from "react-router-dom";
import { supabase } from '@/supabase';
import { useImage } from "@hooks";
import './WritePage.css'; // CSS 파일 import
import { useCategories } from '@hooks';

// 서치바 삭제 

export { loader } from './loader'
export function Write() {
    const formRef = useRef();
    const edit = useLoaderData('write');
    const location = useLocation();
    const navigate = useNavigate();
    const user = useRouteLoaderData('user');
    const { categorie, findById } = useCategories();
    const { images, initImage, getImages, setImages } = useImage();
    const [mainImage, setMainImge] = useState(null);
    const [isLoading, setIsloading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const initSearchParams = useCallback((searchs) => {
        let change = false;
        let init = Object.fromEntries(searchParams.entries());
        for (let search of searchs) {
            if (!searchParams.has(search)) {
                change = true;
                init[search] = '';
            }
        }
        if (change) { setSearchParams(init); }
    }, [setSearchParams]);

    const handleFileChange = (e) => {
        e.preventDefault();
        // !! 이미지가 5개이상이면 벤때리기 
        setImages(e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const categorie = formRef.current.querySelector('#category').value;
        const title = formRef.current.querySelector('#title').value;
        const content = formRef.current.querySelector('#content').value;
        let id = edit ? edit.id : null;
        // 이부분 통합으로 바꿔주기
        if (!categorie.trim()) { return alert('카테고리를 선택 해주세요.') }
        if (!title.trim()) { return alert('타이틀을 입력 해주세요.') }
        if (!content.trim()) { return alert('내용을 입력 해주세요.') }
        try {
            const mainImg = !mainImage ? images[0] : mainImage;
            if (edit) {
                const { error } = await supabase.rpc("update_board", {
                    p_id: Number(edit.id),
                    p_title: title,
                    p_contents: content,
                    p_update_date: new Date().toISOString(),
                    p_category_id: Number(categorie),
                    p_main_img: mainImg ?? null,
                    p_detail_img1: images[1] ?? null,
                    p_detail_img2: images[2] ?? null,
                    p_detail_img3: images[3] ?? null,
                    p_detail_img4: images[4] ?? null,
                });
                if (error) throw error
            }
            else {
                const { data, error } = await supabase.from("boards").insert([{
                    title,
                    contents: content,
                    category_id: Number(categorie),
                    user_id: user.id,
                    main_img: mainImg ?? null,
                    detail_img1: images[1] ?? null,
                    detail_img2: images[2] ?? null,
                    detail_img3: images[3] ?? null,
                    detail_img4: images[4] ?? null,
                }]).select();
                if (error) throw error
                id = data[0].id;
            }
        } catch (error) { return; }
        alert(edit ? "수정되었습니다!" : "등록되었습니다!");
        navigate(`/life/${findById(Number(categorie)).url}/${id}${location.search}`);
    }

    useEffect(() => {
        if (edit) {
            initImage([
                edit.main_img,
                edit.detail_img1,
                edit.detail_img2,
                edit.detail_img3,
                edit.detail_img4,
            ].filter(Boolean));
            setMainImge(edit.main_img)
        }
        setIsloading(true);
    }, [])

    useEffect(() => {
        if (searchParams.get('keyword') !== 'false') {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set('keyword', 'false');
            setSearchParams(newParams);
        }
    }, [searchParams, setSearchParams]);

    if (!isLoading) { return <>가져오는 중입니다.</> }
    return (
        <div>
            <div className="write-page-container">
                <h2 className="write-page-title">
                    {edit ? "게시글 수정" : "게시글 작성"}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div ref={formRef} className="form-header">
                        <select
                            id='category'
                            className="category-select"
                            defaultValue={edit ? edit.category_id : ''}
                        >
                            <option value="">카테고리 선택</option>
                            {categorie.filter(item => item.type === 'boards')[0].children.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <input id='title' className="title-input" type="text" placeholder="제목" defaultValue={edit ? edit.title : ''} />
                        <textarea
                            id='content'
                            className="content-textarea"
                            placeholder="내용"
                            defaultValue={edit ? edit.contents : ''}
                            rows={8}
                        />
                    </div>
                    <div className="image-preview-container">
                        {images.map((img, idx) => (
                            <div key={`old-${idx}`} className="image-item">
                                <img
                                    src={getImages(img)}
                                    className={`image-thumbnail ${0 === idx ? 'selected' : ''}`}
                                    // onClick={() => setMainIndex(idx)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (img === mainImage) { return; }
                                        let copy = JSON.parse(JSON.stringify(images));
                                        const change = copy.pop(idx)
                                        let ampty = [img,]
                                        for (const image of copy) {
                                            ampty.push(image)
                                        }
                                        initImage(ampty)
                                        setMainImge(img)
                                    }}
                                />
                                <button
                                    type="button"
                                    className="image-delete-button"
                                    onClick={() => handleRemoveOldImage(idx)}
                                    aria-label="이미지 삭제"
                                >
                                    ×
                                </button>
                                {0 === idx && <span className="main-image-badge"> 대표 </span>}
                            </div>
                        ))}
                    </div>
                    <div className="form-footer">
                        <div className="file-upload-section">
                            <input
                                className="file-input"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            <p className="file-input-description">
                                대표이미지로 지정할 이미지를 클릭하세요! (최대 5장)
                            </p>
                        </div>
                        <button type="submit" className="submit-button">
                            {edit ? "수정" : "등록"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
