# **API-Powered JobMatch: Intelligent Resume Analyzer**

**API-Powered JobMatch** is an advanced resume analysis tool designed to bridge the gap between job seekers and employers. The tool allows users to upload their resumes, analyze them, and match them with job descriptions. It provides personalized feedback to enhance resumes and improve job application success rates.

## **Table of Contents**

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [APIs and Endpoints](#apis-and-endpoints)
- [Contributing](#contributing)
- [License](#license)

## **Features**

- **Intelligent Resume Parsing**: Extracts key user information from resumes, including education, work experience, and skills.
- **Job Description Matching**: Analyzes the resume's relevance to a specific job description using similarity scoring.
- **Personalized Feedback**: Provides actionable suggestions for improving resumes, such as recommended skills and layout feedback.
- **Data Privacy and Security**: Ensures all user data is securely stored and managed.
- **Cover Letter Generator**: Automatically generates tailored cover letters based on the user's resume and job description.
- **Responsive and Interactive UI**: Dynamic components such as accordions, score displays, and skill recommendations create an engaging user experience.

## **Technologies Used**

### **Frontend**

- **React.js**: Dynamic user interface and state management.
- **React Router**: Routing between pages in the application.
- **Axios**: Handling HTTP requests to the backend.
- **HTML5 & CSS3**: Structuring and styling the frontend components.
- **VANTA.js**: For background animation effects.

### **Backend**

- **Node.js & Express.js**: Backend server and API endpoints.
- **Multer**: For handling file uploads.
- **MySQL2**: For database management.
- **bcrypt**: For secure password hashing.
- **jsonwebtoken (JWT)**: For user authentication and session management.

### **Python Script**

- **Python 3.x**: For resume analysis.
- **ResumeParser**: For extracting user information from resumes.
- **scikit-learn**: For calculating similarity scores.
- **NLTK/Spacy**: Natural language processing for text extraction and processing.
- **openai (GPT-3.5 Turbo)**: For generating cover letters and personalized feedback.

### **Miscellaneous**

- **PDFKit**: For generating PDFs of the user's resume.
- **Docker & Kubernetes (Optional)**: Containerization and orchestration for deployment.

## **Setup and Installation**

### **Prerequisites**

- **Node.js**: Version 14.x or higher.
- **Python 3.x**: Required for running the resume parsing script.
- **MySQL**: Required for database setup.
