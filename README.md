# Evocati

Presentation site for Evocati, recuperări creanțe comerciale.
React + Vite + Tailwind, hosted on Firebase. Fully static: no server, no admin panel.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production files in dist/
```

Another port? `PORT=8080 npm run dev`

## Change a text

Every text on the site lives in **`src/content/content.ts`**.

1. Edit the text.
2. Commit and push to `main`.
3. The site is live about a minute later.

Wrap words in stars to make them gold: `'Creanțele nu se recuperează *singure.*'`
In multi-line texts, each line becomes its own line, list item or paragraph.

## The contact form

"Solicită o analiză" saves the request in Firestore (collection `mail`). The Firebase
**Trigger Email** extension picks it up and emails it to `CONTACT_FORM_TO` in
`src/config.ts`. Every request also stays in the Firebase console, even if an email fails.

`firestore.rules` only lets the browser add a message addressed to that one inbox, so
nobody can use the form to send email anywhere else. Changing the inbox? Update it in
both `src/config.ts` and `firestore.rules`. The build fails if they don't match.

## Going live (once)

**1. Firebase project**
- Create a project at [console.firebase.google.com](https://console.firebase.google.com).
- Switch to the **Blaze** plan (the email extension needs it; normal traffic stays free).
- **Firestore Database** > Create database > location `eur3 (europe)` > production mode.
- **Hosting** > Get started (just click through, the deploy does the rest).

**2. Email extension**

Extensions > **Trigger Email from Firestore** > Install:

| Setting | Value |
|---|---|
| Firestore location | the one you picked above |
| SMTP connection URI | `smtps://site@yourdomain.ro@mail.yourdomain.ro:465` |
| SMTP password | the mailbox password |
| Email documents collection | `mail` |
| Default FROM address | `Evocati <site@yourdomain.ro>` |

Use port 465 or 587. Google Cloud blocks port 25.

**3. Let GitHub deploy**

Google Cloud console > IAM > Service accounts > create `github-deployer` with roles
*Firebase Hosting Admin*, *Firebase Rules Admin*, *Cloud Datastore Viewer* and
*Service Usage Consumer*. Then Keys > Add key > JSON, and:

```bash
gh secret set FIREBASE_SERVICE_ACCOUNT < key.json
gh variable set FIREBASE_PROJECT_ID --body your-project-id
rm key.json
```

If a deploy ever fails on permissions, give the account *Firebase Admin* instead.

**4. Ship it**

Push to `main`, or GitHub > Actions > Deploy > Run workflow.
Then Hosting > **Add custom domain** for your own domain. SSL is automatic.

## How deploys work

`.github/workflows/deploy.yml` builds the site on every push and pull request. On
`main` it also deploys `dist/` to Firebase Hosting and `firestore.rules` to Firestore.

## Project map

```
src/content/content.ts   all texts
src/content/legal.ts     Termeni și condiții + Politica de confidențialitate
src/config.ts            inbox for the contact form
src/pages/Home.tsx       homepage sections
src/lib/contact.ts       sends the form to Firestore
firestore.rules          what the browser may write
firebase.json            hosting + rules config
```

## Testing the form locally

Copy `.env.example` to `.env.local` and fill in your Firebase web config, or point it
at the emulator: `npx firebase-tools emulators:start` (needs Java and Node 20+).

## Not on Firebase?

`dist/` is plain static files and runs on any host, including cPanel (`public/.htaccess`
is included). The contact form still talks to Firebase: set the `VITE_FIREBASE_*`
values from `.env.example` when building.
