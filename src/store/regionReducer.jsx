const initRegionState = {
  address: [],
  isLoading: false
};

export const setRegionAddress = (payload) => ({
  type: "SET_REGION_ADDRESS",
  payload,
});

export const setRegionLoading = (payload) => ({
  type: "SET_REGION_LOADING",
  payload,
});

export const regionReducer = (state = initRegionState, action) => {
  switch (action.type) {
    case "SET_REGION_ADDRESS":
      return { ...state, address: action.payload };
    case "SET_REGION_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};