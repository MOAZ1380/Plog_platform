import React, { useState } from 'react';
import axios from 'axios';
import Comment from '../Comment/Comment'; // Import the Comment component
import './Post.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Post = ({ post, jwt, handleEditPost, handleDeletePost, onCommentUpdate, fetchLikedUsers }) => {
    const decodedToken = jwtDecode(jwt);
    const userId = decodedToken.id;
    const navigate = useNavigate();

    const [isLiked, setIsLiked] = useState(post.likes.includes(userId));
    const [likeCount, setLikeCount] = useState(post.num_like);
    const [postComments, setPostComments] = useState(post.comments || []);
    const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);

    const handleLike = async () => {
        try {
            const endpoint = isLiked
                ? `http://localhost:3000/api/posts/remove_like/${post._id}/unlike`
                : `http://localhost:3000/api/posts/add_like/${post._id}/like`;

            await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${jwt}` } });

            // Update state optimistically
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
            setLikedUsers(users || []); // Fallback to empty array
        } catch (error) {
            console.error('Error fetching liked users:', error.response?.data || error.message);
        } finally {
            setLoadingLikes(false);
        }
    };

    const handleCommentUpdate = (updatedComments) => {
        setPostComments(updatedComments);
        if (onCommentUpdate) onCommentUpdate(updatedComments);
    };

    const handleProfileNavigation = (e) => {
        e.preventDefault(); // Prevent default behavior (e.g., page refresh)
        if (post.user_id?._id) {
            navigate(`/profile/${post.user_id._id}`); // Navigate to the post author's profile
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
                            />
                        ) : (
                            <div className="default-avatar">{post.user_id?.firstName?.[0] || 'U'}</div>
                        )}
                    </div>
                    <div>
                        <span>{post.user_id?.firstName} {post.user_id?.lastName}</span>
                        <span>{new Date(post.created_at).toLocaleString()}</span>
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

            {/* Integrate the Comment component */}
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