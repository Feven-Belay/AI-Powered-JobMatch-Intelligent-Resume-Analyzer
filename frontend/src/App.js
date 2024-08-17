import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer'; 
import './ScoreDisplay.css'; // Assuming you have an external CSS file for styles
import CoverLetterSection from './CoverLetterSection';
import TutorialPage from './TutorialPage';  //


function HomePage() {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(0);

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(window.VANTA.NET({
                el: vantaRef.current,
                color: 0xadd8e6,
                backgroundColor: 0x000000,
                points: 10,
                maxDistance: 20,
                spacing: 15,
                showDots: true
            }));
        }
        return () => vantaEffect && vantaEffect.destroy();
    }, [vantaEffect]);

    return (
        <div ref={vantaRef} style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'white' }}>
            <h1 style={{ color: 'orange' }}>API-Powered JobMatch: Intelligent Resume Analyzer</h1>
            <p style={{ color: 'white' }}>API-Powered JobMatch is an advanced resume analysis tool designed to bridge the gap between job seekers and employers. This tool analyzes resumes, matches them to job descriptions, and provides actionable feedback to enhance job applications.</p>
            <h2 style={{ color: 'white' }}>THE WORLD’S TOP PARSER FOR ACCURACY AND SPEED</h2>
            <ul>
                <li>Intelligent Resume Parsing</li>
                <li>Job Description Matching</li>
                <li>Personalized Feedbacks</li>
                <li>Data Privacy and Security</li>
            </ul>

            <Link to="/contact">
                <button style={{ backgroundColor: '#ffa500', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', color: 'black', fontSize: '16px' }}>
                    Contact us
                </button>
            </Link>
        </div>
    );
}




function ScoreDisplay({ score }) {
    const scoreColor = score >= 75 ? '#4caf50' : score >= 50 ? '#ffeb3b' : '#f44336';
    const feedbackText = score >= 75 ? 'Excellent! Keep it up!' : score >= 50 ? 'Good, but there is room for improvement.' : 'Needs improvement.';

    return (
        <div className="score-container">
            <div className="tooltip">This score reflects how well your resume matches the job description.</div>
            <div className="score" style={{ color: scoreColor }}>
                Resume Score: {score.toFixed(2)}%
            </div>
            <div className="score-bar-container">
                <div className="score-bar" style={{ backgroundColor: scoreColor, width: `${score}%` }}></div>
            </div>
            <div className="score-feedback">
                {score.toFixed(2)}/100
            </div>
            <div className="score-feedback">
                {feedbackText}
            </div>
        </div>
    );
}


function UserInformation({ userInfo }) {
    return (
        <div className="user-info-container">

            <div className="user-info">
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Mobile Number:</strong> {userInfo.mobile}</p>
                <p><strong>College:</strong> {userInfo.college}</p>
                <p><strong>Degree:</strong> {userInfo.degree}</p>
                <p><strong>Total Experience:</strong> {userInfo.totalExperience} years</p>
                <p><strong>User Level:</strong> {userInfo.userLevel}</p>
            </div>
        </div>
    );
}

function FeedbackSection({ title, content }) {
    return (
        <div className="feedback-section">
            <h2 className="feedback-header">{title}</h2>
            <p className="feedback-content">{content}</p>
        </div>
    );
}


function SkillsSection({ skills }) {
    return (
        <div>
      
            {skills && (
                <ul className="skills-list">
                    {skills.split(',').map((skill, index) => (
                        <li key={index} className="skill-item">{skill.trim()}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function Accordion({ title, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="accordion-section">
            <button className="accordion-title" onClick={() => setIsOpen(!isOpen)}>
                {title}
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
}








function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [jobSkills, setJobSkills] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [resumeScore, setResumeScore] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    
    const [message, setMessage] = useState('');
    


    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setResult(null);
        setError(null);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleJobDescriptionChange = (event) => {
        setJobDescription(event.target.value);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('jobDescription', jobDescription);

        setUploading(true);
        try {
            const response = await axios.post('http://localhost:5003/analyze_resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && typeof response.data.data === "object") {
                setResult(response.data.data);
                setResumeScore(parseFloat(response.data.data.similarity_score));
                setJobSkills(response.data.data.job_skills || []);
            } else {
                setError("Received malformed data from server");
            }
        } catch (error) {
            setError(error.response ? error.response.data.message : 'Failed to upload file.');
        } finally {
            setUploading(false);
        }
    };

    const handleSignUp = async () => {
        try {
            const response = await axios.post('http://localhost:5003/signup', {
                name: userName,
                email: userEmail,
                password: userPassword,
            });

            if (response.status === 200) {
                // Handle successful sign-up
            } else {
                setError('Failed to sign up.');
            }
        } catch (error) {
            setError('Failed to sign up.');
            console.error('Error during sign-up:', error);
        }
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <div className="logo">
                        <Link to="/"><img src="/Logo2.png" alt="Logo" /></Link>
                    </div>
                    <nav className="navbar">
                        <Link to="/">Home</Link>
                        <Link to="/cover">Cover Letter</Link>
                        <Link to="/tutorials">Tutorials</Link> {/* Add Tutorials to Navbar */}
                        <Link to="/Contact">Contact Us</Link>

=


                        {/* <button className="contact-btn">Contact us</button> */}
                        {!isLoggedIn ? (
                            <Link to="/login" className="icon-button login-icon"><i className="fas fa-user"></i></Link>
                        ) : (
                            <button onClick={handleLogout} className="icon-button logout-icon">Logout</button>
                        )}
   
                    </nav>
                </header>
                <Routes>
                    <Route path="/" element={isLoggedIn ? (
                        <>
                            <HomePage />
                            <section id="upload" className="upload-section">
                                <h2 style={{ color: '#e68a00' }}>Job Description</h2>
                                <textarea placeholder="Paste the job description here." onChange={handleJobDescriptionChange} style={{ width: '100%', height: '250px', marginBottom: '20px' }}></textarea>

                                <h2 style={{ color: '#e68a00' }}>Resume</h2>
                                <label className="file-label">
                                    <input type="file" onChange={handleFileChange} />
                                    <span>Drop your resume here or choose a file. PDF & DOCX only. Max 2MB file size.</span>
                                </label>
                                <br />
                                <button onClick={handleFileUpload} className="upload-button" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload Resume'}
                                </button>
                                {error && <p className="error-message">{error}</p>}
                                {uploading && <div className="progress-bar"><div className="progress"></div></div>}
                            </section>

                            {result && (
                                <section id="result" className="result">
                                    <h1 className="resume-analysis-title">RESUME ANALYSIS RESULT</h1>

                                     <Accordion title="User Information">
                                        {result && <UserInformation userInfo={{
                                            name: result.name,
                                            email: result.email,
                                            mobile: result.phone_number,
                                            college: result.college_name,
                                            degree: result.degree,
                                            totalExperience: result.total_experience,
                                            userLevel: result.user_level
                                        }} />}
                                    </Accordion>

                                    <Accordion title="Skills">
                                        <SkillsSection skills={result.skills} />
                                    </Accordion>

                                    <Accordion title="Experience">
                                        <div className="ExperienceSection">
                                            <ul>
                                                {Array.isArray(result.relevant_experiences) ? (
                                                    result.relevant_experiences.map((experience, index) => (
                                                        <li key={index}>{experience}</li>
                                                    ))
                                                ) : (
                                                    <li>{result.relevant_experiences || 'No relevant experiences found'}</li>
                                                )}
                                            </ul>
                                        </div>
                                    </Accordion>
                                    <Accordion title="Comparing with Job Description">
                                        <ScoreDisplay score={resumeScore} />
                                        </Accordion>

                                <Accordion title="Recommended Skills">
                                    <div className="recommended-skills">
                                        {Array.isArray(result.recommended_skills) ? (
                                            result.recommended_skills.length > 0 ? (
                                                <ul className="skills-list">
                                                    {result.recommended_skills.map((skill, index) => (
                                                        <li key={index} className="skill-item">{skill}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No recommended skills based on the resume and job description.</p>
                                            )
                                        ) : (
                                            <p>{typeof result.recommended_skills === 'string' ? result.recommended_skills : 'No data available'}</p>
                                        )}
                                    </div>
                                </Accordion>


                                    <Accordion title="Feedback for Users">
                                        <FeedbackSection title="Feedback on Layout and Structure" content={result.layout_feedback} />
                                        <FeedbackSection title="AI Insights" content={result.ai_insights} />
                                        <FeedbackSection title="GPT Feedback" content={result.gpt_feedback} />
                                        <FeedbackSection title="Predicted Field" content={result.predicted_field} />
                                    </Accordion>

                                    <Accordion title="Others">

                                        <div className="ExtraResume">
                                    
                                            <p><strong>Timestamp:</strong> {result.timestamp || 'N/A'}</p>
                                            <p><strong>Number of Pages:</strong> {result.number_of_pages || 'N/A'}</p>
                                        </div>

                                        </Accordion>



                                </section>
                            )}
                        </>
                    ) : (
                        <Navigate to="/login" />
                    )} />
                               <Route path="/tutorials" element={<TutorialPage />} /> {/* Add the TutorialPage Route */}
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/cover" element={<CoverLetterSection coverLetter={result?.cover_letter} />} />
                    <Route path="/signup" element={<Signup
                        setUserName={setUserName}
                        setUserEmail={setUserEmail}
                        setUserPassword={setUserPassword}
                        handleSignUp={handleSignUp}
                    />} />
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                    {/* <Route path ="/ContactUs"element={<ContactUs/>}/> */}


                    
                </Routes>

                <Footer />  {/* Place it at the bottom */}
                <footer className="App-footer">
                    <p>Privacy guaranteed</p>
                    <p>Loved by interviewers at:</p>
                    <p>Google, Tesla, Facebook, Spotify, Amazon</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
