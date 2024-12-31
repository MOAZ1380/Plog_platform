import React, { useState } from 'react';
import axios from 'axios';
import './Comment.css';

const Comment = ({ comments = [], postId, jwt, userId }) => {
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [allComments, setAllComments] = useState(
        Array.isArray(comments) ? comments.filter(comment => comment && comment._id) : []
    );
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState({});

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);

        try {
            const response = await axios.post(
                `http://localhost:3000/api/posts/add_comment/${postId}/comment`,
                { content: newComment },
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );
            const addedComment = response.data.comment;

            setAllComments((prevComments) => [
                ...prevComments,
                { ...addedComment, user_id: { _id: userId, firstName: 'You', lastName: '' } },
            ]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error.response?.data || error.message);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        setProcessing(true);
        try {
            await axios.delete(
                `http://localhost:3000/api/posts/remove_comment/${postId}/comment/${commentId}`,
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );

            setAllComments((prevComments) =>
                prevComments.filter((comment) => comment._id !== commentId)
            );
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
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );

            setAllComments((prevComments) =>
                prevComments.map((comment) =>
                    comment._id === commentId
                        ? { ...comment, content: response.data.comment.content }
                        : comment
                )
            );
            setEditingCommentId(null);
            setEditingContent('');
        } catch (error) {
            console.error('Error editing comment:', error.response?.data || error.message);
        } finally {
            setProcessing(false);
        }
    };

    const toggleDropdown = (commentId) => {
        setDropdownVisible({ [commentId]: !dropdownVisible[commentId] });
    };

    return (
        <div className="comments-section">
            <div className="comments-list">
                {allComments.map((comment) => (
                    comment && comment._id && (
                        <div key={comment._id} className="comment">
                            {editingCommentId === comment._id ? (
                                <div className="edit-comment">
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        rows="2"
                                        placeholder="Edit your comment"
                                    />
                                    <button
                                        disabled={processing}
                                        onClick={() => handleEditComment(comment._id)}
                                    >
                                        Save
                                    </button>
                                    <button onClick={() => setEditingCommentId(null)}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="comment-content">
                                        <p>{comment.content}</p>
                                        <span>
                                            By: {comment.user_id?.firstName || 'Unknown'}{' '}
                                            {comment.user_id?.lastName || ''}
                                        </span>
                                    </div>
                                    {comment.user_id?._id === userId && (
                                        <div className="dropdown-container">
                                            <button
                                                className="dropdown-toggle"
                                                onClick={() => toggleDropdown(comment._id)}
                                            >
                                                &#x22EE;
                                            </button>
                                            {dropdownVisible[comment._id] && (
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
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )
                ))}
            </div>
            <div className="add-comment">
                <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={handleAddComment} disabled={commentLoading}>
                    {commentLoading ? 'Posting...' : 'Comment'}
                </button>
            </div>
        </div>
    );
};

export default Comment;
