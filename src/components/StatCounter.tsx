import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// Counts up from 0 to `value` when scrolled into view.
export default function StatCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.8,
}: {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(display).toLocaleString('ro-RO')}
      {suffix}
    </span>
  )
}
