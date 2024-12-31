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
                    {post.user_id?.avatar ? (
                        <img
                            src={`http://localhost:3000/uploads/${post.user_id.avatar}`}
                            alt={`${post.user_id?.firstName || 'User'}'s avatar`}
                            className="user-avatar"
                        />
                    ) : (
                        <div className="default-avatar">U</div> 
                    )}
                    <div className="post-user-details">
                        <span className="user-name">
                            {post.user_id?.firstName || 'Unknown'} {post.user_id?.lastName || ''}
                        </span>
                        <span className="post-date">{formattedDate(post.created_at)}</span>
                    </div>
                </div>

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
            </div>

            {editingPost === post._id ? (
                <div className="post-editing">
                    <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows="3"
                        placeholder="Edit your post"
                    />
                    <button onClick={() => {
                        handleEditPost(post._id, editingContent);
                        setEditingPost(null);
                    }}>Save</button>
                    <button onClick={() => setEditingPost(null)}>Cancel</button>
                </div>
            ) : (
                <>
                    {post.photo && (
                        <img
                            src={`http://localhost:3000/uploads/${post.photo}`}
                            alt="Post"
                            className="post-photo"
                        />
                    )}
                    <p className="post-content">{post.content}</p>
                    <div className="post-actions">
                        <button
                            onClick={() => handleLike(post._id, post.likes.includes(jwt))}
                            className={`like-button ${post.likes.includes(jwt) ? 'liked' : ''}`}
                        >
                            {post.likes.includes(jwt) ? 'Unlike' : 'Like'}
                        </button>
                    </div>
                    <span>{post.num_like} Likes</span>
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
