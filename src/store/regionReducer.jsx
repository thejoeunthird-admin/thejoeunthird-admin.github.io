const initRegionState = {
  address: [],
  isLoading: false
};

export const resetRegion = () => ({
  type: "RESET_REGION"
});

export const setRegionAddress = (payload) => ({
  type: "SET_REGION_ADDRESS",
  payload,
});

export const setRegionBoth = (city, district) => ({
  type: "SET_REGION_BOTH",
  payload: [city, district]
});

// 위치 기반 리덕스 액션
export const regionReducer = (state = initRegionState, action) => {
  switch (action.type) {
    // 시 변경
    case "SET_REGION_ADDRESS":
      return { ...state, address: action.payload };
    // 군구 변경 
    case "SET_REGION_LOADING":
      return { ...state, isLoading: action.payload };
    // 시, 군구 변경
    case "SET_REGION_BOTH":
      return { ...state, address: action.payload };
    // 주소 초기화
    case "RESET_REGION":
      return { ...state, address: [] };
    default:
      return state;
  }
};
