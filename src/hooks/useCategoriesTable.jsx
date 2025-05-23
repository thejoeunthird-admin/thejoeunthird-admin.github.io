import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategoriesInfo, clearCategoriesInfo } from "../store/categoriesReducer";
import { supabase } from '../supabase/supabase';

export const useCategoriesTable = () => {
  const dispatch = useDispatch();
  const categoriesInfo = useSelector((state) => state.categories.info);
  const [error, setError] = useState(null);

  const fetchCategoriesInfo = async () => {
    if (categoriesInfo) return;
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*");
      if (error) {
        throw new Error(error.message);
      }
      dispatch(setCategoriesInfo(data));
    } catch (err) {
      setError(err.message);
      dispatch(clearCategoriesInfo());
    }
  };

  useEffect(() => {
    fetchCategoriesInfo();
  }, []);

  return {
    info: categoriesInfo,
    loading: categoriesInfo === null?false:true,
    error,
    refetch: fetchCategoriesInfo,
  };
};
