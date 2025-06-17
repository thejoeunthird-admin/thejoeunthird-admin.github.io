import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategoriesInfo, clearCategoriesInfo, setCategoriesAll } from "../store/categoriesReducer";
import { supabase } from '../supabase/supabase';

/** 
 * 카테고리 데이터를 가져오는 커스텀 훅 (path 없이 전체 조회)
 * @returns {object} { info, loading, error, refetch }
 */
export const useCategoriesTable = () => {
  const dispatch = useDispatch();
  const categoriesAll = useSelector((state) => state.categories.all);
  const categoriesInfo = useSelector((state) => state.categories.info);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategoriesInfo = async () => {
    if (categoriesInfo !== null) return;
    setLoading(true);
    setError(null);
    try {
      const { data: categories, error: queryError } = await supabase
        .from('categories')
        .select('*');

      if (queryError) throw queryError;

      if (!categories || categories.length === 0) {
        dispatch(setCategoriesInfo([]));
        dispatch(setCategoriesAll([]));
        return;
      }

      dispatch(setCategoriesAll(categories));

      const parents = categories.filter(item => item.parent_id === 0 || item.parent_id === null);

      const childrenResults = await Promise.all(
        parents.map(async (parent) => {
          const { data: children, error: childrenError } = await supabase
            .from('categories')
            .select('*')
            .eq('parent_id', parent.id);
          return childrenError ? [] : children;
        })
      );

      const result = parents.map((parent, index) => ({
        ...parent,
        children: childrenResults[index],
      }));

      dispatch(setCategoriesInfo(result));
      return result;
    } catch (err) {
      setError(err.message);
      dispatch(clearCategoriesInfo());
      console.error('카테고리 조회 중 오류:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesInfo();
  }, []);

  const findByUrl = (url) => {
    if (!categoriesAll || !url) return null;
    const pathSegments = decodeURIComponent(url).split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const foundCategory = categoriesAll.find(cat => cat.url === lastSegment);
    return foundCategory || null;
  };

  const findById = (id) => {
    if (!categoriesAll || !id) return null;
    return categoriesAll.find(cat => cat.id === id) || null;
  };

  return {
    info: categoriesInfo,
    findByUrl,
    findById,
    loading,
    error,
    refetch: fetchCategoriesInfo,
  };
};
