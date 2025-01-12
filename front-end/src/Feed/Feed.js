import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../Post/Post';
import './Feed.css';
import { jwtDecode } from 'jwt-decode';
import { PostsContext } from '../Post/PostsContext';

const Feed = ({ jwt }) => {
    const decodedToken = jwtDecode(jwt);
    const userId = decodedToken.id;

    const { posts, fetchPosts, addPost, updatePost, deletePost } = useContext(PostsContext);

    const [newPostContent, setNewPostContent] = useState('');
    const [newPostPhoto, setNewPostPhoto] = useState(null);

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
            addPost(response.data.data.post);
            setNewPostContent('');
            setNewPostPhoto(null);
            document.querySelector('.file-name').textContent = '';
        } catch (error) {
            console.error('Error adding post:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

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
                    key={post.key}
                    post={post}
                    jwt={jwt}
                    handleEditPost={updatePost}
                    handleDeletePost={deletePost}
                    fetchLikedUsers={fetchLikedUsersAndComments}
                />
            ))}
        </div>
    );
};

export default Feed;