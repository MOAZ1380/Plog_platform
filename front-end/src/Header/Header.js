import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';
import { jwtDecode } from 'jwt-decode';

const Header = ({ jwt, setJwt }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found. Please log in.');
                }

                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;

                const response = await axios.get(`http://localhost:3000/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('User Data:', response.data); 
                setUser(response.data); 
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, [jwt]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setJwt(null);
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
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
    };

    const handleHomeClick = () => {
        navigate('/feed');
    };

    return (
        <header className="header">
            <button className="home-button" onClick={handleHomeClick}>
                Home
            </button>

            <div className="profile-icon" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                {user?.photo ? (
                    <img
                        src={`http://localhost:3000/uploads/Profile_photo/${user.photo}`} 
                        alt="Profile Icon"
                    />
                ) : (
                    <div className="default-avatar">U</div> 
                )}
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <button onClick={() => navigate('/profile')}>Profile</button>
                        <button onClick={handleLogout}>Logout</button>
                        <button onClick={handleDeleteAccount}>Delete Account</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;