import React, { useState } from 'react';
import './ContactUs.css';  // Import the CSS file
import emailjs from 'emailjs-com';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    
    emailjs.send(
      'service_4diog1j', // Replace with your EmailJS service ID
      'template_ilt8vr7', // Replace with your EmailJS template ID
      {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
      },
      'd2sDKaTdt7AJJIM2p' // Replace with your EmailJS user ID
    ).then((result) => {
      console.log(result.text);
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, (error) => {
      console.log(error.text);
      setSuccess(false);
    });
  };

  return (
    <div className="contact-container">
      <div className="contact-form-wrapper">
        <h1>Contact Us</h1>
        <p>Have any questions or feedback? Please fill out the form below, and we will get back to you as soon as possible.</p>
        <form onSubmit={sendEmail}>
          <input 
            type="text" 
            placeholder="Your Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <input 
            type="email" 
            placeholder="Your Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Subject" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="Your Message" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            required 
          ></textarea>
          <button type="submit">Send Message</button>
        </form>
        {success && <div className="success-message">Your message has been sent successfully!</div>}
      </div>
    </div>
  );
};

export default ContactUs;
