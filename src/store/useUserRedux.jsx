const initUserState = {
  info: null,
};

export const setUserInfo = (payload) => ({
  type: "SET_USER_INFO",
  payload,
});

export const clearUserInfo = () => ({
  type: "CLEAR_USER_INFO",
});

export const useUserRedux = (state = initUserState, action) => {
  switch (action.type) {
    case "SET_USER_INFO":
      return { ...state, info: action.payload };
    case "CLEAR_USER_INFO":
      return { ...state, info: null };
    default:
      return state;
  }
};