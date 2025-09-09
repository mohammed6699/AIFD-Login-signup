// API route to handle contact form email sending
import nodemailer from 'nodemailer';

/**
 * Handles POST requests from ContactForm to send email.
 * Uses SMTP credentials from environment variables.
 */
export async function POST(req) {
  try {
    const { name, email, message, pollLink } = await req.json();

    // Helper: strict email regex
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    // Helper: strip CRLF and header-injection chars
    function sanitize(str, maxLen = 128) {
      return str
        .replace(/[\r\n]/g, ' ')
        .replace(/[<>"'\\]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLen);
    }

    // Validate name
    const safeName = sanitize(name, 64);
    if (!safeName || safeName.length < 2) {
      return new Response(JSON.stringify({ error: 'Name required.' }), { status: 400 });
    }

    // Validate message
    const safeMessage = sanitize(message, 1000);
    if (!safeMessage || safeMessage.length < 5) {
      return new Response(JSON.stringify({ error: 'Message required.' }), { status: 400 });
    }

    // Validate email
    const safeEmail = sanitize(email, 128);
    if (!emailRegex.test(safeEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), { status: 400 });
    }

    // Validate pollLink (optional, but trim and limit)
    const safePollLink = sanitize(pollLink || '', 256);

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

    // Compose email with trusted From and Reply-To
    const mailOptions = {
      from: 'no-reply@yourdomain.com', // trusted sender
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: safeEmail,
      subject: `Contact Form Submission from ${safeName}`,
      text:
        `Message: ${safeMessage}\n` +
        (safePollLink ? `Poll Link: ${safePollLink}\n` : '') +
        `From: ${safeName} <${safeEmail}>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    // Return 500 only for server errors
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
