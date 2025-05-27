import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategoriesInfo, clearCategoriesInfo } from "../store/categoriesReducer";
import { supabase } from '../supabase/supabase';

/** 
 * 카테고리 데이터를 가져오는 커스텀 훅
 * @param {string|null} path - 조회할 카테고리 타입 (null이면 전체 조회)
 * @returns {object} { info, loading, error, refetch }
 */
export const useCategoriesTable = (path = null) => {
  const dispatch = useDispatch();
  const categoriesInfo = useSelector((state) => state.categories.info);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategoriesInfo = async () => {
    if (categoriesInfo !== null) { return; }
    setLoading(true);
    setError(null);
    try {
      // 1. 기본 쿼리 생성 (전체 조회 또는 특정 타입 조회)
      let query = supabase.from('categories').select('*');

      if (path !== null) {
        query = query.eq('type', path);
      }

      const { data: categories, error: queryError } = await query;
      if (queryError) throw queryError;
      if (!categories || categories.length === 0) {
        dispatch(setCategoriesInfo({ parents: [], children: [] }));
        return;
      }

      // 2. 상위/하위 분류 및 관계 설정
      const parents = path === null
        ? categories.filter(item => item.parent_id === 0 || item.parent_id === null)
        : categories;

      const childrenResults = await Promise.all(
        parents.map(async (parent) => {
          const { data: children, error: childrenError } = await supabase
            .from('categories')
            .select('*')
            .eq('parent_id', parent.id);
          return childrenError ? [] : children;
        })
      );

      const result = [
        ...parents.map((parent, index) => ({
          ...parent,
          children: childrenResults[index]
        }))
      ];

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

  const findCategoryByUrl  = (url) => {
    if (!categoriesInfo || !url) return null;
    const pathSegments = decodeURIComponent(url).split('/').filter(Boolean);
    const matchedPath = [];
    let currentLevel = [];
    categoriesInfo.forEach(cat => {
      if (cat.children) currentLevel.push(...cat.children);
    });

    for (const segment of pathSegments) {
      const found = currentLevel.find(cat => cat.url === segment);
      if (!found) break;
      matchedPath.push(found);
      currentLevel = found.children || [];
    }

    return matchedPath;
  };

  return {
    info: categoriesInfo,
    findChildren: findCategoryByUrl,
    loading,
    error,
    refetch: fetchCategoriesInfo,
  };
};