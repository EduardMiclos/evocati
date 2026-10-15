import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline'

interface BaseProps {
  children: ReactNode
  variant?: Variant
  className?: string
}

const base =
  'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 disabled:opacity-60 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'gold-gradient text-ink-950 shadow-glow hover:brightness-110 shimmer',
  outline:
    'border border-white/15 text-white hover:border-gold-400/60 hover:text-gold-300',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
}

const motionProps = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled,
}: BaseProps & {
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <motion.button
      {...motionProps}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
}

export function ButtonLink({
  children,
  variant = 'primary',
  className = '',
  to,
}: BaseProps & { to: string }) {
  const MotionLink = motion(Link)
  return (
    <MotionLink
      {...motionProps}
      to={to}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </MotionLink>
  )
}
