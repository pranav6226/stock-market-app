import React, { useState } from 'react';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  const validateEmail = (email) => {
    /*
    Basic email regex validation
     */
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format.';
    }
    if (!message.trim()) {
      newErrors.message = 'Message is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus(null);

    if (!validate()) {
      return;
    }

    const data = { name, email, message };

    try {
      // Here we mock API call using a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Assume success
      setSubmitStatus('success');
      // Clear form
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby="name-error"
          required
        />
        {errors.name && <span id="name-error" className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="email-error"
          required
        />
        {errors.email && <span id="email-error" className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby="message-error"
          required
        />
        {errors.message && <span id="message-error" className={styles.error}>{errors.message}</span>}
      </div>

      <button type="submit" className={styles.submitButton}>Send</button>

      {submitStatus === 'success' && (
        <p className={styles.successMessage}>Thank you for your message!</p>
      )}
      {submitStatus === 'error' && (
        <p className={styles.errorMessage}>Failed to send message. Please try again later.</p>
      )}
    </form>
  );
}
