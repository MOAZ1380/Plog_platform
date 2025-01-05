import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../Post/Post';
import './Feed.css';
import { jwtDecode } from 'jwt-decode';

const Feed = ({ jwt }) => {
    const decodedToken = jwtDecode(jwt);
    const userId = decodedToken.id;

    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostPhoto, setNewPostPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/posts/GetAllPost', {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setPosts(response.data.data);
        } catch (error) {
            console.error('Error fetching posts:', error.response?.data || error.message);
        }
    };

    const handleCommentUpdate = (postId, updatedComments) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post._id === postId ? { ...post, comments: updatedComments } : post
            )
        );
    };

    const handleAddPost = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (newPostPhoto) formData.append('photo', newPostPhoto);

        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:3000/api/posts/AddPost',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setPosts([response.data.data.post, ...posts]);
            setNewPostContent('');
            setNewPostPhoto(null);
        } catch (error) {
            console.error('Error adding post:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPost = async (postId, updatedContent) => {
        try {
            const response = await axios.patch(
                `http://localhost:3000/api/posts/delete_update/${postId}`,
                { content: updatedContent },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, content: response.data.updatedPost.content } : post
                )
            );
        } catch (error) {
            console.error('Error updating post:', error.response?.data || error.message);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(
                `http://localhost:3000/api/posts/delete_update/${postId}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error.response?.data || error.message);
        }
    };

    const handleLike = async (postId, isLiked) => {
        if (!postId) {
            console.error("Post ID is required");
            alert("Invalid request. Please try again.");
            return;
        }

        try {
            const endpoint = isLiked
                ? `http://localhost:3000/api/posts/remove_like/${postId}/unlike`
                : `http://localhost:3000/api/posts/add_like/${postId}/like`;

            const response = await axios.post(
                endpoint,
                {},
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );

            console.log("Like/Unlike Response:", response.data);
            if (response.status === 200) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId
                            ? {
                                ...post,
                                num_like: isLiked ? post.num_like - 1 : post.num_like + 1,
                                likes: isLiked
                                    ? post.likes.filter((id) => id !== decodedToken.id)
                                    : [...post.likes, decodedToken.id],
                            }
                            : post
                    )
                );

                alert(isLiked ? "Post unliked successfully!" : "Post liked successfully!");
            } else {
                console.error("Error in like/unlike response:", response.data.message);
                alert("Failed to like/unlike the post. Please try again.");
            }
        } catch (error) {
            console.error("Error handling like/unlike:", error.response?.data || error.message);

            if (error.response?.status === 400) {
                alert("Authentication token is missing or invalid.");
            } else if (error.response?.status === 404) {
                alert("User or post not found.");
            } else {
                alert("An error occurred while trying to like/unlike the post. Please try again.");
            }
        }
    };


    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <React.Fragment>
            <div className="feed-container">
                <h2>Feed</h2>
                <form onSubmit={handleAddPost} className="new-post-form">
                    <textarea
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        required
                    />
                    <label className="file-input-label">
                        Choose Photo
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewPostPhoto(e.target.files[0])}
                        />
                    </label>
                    {newPostPhoto && <span className="selected-file">{newPostPhoto.name}</span>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </form>

                <div className="posts">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <Post
                                key={post._id}
                                post={post}
                                jwt={jwt}
                                handleEditPost={handleEditPost}
                                handleDeletePost={handleDeletePost}
                                handleLike={handleLike}
                                onCommentUpdate={(updatedComments) => handleCommentUpdate(post._id, updatedComments)}
                            />
                        ))
                    ) : (
                        <p>No posts yet. Be the first to post something!</p>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};

export default Feed;