import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Compass,
  Eye,
  Gauge,
  Handshake,
  Loader2,
  Lock,
  Send,
  Target,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import StatCounter from '../components/StatCounter'
import { Button } from '../components/Button'
import { useGoToSection } from '../lib/useGoToSection'
import { list, rich, t } from '../content/text'
import { preloadRecaptcha, sendContactRequest, type ContactRequest } from '../lib/contact'

// Mobile-first: every section is designed for a ~375px screen, then widened with
// sm:/lg: breakpoints. Type sizes come from the fluid scale in index.css (.t-*).
// All copy comes from src/content/content.ts.

// Shared stagger variants: a container reveals its children one after another.
const staggerGroup: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}
const inViewProps = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-60px' },
} as const

const gold = 'text-gold-400'

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
      <Impact />
      <ShortCta n={1} />
      <About />
      <WhyEvocati />
      <Advantages />
      <Process />
      <ShortCta n={2} />
      <ClaimTypes />
      <Numbers />
      <BeyondNotice />
      <Negotiation />
      <Audience />
      <ShortCta n={3} />
      <Different />
      <Team />
      <Confidentiality />
      <ShortCta n={4} />
      <Contact />
    </>
  )
}

/* ─────────────────────────────── SHARED ─────────────────────────────── */
function SectionHeading({
  eyebrow,
  title,
  center = false,
}: {
  eyebrow: string
  title: string
  center?: boolean
}) {
  return (
    <AnimatedSection className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="t-h2 mt-2.5 sm:mt-3">{rich(title)}</h2>
    </AnimatedSection>
  )
}

// Rows of a 'lines' field as paragraphs.
function Paragraphs({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i} className={i > 0 ? `mt-2 ${className}` : className}>
          {rich(p, gold)}
        </p>
      ))}
    </>
  )
}

// On phones: a horizontal, swipeable row of cards. From `sm` up: a regular grid.
function SwipeRow({ children, cols }: { children: ReactNode; cols: string }) {
  return (
    <>
      <motion.div
        variants={staggerGroup}
        {...inViewProps}
        className={`no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 ${cols}`}
      >
        {children}
      </motion.div>
      <p className="mt-3 text-center text-[11px] uppercase tracking-widest text-slate-500 sm:hidden">
        Glisează pentru mai mult →
      </p>
    </>
  )
}
const swipeItem = 'w-[80%] shrink-0 snap-center sm:w-auto'

// Pills used for short word lists ("Strategie.", "Presiune." …).
function Pills({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'gold' }) {
  const cls =
    tone === 'gold'
      ? 'border-gold-500/25 bg-gold-500/[0.07] text-slate-100'
      : 'border-white/10 bg-white/5 text-slate-200'
  return (
    <motion.ul variants={staggerGroup} {...inViewProps} className="flex flex-wrap gap-2">
      {items.map((t, i) => (
        <motion.li
          key={i}
          variants={staggerItem}
          className={`rounded-full border px-3 py-1.5 text-[0.8rem] font-medium sm:px-4 sm:py-2 sm:text-sm ${cls}`}
        >
          {t}
        </motion.li>
      ))}
    </motion.ul>
  )
}

function CheckList({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-1.5">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-gold-400" /> {t}
        </li>
      ))}
    </ul>
  )
}

function ShortCta({ n }: { n: number }) {
  const goTo = useGoToSection()
  return (
    <section className="border-y border-gold-500/10 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900">
      <AnimatedSection className="container-page flex items-center justify-between gap-4 py-5 sm:py-9">
        <p className="font-display text-[0.95rem] font-extrabold uppercase leading-snug text-white sm:text-2xl lg:text-3xl">
          {t(`banner.${n}.title`)}{' '}
          <span className="block text-gold-400 sm:inline">{t(`banner.${n}.text`)}</span>
        </p>
        <button
          onClick={() => goTo('contact')}
          aria-label={t('cta.primary')}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold-500/40 text-gold-300 transition-colors hover:bg-gold-500/10 sm:hidden"
        >
          <ArrowRight size={18} />
        </button>
        <Button variant="outline" className="hidden shrink-0 sm:inline-flex" onClick={() => goTo('contact')}>
          {t('cta.primary')} <ArrowRight size={17} />
        </Button>
      </AnimatedSection>
    </section>
  )
}

/* ─────────────────────────────── 1. HERO ─────────────────────────────── */
function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const goTo = useGoToSection()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Scroll-linked parallax. Layers move at different speeds as you scroll away.
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 70])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const px = (v: typeof glowY) => (reduce ? undefined : v)

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
  })

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-32"
    >
      {/* Parallax backdrop layers */}
      <motion.div style={{ y: px(glowY) }} className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <motion.div
        style={{ y: px(gridY) }}
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)]"
      />

      <div className="container-page relative">
        <motion.div
          style={{ y: px(contentY), opacity: px(contentOpacity) }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p {...fadeUp(0)} className="eyebrow mx-auto max-w-[18rem] sm:max-w-none">
            {t('hero.eyebrow')}
          </motion.p>

          <motion.h1 {...fadeUp(0.05)} className="t-hero mx-auto mt-5 max-w-4xl sm:mt-6">
            {rich(t('hero.title'))}
          </motion.h1>

          <motion.p {...fadeUp(0.15)} className="t-lead mx-auto mt-5 max-w-xl text-slate-200 sm:mt-7">
            {t('hero.lead')}
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="t-body mx-auto mt-4 max-w-xl text-slate-400 sm:mt-6">
            <p>{t('hero.line1')}</p>
            <p className="font-medium text-white">{t('hero.line2')}</p>
            <p className="mt-3 sm:mt-1">{t('hero.line3')}</p>
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:gap-4">
            <p className="font-display text-[0.95rem] font-bold text-white sm:text-lg">{t('hero.question')}</p>
            <Button variant="primary" className="w-full sm:w-auto" onClick={() => goTo('contact')}>
              {t('cta.primary')} <ArrowRight size={18} />
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mx-auto mt-8 grid max-w-xs gap-2 text-left text-[0.8rem] text-slate-400 sm:mt-10 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-6 sm:text-sm"
          >
            {list('hero.proof').map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-gold-400" /> {item}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.button
        type="button"
        onClick={() => goTo('impact')}
        aria-label="Derulează"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute inset-x-0 bottom-7 mx-auto hidden w-fit text-slate-500 transition-colors hover:text-gold-300 sm:block"
      >
        <motion.span
          animate={reduce ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-xs"
        >
          Derulează
          <ChevronDown size={18} />
        </motion.span>
      </motion.button>
    </section>
  )
}

/* ─────────────────────────────── 2. IMPACT ─────────────────────────────── */
function Impact() {
  return (
    <section id="impact" className="section scroll-mt-20">
      <div className="container-page grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12">
        <AnimatedSection>
          <h2 className="t-h2 text-slate-500">{t('impact.title1')}</h2>
          <p className="t-h2 mt-3">{rich(t('impact.title2'))}</p>
          <p className="t-body mt-5 max-w-xl text-slate-400 sm:mt-8">{t('impact.text')}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="card p-5 sm:p-8">
          <p className="text-[11px] uppercase tracking-widest text-slate-500 sm:text-sm">{t('impact.label')}</p>
          <div className="mt-3 sm:mt-4">
            <Pills tone="gold" items={list('impact.pills')} />
          </div>
          <p className="t-body mt-4 text-slate-300">{t('impact.after')}</p>
          <p className="t-quote mt-5 border-t border-white/5 pt-5 text-gold-400">{t('impact.quote')}</p>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 3. CINE SUNTEM ─────────────────────────────── */
function About() {
  return (
    <section id="despre" className="section scroll-mt-20 border-y border-white/5 bg-ink-900/40">
      <div className="container-page grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <AnimatedSection>
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <h2 className="mt-2.5 font-display text-4xl font-extrabold text-white sm:text-6xl">{t('about.title')}</h2>
          <p className="t-quote mt-2 text-gold-400">{t('about.tagline')}</p>
          <p className="t-body mt-5 text-slate-300">{t('about.p1')}</p>
          <p className="t-body mt-3 text-slate-400">{t('about.p2')}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="space-y-3 sm:space-y-4">
          <div className="t-sm rounded-2xl border border-white/5 bg-ink-900/60 p-4 text-slate-400 sm:p-6">
            {list('about.not').map((p, i) => (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>
                {p}
              </p>
            ))}
          </div>
          <div className="card border-gold-500/20 p-4 sm:p-6">
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {list('about.steps').map((s, i) => (
                <li key={i} className="rounded-xl bg-ink-900/70 p-3">
                  <span className="text-[11px] font-bold text-gold-500">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-0.5 text-[0.8rem] font-semibold leading-snug text-white sm:text-sm">{s}</p>
                </li>
              ))}
            </ol>
            <p className="t-sm mt-4 text-slate-400">{t('about.note')}</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 4. DE CE EVOCATI ─────────────────────────────── */
function WhyEvocati() {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading eyebrow={t('why.eyebrow')} title={t('why.title')} />
        <motion.div
          variants={staggerGroup}
          {...inViewProps}
          className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-4 lg:grid-cols-4"
        >
          {list('why.cards').map((c, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex h-full flex-col gap-2 rounded-2xl border border-red-500/25 bg-gradient-to-b from-red-500/[0.10] to-ink-850 p-3.5 text-[0.8rem] leading-snug text-red-50 shadow-card sm:flex-row sm:gap-3 sm:p-6 sm:text-base"
            >
              <AlertTriangle size={18} className="shrink-0 text-red-400 sm:mt-0.5" />
              {c}
            </motion.div>
          ))}
        </motion.div>
        <AnimatedSection className="mt-7 sm:mt-10">
          <p className="t-body text-slate-400">{t('why.lead')}</p>
          <p className="t-quote mt-1.5 text-white sm:text-3xl">{rich(t('why.quote'), gold)}</p>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 5. AVANTAJE ─────────────────────────────── */
const advantageIcons = [Award, Compass, Handshake, Gauge, Eye, Target]

function Advantages() {
  return (
    <section id="avantaje" className="section scroll-mt-20 border-y border-white/5 bg-ink-900/40">
      <div className="container-page">
        <SectionHeading eyebrow={t('adv.eyebrow')} title={t('adv.title')} center />
        <div className="mt-7 sm:mt-14">
          <SwipeRow cols="sm:grid-cols-2 lg:grid-cols-3">
            {advantageIcons.map((Icon, i) => (
              <motion.div key={i} variants={staggerItem} className={`${swipeItem} card group p-5 sm:p-6`}>
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500/20 sm:h-12 sm:w-12">
                  <Icon size={20} />
                </div>
                <h3 className="t-h3 mt-4 uppercase tracking-wide sm:mt-5">{t(`adv.${i + 1}.title`)}</h3>
                {list(`adv.${i + 1}.text`).map((p, j) => (
                  <p key={j} className="t-sm mt-1.5 text-slate-400">
                    {p}
                  </p>
                ))}
              </motion.div>
            ))}
          </SwipeRow>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 6. PROCES ─────────────────────────────── */
function StepBody({ n }: { n: number }) {
  if (n !== 2) return <Paragraphs items={list(`step.${n}.text`)} />
  return (
    <>
      <Paragraphs items={list('step.2.text')} />
      <div className="mt-3">
        <Pills items={list('step.2.pills')} />
      </div>
      <div className="mt-3 text-slate-200">
        <Paragraphs items={list('step.2.after')} />
      </div>
    </>
  )
}

// Phones: an accordion (one step open at a time) so the 5 steps don't become a wall of
// text. From `sm` up every step is expanded and the toggle is inert.
function Process() {
  const [open, setOpen] = useState(0)
  return (
    <section id="proces" className="section scroll-mt-20">
      <div className="container-page">
        <SectionHeading eyebrow={t('process.eyebrow')} title={t('process.title')} center />

        <div className="relative mx-auto mt-8 max-w-3xl sm:mt-16">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute bottom-8 left-8 top-8 hidden w-px origin-top bg-gradient-to-b from-gold-500/50 via-gold-500/20 to-transparent sm:block"
          />
          <motion.ol variants={staggerGroup} {...inViewProps} className="space-y-2.5 sm:space-y-10">
            {[1, 2, 3, 4, 5].map((n, i) => {
              const isOpen = open === i
              const title = t(`step.${n}.title`)
              return (
                <motion.li
                  key={n}
                  variants={staggerItem}
                  className={`relative rounded-2xl border transition-colors sm:flex sm:gap-6 sm:border-0 sm:bg-transparent ${
                    isOpen ? 'border-gold-500/25 bg-ink-850/80' : 'border-white/5 bg-ink-900/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3.5 p-3.5 text-left sm:pointer-events-none sm:w-auto sm:p-0"
                  >
                    <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-ink-850 font-display text-sm font-extrabold text-gold-400 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-xl sm:shadow-glow">
                      {String(n).padStart(2, '0')}
                    </span>
                    <span className="t-h3 flex-1 uppercase tracking-wide sm:hidden">{title}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-500 transition-transform sm:hidden ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className={`${isOpen ? 'block' : 'hidden'} px-3.5 pb-4 sm:block sm:px-0 sm:pb-0 sm:pt-3`}>
                    <h3 className="t-h3 hidden uppercase tracking-wide sm:block">{title}</h3>
                    <div className="t-sm text-slate-400 sm:mt-2">
                      <StepBody n={n} />
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </motion.ol>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 7. TIPURI DE CREANȚE ─────────────────────────────── */
function ClaimTypes() {
  const goTo = useGoToSection()
  return (
    <section id="creante" className="section scroll-mt-20">
      <div className="container-page">
        <SectionHeading eyebrow={t('claims.eyebrow')} title={t('claims.title')} center />
        <AnimatedSection className="mx-auto mt-4 max-w-2xl text-center sm:mt-6">
          <p className="t-body text-slate-400">{t('claims.text')}</p>
        </AnimatedSection>

        <div className="mx-auto mt-6 flex max-w-3xl justify-center sm:mt-10 [&_ul]:justify-center">
          <Pills tone="gold" items={list('claims.sectors')} />
        </div>

        <AnimatedSection className="mx-auto mt-8 max-w-2xl rounded-3xl border border-gold-500/25 bg-gradient-to-br from-gold-500/[0.08] to-ink-850 p-6 text-center shadow-glow sm:mt-14 sm:p-8">
          <p className="t-quote text-white sm:text-3xl">{rich(t('claims.ctaTitle'), gold)}</p>
          <p className="t-body mt-1.5 text-slate-300">{t('claims.ctaText')}</p>
          <Button variant="primary" className="mt-5 w-full sm:mt-6 sm:w-auto" onClick={() => goTo('contact')}>
            {t('cta.primary')} <ArrowRight size={17} />
          </Button>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 8. CIFRE ─────────────────────────────── */
// "10+" style values count up; anything else is shown as typed.
function StatValue({ value }: { value: string }) {
  const m = value.match(/^(\d+)(\+?%?)$/)
  return m ? <StatCounter value={Number(m[1])} suffix={m[2]} /> : <>{value}</>
}

function Numbers() {
  return (
    <section className="border-y border-white/5 bg-ink-900 py-14 sm:py-32">
      <div className="container-page">
        <AnimatedSection className="text-center">
          <h2 className="t-h2 text-slate-500 sm:text-6xl">{t('numbers.title1')}</h2>
          <p className="t-h2 mt-1 sm:text-6xl">{t('numbers.title2')}</p>
        </AnimatedSection>

        <motion.div
          variants={staggerGroup}
          {...inViewProps}
          className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:mt-16 sm:rounded-3xl lg:grid-cols-4"
        >
          {[1, 2, 3, 4].map((n) => (
            <motion.div
              key={n}
              variants={staggerItem}
              className="flex flex-col justify-center bg-ink-900 px-3 py-5 text-center sm:p-8"
            >
              <p className="font-display text-[1.35rem] font-extrabold uppercase leading-tight text-gold-400 sm:text-4xl xl:text-5xl">
                <StatValue value={t(`numbers.${n}.value`)} />
              </p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase leading-snug tracking-wider text-slate-400 sm:mt-3 sm:text-sm sm:tracking-widest">
                {t(`numbers.${n}.label`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 9. NU NE OPRIM LA NOTIFICARE ─────────────────────────────── */
function BeyondNotice() {
  return (
    <section className="section">
      <div className="container-page grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
        <SectionHeading eyebrow={t('beyond.eyebrow')} title={t('beyond.title')} />
        <AnimatedSection delay={0.1} className="t-body text-slate-400 sm:text-lg">
          <p>{t('beyond.p1')}</p>
          <p className="font-semibold text-white">{t('beyond.p2')}</p>
          <div className="mt-4 border-l-2 border-gold-500/30 pl-4 sm:mt-6">
            {list('beyond.steps').map((p, i) => (
              <p key={i}>{rich(p, gold)}</p>
            ))}
          </div>
          <p className="t-quote mt-5 text-gold-400 sm:mt-6">{t('beyond.quote')}</p>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 10–11. NEGOCIERE ─────────────────────────────── */
function Negotiation() {
  return (
    <section id="negociere" className="section scroll-mt-20 border-y border-white/5 bg-ink-900/40">
      <div className="container-page grid gap-4 sm:gap-8 lg:grid-cols-2">
        <AnimatedSection className="card h-full p-5 sm:p-10">
          <div className="flex items-center gap-2.5">
            <Handshake className="text-gold-400" size={20} />
            <p className="eyebrow">{t('nego.eyebrow')}</p>
          </div>
          <h2 className="t-h2 mt-3 !text-[clamp(1.1rem,0.9rem+1.4vw,1.9rem)]">{rich(t('nego.title'))}</h2>
          <div className="t-sm mt-4 text-slate-400 sm:mt-5 sm:text-base">
            <Paragraphs items={list('nego.text')} />
          </div>
          <CheckList
            items={list('nego.list')}
            className="mt-5 grid grid-cols-2 gap-2 text-[0.8rem] font-semibold text-white sm:text-sm"
          />
        </AnimatedSection>

        <AnimatedSection
          delay={0.1}
          className="h-full rounded-2xl border border-gold-500/25 bg-gradient-to-b from-gold-500/[0.07] to-ink-850 p-5 shadow-glow sm:p-10"
        >
          <div className="flex items-center gap-2.5">
            <Gauge className="text-gold-400" size={20} />
            <p className="eyebrow">{t('fail.eyebrow')}</p>
          </div>
          <h2 className="t-h2 mt-3 !text-[clamp(1.1rem,0.9rem+1.4vw,1.9rem)]">{rich(t('fail.title'))}</h2>
          <p className="t-sm mt-4 text-slate-300 sm:mt-5 sm:text-base">{t('fail.text')}</p>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 12–13. ANTREPRENORI / COMPANII MARI ─────────────────────────────── */
// Phones: a two-tab switch shows one audience at a time. From `sm` up: side by side.
function Audience() {
  const [tab, setTab] = useState<'ent' | 'corp'>('ent')
  const tabs = [
    { id: 'ent' as const, label: t('aud.tab1'), icon: Briefcase },
    { id: 'corp' as const, label: t('aud.tab2'), icon: Building2 },
  ]
  const show = (id: typeof tab) => (tab === id ? 'block' : 'hidden sm:block')

  return (
    <section className="section">
      <div className="container-page">
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-ink-900 p-1 sm:hidden">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[0.8rem] font-semibold transition-colors ${
                tab === tb.id ? 'gold-gradient text-ink-950' : 'text-slate-400'
              }`}
            >
              <tb.icon size={15} /> {tb.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <AnimatedSection className={`${show('ent')} card h-full p-5 sm:p-10`}>
            <Briefcase className="hidden text-gold-400 sm:block" size={28} />
            <p className="eyebrow sm:mt-6">{t('ent.eyebrow')}</p>
            <h2 className="t-h2 mt-3 !text-[clamp(1.2rem,0.9rem+1.6vw,1.9rem)]">{rich(t('ent.title'))}</h2>
            <p className="t-body mt-4 text-slate-300">{t('ent.text1')}</p>
            <p className="t-quote mt-3 text-gold-400">{t('ent.quote')}</p>
            <p className="t-sm mt-5 text-slate-400 sm:text-base">{t('ent.text2')}</p>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className={`${show('corp')} card h-full p-5 sm:p-10`}>
            <Building2 className="hidden text-gold-400 sm:block" size={28} />
            <p className="eyebrow sm:mt-6">{t('corp.eyebrow')}</p>
            <h2 className="t-h2 mt-3 !text-[clamp(1.05rem,0.85rem+1.4vw,1.9rem)]">{rich(t('corp.title'))}</h2>
            <p className="t-sm mt-4 text-slate-400 sm:mt-5">{t('corp.lead')}</p>
            <CheckList
              items={list('corp.list')}
              className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.8rem] leading-snug text-slate-200 sm:text-sm"
            />
            <p className="t-quote mt-5 text-gold-400">{t('corp.quote')}</p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 14–15. CE NE DIFERENȚIAZĂ ─────────────────────────────── */
function Different() {
  return (
    <section className="section">
      <div className="container-page grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHeading eyebrow={t('diff.eyebrow')} title={t('diff.title')} />
          <AnimatedSection delay={0.1} className="t-body mt-4 space-y-3 text-slate-400 sm:mt-6">
            <p>{t('diff.p1')}</p>
            <p className="text-slate-200">{t('diff.p2')}</p>
            <p className="t-quote text-gold-400">{t('diff.quote')}</p>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.15} className="rounded-2xl border border-white/5 bg-ink-900 p-5 sm:rounded-3xl sm:p-10">
          <h2 className="t-h2 text-slate-500">{t('verify.title1')}</h2>
          <p className="t-h2">{t('verify.title2')}</p>
          <CheckList
            items={list('verify.list')}
            className="mt-5 grid grid-cols-2 gap-2 text-[0.8rem] text-slate-300 sm:mt-6 sm:grid-cols-1 sm:text-base"
          />
          <p className="mt-5 border-t border-white/5 pt-5 text-[11px] uppercase tracking-widest text-slate-500 sm:mt-6 sm:pt-6 sm:text-sm">
            {t('verify.note')}
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 16. ECHIPA ─────────────────────────────── */
function Team() {
  return (
    <section id="echipa" className="section scroll-mt-20 border-y border-white/5 bg-ink-900/40">
      <div className="container-page grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
        <AnimatedSection>
          <p className="eyebrow">{t('team.eyebrow')}</p>
          <h2 className="t-h2 mt-2.5 sm:mt-3">{rich(t('team.title'))}</h2>
          <p className="t-body mt-4 text-slate-400 sm:mt-6">{t('team.p1')}</p>
          <p className="t-body mt-3 text-slate-400">{t('team.p2')}</p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="card p-5 sm:p-8">
          <Users className="hidden text-gold-400 sm:block" size={28} />
          <div className="sm:mt-6">
            <p className="t-body text-slate-200 sm:text-lg">{t('team.card')}</p>
            <p className="mt-3 font-display text-2xl font-extrabold uppercase text-gold-400 sm:mt-6 sm:text-3xl">
              {t('team.word')}
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

/* ─────────────────────────────── 17. CONFIDENȚIALITATE ─────────────────────────────── */
function Confidentiality() {
  return (
    <section className="section">
      <AnimatedSection className="container-page max-w-3xl sm:text-center">
        <div className="flex items-center gap-3 sm:flex-col sm:gap-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-500/25 bg-gold-500/10 text-gold-400 sm:h-14 sm:w-14 sm:rounded-2xl">
            <Lock size={20} />
          </div>
          <p className="eyebrow sm:mt-6">{t('conf.eyebrow')}</p>
        </div>
        <h2 className="t-h2 mt-4 sm:mt-3">{rich(t('conf.title'))}</h2>
        <p className="t-body mt-4 text-slate-400 sm:mt-6">{t('conf.p1')}</p>
        <p className="t-body mt-3 text-slate-400">{t('conf.p2')}</p>
        <p className="t-body mt-4 font-semibold text-slate-200 sm:mt-6">{t('conf.p3')}</p>
      </AnimatedSection>
    </section>
  )
}

/* ─────────────────────────────── 18. CTA / CONTACT ─────────────────────────────── */
function Contact() {
  return (
    <section id="contact" className="section scroll-mt-16">
      <div className="container-page">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-ink-850 to-ink-900 p-5 sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="relative grid items-center gap-7 lg:grid-cols-2 lg:gap-10">
              <div>
                <h2 className="t-h2">{rich(t('cs.title'))}</h2>
                <p className="t-lead mt-3 text-slate-200">{t('cs.lead')}</p>
                <p className="t-sm mt-4 max-w-md text-slate-400 sm:mt-6 sm:text-base">{t('cs.text')}</p>
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
      {/* Honeypot: hidden from people, bots fill it in and get dropped server-side. */}
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
      {state.status === 'error' && (
        <p className="text-center text-sm text-red-400">
          Mesajul nu a putut fi trimis: {state.message}. Ne poți suna la {t('contact.phone')}.
        </p>
      )}
    </form>
  )
}
