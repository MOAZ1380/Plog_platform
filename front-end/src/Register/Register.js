import React, { useState } from 'react';
import '../Login/Login.css';

const Register = ({ onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        sex: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        photo: null
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validateForm = () => {
        const newErrors = {};
        const today = new Date();
        const birthDate = new Date(formData.birthDate);

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.sex) {
            newErrors.sex = 'Please select your gender';
        }

        if (!formData.birthDate) {
            newErrors.birthDate = 'Birth date is required';
        } else if (birthDate >= today) {
            newErrors.birthDate = 'Birth date cannot be in the future';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            photo: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'confirmPassword' && key !== 'photo') {
                    formDataToSend.append(key, formData[key]);
                }
            });
            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }

            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            onRegisterSuccess();
        } catch (error) {
            setServerError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Sign up to get started</p>

                {serverError && (
                    <div className="alert alert-error">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">
                    <div className={`form-group ${errors.firstName ? 'error' : ''}`}>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            required
                        />
                        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>

                    <div className={`form-group ${errors.lastName ? 'error' : ''}`}>
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            required
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>

                    <div className={`form-group ${errors.sex ? 'error' : ''}`}>
                        <label htmlFor="sex">Gender</label>
                        <select
                            id="sex"
                            name="sex"
                            value={formData.sex}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {errors.sex && <span className="error-message">{errors.sex}</span>}
                    </div>

                    <div className={`form-group ${errors.birthDate ? 'error' : ''}`}>
                        <label htmlFor="birthDate">Birth Date</label>
                        <input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                        {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="photo">Profile Photo</label>
                        <input
                            id="photo"
                            name="photo"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    <div className={`form-group ${errors.email ? 'error' : ''}`}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className={`form-group ${errors.password ? 'error' : ''}`}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                        {errors.confirmPassword && (
                            <span className="error-message">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Sign up"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;