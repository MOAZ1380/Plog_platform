import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Header.css';
import { jwtDecode } from 'jwt-decode';
import SearchBar from '../SearchBar/SearchBar';

const Header = ({ jwt, setJwt }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [dropdownTimeout, setDropdownTimeout] = useState(null);
    const [showSearchBar, setShowSearchBar] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found. Please log in.');
                }

                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;

                console.log('Fetching user data for userId:', userId); // Debugging

                const response = await axios.get(`http://localhost:3000/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('User data fetched:', response.data); // Debugging

                // Access the nested `data` property in the response
                setUser(response.data.data);
            } catch (error) {
                console.error('Error fetching user:', error);
                if (error.response?.status === 404 && location.pathname !== '/login') {
                    alert('User not found. Please log in again.');
                    navigate('/login');
                }
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else if (location.pathname !== '/login') {
            navigate('/login');
        }
    }, [jwt, navigate, location.pathname]);

    const handleProfileClick = () => {
        if (user?._id) {
            navigate(`/profile/${user._id}`); // Navigate to the user's profile page
        } else {
            alert('User data is not available. Please log in again.');
            navigate('/login');
        }
    };

    const handleMouseEnter = () => {
        if (dropdownTimeout) {
            clearTimeout(dropdownTimeout);
        }
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 300); // 300ms delay before hiding the dropdown
        setDropdownTimeout(timeout);
    };

    return (
        <header className="header">
            <button className="home-button" onClick={() => navigate('/feed')}>
                Home
            </button>

            {/* Search Button and SearchBar */}
            <div className="search-container">
                <button
                    className="search-button"
                    onClick={() => setShowSearchBar((prev) => !prev)}
                >
                    🔍
                </button>
                {showSearchBar && <SearchBar />}
            </div>

            {/* Profile Icon and Dropdown */}
            <div
                className="profile-icon-container"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="profile-icon">
                    {user?.photo ? (
                        <img
                            src={`http://localhost:3000/uploads/Profile_photo/${user.photo}`}
                            alt="Profile Icon"
                        />
                    ) : (
                        <div className="default-avatar">U</div>
                    )}
                </div>
                {isDropdownOpen && user && (
                    <div
                        className="dropdown-menu"
                        onMouseEnter={handleMouseEnter} // Keep dropdown open when mouse is over it
                        onMouseLeave={handleMouseLeave}
                    >
                        <button onClick={handleProfileClick}>Profile</button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                setJwt(null);
                                navigate('/login');
                            }}
                        >
                            Logout
                        </button>
                        <button
                            onClick={async () => {
                                const confirmed = window.confirm(
                                    'Are you sure you want to delete your account? This action cannot be undone.'
                                );
                                if (!confirmed) return;

                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.delete('http://localhost:3000/api/users/delete_account', {
                                        headers: { Authorization: `Bearer ${token}` },
                                    });

                                    localStorage.removeItem('token');
                                    setJwt(null);
                                    navigate('/register');
                                } catch (error) {
                                    console.error('Error deleting account:', error);
                                    alert('Failed to delete account. Please try again.');
                                }
                            }}
                        >
                            Delete Account
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;