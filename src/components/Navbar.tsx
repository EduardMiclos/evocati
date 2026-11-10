import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { telHref } from '../lib/tel'
import { t } from '../content/text'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/5 bg-ink-950/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Logo />
        <a
          href={telHref(t('contact.phone'))}
          className="gold-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink-950 hover:brightness-110 sm:px-5 sm:py-2.5"
        >
          <Phone size={16} /> {t('cta.call')}
        </a>
      </nav>
    </header>
  )
}
