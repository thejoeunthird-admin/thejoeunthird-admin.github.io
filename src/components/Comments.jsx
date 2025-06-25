import React, { useState, useEffect, useSyncExternalStore, } from 'react';
import { supabase } from '../supabase/supabase';
import { useUserTable } from "../hooks/useUserTable";
import { FaRegUserCircle, FaEllipsisV, FaCommentAlt, FaRegThumbsUp } from "react-icons/fa";
import "../css/comments.css"

export function Comments({ productId, categoryId }) {
    // useUserTable 훅 호출하여 현재 로그인된 사용자 정보 가져옴.
    // info: 사용자 정보, loading: 로딩 상태 
    const { info: userInfo } = useUserTable();

    const [comments, setComments] = useState([]); // 댓글 리스트 상태
    const [newComment, setNewComment] = useState(''); // 새 댓글 입력 상태
    const [replyTo, setReplyTo] = useState(null); // 대댓글 정보
    const [dropdownVisible, setDropdownVisible] = useState(null); // 댓글 드롭다운
    const [editComment, setEditComment] = useState(null); // 수정할 댓글 상태(수정 추적할 상태)
    const [editText, setEditText] = useState('') // 수정할 텍스트 상태

    // 서버에서 댓글 불러오기 함수
    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*, users(name, id)')
                .eq('table_id', productId)
                .eq('category_id', categoryId)
                .order('create_date', { ascending: false });

            if (error) throw error;
            setComments(data); // 댓글 데이터 상태 업데이트
        } catch (error) {
            console.error('댓글 불러오기 실패', error);
        }
    };


    // 댓글 불러오기
    useEffect(() => {
        fetchComments();
    }, [productId]); // productid가 변경될 때마다 댓글 재불러오기


    // 댓글 작성 함수 submit(대댓글 parentId)
    const handleCommentSubmit = async (e, parentId = null) => {
        e.preventDefault();

        if (!newComment.trim()) {
            alert('댓글을 작성해주세요');
            return;
        }

        if (!userInfo) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            // 1. 댓글 insert
            // supabase에 insert
            const { data: commentData, error:commentError } = await supabase
                .from('comments')
                .insert([
                    {
                        comment: newComment,
                        category_id: categoryId,
                        table_id: productId,
                        user_id: userInfo.id,
                        // parent_id: parentId // 대댓글인 경우 parentId 값 전달
                        parent_id: replyTo ? replyTo.id : null,
                    }
                ])
                .select() // insert 후 데이터 받아오기
                .single(); // 하나만 insert 했으니 single() 사용

            if (commentError) throw error;

            // 2. category 테이블에서 type 조회
            const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('type')
                .eq('id', categoryId)
                .single();

            if (categoryError || !categoryData) throw categoryError;

            const categoryType = categoryData.type; // ex) 'board', 'trade'

            // 3. 해당 테이블에서 게시물 작성자 조회
            let postAuthorId = null;
            let postTitle = null;

            if (categoryType === 'boards') {
                const { data, error } = await supabase
                    .from('boards')
                    .select('user_id, title')
                    .eq('id', productId)
                    .single();

                if (error) throw error;
                postAuthorId = data.user_id;
                postTitle = data.title;

            } else if (categoryType === 'trades') {
                const { data, error } = await supabase
                    .from('trades')
                    .select('user_id, title')
                    .eq('id', productId)
                    .single();
                if (error) throw error;
                postAuthorId = data.user_id;
                postTitle = data.title;
            }

            // 4. 알림 등록( 자기 자신 제외)
            if (postAuthorId && postAuthorId !== userInfo.id) {       
                const message = `${postTitle} 게시물에 댓글이 달렸습니다.`;

                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert([
                        {
                            receiver_id: postAuthorId,
                            sender_id: userInfo.id,
                            type: 'comment',
                            table_type: categoryType,
                            table_id: productId, // 게시글 id
                            related_id: commentData.id, // 댓글 id
                            message,
                        },
                    ]);
                if (notifError) console.error('알림 등록 실패: ', notifError);
            }
            setNewComment('');
            setReplyTo(null); // 대댓글 작성 후, replyTo 초기화
            fetchComments();

        } catch (error) {
            console.error('댓글 작성 실패', error);
        }
    };


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

    // 드롭다운 메뉴 toggle
    const toggleDropdown = (index) => {
        if (dropdownVisible === index) {
            setDropdownVisible(null); // 이미 열려 있으면 닫기
        } else {
            setDropdownVisible(index); // 새로 클릭한 댓글의 드롭다운 열기
        }
    }

    // 수정 버튼 클릭 시 해당 댓글을 수정하도록 설정
    const handleEdit = (commentId, currentComment) => {
        setEditComment(commentId); // 수정할 댓글 id
        setEditText(currentComment); // 수정할 댓글 텍스트
    }

    // 댓글 수정 함수 submit
    const handleEditSubmit = async (e, commentId) => {
        e.preventDefault();

        if (!editText.trim()) {
            alert('수정 댓글 입력하세요');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('comments')
                .update({
                    comment: editText,
                    update_date: new Date().toISOString(),
                })
                .eq('id', commentId);

            if (error) throw error;

            // 댓글 수정 후 바로 클라이언트에서 상태 갱신
            setComments(prevComments =>
                prevComments.map(
                    comment => comment.id === commentId ? { ...comment, comment: editText, update_date: new Date().toISOString() } : comment
                )
            )

            setEditComment(null); // 수정 모드 종료
            setEditText(''); // 텍스트 초기화
            // fetchComments; // 댓글 새로고침 > 수정은 setComments()로

        } catch (error) {
            console.error('댓글 수정 실패', error);
        }
    };

    // 댓글 삭제 함수
    const handleDelete = async (commentId) => {
        if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

        try {
            // 삭제 대상 댓글 가져오기 (parent_id 확인)
            const { data: targetComment, error: fetchError } = await supabase
                .from('comments')
                .select('id, parent_id')
                .eq('id', commentId)
                .single();

            if (fetchError) throw fetchError;

            const isParent = !targetComment.parent_id;

            if (isParent) {
                // 부모 댓글 삭제 처리
                // 자식 댓글 중 is_deleted = false 인 것 존재 여부 확인
                const { data: childComments, error: childError } = await supabase
                    .from('comments')
                    .select('id')
                    .eq('parent_id', commentId);

                if (childError) throw childError;

                if (childComments.length > 0) {
                    // 자식 댓글 있으면 soft delete
                    await supabase.from('comments')
                        .update({ is_deleted: true })
                        .eq('id', commentId);
                } else {
                    // 자식 댓글 없으면 완전 삭제
                    await supabase.from('comments')
                        .delete()
                        .eq('id', commentId);
                }
            } else {
                // 자식 댓글은 바로 완전 삭제
                await supabase.from('comments')
                    .delete()
                    .eq('id', commentId);

                // 그리고 부모가 soft delete 상태인지 체크
                const { data: parentComment, error: parentError } = await supabase
                    .from('comments')
                    .select('is_deleted')
                    .eq('id', targetComment.parent_id)
                    .single();

                if (parentError) throw parentError;

                if (parentComment?.is_deleted) {
                    // 부모 댓글의 남은 자식 댓글 존재 여부 체크
                    const { data: remainingChildren, error: remError } = await supabase
                        .from('comments')
                        .select('id')
                        .eq('parent_id', targetComment.parent_id);

                    if (remError) throw remError;

                    if (remainingChildren.length === 0) {
                        // 자식 댓글이 더 이상 없으면 부모 댓글 완전 삭제
                        await supabase.from('comments')
                            .delete()
                            .eq('id', targetComment.parent_id);
                    }
                }
            }

            fetchComments();

        } catch (error) {
            console.error('댓글 삭제 실패:', error);
        }
    };

    return (
        <div id="comments-section" >
            <div className='comments-top'>
                <h4>댓글</h4>
                <form onSubmit={(e) => handleCommentSubmit(e, replyTo ? replyTo.id : null)} className="comment-form">
                    {replyTo && (
                        <div className="reply-target" onClick={() => setReplyTo(null)}>
                            <strong>@{replyTo.users?.name}</strong>
                        </div>
                    )}

                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={"댓글을 작성하세요"}
                        className="comment-input"
                    />
                    <button type="submit" className="submit-btn">
                        댓글 작성
                    </button>
                </form>

            </div>
            {/* 댓글 List */}
            <div className="comments-list">
                {comments
                    .filter(comment => !comment.parent_id) // 부모 댓글만
                    .map((parentComment, idx) => (
                        <div key={parentComment.id} className="comment-item">
                            <div className="comment-header">
                                <strong><FaRegUserCircle /> {parentComment.users?.name}</strong>
                                <div>
                                    <button className='small-button'><FaRegThumbsUp className='small-icon' /></button>
                                    <button className='small-button' onClick={() => setReplyTo(parentComment)}><FaCommentAlt className='small-icon' /></button>

                                    {!parentComment.is_deleted && userInfo?.id === parentComment.user_id && (
                                        <>
                                            <button className='small-button' onClick={() => toggleDropdown(idx)}><FaEllipsisV className='small-icon' /></button>

                                            {dropdownVisible === idx && (
                                                <div className='dropMenu'>
                                                    <button onClick={() => handleEdit(parentComment.id, parentComment.comment)}>수정</button>
                                                    <button onClick={() => handleDelete(parentComment.id)}>삭제</button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className='comment-date'>
                                <small>{formatRelativeTime(parentComment.create_date)}</small>
                                {parentComment.update_date !== parentComment.create_date && (
                                    <small className="updated-label">&nbsp;, (수정됨) </small>
                                )}
                            </div>

                            {editComment === parentComment.id ? (
                                <form onSubmit={(e) => handleEditSubmit(e, parentComment.id)} className='editComment-input'>
                                    <textarea value={editText}
                                        onChange={(e) => setEditText(e.target.value)} className='comment-input' />
                                    <button type='submit' className='editSubmit-btn'>수정 완료</button>
                                </form>
                            ) : (
                                <div>
                                    <p>{parentComment.is_deleted ? '삭제된 댓글입니다.' : parentComment.comment}</p>

                                </div>
                            )}

                            {/* 자식 댓글 별도 처리 */}
                            <div className="replies">
                                {comments
                                    .filter(reply => reply.parent_id === parentComment.id)
                                    .map((reply, rIdx) => (
                                        <div key={reply.id} className="reply-item">
                                            <div className="comment-header">
                                                <strong><FaRegUserCircle /> {reply.users?.name}</strong>
                                                <div>
                                                    <button className='small-button'><FaRegThumbsUp className='small-icon' /></button>

                                                    {/*댓글 아이콘 */}
                                                    {/* <button className='small-button' onClick={() => setReplyTo(reply)}><FaCommentAlt className='small-icon' /></button> */}

                                                    {!reply.is_deleted && userInfo?.id === reply.user_id && (
                                                        <>
                                                            <button className='small-button' onClick={() => toggleDropdown(`reply-${rIdx}`)}><FaEllipsisV className='small-icon' /></button>
                                                            {dropdownVisible === `reply-${rIdx}` && (
                                                                <div className='dropMenu'>
                                                                    <button onClick={() => handleEdit(reply.id, reply.comment)}>수정</button>
                                                                    <button onClick={() => handleDelete(reply.id)}>삭제</button>
                                                                </div>
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

                                            {editComment === reply.id ? (
                                                <form onSubmit={(e) => handleEditSubmit(e, reply.id)} className='editComment-input'>
                                                    <textarea value={editText}
                                                        onChange={(e) => setEditText(e.target.value)} className='comment-input' />
                                                    <button type='submit' className='editSubmit-btn'>수정 완료</button>
                                                </form>
                                            ) : (
                                                <p><strong>@{parentComment.users?.name}</strong> &ensp; {reply.comment}</p>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
            </div>

        </div>
    );
}

