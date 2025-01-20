import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Post from '../Post/Post';
import './PostView.css';

const PostView = ({ jwt }) => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3000/api/posts/${postId}`,
                    {
                        headers: { Authorization: `Bearer ${jwt}` },
                    }
                );
                setPost(response.data.data);
            } catch (error) {
                console.error('Error fetching post:', error);
                setError('Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, jwt]);

    const handleEditPost = async (postId, updatedContent) => {
        setPost((prev) => ({
            ...prev,
            content: updatedContent,
        }));
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`http://localhost:3000/api/posts/delete_update/${postId}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setPost(null);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const fetchLikedUsers = async (postId) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/posts/fetch_likeAndComment/${postId}`,
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );
            return response.data.post.likes || [];
        } catch (error) {
            console.error('Error fetching liked users:', error);
            return [];
        }
    };

    if (loading) {
        return <div className="post-view-loading">Loading...</div>;
    }

    if (error) {
        return <div className="post-view-error">{error}</div>;
    }

    if (!post) {
        return <div className="post-view-error">Post not found</div>;
    }

    return (
        <div className="post-view">
            <Post
                key={post._id}
                post={post}
                jwt={jwt}
                handleEditPost={handleEditPost}
                handleDeletePost={handleDeletePost}
                fetchLikedUsers={fetchLikedUsers}
                isStandalone={true}
            />
        </div>
    );
};

export default PostView;