import { supabase } from '../supabase/supabase';

export const getCategoriesUrl = async (url = '') => {
    if (!url) return null;
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('url', url)
        .limit(1)
        .single();
    if (error) {
        console.error('getCategoriesUrl error:', error);
        return null;
    }
    return data;
};