import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from '../Comment/Comment';
import './Post.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Post = ({ post, jwt, handleEditPost, handleDeletePost, onCommentUpdate, fetchLikedUsers }) => {
    const decodedToken = jwtDecode(jwt);
    const userId = decodedToken.id;
    const navigate = useNavigate();

    const [isLiked, setIsLiked] = useState(post.likes.includes(userId));
    const [likeCount, setLikeCount] = useState(post.num_like);
    const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const [comments, setComments] = useState([]);

    // Fetch comments for the post
    useEffect(() => {
        const fetchComments = async () => {
            try {
                console.log('Fetching comments for post ID:', post._id); // Debugging
                const response = await axios.get(`http://localhost:3000/api/posts/${post._id}/comment`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                setComments(response.data.data || []); // Default to an empty array
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        fetchComments();
    }, [post, jwt]); // Add post and jwt as dependencies

    const handleLike = async () => {
        try {
            const endpoint = isLiked
                ? `http://localhost:3000/api/posts/remove_like/${post._id}/unlike`
                : `http://localhost:3000/api/posts/add_like/${post._id}/like`;

            await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${jwt}` } });

            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        } catch (error) {
            console.error('Error toggling like:', error.response?.data || error.message);
        }
    };

    const showLikesModal = async () => {
        setIsLikesModalVisible(true);
        setLoadingLikes(true);
        try {
            const users = await fetchLikedUsers(post._id);
            setLikedUsers(users || []);
        } catch (error) {
            console.error('Error fetching liked users:', error.response?.data || error.message);
        } finally {
            setLoadingLikes(false);
        }
    };

    const handleProfileNavigation = (e) => {
        e.preventDefault();
        if (post.user_id?._id) {
            navigate(`/profile/${post.user_id._id}`);
        } else {
            console.error('User ID is missing');
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
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : (
                            <div className="default-avatar">
                                {post.user_id?.firstName?.[0] || 'U'}
                            </div>
                        )}
                        {/* Fallback default avatar */}
                        <div className="default-avatar" style={{ display: 'none' }}>
                            {post.user_id?.firstName?.[0] || 'U'}
                        </div>
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
            </div>
            <div className="post-content">
                {post.photo && (
                    <img
                        src={`http://localhost:3000/uploads/Posts_photo/${post.photo}`}
                        alt="Post"
                    />
                )}
                <p>{post.content}</p>
            </div>
            <div className="post-actions">
                <button onClick={handleLike}>
                    {isLiked ? 'Unlike' : 'Like'} ({likeCount})
                </button>
                <button onClick={showLikesModal}>View Likes</button>
                {isLikesModalVisible && (
                    <div className="modal">
                        <h3>Liked By</h3>
                        {loadingLikes ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {likedUsers.map((user) => (
                                    <li key={user._id}>
                                        {user.firstName} {user.lastName}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button onClick={() => setIsLikesModalVisible(false)}>Close</button>
                    </div>
                )}
            </div>

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