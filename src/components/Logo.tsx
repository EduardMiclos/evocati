import { Link } from 'react-router-dom'
import logo from '../assets/logo-evocati.png'

export default function Logo({ className = 'h-10 sm:h-11' }: { className?: string }) {
  return (
    <Link to="/" aria-label="Evocati, pagina principală" className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90">
      <img src={logo} alt="Evocati" width={444} height={120} className={`w-auto ${className}`} />
    </Link>
  )
}
