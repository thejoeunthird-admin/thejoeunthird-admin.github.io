import React, { Suspense, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useParams, HashRouter, createHashRouter, useSearchParams, RouterProvider, Outlet, useNavigate, useNavigation, } from 'react-router-dom';
import { Provider as ReduxProvider } from "react-redux";
import { redux } from "./store/redux";
import './index.css';
// 페이지 로딩 
import {
  Layout, layoutLoader,
  Community, communityLoader,
  CommunityDetail, communityDetailLoader,
  CommunityWrite, communityWriteLoader,
  Login, LoginRedirect, loginRedirectLoader,
} from '@pages'
// import { LoadingCircle } from './components/LoadingCircle';
import {
  useToken,
  useCategories,
} from '@hooks';
import { useRegion } from './hooks';

function TradeRouter() {
  const { id, item, tap } = useParams();
  /* 김종현 작업 --- 공구, 거래 전체 게시판 */
  if (id === 'gonggu') {
    if (item) {
      switch (item) {
        case 'creative': return <TradeForm />;
        case 'update': return <TradeForm id={tap} />;
        default: return <TradeDetail />;
      }
    }
    else return (<Trade tap={id} />)
  }
  /* 김종현 작업 --- 공구, 거래 게시판 */
  else {
    if (item) {
      switch (item) {
        case 'creative': return <UsedForm mode="create" />;
        case 'update': return <UsedForm mode="edit" item={tap} />;
        default: return <UsedDetail />;
      }
    }
    else { return (<UsedBoard />) }
  }
}

// params -> {게시판}/:category/:item/:detail 
const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    id: 'user',
    loader: layoutLoader,
    children: [
      { path: 'login', element: <Login /> },
      {
        path: 'login/redirect',
        loader: loginRedirectLoader,
        element: <LoginRedirect />
      },
      {
        path: 'life',
        id: 'community',
        loader: communityLoader,
        element: <Outlet />,
        children: [
          {
            path: ':category?',
            element: <Community />,
          },
          {
            path: ':category?/write/:detail?',
            exact: true,
            loader: communityWriteLoader,
            element: <CommunityWrite />
          },
          {
            path: ':category?/:item',
            loader: communityDetailLoader,
            element: <CommunityDetail />
          }
        ]
      }
    ]
  },
])

function App() {
  // const navigation = useNavigation();
  const { region } = useRegion();
  const { ready } = useToken();
  const { categorie } = useCategories();
  if (!categorie || !ready || !region) { return; }

  // if(navigation.state === 'loading'){
  //   return <div>로딩중입니다...</div>;
  // }
  return (<>
    {/* <NotificationProvider> */}
    <RouterProvider router={router} />
    {/* </NotificationProvider> */}
  </>)
}



// 순서 :category, :item, :detail 


// function App() {

//   return (
//     <HashRouter>
//       {/* 리덕스 사용 */}
//       <ReduxProvider store={redux}>
//         <NotificationProvider>
//           <Layout>
//             <Routes>
//               {/* 박희뭔 작업 -- 알람 */}
//               <Route path='/notification' element={<Notifications />} />
//               {/* 백종욱 작업 -- 메인 */}
//               <Route path='/' element={<Main />} />
//               <Route path='/login' element={<Login />} />
//               <Route path='/login/redirect' element={<LoginRedirect />} />
//               <Route path='/my' element={<MyPage />} />
//               <Route path='/my/:tap' element={<MyPage />} />
//               <Route path='/my/:tap/:item' element={<MyPage />} />
//               {/* 김종현, 강수아 작업 --- 거래 게시판 */}
//               <Route path='/trade' element={<Trade />} />
//               <Route path='/trade/:id' element={<TradeRouter />} /> 
//               <Route path='/trade/:id/:item' element={<TradeRouter />} />
//               <Route path='/trade/:id/:item/:tap' element={<TradeRouter />} />
//               {/* 이신아 작업 -- 일반 게시판 */}
//               <Route path="/life" element={<BoardListPage />} />
//               <Route path="/life/:tap" element={<BoardListPage />} />
//               <Route path="/life/write" element={<WritePage />} />
//               <Route path="/life/edit/:id" element={<EditPage />} />
//               <Route path="/life/:tap/:id" element={<BoardDetailPage />} />
//             </Routes>
//           </Layout>
//         </NotificationProvider>
//       </ReduxProvider>
//     </HashRouter >
//   );
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

