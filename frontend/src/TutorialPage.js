// src/TutorialPage.js
import React from 'react';

function TutorialPage() {
    return (
        <div className="tutorial-page">
            <h1>Resume Building and Job Interview Preparation Tutorials</h1>
            <p>These tutorials will help you craft a better resume and prepare effectively for job interviews.</p>
            
            <div className="tutorial-section">
                <h2>Resume Building Tutorials</h2>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/Tt08KmFfIYQ?si=PGo5qG52hj1vnvT0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/qPPuW013F-A?si=IdGM7nPbHkOV0IEY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>

            <div className="tutorial-section">
                <h2>Job Interview Preparation Tutorials</h2>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/6bJTEZnTT5A?si=2rJJIo1gm1LzSjdd" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/BpP_tOZAPjg?si=Z5Wp0OBEUwsWlfOc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
        </div>
    );
}

export default TutorialPage;
