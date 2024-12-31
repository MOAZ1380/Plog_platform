import React, { useState } from 'react';
import Header from '../Header/Header'
import Register from '../Register/Register';
import Login from '../Login/Login';
import Feed from '../Feed/Feed';
import Footer from '../Footer/Footer'
const App = () => {
  const [jwt, setJwt] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (token) => {
    setJwt(token);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleRegisterSuccess = () => {
    setIsLogin(true);
  };

  return (
    <div className="app-container">
      {!jwt ? (
        <div className="auth-wrapper">
          {isLogin ? (
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
          )}
        </div>
      ) : (
        <>
          {/* <Header /> */}
          <Feed jwt={jwt} />
          {/* <Footer  /> */}
        </>

      )}
    </div>
  );
};

export default App;