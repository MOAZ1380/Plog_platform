import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', photo: '' });
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();
    const { userId } = useParams(); // Extract userId from the URL

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || typeof token !== 'string') {
                    throw new Error('No token found. Please log in.');
                }

                // If userId is undefined, redirect to the logged-in user's profile
                const decodedToken = jwtDecode(token);
                const currentUserId = decodedToken.id;

                if (!userId) {
                    navigate(`/profile/${currentUserId}`);
                    return;
                }

                // Fetch user info
                const userResponse = await axios.get(
                    `http://localhost:3000/api/users/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Fetch user posts
                const postsResponse = await axios.get(
                    `http://localhost:3000/api/posts/GetUserPost/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log('User Data:', response.data);
                setUser(response.data);
                setFormData({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    photo: response.data.photo,
                });
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError(error.message);
                navigate('/login');
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/users/update`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating user profile:', error);
            setError(error.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'Unknown';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="header">
                <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                </button>
            </div>

            <div className="profile-content">
                <div className="profile-photo">
                    {user.photo ? (
                        <img
                            src={`http://localhost:3000/uploads/Profile_photo/${user.photo}`}
                            alt="Profile"
                        />
                    ) : (
                        <div className="default-avatar">U</div>
                    )}
                </div>
                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-form">
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="First Name"
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Last Name"
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                            />
                            <input
                                type="file"
                                name="photo"
                                onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                            />
                            <button onClick={handleSave}>Save</button>
                            <button onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    ) : (
                        <>
                            <h2>{user.firstName} {user.lastName}</h2>
                            <p>{user.email}</p>
                            <p>Joined: {formatDate(user.createdAt)}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;