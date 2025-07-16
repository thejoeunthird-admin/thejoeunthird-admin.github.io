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

// 위치 기반 리덕스 액션
export const userReducer = (state = initUserState, action) => {
  switch (action.type) {
    // supabase profiles 테이블을 저장
    case "SET_USER_INFO":
      return { ...state, info: action.payload };
    // 리덕스 안에 유저 정보를 삭제 supabase profiles은 그대로
    case "CLEAR_USER_INFO":
      return { ...state, info: null };
    default:
      return state;
  }
};