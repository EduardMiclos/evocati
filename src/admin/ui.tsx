import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

// Shared building blocks for the admin dashboard.

// text-base on phones avoids iOS zoom-on-focus.
export const inputCls =
  'w-full rounded-lg border border-white/10 bg-ink-950/70 px-3 py-2 text-base text-white placeholder:text-slate-600 focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20 disabled:opacity-50 sm:text-sm'

export function Card({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/5 bg-ink-850/70 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-white sm:text-lg">{title}</h2>
          {description && <div className="mt-1 text-sm text-slate-400">{description}</div>}
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function FieldRow({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: ReactNode
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

const tones = {
  ok: { cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200', Icon: CheckCircle2 },
  error: { cls: 'border-red-500/30 bg-red-500/10 text-red-200', Icon: AlertTriangle },
  warn: { cls: 'border-amber-500/30 bg-amber-500/10 text-amber-100', Icon: AlertTriangle },
  info: { cls: 'border-sky-500/25 bg-sky-500/10 text-sky-100', Icon: Info },
}

export function Notice({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  const { cls, Icon } = tones[tone]
  return (
    <div className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${cls}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function PrimaryButton({
  children,
  busy,
  disabled,
  onClick,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  busy?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {busy && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  busy,
  disabled,
  onClick,
  className = '',
}: {
  children: ReactNode
  busy?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-gold-400/50 hover:text-gold-200 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {busy && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export function Spinner() {
  return (
    <div className="grid place-items-center py-16 text-slate-500">
      <Loader2 className="animate-spin" size={26} />
    </div>
  )
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Eroare necunoscută')
