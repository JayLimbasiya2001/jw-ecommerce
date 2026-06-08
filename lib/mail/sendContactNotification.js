"use strict";

/**
 * Sends contact inquiry notification when SMTP is configured.
 * Failures are logged but do not block inquiry persistence.
 */
async function sendContactNotification(inquiry) {
  const host = process.env.SMTP_HOST;
  const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;

  if (!host || !notifyEmail) {
    return;
  }

  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || notifyEmail,
      to: notifyEmail,
      subject: `New contact inquiry from ${inquiry.name}`,
      text: [
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Phone: ${inquiry.phone || "—"}`,
        "",
        inquiry.message,
      ].join("\n"),
    });
  } catch (err) {
    console.error("Contact notification email failed:", err.message);
  }
}

module.exports = { sendContactNotification };
