import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { useGoToSection } from '../lib/useGoToSection'
import { list, t } from '../content/text'

export default function Footer() {
  const goTo = useGoToSection()
  const linkCls = 'text-left hover:text-gold-300'
  const phone = t('contact.phone')
  const email = t('contact.email')
  return (
    <footer className="relative border-t border-white/5 bg-ink-900">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo className="h-12" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            {list('footer.tagline').map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </p>
          <p className="mt-4 font-display text-sm font-extrabold tracking-wide text-gold-400">{t('footer.motto')}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Evocati</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li><button onClick={() => goTo('despre')} className={linkCls}>Cine suntem</button></li>
            <li><button onClick={() => goTo('proces')} className={linkCls}>Cum recuperăm</button></li>
            <li><button onClick={() => goTo('creante')} className={linkCls}>Tipuri de creanțe</button></li>
            <li><button onClick={() => goTo('contact')} className={linkCls}>{t('cta.primary')}</button></li>
          </ul>
        </div>

        <div className="order-last col-span-2 md:order-none md:col-span-1">
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {phone && (
              <li>
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 hover:text-gold-300">
                  <Phone size={15} className="text-gold-500" /> {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-2 break-all hover:text-gold-300">
                  <Mail size={15} className="shrink-0 text-gold-500" /> {email}
                </a>
              </li>
            )}
            {t('contact.address') && (
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-gold-500" /> {t('contact.address')}
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li><Link to="/termeni" className="hover:text-gold-300">Termeni și condiții</Link></li>
            <li><Link to="/confidentialitate" className="hover:text-gold-300">Politica de confidențialitate</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Evocati — Recuperări creanțe comerciale. Toate drepturile rezervate.</p>
          <p className="max-w-md">{t('footer.bottom')}</p>
        </div>
      </div>
    </footer>
  )
}
