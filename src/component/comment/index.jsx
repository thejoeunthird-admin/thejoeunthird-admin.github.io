import React, { useState, useEffect, useSyncExternalStore, useRef, } from 'react';
import { supabase } from '@/supabase';
import { FaRegUserCircle, FaEllipsisV, FaCommentAlt, FaRegThumbsUp } from "react-icons/fa";
import { useLoaderData, useParams, useRouteLoaderData } from 'react-router-dom';
import { useCategories } from '../../hooks';
import * as S from './index.styled'

export function Comment({ product, categoryId }) {
    const user = useRouteLoaderData('user');
    const [comments, setComments] = useState(null);
    const { findById } = useCategories();
    const editRef = useRef();
    const commentRef = useRef();
    const [replyTo, setReplyTo] = useState(null); // 대댓글 정보
    const [dropdownVisible, setDropdownVisible] = useState(null); // 댓글 드롭다운
    const [editComment, setEditComment] = useState(null);

    // 댓글 작성
    const handleCommentSubmit = async (e, ref) => {
        e.preventDefault();
        const str = ref.current.value;
        if (!str.trim()) { return alert('댓글을 작성해주세요'); }
        if (!user.access) { return alert('로그인이 필요합니다.') }
        try {
            const { data: comment, error: commentError } = await supabase
                .from('comments')
                .insert([
                    {
                        comment: str,
                        category_id: categoryId,
                        table_id: product.id,
                        user_id: user.id,
                        parent_id: replyTo ? replyTo.id : null,
                    }
                ])
                .select() // insert 후 데이터 받아오기
                .single(); // 하나만 insert 했으니 single() 사용
            if (commentError) throw error;
            if (product.user_id === user.id) { // 알람은 자신 제외
                const message = `${product.title} 게시물에 댓글이 달렸습니다.`;
                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert([
                        {
                            receiver_id: product.user_id,
                            sender_id: user.id,
                            type: 'comment',
                            table_type: findById(categoryId).type,
                            table_id: product.id,
                            related_id: comment.id, // 댓글 id
                            message,
                        },
                    ]);
                if (notifError) throw error;
            }
            ref.current.value = '';
            setReplyTo(null);
            fetchComment();
        } catch (error) { console.error('댓글 작성 실패', error); }
    };

    // 댓글 수정
    const handleEditSubmit = async (e, ref, commentId) => {
        e.preventDefault();
        if (!ref.current.value.trim()) { return alert('수정 댓글 입력하세요'); }
        try {
            const { error } = await supabase
                .from('comments')
                .update({
                    comment: ref.current.value,
                    update_date: new Date().toISOString(),
                })
                .eq('id', commentId);
            if (error) throw error;
            ref.current.value = ''
            fetchComment();
        } catch (error) { console.error('댓글 수정 실패', error); }
    }

    // 댓글 삭제
    const handleDelete = async (comment) => {
        if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
        try {
            if (!comment.parent_id) { // 부모 객체이다.
                const childs = comments.filter(item => item.parent_id == comment.id);
                if (childs.length > 0) { // 자식이 있다.
                    for (let child of childs) {
                        const { error } = await supabase.from('comments').update({ is_deleted: true }).eq('id', child.id);
                        if (error) throw error;
                    }
                }
                const { error } = await supabase.from('comments').update({ is_deleted: true }).eq('id', comment.id);
                if (error) throw error;
            }
        } catch (error) { console.error('댓글 삭제 실패', error); }
        setDropdownVisible(false);
    }


    // 댓글 작성 시간 표시 함수 
    const formatRelativeTime = (timestamp) => {
        const now = new Date();

        const utcDate = new Date(timestamp); // supabase에서 받은 UTC 시간
        const time = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // UTC > KST로 변환
        const diff = now - time;

        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);

        if (days >= 7) {
            // 7일 초과 시: '2025년 05월 19일 오후 2:20' 형식
            const year = time.getFullYear();
            const month = String(time.getMonth() + 1).padStart(2, '0');
            const date = String(time.getDate()).padStart(2, '0');

            let hour = time.getHours();
            const minute = String(time.getMinutes()).padStart(2, '0');
            const isPM = hour >= 12;
            const ampm = isPM ? '오후' : '오전';
            hour = hour % 12 || 12; // 12시간제로 변환

            return `${year}년 ${month}월 ${date}일 ${ampm} ${hour}:${minute}`;
        }

        if (mins < 1) return '방금 전';
        if (mins < 60) return `${mins}분 전`;
        if (hrs < 24) return `${hrs}시간 전`;
        return `${days}일 전`;
    };

    const toggleDropdown = (index) => {
        if (dropdownVisible === index) {
            setDropdownVisible(null); // 이미 열려 있으면 닫기
        } else {
            setDropdownVisible(index); // 새로 클릭한 댓글의 드롭다운 열기
        }
    }

    // 수정 버튼 클릭 시 해당 댓글을 수정하도록 설정
    const handleEdit = (commentId) => {
        setEditComment(commentId); // 수정할 댓글 id
        setDropdownVisible(false);
    }

    const fetchComment = async () => {
        const itemNum = Number(product.id);
        const loader = async () => {
            if (isNaN(itemNum)) {
                throw new Response('Invalid ID 2', { status: 400 });
            }
            try {
                const { data, error } = await supabase
                    .from('comments')
                    .select('*, users(name, id)')
                    .eq('table_id', itemNum)
                    .eq('category_id', categoryId)
                    .eq('is_deleted', false)
                    .order('create_date', { ascending: false });
                if (error) throw error;
                return data;
            } catch (err) { return [] }
        }
        loader().then((obj) => { setComments(obj) })
    }

    useEffect(() => { fetchComment(); }, [product.id])

    if (!comments) { return; }
    return (
        <S.Container>
            <div className='comments-top'>
                <h4>댓글</h4>
                <form onSubmit={(e) => handleCommentSubmit(e, commentRef, replyTo ? replyTo.id : null)}>
                    {replyTo && (
                        <div onClick={() => setReplyTo(null)}>
                            <strong>@{replyTo.users?.name}</strong>
                        </div>
                    )}
                    <textarea ref={commentRef} placeholder={"댓글을 작성하세요"} />
                    <button type="submit">
                        댓글 작성
                    </button>
                </form>
            </div>
            <div className="comments-list">
                {/* 부모만 추출 */}
                {comments.filter(comment => !comment.parent_id).map((comment, id) =>
                    <S.CommentsItem key={comment.id}>
                        <div className="comment-header">
                            <strong>
                                <FaRegUserCircle />
                                {comment.users?.name}
                            </strong>
                            <div>
                                <S.SmallButton>
                                    <FaRegThumbsUp className='small-icon' />
                                </S.SmallButton>
                                <S.SmallButton onClick={() => setReplyTo(comment)}>
                                    <FaCommentAlt className='small-icon' />
                                </S.SmallButton>
                                {!comment.is_deleted && user?.id === comment.user_id && (<>
                                    <S.SmallButton onClick={() => toggleDropdown(id)}>
                                        <FaEllipsisV className='small-icon' />
                                    </S.SmallButton>
                                    {dropdownVisible === id && (
                                        <ul>
                                            <li onClick={() => handleEdit(comment.id, comment.comment)}>수정</li>
                                            <li onClick={() => handleDelete(comment)}>삭제</li>
                                        </ul>
                                    )}
                                </>)}
                            </div>
                        </div>
                        <div className='comment-date'>
                            <small>{formatRelativeTime(comment.create_date)}</small>
                            {comment.update_date !== comment.create_date && (
                                <small className="updated-label">&nbsp;, (수정됨) </small>
                            )}
                        </div>
                        {editComment === comment.id ? (
                            <form
                                className='edit'
                                onSubmit={(e) => handleEditSubmit(e, editRef, comment.id)}
                            >
                                <S.Input
                                    ref={editRef}
                                    className='comment-input'
                                    defaultValue={comment.comment}
                                />
                                <button
                                    className='editSubmit-btn'
                                    type='submit'
                                >
                                    수정 완료
                                </button>
                            </form>
                        ) : (
                            <div>
                                <p>{comment.is_deleted ? '삭제된 댓글입니다.' : comment.comment}</p>
                            </div>
                        )}
                        <div>
                            {comments.filter(reply => reply.parent_id === comment.id).map((reply, rIdx) => (
                                <S.CommentsItem key={comment.id} $notBox>
                                    <div className="comment-header">
                                        <strong>
                                            <FaRegUserCircle />
                                            {reply.users?.name}
                                        </strong>
                                        <div>
                                            <S.SmallButton>
                                                <FaRegThumbsUp />
                                            </S.SmallButton>
                                            {!reply.is_deleted && user.id === reply.user_id && (
                                                <>
                                                    <S.SmallButton onClick={() => toggleDropdown(`reply-${rIdx}`)}>
                                                        <FaEllipsisV />
                                                    </S.SmallButton>
                                                    {dropdownVisible === `reply-${rIdx}` && (
                                                        <ul>
                                                            <li onClick={() => handleEdit(reply.id, reply.comment)}>수정</li>
                                                            <li onClick={() => handleDelete(reply)}>삭제</li>
                                                        </ul>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>                                
                                    <strong>{reply.user?.name}</strong>
                                    <div className='comment-date'>
                                        <small>{formatRelativeTime(reply.create_date)}</small>
                                        {reply.update_date !== reply.create_date && (
                                            <small className="updated-label">&nbsp;, (수정됨) </small>
                                        )}
                                    </div>
                                    { editComment === reply.id ? (
                                        <form
                                            className='editComment-input'
                                            onSubmit={(e) => handleEditSubmit(e, editRef, reply.id)}
                                        >
                                            <S.Input
                                                ref={editRef}
                                                className='comment-input'
                                                defaultValue={comment.comment}
                                            />
                                            <button
                                                className='editSubmit-btn'
                                                type='submit'
                                            >
                                                수정 완료
                                            </button>
                                        </form>
                                    ) : (
                                        <p><strong>@{comment.users?.name}</strong> &ensp; {reply.comment}</p>
                                    )}
                                </S.CommentsItem>
                            ))}
                        </div>
                    </S.CommentsItem>
                )}
            </div>
        </S.Container>
    );
}
