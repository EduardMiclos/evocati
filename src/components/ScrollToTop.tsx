import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scrolls to top on route change (unless navigating to an in-page hash anchor).
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
