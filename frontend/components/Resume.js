import React from 'react';
import './Resume.css'; // Ensure you have a CSS file for styling

function Resume({ userData }) {
    return (
        <div className="resume">
        <header className="resume-header">
            <h1>{userData.name}</h1>
            <p>Email address: {userData.email}</p>
        </header>
        <div className="resume-section">
            <h2>Work Experience</h2>
            {userData.experience.map(job => (
            <div key={job.id}>
                <h3>{job.title}</h3>
                <p>{job.company} - {job.location}</p>
                <p>{job.startDate} to {job.endDate}</p>
                <p>{job.description}</p>
            </div>
            ))}
        </div>
        <div className="resume-section">
            <h2>Education</h2>
            {userData.education.map(edu => (
            <div key={edu.id}>
                <h3>{edu.degree}</h3>
                <p>{edu.institution}</p>
                <p>{edu.graduationYear}</p>
            </div>
            ))}
        </div>
        <div className="resume-skills">
            <h2>Skills</h2>
            <ul>
            {userData.skills.map(skill => <li key={skill}>{skill}</li>)}
            </ul>
        </div>
        <div className="resume-section">
            <h2>Strengths</h2>
            <ul>
            {userData.strengths.map(strength => <li key={strength}>{strength}</li>)}
            </ul>
        </div>
        <footer className="resume-footer">
            <h2>Volunteering</h2>
            <p>{userData.volunteering}</p>
        </footer>
        </div>
    );
}

export default Resume;
