import React, { useState } from 'react';
import Comment from '../Comment/Comment';
import './Post.css';

const Post = ({ post, jwt, handleEditPost, handleDeletePost, handleLike }) => {
    const [editingContent, setEditingContent] = useState('');
    const [editingPost, setEditingPost] = useState(null);

    const formattedDate = (date) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    };

    return (
        <div className="post">
            <div className="post-header">
                <div className="post-user-info">
                    <div className="default-avatar">
                        {post.user_id?.firstName?.[0] || 'U'}
                    </div>
                    <div className="post-user-details">
                        <span className="user-name">
                            {post.user_id?.firstName} {post.user_id?.lastName}
                        </span>
                        <span className="post-date">{formattedDate(post.created_at)}</span>
                    </div>
                </div>
                {post.user_id?._id === jwt && (
                    <div className="post-dropdown">
                        <button className="dropdown-toggle">...</button>
                        <div className="dropdown-menu">
                            <button
                                onClick={() => {
                                    setEditingPost(post._id);
                                    setEditingContent(post.content);
                                }}
                            >
                                Edit
                            </button>
                            <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                        </div>
                    </div>
                )}
            </div>

            {editingPost === post._id ? (
                <div className="post-editing">
                    <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows="3"
                        placeholder="Edit your post"
                    />
                    <div className="edit-buttons">
                        <button
                            onClick={() => {
                                handleEditPost(post._id, editingContent);
                                setEditingPost(null);
                            }}
                        >
                            Save
                        </button>
                        <button onClick={() => setEditingPost(null)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    {post.photo && (
                        <img
                            src={`/uploads/${post.photo}`}
                            alt="Post"
                            className="post-photo"
                        />
                    )}
                    <p className="post-content">{post.content}</p>
                    <div className="post-actions">
                        <button
                            onClick={() => handleLike(post._id)}
                            className={`like-button ${post.likes?.includes(jwt) ? 'liked' : ''}`}
                        >
                            Like
                        </button>
                        <span>{post.num_like} Likes</span>
                    </div>
                </>
            )}
            <Comment
                comments={post.comments}
                postId={post._id}
                jwt={jwt}
                userId={post.user_id?._id}
            />
        </div>
    );
};

export default Post;
