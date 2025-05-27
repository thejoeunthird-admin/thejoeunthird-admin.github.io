import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from '../supabase/supabase';

/**
 * 현재 location.pathname 기준으로 경로별 카테고리를 계단식으로 조회하는 훅
 * @returns {Array} matchedPath - url 경로와 매칭되는 카테고리 배열
 */
export const useRoots = () => {
  const location = useLocation();
  const [matchedPath, setMatchedPath] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const pathSegments = decodeURIComponent(location.pathname).split('/').filter(Boolean);
      let currentParentId = null; // 최상위부터 탐색 시작
      const pathArray = [];

      for (const segment of pathSegments) {
        // 현재 부모 ID 기준으로 url이 일치하는 카테고리 조회
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('url', segment)
          .eq(currentParentId === null ? 'parent_id' : 'parent_id', currentParentId)
          .limit(1)
          .single();

        if (error || !data) {
          break; // 더 이상 매칭되는 경로 없음
        }
        pathArray.push(data);
        currentParentId = data.id; // 다음 단계 자식 탐색용 부모 ID 설정
      }

      setMatchedPath(pathArray);
    };

    loadCategories();
  }, [location]);

  return matchedPath;
};



export function TestPage() {
  const matchedPath = useRoots();

  console.log(matchedPath)


  return (
    <div>
      <h2>📦 WebP 이미지 압축기 (라이브러리 사용)</h2>
      <input></input>
      <input type="file" accept="image/*"/>
    </div>
  );
}
