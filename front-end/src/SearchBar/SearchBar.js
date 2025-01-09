import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MessageSquare, Loader2 } from 'lucide-react';
import './SearchBar.css';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false); // Controls visibility of results dropdown
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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                handleSearch();
            } else {
                setSearchResults({ posts: [], users: [] });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchResults({ posts: [], users: [] });
            return;
        }

        setIsLoading(true);
        setShowResults(true);

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [postsResponse, usersResponse] = await Promise.all([
                fetch(`http://localhost:3000/api/posts/search/${searchTerm}`, { headers }),
                fetch(`http://localhost:3000/api/users/search/${searchTerm}`, { headers }),
            ]);

            const postsData = await postsResponse.json();
            const usersData = await usersResponse.json();

            setSearchResults({
                posts: postsData.status === 'success' ? postsData.data : [],
                users: usersData.status === 'success' ? usersData.data : [],
            });
        } catch (error) {
            console.error('Error searching:', error);
            setSearchResults({ posts: [], users: [] });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResultClick = (type, id) => {
        setSearchTerm('');
        setShowResults(false);
        navigate(type === 'post' ? `/post/${id}` : `/profile/${id}`);
    };

    return (
        <div className="search-bar" ref={searchRef}>
            <div className="search-bar__input-wrapper">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search posts or users..."
                    className="search-bar__input"
                    onFocus={() => setShowResults(true)}
                />
                <div className="search-bar__icon">
                    {isLoading ? (
                        <Loader2 className="search-bar__loading-icon" />
                    ) : (
                        <Search className="search-bar__search-icon" />
                    )}
                </div>
            </div>

            {showResults && (searchResults.users.length > 0 || searchResults.posts.length > 0) && (
                <div className="search-bar__results">
                    {searchResults.users.length > 0 && (
                        <div className="search-bar__results-section">
                            <h3 className="search-bar__results-section-title">Users</h3>
                            {searchResults.users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleResultClick('user', user._id)}
                                    className="search-bar__result-item"
                                >
                                    <User className="search-bar__result-icon" />
                                    <div>
                                        <p className="search-bar__result-name">{user.firstName} {user.lastName}</p>
                                        <p className="search-bar__result-email">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchResults.users.length > 0 && (
                        <div className="search-bar__results-section">
                            <h3 className="search-bar__results-section-title">Users</h3>
                            {searchResults.users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => handleResultClick('user', user._id)}
                                    className="search-bar__result-item"
                                >
                                    <User className="search-bar__result-icon" />
                                    <div>
                                        <p className="search-bar__result-name">
                                            {user.firstName || 'Unknown'} {user.lastName || ''}
                                        </p>
                                        <p className="search-bar__result-email">{user.email || 'No email'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showResults && searchTerm && !isLoading && searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                <div className="search-bar__no-results">
                    <p className="search-bar__no-results-message">No results found for "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;