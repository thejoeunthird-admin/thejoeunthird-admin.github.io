import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useParams, HashRouter, } from 'react-router-dom';
import { Provider as ReduxProvider } from "react-redux";
import { redux } from "./store/redux";
import './index.css';
import { Layout } from './components/layout';
import { Login } from './components/Login';
import { LoginRedirect } from './components/Login.redirect'
import { MyPage } from './components/Mypage';
import { TestPage } from './components/testpage';
import { Main } from './components/Main';
import { UsedDetail } from './components/UsedDetail';
import BoardListPage from './board/BoardListPage';
import WritePage from './board/WritePage';
import BoardDetailPage from './board/BoardDetailPage';
import EditPage from './board/EditPage';
import { UsedBoard } from './components/UsedBoard';
import { Trade } from './components/Trade';
import { TradeForm } from './components/TradeForm';
import { TradeDetail } from './components/TradeDetail';
import { Notifications } from './components/Notifications';
import { NotificationProvider } from './components/AlertNotifications';
import { UsedForm } from './components/UsedForm';

function TradeRouter() {
  const { id, item, tap } = useParams();
  /* 김종현 작업 --- 공구, 거래 전체 게시판 */
  if (id === 'gonggu') {
    if(item){
        switch(item){
          case 'creative': return <TradeForm/>;
          case 'update': return <TradeForm id={tap}/>;
          default: return <TradeDetail />;
      }
    }
    else return (<Trade tap={id}/>)
  }
  /* 김종현 작업 --- 공구, 거래 게시판 */
  else {
    if(item){
      switch(item){
        case 'creative': return <UsedForm mode="create" />;
        case 'update': return <UsedForm mode="edit" item={tap}/>;
        default: return <UsedDetail />;
      }
    }
    else { return(<UsedBoard />) }
  }
}

function App() {
  return (
    <HashRouter>
      {/* 리덕스 사용 */}
      <ReduxProvider store={redux}>
        <NotificationProvider>
          <Layout>
            <Routes>
              {/* 박희뭔 작업 -- 알람 */}
              <Route path='/notification' element={<Notifications />} />
              {/* 백종욱 작업 -- 메인 */}
              <Route path='/' element={<Main />} />
              <Route path='/login' element={<Login />} />
              <Route path='/login/redirect' element={<LoginRedirect />} />
              <Route path='/my' element={<MyPage />} />
              <Route path='/my/:tap' element={<MyPage />} />
              <Route path='/my/:tap/:item' element={<MyPage />} />
              {/* 김종현, 강수아 작업 --- 거래 게시판 */}
              <Route path='/trade' element={<Trade />} />
              <Route path='/trade/:id' element={<TradeRouter />} /> 
              <Route path='/trade/:id/:item' element={<TradeRouter />} />
              <Route path='/trade/:id/:item/:tap' element={<TradeRouter />} />
              {/* 이신아 작업 -- 일반 게시판 */}
              <Route path="/life" element={<BoardListPage />} />
              <Route path="/life/:tap" element={<BoardListPage />} />
              <Route path="/life/write" element={<WritePage />} />
              <Route path="/life/edit/:id" element={<EditPage />} />
              <Route path="/life/:tap/:id" element={<BoardDetailPage />} />
            </Routes>
          </Layout>
        </NotificationProvider>
      </ReduxProvider>
    </HashRouter >
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

