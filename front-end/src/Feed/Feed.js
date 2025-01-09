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

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/posts/GetAllPost', {
                headers: { Authorization: `Bearer ${jwt}` },
            });

            // Ensure posts have unique keys
            const postsWithIds = response.data.data.map((post, index) => ({
                ...post,
                key: post._id || `post-${index}`, // Fallback key if _id is missing
            }));
            setPosts(postsWithIds);
        } catch (error) {
            console.error('Error fetching posts:', error.response?.data || error.message);
        }
    };

    const fetchLikedUsersAndComments = async (postId) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/posts/fetch_likeAndComment/${postId}`,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            return response.data.post.likes;
        } catch (error) {
            console.error('Error fetching liked users:', error.response?.data || error.message);
            return [];
        }
    };

    const handleAddPost = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (newPostPhoto) formData.append('photo', newPostPhoto);

        try {
            const response = await axios.post(
                'http://localhost:3000/api/posts/AddPost',
                formData,
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            setPosts([{ ...response.data.data.post, key: response.data.data.post._id }, ...posts]);
            setNewPostContent('');
            setNewPostPhoto(null);
            document.querySelector('.file-name').textContent = ''; // Clear the file name display
        } catch (error) {
            console.error('Error adding post:', error.response?.data || error.message);
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
            await axios.delete(`http://localhost:3000/api/posts/delete_update/${postId}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="feed">
            <form onSubmit={handleAddPost}>
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                />
                <div className="file-input-container">
                    <input
                        type="file"
                        id="file-input"
                        accept="image/*"
                        onChange={(e) => {
                            setNewPostPhoto(e.target.files[0]);
                            const fileNameDisplay = document.querySelector('.file-name');
                            if (e.target.files[0]) {
                                fileNameDisplay.textContent = e.target.files[0].name;
                            } else {
                                fileNameDisplay.textContent = '';
                            }
                        }}
                    />
                    <label htmlFor="file-input" className="custom-file-button">
                        Choose File
                    </label>
                    <span className="file-name"></span>
                </div>
                <button type="submit">Post</button>
            </form>
            {posts.map((post) => (
                <Post
                    key={post.key} // Use unique key (post._id or fallback)
                    post={post}
                    jwt={jwt}
                    handleEditPost={handleEditPost}
                    handleDeletePost={handleDeletePost}
                    fetchLikedUsers={fetchLikedUsersAndComments}
                />
            ))}
        </div>
    );
};

export default Feed;