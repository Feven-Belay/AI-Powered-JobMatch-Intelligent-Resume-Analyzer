import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ setIsLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            const response = await axios.post('http://localhost:5003/login', {
                email,
                password,
            });

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                setIsLoggedIn(true);
                navigate('/');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            </div>
        </div>
    );
}

export default Login;
