import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { telHref } from '../lib/tel'
import { t } from '../content/text'

export default function Footer() {
  const phone = t('contact.phone')
  const email = t('contact.email')
  return (
    <footer className="relative border-t border-white/5 bg-ink-900">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <Logo className="h-12" />
          <p className="mt-4 text-sm text-slate-400">{t('cs.lead')}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>
              <a href={telHref(phone)} className="flex items-center gap-2 hover:text-gold-300">
                <Phone size={15} className="text-gold-500" /> {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="flex items-center gap-2 break-all hover:text-gold-300">
                <Mail size={15} className="shrink-0 text-gold-500" /> {email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={15} className="text-gold-500" /> {t('contact.address')}
            </li>
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
        <p className="container-page py-5 text-center text-xs text-slate-500 sm:text-left">
          © {new Date().getFullYear()} {t('site.title')}. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  )
}
