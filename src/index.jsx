import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, } from 'react-router-dom';
import { Provider as ReduxProvider } from "react-redux";
import { redux } from "./store/redux";
import './index.css';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { LoginRedirect } from './components/Login.redirect'
import { MyPage } from './components/Mypage';
import { TestPage } from './components/testpage';

function App() {
  return (
    <BrowserRouter>
      {/* 리덕스 사용 */}
      <ReduxProvider store={redux}>
        <Layout>
          <Routes>
            <Route path='/' element={<TestPage/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/login/redirect' element={<LoginRedirect/>} />
            <Route path='/my' element={<MyPage />} />
            <Route path='/my/:tap' element={<MyPage />} />
            {/* <Route path='/my/:tap/:item' element={<MyPage />} /> */}
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

