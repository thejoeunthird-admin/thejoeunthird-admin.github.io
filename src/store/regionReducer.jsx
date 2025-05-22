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

export const setRegionLoading = (payload) => ({
  type: "SET_REGION_LOADING",
  payload,
});

// 둘 다 한 번에 설정하는 액션 타입
const SET_REGION_BOTH = "SET_REGION_BOTH";

// 액션 생성자 추가
export const setRegionBoth = (city, district) => ({
  type: SET_REGION_BOTH,
  payload: [city, district]
});

export const regionReducer = (state = initRegionState, action) => {
  switch (action.type) {
    case "SET_REGION_ADDRESS":
      return { ...state, address: action.payload };
    case "SET_REGION_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET_REGION":
      return { ...state, address: [] }; // 주소 초기화
    case "SET_REGION_BOTH":
      return { ...state, address: action.payload };
    default:
      return state;
  }
};
