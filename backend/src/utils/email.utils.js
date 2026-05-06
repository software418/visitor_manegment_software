import nodemailer from 'nodemailer';
import  AppError  from './appError.js';
import logger from './logger.utils.js';

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

/**
 * Send an email.
 * @param {string} to - recipient email address
 * @param {string} subject
 * @param {string} html - HTML email body
 */
export const sendEmail = async (to, subject, html) => {
   if (process.env.NODE_ENV === 'test') return;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"VMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`[EMAIL] Sent → ${to} | Subject: ${subject}`);
  } catch (err) {
    logger.error(`[EMAIL] Failed → ${to} | ${err.message}`);
    throw new AppError('Failed to send email', 500, 'SERVER_ERROR');
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

export const passwordResetTemplate = (resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Reset Your Password</h2>
    <p>You requested a password reset for your VMS account.</p>
    <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetLink}"
      style="display: inline-block; padding: 12px 24px; background-color: #000;
             color: #fff; text-decoration: none; border-radius: 4px; margin: 16px 0;">
      Reset Password
    </a>
    <p style="color: #666; font-size: 13px;">
      If you did not request this, ignore this email. Your password will not change.
    </p>
    <p style="color: #666; font-size: 13px;">
      Or copy this link: <a href="${resetLink}">${resetLink}</a>
    </p>
  </div>
`;

