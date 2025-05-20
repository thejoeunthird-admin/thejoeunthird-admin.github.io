import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { Layout } from './components/layout';
import { Login } from './components/login';
import { LoginRedirect } from './components/login.redirect'

function Home() {
  return <div>임시 홈페이지 적용</div>;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/login/redirect' element={<LoginRedirect />} />
        </Routes>
      </Layout>
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

