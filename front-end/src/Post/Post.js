import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from '../Comment/Comment';
import './Post.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Post = ({ post, jwt, handleEditPost, handleDeletePost, fetchLikedUsers, isStandalone }) => {
    const decodedToken = jwtDecode(jwt);
    const userId = decodedToken.id;
    const navigate = useNavigate();
    const isAuthorized = userId === post.user_id?._id;
    const [isLiked, setIsLiked] = useState(post.likes.includes(userId));
    const [likeCount, setLikeCount] = useState(post.num_like);
    const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const [comments, setComments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const avatarStyles = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'contain',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        color: '#333',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        overflow: 'hidden'

    };

    const defaultAvatarStyles = {
        ...avatarStyles,
        backgroundColor: '#e0e0e0',
        display: 'flex'
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/posts/${post._id}/comment`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                setComments(response.data.data || []);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        fetchComments();
    }, [post, jwt]);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.dropdown')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownOpen]);

    useEffect(() => {
        setIsLiked(post.likes.includes(userId));
        setLikeCount(post.num_like);
    }, [post, userId]);

    useEffect(() => {
        const syncLikeState = async () => {
            if (isLikesModalVisible) {
                await fetchLikedUsersData();
            }
        };
        syncLikeState();
    }, [isLiked, likeCount]);

    const handleLike = async () => {
        try {
            const endpoint = isLiked
                ? `http://localhost:3000/api/posts/remove_like/${post._id}/unlike`
                : `http://localhost:3000/api/posts/add_like/${post._id}/like`;

            const response = await axios.post(
                endpoint,
                {},
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );

            if (response.data.status === 'success') {
                const updatedPost = response.data.data;
                
                setIsLiked(!isLiked);
                setLikeCount(updatedPost.num_like);
                
                if (!isLiked) {
                    setLikedUsers(prev => [...prev, {
                        _id: userId,
                        firstName: decodedToken.firstName,
                        lastName: decodedToken.lastName
                    }]);
                } else {
                    setLikedUsers(prev => prev.filter(user => user._id !== userId));
                }

                if (handleEditPost) {
                    handleEditPost(post._id, updatedPost);
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setIsLiked(post.likes.includes(userId));
            setLikeCount(post.num_like);
        }
    };

    const handleUnlikeUser = async (unlikeUserId) => {
        try {
            const response = await axios.post(
                `http://localhost:3000/api/posts/remove_like/${post._id}/unlike`,
                {},
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.status === 'success') {
                setLikedUsers(prevUsers => prevUsers.filter(user => user._id !== unlikeUserId));
                setLikeCount(prev => prev - 1);
                
                if (unlikeUserId === userId) {
                    setIsLiked(false);
                }
                
                if (handleEditPost) {
                    handleEditPost(post._id, response.data.data);
                }
            }
        } catch (error) {
            console.error('Error unliking user:', error);
            await fetchLikedUsersData();
        }
    };

    const fetchLikedUsersData = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/posts/fetch_likeAndComment/${post._id}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.status === 'success') {
                const uniqueLikes = response.data.post.likes.filter((like, index, self) =>
                    index === self.findIndex((l) => l._id === like._id)
                );
                setLikedUsers(uniqueLikes);
                setLikeCount(response.data.post.num_like);
            }
        } catch (error) {
            console.error('Error fetching liked users:', error);
        }
    };

    const showLikesModal = async () => {
        setIsLikesModalVisible(true);
        setLoadingLikes(true);
        try {
            await fetchLikedUsersData();
        } catch (error) {
            console.error('Error fetching liked users:', error);
        } finally {
            setLoadingLikes(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(post.content);
        setDropdownOpen(false);
    };

    const saveEdit = async () => {
        if (!editContent.trim()) {
            alert('Post content cannot be empty.');
            return;
        }

        try {
            const response = await axios.patch(
                `http://localhost:3000/api/posts/delete_update/${post._id}`,
                { content: editContent },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            handleEditPost(post._id, response.data.updatedPost.content);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating post:', error.response?.data || error.message);
            alert('Failed to update post. Please try again.');
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this post?');
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:3000/api/posts/delete_update/${post._id}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            handleDeletePost(post._id);
        } catch (error) {
            console.error('Error deleting post:', error.response?.data || error.message);
            alert('Failed to delete post. Please try again.');
        }
    };

    const handleProfileNavigation = (e) => {
        e.preventDefault();
        if (post.user_id?._id) {
            navigate(`/profile/${post.user_id._id}`);
        }
    };

    return (
        <div className="post">
            <div className="post-header">
                <div className="post-user-info" onClick={handleProfileNavigation}>
                    <div className="user-avatar">
                        {post.user_id?.photo ? (
                            <img
                                src={`http://localhost:3000/uploads/Profile_photo/${post.user_id.photo}`}
                                alt="User Avatar"
                                style={avatarStyles}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : (
                            <div className="default-avatar" style={defaultAvatarStyles}>
                                {post.user_id?.firstName?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <span>{post.user_id?.firstName} {post.user_id?.lastName}</span>
                        <span>
                            {new Date(post.created_at).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                </div>
                {isAuthorized && !isStandalone && (
                    <div className="dropdown">
                        <button className="dropdown-toggle" onClick={toggleDropdown}>
                            ⋮
                        </button>
                        {dropdownOpen && (
                            <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
                                <button onClick={handleEdit}>Edit</button>
                                <button onClick={handleDelete}>Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {isEditing ? (
                <div className="edit-form">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="edit-input"
                        placeholder="What's on your mind?"
                        autoComplete="on"
                    />
                    <div className="edit-buttons">
                        <button onClick={saveEdit} className="save-button">Save</button>
                        <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="post-content">
                    {post.photo && (
                        <img
                            src={`http://localhost:3000/uploads/Posts_photo/${post.photo}`}
                            alt="Post"
                        />
                    )}
                    <p>{post.content}</p>
                </div>
            )}
            <div className="post-actions">
                <button
                    onClick={handleLike}
                    className={`like-button ${isLiked ? 'liked' : ''}`}
                >
                    {isLiked ? 'Unlike' : 'Like'} ({likeCount})
                </button>
                {likeCount > 0 && (
                    <button onClick={showLikesModal} className="like-button">
                        View Likes
                    </button>
                )}
            </div>
            {isLikesModalVisible && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Liked By</h3>
                        {loadingLikes ? (
                            <p className="loading-text">Loading...</p>
                        ) : (
                            <ul className="liked-users-list">
                                {likedUsers.map((user) => (
                                    <li key={`${user._id}-${post._id}`} className="liked-user-item">
                                        <div className="liked-user-info">
                                            <span>{user.firstName} {user.lastName}</span>
                                        </div>
                                        {user._id === userId && (
                                            <button
                                                onClick={() => handleUnlikeUser(user._id)}
                                                className="unlike-button"
                                            >
                                                Unlike
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button onClick={() => setIsLikesModalVisible(false)}>Close</button>
                    </div>
                </div>
            )}

            <h3>Comments:</h3>
            <Comment
                comments={comments}
                postId={post._id}
                jwt={jwt}
                userId={userId}
                onCommentUpdate={(updatedComments) => setComments(updatedComments)}
            />
        </div>
    );
};

export default Post;
