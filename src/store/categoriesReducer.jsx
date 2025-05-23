const initCategoriesState = {
    info: null,
};

export const setCategoriesInfo = (payload) => ({
    type: "SET_CATEGORIES_INFO",
    payload,
});

export const clearCategoriesInfo = () => ({
    type: "CLEAR_CATEGORIES_INFO",
});

export const categoriesReducer = (state = initCategoriesState, action) => {
    switch (action.type) {
        case "SET_CATEGORIES_INFO":
            return { ...state, info: action.payload };
        case "CLEAR_CATEGORIES_INFO":
            return { ...state, info: null };
        default:
            return state;
    }
};