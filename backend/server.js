/**
 * Carvajal HVAC Construction LLC — Contact form backend
 * ------------------------------------------------------
 * Minimal, dependency-light Express server that:
 *  1. Validates and sanitizes incoming contact form submissions
 *  2. Applies basic spam protection (honeypot + rate limiting)
 *  3. Stores each lead as a structured JSON line (local backup, works
 *     even if email sending isn't configured yet)
 *  4. Emails a notification via SMTP (nodemailer), when credentials
 *     are present in the environment
 *
 * This is intentionally simple: one small business, one form, one
 * inbox. No database is required. See ../README.md for setup and
 * deployment notes, including what to fill in before this goes live.
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const LEADS_FILE = path.join(__dirname, 'leads', 'leads.jsonl');

// Make sure the leads directory exists (local backup of every submission)
fs.mkdirSync(path.join(__dirname, 'leads'), { recursive: true });

/* -------------------------------------------------------------------- */
/* Middleware                                                            */
/* -------------------------------------------------------------------- */
app.use(express.json({ limit: '32kb' })); // small limit; this is a contact form, not a file upload
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : '*',
  methods: ['POST'],
}));

// Basic rate limiting: 8 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please try again later.' },
});

/* -------------------------------------------------------------------- */
/* Validation helpers                                                    */
/* -------------------------------------------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str, maxLen) {
  if (typeof str !== 'string') return '';
  // strip control chars, trim, cap length — keeps this simple and safe
  return str.replace(/[\r\n\t]+/g, ' ').replace(/[<>]/g, '').trim().slice(0, maxLen);
}

function validateSubmission(body) {
  const errors = [];
  const name = sanitize(body.name, 100);
  const phone = sanitize(body.phone, 30);
  const email = sanitize(body.email, 100);
  const service = sanitize(body.service, 80);
  const message = sanitize(body.message, 2000);

  if (!name) errors.push('Name is required.');
  if (!phone || phone.replace(/\D/g, '').length < 7) errors.push('A valid phone number is required.');
  if (email && !EMAIL_RE.test(email)) errors.push('Email address is not valid.');
  if (!service) errors.push('Please select a service.');
  if (!message) errors.push('Please describe what you need.');

  return { errors, clean: { name, phone, email, service, message } };
}

/* -------------------------------------------------------------------- */
/* Email transport (only activates once SMTP env vars are set)          */
/* -------------------------------------------------------------------- */
function buildTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // not configured yet — see README
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendNotification(lead) {
  const transporter = buildTransport();
  if (!transporter) return { sent: false, reason: 'SMTP not configured' };

  const to = process.env.NOTIFY_TO || 'carvajalhvac@gmail.com';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    replyTo: lead.email || undefined,
    subject: `New service request: ${lead.service} — ${lead.name}`,
    text:
      `New request from the website contact form\n\n` +
      `Name: ${lead.name}\n` +
      `Phone: ${lead.phone}\n` +
      `Email: ${lead.email || '(not provided)'}\n` +
      `Service: ${lead.service}\n\n` +
      `Message:\n${lead.message}\n`,
  });

  return { sent: true };
}

/* -------------------------------------------------------------------- */
/* Routes                                                                */
/* -------------------------------------------------------------------- */
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    // Honeypot: real users never fill this hidden field in
    if (req.body.company_website) {
      return res.status(200).json({ ok: true }); // pretend success, drop silently
    }

    const { errors, clean } = validateSubmission(req.body);
    if (errors.length) {
      return res.status(400).json({ ok: false, error: errors.join(' ') });
    }

    const lead = {
      ...clean,
      receivedAt: new Date().toISOString(),
      ip: req.ip,
    };

    // 1. Always persist locally first — the form must never silently fail
    fs.appendFile(LEADS_FILE, JSON.stringify(lead) + '\n', (err) => {
      if (err) console.error('Failed to write lead to disk:', err);
    });

    // 2. Attempt email notification (no-op until SMTP is configured)
    let mail = { sent: false };
    try {
      mail = await sendNotification(lead);
    } catch (mailErr) {
      console.error('Email notification failed:', mailErr.message);
    }

    return res.status(200).json({ ok: true, emailed: mail.sent });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please call or WhatsApp us directly.' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Carvajal HVAC contact backend running on port ${PORT}`);
  if (!buildTransport()) {
    console.log('NOTE: SMTP is not configured yet. Leads are being saved to backend/leads/leads.jsonl but no email will be sent. See README.md.');
  }
});
