import { useEffect, useRef, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { categorieAtom } from '@jotai';
import { supabase } from '@/supabase';

export const useCategories = () => {
  const [categorie, setCategorie] = useAtom(categorieAtom);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false); // ✅ 최초 1회만 실행 제어

  const buildTree = (flatList) => {
    const idMap = {};
    const roots = [];

    for (const item of flatList) {
      idMap[item.id] = { ...item, children: [] };
    }

    for (const item of flatList) {
      const mapped = idMap[item.id];
      if (item.parent_id) {
        idMap[item.parent_id]?.children.push(mapped);
      } else {
        roots.push(mapped);
      }
    }

    return roots;
  };

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      const tree = buildTree(data);
      setCategorie(tree);
    } catch (err) {
      setError(err.message || String(err));
    }
  }, [setCategorie]);

  useEffect(() => {
    if (!fetchedRef.current && categorie === null) {
      fetchedRef.current = true;
      fetchCategories();
    }
  }, [fetchCategories, categorie]);

  /** URL 경로로 카테고리 찾기 */
  const findByUrl = useCallback(
    (url) => {
      if (!categorie) return null;

      const last = decodeURIComponent(url).split('/').filter(Boolean).pop();

      const search = (nodes) => {
        for (const node of nodes) {
          if (node.url === last) return node;
          if (node.children?.length) {
            const result = search(node.children);
            if (result) return result;
          }
        }
        return null;
      };

      return search(categorie);
    },
    [categorie]
  );

  /** ID로 카테고리 찾기 */
  const findById = useCallback(
    (id) => {
      if (!categorie) return null;

      const search = (nodes) => {
        for (const node of nodes) {
          if (node.id === id) return node;
          if (node.children?.length) {
            const result = search(node.children);
            if (result) return result;
          }
        }
        return null;
      };

      return search(categorie);
    },
    [categorie]
  );

  return {
    categorie: Array.isArray(categorie) ? categorie.filter(c => c.id !== 16) : categorie,
    error,
    findByUrl,
    findById,
  };
};
