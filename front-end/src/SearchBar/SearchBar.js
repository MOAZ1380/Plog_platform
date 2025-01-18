import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (value) => {
        if (value.length < 1) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsLoading(true);
        setShowResults(true);

        try {
            const token = localStorage.getItem('token');

            const usersResponse = await axios.get(
                `http://localhost:3000/api/users/search/${encodeURIComponent(value)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const users = usersResponse.data.data.map((user) => ({
                ...user,
                type: 'user',
            }));

            const postsResponse = await axios.get(
                `http://localhost:3000/api/posts/search/${encodeURIComponent(value)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const posts = postsResponse.data.data.map((post) => ({
                ...post,
                type: 'post',
            }));

            setSearchResults([...users, ...posts]);
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                console.error('Search error:', error);
            }
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleResultClick = (result) => {
        if (result.type === 'user') {
            navigate(`/profile/${result._id}`);
        } else {
            navigate(`/post/${result._id}`);
        }
        setShowResults(false);
        setSearchTerm('');
    };

    return (
        <div className="search-wrapper" ref={searchRef}>
            <input
                type="text"
                placeholder="Search users or posts..."
                value={searchTerm}
                onChange={handleInputChange}
                className="search-input"
                onFocus={() => setShowResults(true)}
            />
            {showResults && (searchResults.length > 0 || isLoading) && (
                <div className="search-results">
                    {isLoading ? (
                        <div className="loading">Searching...</div>
                    ) : searchResults.length === 0 ? (
                        <div className="no-results">No results found</div>
                    ) : (
                        searchResults.map((result) => (
                            <div
                                key={result._id}
                                className="search-result-item"
                                onClick={() => handleResultClick(result)}
                            >
                                {result.type === 'user' ? (
                                    <div className="user-result">
                                        <div className="user-avatar">
                                            {result.photo ? (
                                                <img
                                                    src={`http://localhost:3000/uploads/Profile_photo/${result.photo}`}
                                                    alt={`${result.firstName}'s avatar`}
                                                />
                                            ) : (
                                                <div className="default-avatar">
                                                    {result.firstName[0]}
                                                </div>
                                            )}
                                        </div>
                                        <span>{result.firstName} {result.lastName}</span>
                                    </div>
                                ) : (
                                    <div className="post-result">
                                        <span>{result.content.substring(0, 100)}...</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;