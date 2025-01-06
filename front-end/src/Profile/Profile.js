import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', photo: '' });
    const navigate = useNavigate();
    const { userId } = useParams(); // Extract userId from the URL

    // State to store the logged-in user's ID
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || typeof token !== 'string') {
                    throw new Error('No token found. Please log in.');
                }

                // Decode the token to get the logged-in user's ID
                const decodedToken = jwtDecode(token);
                const currentUserId = decodedToken.id;
                setLoggedInUserId(currentUserId); // Set the logged-in user's ID

                // If userId is undefined, redirect to the logged-in user's profile
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

                console.log('User Data:', userResponse.data); // Debugging
                console.log('User Posts:', postsResponse.data); // Debugging

                // Ensure the user object has the required fields
                const userData = userResponse.data.data;
                if (!userData.username) {
                    userData.username = `${userData.firstName} ${userData.lastName}`;
                }

                setUser(userData);
                setPosts(postsResponse.data.data || []); // Ensure posts is an array
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError(error.message);
                navigate('/login');
            }
        };

        fetchUserProfile();
    }, [userId, navigate]);

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
            {/* Conditionally render the header only if the logged-in user is viewing their own profile */}
            {loggedInUserId === userId && (
                <div className="header">
                    <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                </div>
            )}

            <div className="profile-content">
                <div className="profile-photo">
                    {user.photo ? (
                        <img
                            src={`http://localhost:3000/uploads/Profile_photo/${user.photo}`}
                            alt="Profile"
                        />
                    ) : (
                        <div className="default-avatar">{user.firstName ? user.firstName.charAt(0) : 'U'}</div>
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
                            <p>Joined: {formatDate(user.createdAt)}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="user-posts">
                <h3>Posts</h3>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post._id} className="post">
                            <div className="post-meta">
                                <span>{post.user_id?.firstName} {post.user_id?.lastName}</span> • {formatDate(post.created_at)}
                            </div>
                            <p>{post.content}</p>
                            {post.photo && (
                                <img
                                    src={`http://localhost:3000/uploads/Posts_photo/${post.photo}`}
                                    alt="Post"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <p>No posts Yet.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;