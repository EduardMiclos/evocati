# Evocati — website + admin

Animated, dark-themed presentation website for **Evocati** (recuperări creanțe
comerciale) with an admin dashboard. Front-end: **Vite + React + TypeScript +
Tailwind + Framer Motion**. Back-end: a few **PHP** scripts (no database) that run
on any cPanel hosting. The default copy comes from
`BUN VENIT IN CASA DE  RECUPERARI CREANTEI EVOCATI.docx`.

---

## Requirements

- Node.js 18+ and npm
- PHP 8.1+ locally (only for the admin and the contact form in dev)

## Local development

```bash
npm install
npm run dev                  # http://localhost:5173  (admin: /#/admin)
PORT=8080 npm run dev        # any port (or: npm run dev -- --port 8080)
```

`npm run dev` also starts `php -S` for the API and proxies `/api` to it. Local
admin data (texts, settings, requests) is kept in `.dev-data/`, never in the build.
The dev and preview servers listen on all interfaces and accept any hostname.

## Build

```bash
npm run build    # type-checks, then outputs the site + API to ./dist
npm run preview  # serve ./dist locally (with PHP) to test it
```

---

## Deploy to Google Cloud / Firebase (production)

```
visitor ──► Firebase Hosting (CDN, custom domain, auto SSL)
              ├── static site (dist/)
              └── /api/** ──► Cloud Run "evocati-api" (deploy/api/Dockerfile, PHP 8.3 + Apache)
                                 └── /data ──► private Cloud Storage bucket (texts, settings, requests)
```

Every push to `main` runs `.github/workflows/deploy.yml`: build + checks → API image
to Artifact Registry → Cloud Run → site to Firebase Hosting. Pull requests only run the
build and checks. GitHub authenticates to Google with Workload Identity Federation, so
there are no keys stored anywhere.

### One-time setup

1. Create a Google Cloud project, enable billing (**Blaze** plan — needed for the
   Hosting → Cloud Run rewrite; normal traffic stays in the free tier), then add
   Firebase to it at console.firebase.google.com.
2. Install `gcloud` and log in as a project Owner (`gcloud auth login`).
3. Run:
   ```bash
   PROJECT_ID=your-project-id ./deploy/gcp-setup.sh
   ```
   It enables the APIs, creates the image registry, the private data bucket (with
   30-day version history), two least-privilege service accounts, the GitHub ↔ Google
   trust, and writes the `GCP_*` variables into this GitHub repository.
4. GitHub → Actions → **Deploy** → *Run workflow*.
5. Open `https://your-project-id.web.app/#/admin`, log in, set the new password.
6. Firebase Console → Hosting → **Add custom domain** (SSL is issued automatically).

Region: `europe-west1`. To use another, change it in `firebase.json` too.

Differences from cPanel: HTTPS and certificates are managed by Firebase (the admin's
Securitate tab shows that instead of the toggle); email must go through **SMTP** on
port 465 or 587 — Google Cloud blocks port 25 and has no `mail()`.

---

## Deploy to cPanel

1. `npm run build`, then zip **the contents** of `dist/` (or use the ready-made
   `evocati-cpanel.zip`).
2. cPanel → **File Manager** → `public_html` (or a subfolder) → **Upload** the zip →
   right-click → **Extract**. Make sure hidden files (`.htaccess`) are extracted:
   File Manager → Settings → *Show Hidden Files*.
3. Open `https://domeniu.ro/#/admin`, log in with the initial password and set a
   new one (required on first login).
4. In the admin:
   - **Email** — SMTP account (cPanel → Email Accounts → Connect Devices shows the
     server, port and username), recipients for the contact form → *Trimite test*.
   - **Securitate** — run AutoSSL in cPanel (SSL/TLS Status) if the certificate
     isn't valid yet, then turn on **Forțează HTTPS**.
   - **Contact** / **Texte site** — phone, email, address and every text on the site.

PHP version: cPanel → *MultiPHP Manager* → 8.1 or newer.

### Updating the site later

Upload a new build over the old one. Everything edited in the admin lives in
`api/data/`, which the build doesn't contain, so texts, email settings, the admin
password and received requests are kept. The force-HTTPS setting lives in the root
`.htaccess`; if you overwrite it, turn the toggle on again in the admin.

### Forgot the admin password

Delete `api/data/admin.php` in File Manager. The initial password works again and
you'll be asked to set a new one.

---

## How it works

```
src/
  App.tsx                 Router: public site + lazy-loaded /admin
  content/schema.ts       ← EVERY EDITABLE TEXT (key, label, default). Add fields here.
  content/ContentProvider useContent(): t(key), list(key); *word* → gold highlight
  pages/Home.tsx          All homepage sections, reading texts via t()
  admin/                  Dashboard: Texte, Contact, Email, Cereri, Securitate
  lib/api.ts              fetch wrapper for the PHP API (relative path → works in subfolders)
deploy/
  api/Dockerfile          PHP API image for Cloud Run
  gcp-setup.sh            one-time Google Cloud / Firebase / GitHub setup
firebase.json             Hosting config (+ /api/** → Cloud Run rewrite)
.github/workflows/        CI/CD: build, then deploy to Cloud Run + Firebase Hosting
public/
  .htaccess               compression, caching, security headers, HTTPS block (admin-managed)
  api/                    PHP endpoints (copied as-is into dist/api)
    config.php            initial admin password hash, session timeout
    lib.php               storage, sessions, CSRF check, rate limits
    mailer.php            built-in SMTP client (SSL/STARTTLS/AUTH) + mail() fallback
    content.php           GET public texts / POST save (admin)
    contact.php           contact form → saved + emailed (honeypot, rate limit)
    settings.php          email server settings + test email (admin)
    submissions.php       received requests (admin)
    ssl.php               certificate status + force-HTTPS toggle (admin)
    auth.php              login / logout / change password
    data/                 runtime data, denied by .htaccess AND a PHP guard line
```

The PHP code reads these environment variables (all optional; the Docker image sets
them for Cloud Run): `EVOCATI_PLATFORM` (`cpanel`|`firebase`), `EVOCATI_DATA_DIR`,
`EVOCATI_SESSION_DIR`, `EVOCATI_SESSION_NAME` (Firebase only forwards `__session`),
`EVOCATI_TRUST_PROXY=1` (read visitor IP/host from `X-Forwarded-*`), `EVOCATI_HTACCESS`.

Security notes: admin session cookie is HttpOnly + SameSite=Strict; every write
needs the `X-Requested-With: evocati` header; login is limited to 5 tries / 15 min
and the contact form to 5 requests / hour per IP; the SMTP password is never sent
back to the browser; force-HTTPS refuses to turn on without a valid certificate.
