import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, Loader2, Mail, Phone, Send } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { Button } from '../components/Button'
import { useGoToSection } from '../lib/useGoToSection'
import { telHref } from '../lib/tel'
import { rich, t } from '../content/text'
import { preloadRecaptcha, sendContactRequest, type ContactRequest } from '../lib/contact'

// One page: the message, then the contact section. All copy is in src/content/content.ts.

export default function Home() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [location.hash])

  return (
    <>
      <Hero />
      <Contact />
    </>
  )
}

function Hero() {
  const reduce = useReducedMotion()
  const goTo = useGoToSection()
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
  })

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)]" />

      <div className="container-page relative mx-auto max-w-4xl text-center">
        <motion.p {...fadeUp(0)} className="eyebrow">
          {t('hero.eyebrow')}
        </motion.p>

        <motion.h1 {...fadeUp(0.05)} className="t-hero mt-5 sm:mt-6">
          {rich(t('hero.title'))}
        </motion.h1>

        <motion.div {...fadeUp(0.15)} className="t-lead mx-auto mt-6 max-w-2xl text-slate-300 sm:mt-8">
          <p>{t('hero.p1')}</p>
          <p className="mt-1 font-semibold text-white">{t('hero.p2')}</p>
        </motion.div>

        <motion.div {...fadeUp(0.3)} className="mx-auto mt-10 max-w-2xl sm:mt-14">
          <p className="t-h2 text-gold-300">{t('hero.question')}</p>
          <p className="t-body mt-3 text-slate-400 sm:mt-4">{t('hero.invite')}</p>
        </motion.div>

        <motion.div
          {...fadeUp(0.4)}
          className="mx-auto mt-8 flex max-w-xs flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <a
            href={telHref(t('contact.phone'))}
            className="gold-gradient shimmer relative inline-flex overflow-hidden items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink-950 shadow-glow hover:brightness-110"
          >
            <Phone size={17} /> {t('cta.call')}: {t('contact.phone')}
          </a>
          <Button variant="outline" onClick={() => goTo('contact')}>
            {t('cta.write')} <ArrowDown size={17} />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

function Contact() {
  const phone = t('contact.phone')
  const email = t('contact.email')
  return (
    <section id="contact" className="section scroll-mt-16">
      <div className="container-page">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-ink-850 to-ink-900 p-5 sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <h2 className="t-h2">{t('cs.title')}</h2>
                <p className="t-lead mt-3 text-slate-200">{t('cs.lead')}</p>
                <ul className="mt-6 space-y-3 sm:mt-8">
                  <li>
                    <a href={telHref(phone)} className="t-h3 inline-flex items-center gap-3 text-white hover:text-gold-300">
                      <Phone size={22} className="text-gold-400" /> {phone}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${email}`} className="inline-flex items-center gap-3 break-all text-slate-300 hover:text-gold-300">
                      <Mail size={18} className="shrink-0 text-gold-400" /> {email}
                    </a>
                  </li>
                </ul>
              </div>
              <ContactForm />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

// text-base (16px) on inputs stops iOS Safari from zooming in on focus.
const inputCls =
  'w-full rounded-xl border border-white/10 bg-ink-950/60 px-3.5 py-2.5 text-base text-white placeholder:text-slate-500 focus:border-gold-400/50 focus:outline-none focus:ring-2 focus:ring-gold-400/20 sm:px-4 sm:py-3 sm:text-sm'

type FormState = { status: 'idle' | 'sending' | 'sent' } | { status: 'error'; message: string }

// Sent to the contactForm Cloud Function, which emails office@ (see src/lib/contact.ts).
function ContactForm() {
  const [state, setState] = useState<FormState>({ status: 'idle' })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    // Bots fill the hidden "website" field; pretend success and drop it.
    if (data.website) {
      setState({ status: 'sent' })
      return
    }
    const field = (k: keyof ContactRequest) => (data[k] ?? '').trim()
    setState({ status: 'sending' })
    try {
      await sendContactRequest({
        lastName: field('lastName'),
        firstName: field('firstName'),
        company: field('company'),
        phone: field('phone'),
        email: field('email'),
        amount: field('amount'),
        message: field('message'),
      })
      form.reset()
      setState({ status: 'sent' })
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'eroare necunoscută' })
    }
  }

  return (
    <form onSubmit={onSubmit} onFocus={preloadRecaptcha} className="space-y-2.5 sm:space-y-3">
      {/* Honeypot: hidden from people, bots fill it in and get dropped. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <input required name="lastName" maxLength={80} placeholder="Nume" autoComplete="family-name" className={inputCls} />
        <input required name="firstName" maxLength={80} placeholder="Prenume" autoComplete="given-name" className={inputCls} />
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <input required name="phone" type="tel" maxLength={40} placeholder="Telefon" autoComplete="tel" className={inputCls} />
        <input required name="email" type="email" maxLength={160} placeholder="Email" autoComplete="email" className={inputCls} />
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <input name="company" maxLength={160} placeholder="Companie" autoComplete="organization" className={inputCls} />
        <input name="amount" maxLength={60} placeholder="Valoarea creanței (lei)" inputMode="numeric" className={inputCls} />
      </div>
      <textarea name="message" rows={3} maxLength={4000} placeholder="Descrie pe scurt situația" className={inputCls} />
      <Button type="submit" variant="primary" className="w-full" disabled={state.status === 'sending'}>
        {state.status === 'sending' ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}{' '}
        {t('cs.button')}
      </Button>
      {state.status === 'sent' && <p className="text-center text-sm text-emerald-400">{t('cs.success')}</p>}
      {state.status === 'error' && (
        <p className="text-center text-sm text-red-400">
          Mesajul nu a putut fi trimis: {state.message}. Ne poți suna la {t('contact.phone')}.
        </p>
      )}
      {/* The reCAPTCHA badge is hidden (index.css); Google then requires this notice. */}
      <p className="text-center text-[11px] leading-snug text-slate-500">
        Protejat de reCAPTCHA. Se aplică{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-slate-300">
          Politica de confidențialitate
        </a>{' '}
        și{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-slate-300">
          Termenii
        </a>{' '}
        Google.
      </p>
    </form>
  )
}
