import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Comment.css';

const Comment = ({ comments, postId, jwt, userId, onCommentUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showDropdown, setShowDropdown] = useState(null);
    const navigate = useNavigate();

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            alert('Comment content cannot be empty.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:3000/api/posts/add_comment/${postId}/comment`,
                { content: newComment, post_id: postId },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.data) {
                onCommentUpdate(response.data.data);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Failed to add comment. Please try again.');
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) {
            alert('Updated comment cannot be empty.');
            return;
        }

        try {
            const response = await axios.patch(
                `http://localhost:3000/api/posts/Update_comment/${postId}/comment/${commentId}`,
                { content: editContent },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.data) {
                onCommentUpdate(response.data.data);
                setEditingComment(null);
                setEditContent('');
                setShowDropdown(null);
            }
        } catch (error) {
            console.error('Error updating comment:', error.response?.data || error.message);
            alert('Failed to update comment. Please try again.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(
                `http://localhost:3000/api/posts/remove_comment/${postId}/comment/${commentId}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.data) {
                onCommentUpdate(response.data.data);
                setShowDropdown(null);
            }
        } catch (error) {
            console.error('Error deleting comment:', error.response?.data || error.message);
            alert('Failed to delete comment. Please try again.');
        }
    };

    const handleProfileNavigation = (userId) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="comments-section">
            <form onSubmit={handleSubmitComment} className="comment-form">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="comment-input"
                />
                <button type="submit" className="comment-submit-btn">Post</button>
            </form>

            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment._id} className="comment">
                        <div className="comment-header">
                            <div
                                className="comment-user-info"
                                onClick={() => handleProfileNavigation(comment.user_id._id)}
                            >
                                <div className="comment-avatar">
                                    {comment.user_id.photo ? (
                                        <img
                                            src={`http://localhost:3000/uploads/Profile_photo/${comment.user_id.photo}`}
                                            alt="User Avatar"
                                            className="avatar-image"
                                        />
                                    ) : (
                                        <div className="default-avatar">
                                            {comment.user_id.firstName?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="comment-username">
                                    {comment.user_id.firstName} {comment.user_id.lastName}
                                </span>
                            </div>

                            {comment.user_id._id === userId && (
                                <div className="comment-actions">
                                    <button
                                        className="dropdown-toggle"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent event bubbling
                                            setShowDropdown(showDropdown === comment._id ? null : comment._id);
                                        }}
                                    >
                                        ⋮
                                    </button>
                                    {showDropdown === comment._id && (
                                        <div className="dropdown-menu">
                                            <button
                                                onClick={() => {
                                                    setEditingComment(comment._id);
                                                    setEditContent(comment.content);
                                                    setShowDropdown(null);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteComment(comment._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {editingComment === comment._id ? (
                            <div className="edit-comment-form">
                                <input
                                    type="text"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="edit-comment-input"
                                />
                                <div className="edit-comment-buttons">
                                    <button onClick={() => handleEditComment(comment._id)}>Save</button>
                                    <button
                                        onClick={() => {
                                            setEditingComment(null);
                                            setEditContent('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="comment-content">{comment.content}</p>
                        )}

                        <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comment;