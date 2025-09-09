// API route to handle contact form email sending
import nodemailer from 'nodemailer';

/**
 * Handles POST requests from ContactForm to send email.
 * Uses SMTP credentials from environment variables.
 */
export async function POST(req) {
  try {
    const { name, email, message, pollLink } = await req.json();
    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    // Compose email
    const mailOptions = {
      from: email,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: `Contact Form Submission from ${name}`,
      text: `Message: ${message}\nPoll Link: ${pollLink}\nFrom: ${name} <${email}>`,
    };
    // Send email
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
