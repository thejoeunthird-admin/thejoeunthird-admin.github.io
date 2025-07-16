// routes/lifeLoader.js
import { supabase } from '@/supabase';

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') || '';
  const tap = params.category;
  let query = supabase
    .from("boards")
    .select(`
      id, title, contents, create_date, category_id, main_img, cnt,
      user_id, users(name), categories(name)
    `)
    .order("create_date", { ascending: false });

  if (tap && tap !== "all") {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("url", tap)
      .single();

    if (cat?.id) {
      query = query.eq("category_id", cat.id);
    }
  }

  if (keyword && keyword !== '') {
    query = query.or(`title.ilike.%${keyword}%,contents.ilike.%${keyword}%`);
  }

  const { data: boardsData } = await query;

  const boardsWithCounts = await Promise.all(
    (boardsData || []).map(async (board) => {
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("table_id", board.id);

      const { count: likesCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("table_id", board.id);

      return {
        ...board,
        commentsCount: commentsCount || 0,
        likesCount: likesCount || 0,
      };
    })
  );

//   // 지연 함수 (delay)
// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
//     // 10초 지연
//   await delay(10000);
  return boardsWithCounts;
}
