import { CONTACT_FORM_TO } from '../config'

export interface ContactRequest {
  name: string
  company: string
  phone: string
  email: string
  amount: string
  message: string
}

// On Firebase Hosting the project's web config is served at this reserved URL, so the
// build needs no keys. VITE_FIREBASE_* (in .env.local) override it for local testing.
async function firebaseConfig() {
  const env = import.meta.env
  if (env.VITE_FIREBASE_PROJECT_ID) {
    return { apiKey: env.VITE_FIREBASE_API_KEY, projectId: env.VITE_FIREBASE_PROJECT_ID, appId: env.VITE_FIREBASE_APP_ID }
  }
  const res = await fetch('/__/firebase/init.json')
  if (!res.ok) throw new Error('formularul nu este configurat pe acest server')
  return res.json()
}

let emulatorConnected = false

// Adds a document to the `mail` collection; the Firebase "Trigger Email" extension
// sends it to CONTACT_FORM_TO. Firebase is loaded only when a form is actually sent.
export async function sendContactRequest(form: ContactRequest): Promise<void> {
  const [{ getApps, initializeApp }, fs] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore/lite'),
  ])
  const app = getApps()[0] ?? initializeApp(await firebaseConfig())
  const db = fs.getFirestore(app)
  const emulator = import.meta.env.VITE_FIRESTORE_EMULATOR
  if (emulator && !emulatorConnected) {
    const [host, port] = emulator.split(':')
    fs.connectFirestoreEmulator(db, host, Number(port))
    emulatorConnected = true
  }

  const text = [
    'Cerere nouă din formularul „Solicită o analiză”',
    '',
    `Nume:      ${form.name}`,
    `Companie:  ${form.company}`,
    `Telefon:   ${form.phone}`,
    `Email:     ${form.email}`,
    `Valoare:   ${form.amount}`,
    '',
    'Situația:',
    form.message,
  ].join('\n')

  await fs.addDoc(fs.collection(db, 'mail'), {
    to: CONTACT_FORM_TO,
    ...(form.email ? { replyTo: form.email } : {}),
    message: { subject: `Cerere nouă de analiză: ${form.name}`, text },
    form,
    createdAt: fs.serverTimestamp(),
  })
}
