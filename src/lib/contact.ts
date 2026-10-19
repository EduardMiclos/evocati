// "Solicită o analiză" → the contactForm Cloud Function (same as the old site), which
// checks the reCAPTCHA token and emails office@evocati-legal.ro.
const ENDPOINT = 'https://europe-west1-evocati-website.cloudfunctions.net/contactForm'
// Public site key (reCAPTCHA v3); the secret half lives in the Cloud Function.
const RECAPTCHA_SITE_KEY = '6LeqXw4sAAAAAMLk43p7DgeuK4cgFNGexG9TwHjF'

export interface ContactRequest {
  lastName: string
  firstName: string
  company: string
  phone: string
  email: string
  amount: string
  message: string
}

declare global {
  interface Window {
    grecaptcha?: {
      ready(cb: () => void): void
      execute(siteKey: string, options: { action: string }): Promise<string>
    }
  }
}

let recaptcha: Promise<void> | null = null

// The reCAPTCHA script is only loaded once someone starts filling in the form.
function loadRecaptcha(): Promise<void> {
  recaptcha ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    s.async = true
    s.onload = () => window.grecaptcha?.ready(resolve)
    s.onerror = () => {
      recaptcha = null
      reject(new Error('protecția anti-spam nu s-a putut încărca'))
    }
    document.head.appendChild(s)
  })
  return recaptcha
}

export function preloadRecaptcha() {
  loadRecaptcha().catch(() => undefined)
}

export async function sendContactRequest(form: ContactRequest): Promise<void> {
  await loadRecaptcha()
  const recaptchaToken = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })

  // The function emails only these fields, so company and amount go at the top of the message.
  const details = [
    form.company && `Companie: ${form.company}`,
    form.amount && `Valoarea creanței: ${form.amount}`,
  ].filter(Boolean)
  const message = [...details, ...(details.length && form.message ? [''] : []), form.message].join('\n').trim()

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lastName: form.lastName,
      firstName: form.firstName,
      email: form.email,
      phone: form.phone,
      message: message || '(fără mesaj)',
      recaptchaToken,
    }),
  })
  const reply = await res.text()
  // The function answers "Sended" on success (same contract as the old site).
  if (!res.ok || !reply.includes('Sended')) {
    throw new Error(res.ok ? 'serverul nu a confirmat trimiterea' : `eroare server (${res.status})`)
  }
}
