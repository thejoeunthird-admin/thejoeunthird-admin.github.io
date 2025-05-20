import { createStore, combineReducers } from "redux";
import { userReducer } from "./userReducer";

const rootReducer = combineReducers({
  user: userReducer,
});

export const redux = createStore(rootReducer);
