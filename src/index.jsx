import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { Provider as ReduxProvider } from "react-redux";
import { redux } from "./store/redux";
import './index.css';
import { Layout } from './components/layout';
import { Login } from './components/login';
import { LoginRedirect } from './components/login.redirect'
import { TestPage } from './components/testpage';
import { MyPage } from './components/Mypage';
import { useCategoriesTable } from './hooks/useCategoriesTable';

const board_init = (categories, location) => {
    if (!categories) return;
    const pathSegments = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    // 초기화된 경로 결과를 저장할 배열
    const matchedPath = [];
    let currentLevel = categories;
    for (const segment of pathSegments) {
        const found = currentLevel.find(cat => cat.url === segment);
        if (!found) break;

        matchedPath.push(found);
        currentLevel = found.children || [];
    }
    return matchedPath;
};

function Router() {
  const { board, tap } = useParams();
  const location = useLocation();
  const { info: categories, loading: categoriesLoding } = useCategoriesTable();
  const categorie = board_init(categories, location);
  
  if(categoriesLoding) { return <>로딩중</>}
  switch(board){
    case 'home':{ return <Home /> } break;
    case 'my':{ return <MyPage />} break;
    case 'testpage':{ return <TestPage /> } break;
    case 'life': { return <>라이프 전체 페이지</> } break;
    case 'login': { 
      switch(tap){
        case "redirect": { return <LoginRedirect /> } break;
        default: {return <Login />} break;
      }
    } break;
  }
}

function App() {
  return (
    <BrowserRouter>
      {/* 리덕스 사용 */}
      <ReduxProvider store={redux}>
        {/* Layout 컴포넌트 안에 <Routes> </Routes> 내용들이 */}
        <Layout>
          <Routes>
            <Route path='/:board' element={<Router/>}/>
            <Route path='/:board/:tap' element={<Router/>}/>
            <Route path='/:board/:tap/:item' element={<Router/>}/>
          </Routes>
        </Layout>
      </ReduxProvider>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

