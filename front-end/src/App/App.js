import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Register from '../Register/Register';
import Login from '../Login/Login';
import Feed from '../Feed/Feed';
import Profile from '../Profile/Profile';
import Header from '../Header/Header';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';
import { PostsProvider } from '../Post/PostsContext';
import PostView from '../SearchBar/PostView';

const App = () => {
    const [jwt, setJwt] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogin = (token) => {
        setJwt(token);
    };

    const toggleForm = () => {
        const newPath = isLogin ? '/register' : '/login';
        setIsLogin(!isLogin);
        navigate(newPath);
    };

    const handleRegisterSuccess = () => {
        setIsLogin(true);
        navigate('/login');
    };

    const isFeedOrProfile = location.pathname.startsWith('/feed') || location.pathname.startsWith('/profile');

    return (
        <div className="app-container">
            <PostsProvider>
                {jwt && <Header jwt={jwt} setJwt={setJwt} />}
                <Routes>
                    {jwt ? (
                        <>
                            <Route path="/feed" element={<Feed jwt={jwt} />} />
                            <Route path="/profile/:userId" element={<Profile jwt={jwt} />} />
                            <Route path="/post/:postId" element={<PostView jwt={jwt} />} />
                            <Route path="*" element={<Navigate to="/feed" />} />
                        </>
                    ) : (
                        <>
                            <Route
                                path="/login"
                                element={
                                    <>
                                        <Login onLogin={handleLogin} />
                                        <button className="toggle-button" onClick={toggleForm}>
                                            Don't have an account? Sign up
                                        </button>
                                    </>
                                }
                            />
                            <Route
                                path="/register"
                                element={
                                    <>
                                        <Register onRegisterSuccess={handleRegisterSuccess} />
                                        <button className="toggle-button" onClick={toggleForm}>
                                            Already have an account? Sign in
                                        </button>
                                    </>
                                }
                            />
                            <Route path="*" element={<Navigate to="/login" />} />
                        </>
                    )}
                </Routes>
                {isFeedOrProfile && <ScrollToTopButton />}
            </PostsProvider>
        </div>
    );
};

export default App;