import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

// Development-only outbox so emails can be previewed without an SMTP provider.
const devOutbox = [];

export const getDevOutbox = () => devOutbox;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout(title, bodyHtml) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f7f5f0;padding:24px;color:#1b2333">
  <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e7e2d8;border-radius:12px;padding:32px">
  <h2 style="margin-top:0">${escapeHtml(title)}</h2>${bodyHtml}
  <p style="color:#6b7280;font-size:12px;margin-top:32px">EstateHub · You received this email because of activity on your account.</p>
  </div></body></html>`;
}

export async function sendEmail({ to, subject, html, text }) {
  if (transporter) {
    await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html, text });
    logger.info('email_sent', { subject });
    return;
  }
  if (env.isProduction) {
    logger.error('email_not_configured', { subject });
    return;
  }
  devOutbox.unshift({ to, subject, text, sentAt: new Date().toISOString() });
  devOutbox.length = Math.min(devOutbox.length, 20);
  if (!env.isTest) console.log(`\n[dev-email] To: ${to}\n[dev-email] Subject: ${subject}\n[dev-email] ${text}\n`);
}

function actionEmail({ to, subject, title, intro, actionLabel, url, outro }) {
  const html = layout(
    title,
    `<p>${escapeHtml(intro)}</p>
     <p><a href="${escapeHtml(url)}" style="display:inline-block;background:#1b2a4a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">${escapeHtml(actionLabel)}</a></p>
     <p style="color:#6b7280">${escapeHtml(outro)}</p>`,
  );
  return sendEmail({ to, subject, html, text: `${intro}\n${actionLabel}: ${url}\n${outro}` });
}

export const sendVerificationEmail = (user, token) =>
  actionEmail({
    to: user.email,
    subject: 'Verify your EstateHub email',
    title: `Welcome, ${user.name}`,
    intro: 'Please confirm your email address to start listing properties.',
    actionLabel: 'Verify email',
    url: `${env.CLIENT_URL}/verify-email?token=${token}`,
    outro: 'This link expires in 24 hours.',
  });

export const sendPasswordResetEmail = (user, token) =>
  actionEmail({
    to: user.email,
    subject: 'Reset your EstateHub password',
    title: 'Password reset request',
    intro: 'We received a request to reset your password. If this was not you, you can ignore this email.',
    actionLabel: 'Reset password',
    url: `${env.CLIENT_URL}/reset-password?token=${token}`,
    outro: 'This link expires in 30 minutes and can be used once.',
  });

export const sendInquiryNotification = (recipient, inquiry, propertyTitle) =>
  sendEmail({
    to: recipient.email,
    subject: `New inquiry${propertyTitle ? ` about ${propertyTitle}` : ''}`,
    html: layout('You have a new inquiry', `<p><strong>${escapeHtml(inquiry.name)}</strong> (${escapeHtml(inquiry.email)}) wrote:</p><blockquote>${escapeHtml(inquiry.message)}</blockquote>`),
    text: `${inquiry.name} (${inquiry.email}) wrote: ${inquiry.message}`,
  });
