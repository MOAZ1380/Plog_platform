import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from '../Register/Register';
import Login from '../Login/Login';
import Feed from '../Feed/Feed';
import Profile from '../Profile/Profile';
import Header from '../Header/Header';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';

const App = () => {
  const [jwt, setJwt] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();

  const handleLogin = (token) => {
    setJwt(token);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleRegisterSuccess = () => {
    setIsLogin(true);
  };

  const isFeedOrProfile = location.pathname.startsWith('/feed') || location.pathname.startsWith('/profile');

  return (
    <div className="app-container">
      {jwt && <Header jwt={jwt} setJwt={setJwt} />}
      <Routes>
        {jwt ? (
          <>
            <Route path="/feed" element={<Feed jwt={jwt} />} />
            <Route path="/profile/:userId" element={<Profile jwt={jwt} />} />
            <Route path="*" element={<Navigate to="/feed" />} />
          </>
        ) : (
          <>
            <Route
              path="/login"
              element={
                isLogin ? (
                  <>
                    <Login onLogin={handleLogin} />
                    <button className="toggle-button" onClick={toggleForm}>
                      Don't have an account? Sign up
                    </button>
                  </>
                ) : (
                  <>
                    <Register onRegisterSuccess={handleRegisterSuccess} />
                    <button className="toggle-button" onClick={toggleForm}>
                      Already have an account? Sign in
                    </button>
                  </>
                )
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
      {isFeedOrProfile && <ScrollToTopButton />}
    </div>
  );
};

export default App;