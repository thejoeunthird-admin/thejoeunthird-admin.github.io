// redux 관련 함수 모두 여기에 선언 
import { createStore, combineReducers } from "redux";
import { userReducer } from "./userReducer";
import { regionReducer } from "./regionReducer"
import { categoriesReducer } from './categoriesReducer'

// redux에 필요한 함수들
export * from './regionReducer'
export * from './userReducer'
export * from './categoriesReducer'

const rootReducer = combineReducers({
  user: userReducer,
  region: regionReducer,
  categories: categoriesReducer,
});

export const redux = createStore(rootReducer);
