import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Comment from '../Comment/Comment';
import './Post.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Post = ({ post, jwt, handleEditPost, handleDeletePost, onCommentUpdate }) => {
    const decodedToken = jwtDecode(jwt);
    const userId = decodedToken.id;

    const [isLiked, setIsLiked] = useState(post.likes.includes(userId));
    const [likeCount, setLikeCount] = useState(post.num_like);
    const [editingContent, setEditingContent] = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const [postComments, setPostComments] = useState(post.comments || []);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLike = async () => {
        try {
            const endpoint = isLiked
                ? `http://localhost:3000/api/posts/remove_like/${post._id}/unlike`
                : `http://localhost:3000/api/posts/add_like/${post._id}/like`;

            await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${jwt}` } });

            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        } catch (error) {
            console.error('Error handling like/unlike:', error.response?.data || error.message);
        }
    };

    const confirmDeletePost = (postId) => {
        const confirmed = window.confirm('Are you sure you want to delete this post?');
        if (confirmed) {
            handleDeletePost(postId);
        }
    };

    const handleCommentUpdate = (updatedComments) => {
        setPostComments(updatedComments);

        if (onCommentUpdate) {
            onCommentUpdate(updatedComments);
        }
    };

    const formattedDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'Unknown';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleProfileNavigation = () => {
        console.log('Navigating to profile:', post.user_id?._id);
        if (post.user_id?._id) {
            navigate(`/profile`);
        } else {
            console.error('User ID is missing');
        }
    };

    return (
        <div className="post">
            <div className="post-header">
                <div className="post-user-info">
                    <div
                        className="user-avatar-link"
                        onClick={handleProfileNavigation}
                    >
                        <div className="user-avatar">
                            {post.user_id?.photo ? (
                                <img
                                    src={`http://localhost:3000/uploads/Profile_photo/${post.user_id.photo}`}
                                    alt="Avatar"
                                    className="user-avatar"
                                />
                            ) : (
                                <div className="default-avatar">
                                    {post.user_id?.firstName?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className="user-name-link"
                        onClick={handleProfileNavigation}
                    >
                        <span className="user-name">
                            {post.user_id?.firstName || 'Unknown'} {post.user_id?.lastName || 'User'}
                        </span>
                        <span className="post-date">
                            {formattedDate(post.created_at)}
                        </span>
                    </div>
                </div>
                {post.user_id?._id === userId && (
                    <div className="post-dropdown" ref={dropdownRef}>
                        <button className="dropdown-toggle" onClick={() => setDropdownVisible(!dropdownVisible)}>
                            &#x22EE;
                        </button>
                        {dropdownVisible && (
                            <div className="dropdown-menu">
                                <button
                                    onClick={() => {
                                        setEditingPost(post._id);
                                        setEditingContent(post.content);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        confirmDeletePost(post._id);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {editingPost === post._id ? (
                <div>
                    <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows="3"
                        placeholder="Edit your post"
                    />
                    <div>
                        <button
                            onClick={() => {
                                handleEditPost(post._id, editingContent);
                                setEditingPost(null);
                            }}
                        >
                            Save
                        </button>
                        <button onClick={() => setEditingPost(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {post.photo && (
                        <img
                            src={`http://localhost:3000/uploads/Posts_photo/${post.photo}`}
                            alt="Post"
                            className="post-photo"
                        />)}
                    <p className="post-content">{post.content}</p>
                </>
            )}

            <div className="post-actions">
                <button
                    className={`like-button ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {isLiked ? 'Unlike' : 'Like'}
                </button>
                <span>{likeCount} Likes</span>
            </div>

            <Comment
                comments={postComments}
                postId={post._id}
                jwt={jwt}
                userId={userId}
                onCommentUpdate={handleCommentUpdate}
            />
        </div>
    );
};

export default Post;