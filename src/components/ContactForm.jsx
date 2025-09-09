import React, { useState } from 'react';

/**
 * ContactForm component allows users to send an email after creating a poll.
 * Collects name, email, message, and poll link, then submits to the backend API.
 */
const ContactForm = ({ pollLink }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    pollLink: pollLink || '',
  });
  const [status, setStatus] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form to API route
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('Email sent successfully!');
        setForm({ name: '', email: '', message: '', pollLink: pollLink || '' });
      } else {
        setStatus('Failed to send email.');
      }
    } catch (err) {
      setStatus('Error sending email.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <h2>Contact Us</h2>
      <label>
        Name:
        <input type="text" name="name" value={form.name} onChange={handleChange} required />
      </label>
      <label>
        Email:
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </label>
      <label>
        Message:
        <textarea name="message" value={form.message} onChange={handleChange} required />
      </label>
      <label>
        Poll Link:
        <input type="text" name="pollLink" value={form.pollLink} onChange={handleChange} readOnly={!!pollLink} />
      </label>
      <button type="submit">Send Email</button>
      {status && <p>{status}</p>}
    </form>
  );
};

export default ContactForm;
