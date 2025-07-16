import { supabase } from '@/supabase';

export const loader = async ({ params, request }) => {
  const { item } = params;
  const numericId = Number(item);
  if (isNaN(numericId)) {
    throw new Response('Invalid ID 1', { status: 400 });
  }

  // ✅ 세션에서 현재 사용자 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;

  // ✅ 게시글 + 유저/카테고리 조인
  const { data: postData, error: postError } = await supabase
    .from('boards')
    .select('*, users(name), categories(name)')
    .eq('id', numericId)
    .single();

  if (postError || !postData) {
    throw new Response('Post not found', { status: 404 });
  }

  // ✅ 좋아요 개수
  const { count: likesCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', postData.category_id)
    .eq('table_id', postData.id);

  // ✅ 내가 좋아요 눌렀는지 여부
  let isLike = false;
  if (userId) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('id')
      .eq('category_id', postData.category_id)
      .eq('table_id', postData.id)
      .eq('user_id', userId);

    isLike = likeData.length > 0;
  }

  return {
    detail: postData,
    likes: likesCount ?? 0,
    isLike,
  };
};
