import { Link } from 'react-router-dom'

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-gold-500/30 bg-gradient-to-br from-ink-700 to-ink-850 shadow-glow transition-transform group-hover:scale-105">
        <span className="font-display text-lg font-extrabold text-gold-400">E</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Evocati
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold-500/80">
            Recuperări creanțe
          </span>
        </span>
      )}
    </Link>
  )
}
