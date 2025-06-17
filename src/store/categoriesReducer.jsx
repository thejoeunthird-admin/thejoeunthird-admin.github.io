const initCategoriesState = {
  info: null,  // 트리 구조 (부모-자식)
  all: null,   // 평탄화된 모든 카테고리 배열
};

export const setCategoriesInfo = (payload) => ({
  type: "SET_CATEGORIES_INFO",
  payload,
});

export const setCategoriesAll = (payload) => ({
  type: "SET_CATEGORIES_ALL",
  payload,
});

export const clearCategoriesInfo = () => ({
  type: "CLEAR_CATEGORIES_INFO",
});

export const categoriesReducer = (state = initCategoriesState, action) => {
  switch (action.type) {
    case "SET_CATEGORIES_INFO":
      return { ...state, info: action.payload };
    case "SET_CATEGORIES_ALL":
      return { ...state, all: action.payload };
    case "CLEAR_CATEGORIES_INFO":
      return { ...state, info: null, all: null };
    default:
      return state;
  }
};
