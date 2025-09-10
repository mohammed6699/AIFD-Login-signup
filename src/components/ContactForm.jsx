'use client'
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      pollLink: pollLink || '',
    }));
  }, [pollLink]);

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
    <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-neutral-950 rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium text-gray-700 dark:text-gray-300">Name</Label>
          <Input id="name" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Enter your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium text-gray-700 dark:text-gray-300">Email</Label>
          <Input id="email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message" className="text-base font-medium text-gray-700 dark:text-gray-300">Message</Label>
          <Textarea id="message" name="message" value={form.message} onChange={handleChange} required placeholder="Your message" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pollLink" className="text-base font-medium text-gray-700 dark:text-gray-300">Poll Link</Label>
          <Input id="pollLink" type="text" name="pollLink" value={form.pollLink} onChange={handleChange} readOnly={!!pollLink} placeholder="Poll link (if any)" />
        </div>
        <Button type="submit" className="w-full text-lg py-3">Send Email</Button>
        {status && <p className={`text-center text-sm mt-4 ${status.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>{status}</p>}
      </form>
    </div>
  );
};

export default ContactForm;