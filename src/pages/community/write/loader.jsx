import { supabase } from "../../../supabase";

export const loader = async ({ params }) => {
    const { detail } = params;
    const numericId = Number(detail);
    if (isNaN(numericId)) {
        console.warn('글쓰기모드입니다.')
        return null;
    }
    const { data: postData, error: postError } = await supabase
        .from('boards')
        .select('*, users(name), categories(name)')
        .eq('id', numericId)
        .single();

    if (postError || !postData) {
        throw new Response('Post not found', { status: 404 });
    }
    return postData;
}