// SMTP email notifications. Inactive until SMTP_* credentials exist in .env
// (Gmail: enable 2-step verification, create an App Password at
// https://myaccount.google.com/apppasswords, then set the vars below).
import nodemailer from "nodemailer";

export function mailerConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFY_EMAIL
  );
}

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "1" || Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
}

/** Notify the site owner about a new contact message. Fails silently —
 *  a broken email setup must never block the contact form. */
export async function notifyNewMessage(msg: {
  name: string;
  email: string;
  projectType?: string | null;
  budget?: string | null;
  message: string;
}): Promise<boolean> {
  if (!mailerConfigured()) return false;
  try {
    const info = transport();
    const lines = [
      `Name: ${msg.name}`,
      `Email: ${msg.email}`,
      msg.projectType ? `Project type: ${msg.projectType}` : null,
      msg.budget ? `Budget: ${msg.budget}` : null,
      "",
      msg.message,
    ].filter(Boolean);
    await info.sendMail({
      from: process.env.SMTP_USER!,
      to: process.env.NOTIFY_EMAIL!,
      replyTo: msg.email,
      subject: `New project inquiry from ${msg.name}`,
      text: lines.join("\n"),
    });
    return true;
  } catch (e) {
    console.error("[mailer] notification failed:", e);
    return false;
  }
}
