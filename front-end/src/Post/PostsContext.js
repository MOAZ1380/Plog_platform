import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const PostsContext = createContext();

export const PostsProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
    
            const response = await axios.get('http://localhost:3000/api/posts/GetAllPost', {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            const postsWithIds = response.data.data.map((post, index) => ({
                ...post,
                key: post._id || `post-${index}`,
            }));
            setPosts(postsWithIds);
        } catch (error) {
            console.error('Error fetching posts:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const addPost = (newPost) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    const updatePost = (postId, updatedFields) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post._id === postId ? { ...post, ...updatedFields } : post
            )
        );
    };

    const deletePost = (postId) => {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    };

    return (
        <PostsContext.Provider value={{ posts, fetchPosts, addPost, updatePost, deletePost }}>
            {children}
        </PostsContext.Provider>
    );
};