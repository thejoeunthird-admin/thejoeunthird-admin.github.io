import { createStore, combineReducers } from "redux";
import { useUserRedux } from "./userReducer";
import { regionReducer } from "./regionReducer"

const rootReducer = combineReducers({
  user: useUserRedux,
  region: regionReducer
});

export const redux = createStore(rootReducer);

export { setRegionLoading, setRegionAddress, resetRegion, setRegionBoth } from './regionReducer';