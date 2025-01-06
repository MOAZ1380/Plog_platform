import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Comment.css';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

const Comment = ({ comments = [], postId, jwt, userId, onCommentUpdate }) => {
    const decodedToken = jwtDecode(jwt);
    const currentUserId = decodedToken.id;

    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [allComments, setAllComments] = useState(
        Array.isArray(comments) ? comments.filter(comment => comment && comment._id) : []
    );
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(null);

    // Close dropdown when clicking outside
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);

        try {
            const response = await axios.post(
                `http://localhost:3000/api/posts/add_comment/${postId}/comment`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            const addedComment = response.data.comment;

            // Update the UI immediately
            const updatedComments = [
                ...allComments,
                { ...addedComment, user_id: { _id: currentUserId, firstName: 'You', lastName: '' } },
            ];
            setAllComments(updatedComments);
            setNewComment('');

            // Notify the parent component about the updated comments
            if (onCommentUpdate) {
                onCommentUpdate(updatedComments);
            }
        } catch (error) {
            console.error('Error adding comment:', error.response?.data || error.message);
        } finally {
            setCommentLoading(false);
        }
    };

    const confirmDeleteComment = (commentId) => {
        const confirmed = window.confirm('Are you sure you want to delete this comment?');
        if (confirmed) {
            handleDeleteComment(commentId);
        }
    };

    const handleDeleteComment = async (commentId) => {
        setProcessing(true);
        try {
            await axios.delete(
                `http://localhost:3000/api/posts/remove_comment/${postId}/comment/${commentId}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            // Update the UI immediately
            const updatedComments = allComments.filter((comment) => comment._id !== commentId);
            setAllComments(updatedComments);

            // Notify the parent component about the updated comments
            if (onCommentUpdate) {
                onCommentUpdate(updatedComments);
            }
        } catch (error) {
            console.error('Error deleting comment:', error.response?.data || error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleEditComment = async (commentId) => {
        setProcessing(true);
        try {
            const response = await axios.patch(
                `http://localhost:3000/api/posts/update_comment/${postId}/comment/${commentId}`,
                { content: editingContent },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );

            // Update the UI immediately
            const updatedComments = allComments.map((comment) =>
                comment._id === commentId
                    ? { ...comment, content: response.data.comment.content }
                    : comment
            );
            setAllComments(updatedComments);
            setEditingCommentId(null);
            setEditingContent('');

            // Notify the parent component about the updated comments
            if (onCommentUpdate) {
                onCommentUpdate(updatedComments);
            }
        } catch (error) {
            console.error('Error editing comment:', error.response?.data || error.message);
        } finally {
            setProcessing(false);
        }
    };

    const toggleDropdown = (commentId) => {
        setDropdownVisible(dropdownVisible === commentId ? null : commentId);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Invalid Date';
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="comments-section">
            <div className="comments-list">
                {allComments.map((comment) => (
                    comment && comment._id && (
                        <div key={comment._id} className="comment">
                            <div className="comment-header">
                                <Link to={`/profile/${comment.user_id?._id || ''}`} className="comment-avatar-link">
                                    <div className="comment-avatar">
                                        {comment.user_id?.photo ? (
                                            <img
                                                src={comment.user_id.photo}
                                                alt="Avatar"
                                                className="comment-avatar"
                                            />
                                        ) : (
                                            <div className="default-avatar">
                                                {comment.user_id?.firstName?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="comment-user-info">
                                    <Link to={`/profile/${comment.user_id?._id || ''}`} className="comment-username-link">
                                        <span className="comment-username">
                                            {comment.user_id?.firstName || 'Unknown'} {comment.user_id?.lastName || 'User'}
                                        </span>
                                    </Link>
                                    <span className="comment-timestamp">
                                        {formatTimestamp(comment.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="comment-content">
                                {editingCommentId === comment._id ? (
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        rows="3"
                                        placeholder="Edit your comment"
                                    />
                                ) : (
                                    <p>{comment.content || 'No content'}</p>
                                )}
                            </div>

                            {/* Dropdown for Edit/Delete (only for authorized user) */}
                            {comment.user_id?._id === currentUserId && (
                                <div className="comment-actions" ref={dropdownRef}>
                                    <div className={`dropdown-container ${dropdownVisible === comment._id ? 'active' : ''}`}>
                                        <button
                                            className="dropdown-toggle"
                                            onClick={() => toggleDropdown(comment._id)}
                                        >
                                            &#x22EE;
                                        </button>
                                        {dropdownVisible === comment._id && (
                                            <div className="dropdown-menu">
                                                <button
                                                    disabled={processing}
                                                    onClick={() => {
                                                        setEditingCommentId(comment._id);
                                                        setEditingContent(comment.content || '');
                                                        toggleDropdown(comment._id);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    disabled={processing}
                                                    onClick={() => confirmDeleteComment(comment._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Edit Actions (Save/Cancel) */}
                            {editingCommentId === comment._id && (
                                <div className="edit-actions">
                                    <button
                                        onClick={() => handleEditComment(comment._id)}
                                        disabled={processing}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingCommentId(null);
                                            setEditingContent('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>

            {/* Add Comment Section */}
            <div className="add-comment">
                <textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={handleAddComment} disabled={commentLoading}>
                    {commentLoading ? 'Commenting...' : 'Comment'}
                </button>
            </div>
        </div>
    );
};

export default Comment;