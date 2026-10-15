import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { Button } from './Button'
import { useGoToSection } from '../lib/useGoToSection'
import { t } from '../content/text'

const links = [
  { label: 'Cine suntem', id: 'despre' },
  { label: 'Avantaje', id: 'avantaje' },
  { label: 'Cum recuperăm', id: 'proces' },
  { label: 'Creanțe', id: 'creante' },
  { label: 'Echipa', id: 'echipa' },
  { label: 'Contact', id: 'contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const goToSection = useGoToSection()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu, then smoothly scroll to the target section.
  const goTo = (id: string) => {
    setOpen(false)
    goToSection(id)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/5 bg-ink-950/80 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => goTo(l.id)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="primary" className="px-5 py-2.5" onClick={() => goTo('contact')}>
            {t('cta.primary')}
          </Button>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white lg:hidden"
          aria-label="Meniu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5 bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => goTo(l.id)}
                  className="rounded-xl px-4 py-3 text-left text-base font-medium text-slate-200 hover:bg-white/5"
                >
                  {l.label}
                </button>
              ))}
              <Button variant="primary" className="mt-2 w-full" onClick={() => goTo('contact')}>
                {t('cta.primary')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
