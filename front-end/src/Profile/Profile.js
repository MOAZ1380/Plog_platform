import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import Post from '../Post/Post';
import { PostsContext } from '../Post/PostsContext';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        photo: null,
    });
    const navigate = useNavigate();
    const { userId } = useParams();
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    const { posts, updatePost, deletePost } = useContext(PostsContext);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || typeof token !== 'string') {
                    throw new Error('No token found. Please log in.');
                }

                const decodedToken = jwtDecode(token);
                const currentUserId = decodedToken.id;
                setLoggedInUserId(currentUserId);

                if (!userId) {
                    navigate(`/profile/${currentUserId}`);
                    return;
                }

                const userResponse = await axios.get(
                    `http://localhost:3000/api/users/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const userData = userResponse.data.data;
                if (!userData.username) {
                    userData.username = `${userData.firstName} ${userData.lastName}`;
                }

                setUser(userData);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError(error.message);
                navigate('/login');
            }
        };

        fetchUserProfile();
    }, [userId, navigate]);

    const userPosts = posts.filter((post) => post.user_id?._id === userId);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, photo: e.target.files[0] });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            const fields = ['firstName', 'lastName', 'email', 'currentPassword', 'newPassword', 'confirmPassword', 'photo'];
            fields.forEach(field => {
                if (formData[field]) {
                    data.append(field, formData[field]);
                }
            });

            const response = await axios.patch(
                `http://localhost:3000/api/users/update_profile`,
                data,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );

            setUser(response.data.data.user);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating user profile:', error);
            setError(error.response?.data?.message || 'Failed to update profile');
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

    const fetchLikedUsers = async (postId) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/posts/fetch_likeAndComment/${postId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.post.likes;
        } catch (error) {
            console.error('Error fetching liked users:', error.response?.data || error.message);
            return [];
        }
    };

    const handleCommentUpdate = (postId, updatedComments) => {
        updatePost(postId, { comments: updatedComments });
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
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
                    <div className="profile-info-content">
                        {isEditing ? (
                            <form>
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
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        placeholder="Current Password"
                                    />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="New Password"
                                    />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Confirm New Password"
                                    />
                                    <input
                                        type="file"
                                        name="photo"
                                        onChange={handleFileChange}
                                    />
                                    <button onClick={handleSave}>Save</button>
                                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h2>{user.firstName} {user.lastName}</h2>
                                <p>Joined: {formatDate(user.createdAt)}</p>
                            </>
                        )}
                    </div>
                    {loggedInUserId === userId && !isEditing && (
                        <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="user-posts">
                <h3>Posts</h3>
                {userPosts.length > 0 ? (
                    userPosts.map((post) => (
                        <Post
                            key={post._id}
                            post={post}
                            jwt={localStorage.getItem('token')}
                            handleEditPost={updatePost}
                            handleDeletePost={deletePost}
                            fetchLikedUsers={fetchLikedUsers}
                            onCommentUpdate={handleCommentUpdate}
                        />
                    ))
                ) : (
                    <p>No posts Yet.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;