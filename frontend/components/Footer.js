import React from 'react';
import './Footer.css'; // Ensure the styles are in a separate CSS file

const Footer = () => {
    return (
        <footer className="footer">
            <p>Privacy guaranteed</p>
            <p>Loved by interviewers at:</p>
            <div className="social-icons">
                <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
                    <img src={require('./Icons/Google.png')} alt="Google" />
                </a>

                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                    <img src={require('./Icons/facebook.jpeg')} alt="Facebook" />
                </a>
                <a href="https://www.spotify.com" target="_blank" rel="noopener noreferrer">
                    <img src={require('./Icons/spotify.png')} alt="Spotify" />
                </a>
                <a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer">
                    <img src={require('./Icons/Amazon.png')} alt="Amazon" />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
