import './Signup.css';
import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('Processing...');
        try {
            const response = await axios.post('http://localhost:5003/signup', formData);
            setMessage(`Signup successful! Welcome, ${response.data.name}. Please login.`);
            setFormData({ name: '', email: '', password: '' });
        } catch (error) {
            console.error('Signup error:', error.response || error.message);
            setMessage(error.response?.data?.message || 'Failed to sign up. Please try again.');
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit} className="signup-form">
                <h2>Sign Up</h2>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="signup-button">Sign Up</button>
                {message && <p className="message">{message}</p>}
            </form>
            <div className="login-link">
                Already have an account? <a href="/login">Login here</a>
            </div>
        </div>
    );
}

export default Signup;
