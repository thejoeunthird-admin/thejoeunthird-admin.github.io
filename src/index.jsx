import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Provider as ReduxProvider } from "react-redux";
import { redux } from "./store/redux";
import './index.css';
import { Layout } from './components/layout';
import { Login } from './components/login';
import { LoginRedirect } from './components/login.redirect'
import { TestPage } from './components/testpage';

function Home() {
  return<p></p>;
}

function App() {

  return (
    <BrowserRouter>
      {/* 리덕스 사용 */}
      <ReduxProvider store={redux}>
        {/* Layout 컴포넌트 안에 <Routes> </Routes> 내용들이 */}
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/login/redirect' element={<LoginRedirect />} />
            <Route path='/test' element={<TestPage />} />
            {/* 동적 라우팅 해줄것 */}
            <Route path="/life" element={<>라이프 전체 페이지</>} />
            <Route path="/life/:tap" element={<>라이프 페이지</>} /> 
            <Route path="/life" element={<>거래 전체 페이지</>} />
            <Route path="/trade/:tap" element={<>거래 페이지</>} /> 
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

