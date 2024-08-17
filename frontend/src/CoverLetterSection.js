import React from 'react';
import { saveAs } from 'file-saver';

function CoverLetterSection({ coverLetter }) {
    const downloadCoverLetter = () => {
        const blob = new Blob([coverLetter], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "CoverLetter.txt");
    };

    return (
        <div style={{ margin: '40px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <h2 style={{ color: '#0056b3', textAlign: 'center', marginBottom: '20px' }}>Cover Letter</h2>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px', textAlign: 'center' }}>
                This cover letter has been auto-generated based on the information extracted from your uploaded resume and job description. Ensure that all details are accurate before using it for any application.
            </p>
            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
                    {coverLetter ? (
                        coverLetter.split('\n').map((paragraph, index) => (
                            <p key={index} style={{ marginBottom: '10px' }}>{paragraph}</p>
                        ))
                    ) : (
                        <p>N/A</p>
                    )}
                </div>
            </div>
            <button 
                onClick={downloadCoverLetter} 
                style={{
                    backgroundColor: '#0056b3',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    fontSize: '16px'
                }}>
                Download Cover Letter
            </button>
        </div>
    );
}

export default CoverLetterSection;
