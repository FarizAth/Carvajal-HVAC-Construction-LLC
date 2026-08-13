# Carvajal HVAC Construction LLC — Website

A production website for Carvajal HVAC Construction LLC, an Orlando, FL heating, ventilating, and air conditioning company. Built as a static multi-page site (HTML, CSS, vanilla JS) with a small optional Node backend for the contact form.

---

## 1. Project structure

```
carvajal-hvac-website/
├── index.html              Homepage
├── services.html           Full services breakdown
├── about.html               About the company
├── contact.html              Contact page + service request form
├── privacy.html              Privacy policy (template — see note below)
├── terms.html                 Terms of use (template — see note below)
│
├── css/
│   └── style.css             All site styling (design tokens at the top)
├── js/
│   └── script.js              Nav, scroll reveal, cursor, FAQ, form logic
├── images/                     All site photography + icon sprite
├── videos/
│   └── carvajal-hvac-hero-background.mp4   Compressed hero background loop
├── favicon/                    Full favicon + manifest set
│
├── backend/                    Optional Node/Express contact form backend
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── leads/                  Local JSON backup of every form submission
│
├── robots.txt
├── sitemap.xml
└── README.md                   This file
```

## 2. Running locally

No build step is required for the frontend. From the project root:

```bash
python3 -m http.server 8080
# or: npx serve .
```

Then open `http://localhost:8080`.

To run the contact form backend as well (optional, see section 4):

```bash
cd backend
npm install
cp .env.example .env      # fill in real values, see below
npm start                 # runs on http://localhost:3001
```

With both running, the form on `contact.html` will POST to `/api/contact`. If you're serving the frontend and backend from different ports locally, either proxy `/api` to port 3001, or temporarily change the form's `data-endpoint` attribute in `contact.html` to `http://localhost:3001/api/contact`.

## 3. Deploying

The frontend is fully static and can be hosted anywhere that serves static files: Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3 + CloudFront, or a standard shared host. Upload everything **except** the `backend/` folder to your web root.

The backend (if you want a working contact form without a third-party form service) needs a Node.js host: Render, Railway, Fly.io, a small VPS, or similar. Point the frontend's form at wherever you deploy it (see section 4).

Before going live:
- Replace `https://www.carvajalhvac.com` throughout the HTML `<link rel="canonical">`, Open Graph, Twitter, and JSON-LD tags with the real domain once one is registered.
- Update `sitemap.xml` and `robots.txt` if the domain changes.

## 4. How the contact form works

The form in `contact.html` is fully built on the frontend: it validates required fields, email format, and phone format in the browser, shows loading/success/error states, and includes a honeypot field for basic spam protection.

It submits to `/api/contact` as JSON. Right now, that endpoint needs to be connected to the backend in `/backend`:

1. `cd backend && npm install`
2. Copy `.env.example` to `.env` and fill in real SMTP credentials so lead notifications get emailed to `carvajalhvac@gmail.com`. For Gmail, use an **App Password** (not the regular account password): generate one at https://myaccount.google.com/apppasswords after enabling 2-Step Verification.
3. Deploy `backend/` to a Node host and point the frontend at it, either by:
   - Reverse-proxying `/api/*` on your main domain to the backend host, or
   - Changing `data-endpoint="/api/contact"` in `contact.html` to the backend's full URL.

**Every submission is saved locally** to `backend/leads/leads.jsonl` regardless of whether email is configured, so no lead is ever lost even before SMTP is set up. Each line is one JSON record with the submitted fields, a timestamp, and the sender's IP.

**If the backend is never deployed:** the frontend form will show a clear error message with working call, WhatsApp, and email links instead of pretending the message was sent. It will never silently fail.

## 5. Where to update business information

- **Contact details** (phone, WhatsApp, email, address): appear in the topbar, header, footer, and contact page of every HTML file. Search and replace across all `.html` files if any of these change.
- **Logo**: `images/carvajal-hvac-logo.jpg` / `.webp`. Also used to generate the favicon set in `/favicon`.
- **Social links**: Instagram and Facebook URLs appear in the topbar and footer of every page.

## 6. Where to replace images and video

- All photography lives in `/images`, already renamed and optimized (JPEG + WebP pairs, served via `<picture>` for smaller file sizes on supporting browsers).
- To swap a photo, replace both the `.jpg` and `.webp` file with the same filename, or update the `<picture>`/`<img>` references in the relevant HTML file.
- The hero background video is `videos/carvajal-hvac-hero-background.mp4`, already compressed for web (h.264, faststart, no audio track) with a poster fallback at `images/carvajal-hvac-hero-poster.jpg`. Swap the file and keep the same filename, or update the `<source>` and `poster` attributes in `index.html`.

## 7. SEO configuration

- Each page has a unique title, meta description, canonical URL, and Open Graph/Twitter tags.
- `index.html` includes `HVACBusiness` (LocalBusiness) JSON-LD structured data with real, supplied business information only. No fabricated ratings, hours, or price range are included — add these once they're confirmed and accurate.
- `services.html`, `about.html`, and `contact.html` include `BreadcrumbList` structured data.
- `sitemap.xml` and `robots.txt` are included at the root and reference the placeholder domain — update once a real domain is live.

## 8. Accessibility notes

- Skip-to-content link on every page.
- Visible focus states on all interactive elements.
- Mobile menu traps focus, closes on Escape, and restores focus on close.
- All imagery has descriptive alt text.
- Respects `prefers-reduced-motion`: scroll reveals, the custom cursor, and the hero video autoplay all disable gracefully.
- Custom cursor and parallax-style effects are desktop-only and never required to use the site.

## 9. Required external services

None are required for the site to function as a static site. Optional:
- **SMTP provider** (Gmail, SendGrid, Postmark, etc.) for the contact form to send email notifications — see section 4.
- **Domain + hosting** for the frontend.
- **Node hosting** if you want the contact form backend running.

## 10. A few things to confirm before launch

- `privacy.html` and `terms.html` are general-purpose templates. Have them reviewed by a licensed attorney and filled in with any business-specific details before publishing.
- The Google Maps embed on `contact.html` uses the supplied street address directly and needs no API key, but double-check the pin lands on the correct building once live.
- No certifications, licenses, years in business, financing options, or guarantees beyond general "guaranteed workmanship" language were provided in the source brief, so none are claimed on the site. Add these once you can confirm exact wording and any required license numbers.
