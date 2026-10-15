import { motion, useScroll, useSpring } from 'framer-motion'

// Thin gold bar pinned to the top that fills as the page is scrolled.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500"
    />
  )
}
