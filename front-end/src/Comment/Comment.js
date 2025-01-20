import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Comment.css';

const Comment = ({ comments, postId, jwt, userId, onCommentUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const navigate = useNavigate();

    const avatarStyles = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        color: '#333',
        fontWeight: 'bold',
        fontSize: '1.2rem'
    };

    const defaultAvatarStyles = {
        ...avatarStyles,
        backgroundColor: '#e0e0e0',
        display: 'flex'
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            alert('Comment content cannot be empty.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:3000/api/posts/add_comment/${postId}/comment`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            if (response.data.data) {
                onCommentUpdate([...comments, response.data.data]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error.response?.data || error.message);
            alert('Failed to add comment. Please try again.');
        }
    };

    const toggleDropdown = (commentId, e) => {
        e.stopPropagation();
        setDropdownOpen(commentId === dropdownOpen ? null : commentId);

        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            if (dropdown.contains(e.target)) {
                dropdown.classList.toggle('active');
            } else {
                dropdown.classList.remove('active');
            }
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.dropdown')) {
                setDropdownOpen(null);
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownOpen]);

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
                const updatedComments = comments.map((comment) =>
                    comment._id === commentId ? response.data.data : comment
                );
                onCommentUpdate(updatedComments);
                setEditingCommentId(null);
                setEditContent('');
                setDropdownOpen(null);
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
                const updatedComments = comments.filter((comment) => comment._id !== commentId);
                onCommentUpdate(updatedComments);
                setDropdownOpen(null);
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
                <button type="submit" className="comment-submit-btn">Comment</button>
            </form>

            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment._id} className="comment">
                        <div className="comment-header">
                            <div
                                className="comment-user-info"
                                onClick={() => handleProfileNavigation(comment.user_id?._id)}
                            >
                                <div className="comment-avatar" style={defaultAvatarStyles}>
                                    {comment.user_id?.photo ? (
                                        <img
                                            src={`http://localhost:3000/uploads/Profile_photo/${comment.user_id.photo}`}
                                            alt="User Avatar"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="default-avatar" style={{ display: comment.user_id?.photo ? 'none' : 'flex' }}>
                                        {comment.user_id?.firstName?.[0] || 'U'}
                                    </div>
                                </div>
                                <div className="comment-user-details">
                                    <span className="comment-username">
                                        {comment.user_id?.firstName} {comment.user_id?.lastName}
                                    </span>
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
                            </div>

                            {comment.user_id?._id === userId && (
                                <div className="dropdown">
                                    <button
                                        className="dropdown-toggle"
                                        onClick={(e) => toggleDropdown(comment._id, e)}
                                    >
                                        ⋮
                                    </button>
                                    {dropdownOpen === comment._id && (
                                        <div className="dropdown-menu">
                                            <button
                                                onClick={() => {
                                                    setEditingCommentId(comment._id);
                                                    setEditContent(comment.content);
                                                    setDropdownOpen(null);
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

                        {editingCommentId === comment._id ? (
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
                                            setEditingCommentId(null);
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comment;