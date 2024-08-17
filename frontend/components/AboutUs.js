import React from 'react';

function AboutUs() {
  return (
    <div className="about-us-page" style={styles.container}>
      <h1 style={styles.heading}>About API-Powered JobMatch</h1>
      <p style={styles.paragraph}>
        API-Powered JobMatch is an advanced AI-driven resume analysis tool designed to help bridge the gap between job seekers and employers.
        By leveraging powerful algorithms and state-of-the-art machine learning techniques, this tool analyzes resumes, compares them with job descriptions, 
        and provides personalized feedback to enhance job applications.
      </p>
      <h2 style={styles.subheading}>Our Key Features</h2>
      <ul style={styles.list}>
        <li style={styles.listItem}>Intelligent Resume Parsing</li>
        <li style={styles.listItem}>Job Description Matching</li>
        <li style={styles.listItem}>Personalized Feedbacks</li>
        <li style={styles.listItem}>Data Privacy and Security</li>
      </ul>
      <p style={styles.paragraph}>
        Our platform ensures that job seekers have the best chance of success by providing insights into how their resumes align with job descriptions 
        and suggesting improvements to make them stand out.
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    margin: '0 auto',
    maxWidth: '800px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '36px',
    color: 'orange',
    marginBottom: '20px',
  },
  paragraph: {
    fontSize: '18px',
    color: '#333',
    lineHeight: '1.6',
  },
  subheading: {
    fontSize: '28px',
    color: '#e68a00',
    marginBottom: '15px',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    fontSize: '20px',
    color: '#666',
    margin: '10px 0',
  },
};

export default AboutUs;
