import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Smoothly scroll to a section by id. Because the app uses HashRouter, we must
// NOT use plain `href="#id"` anchors (that would change the route, not scroll).
// If we're on another route, navigate home first, then scroll once it mounts.
export function useGoToSection() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return useCallback(
    (id: string) => {
      const scroll = () =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      if (pathname !== '/') {
        navigate('/')
        setTimeout(scroll, 150)
      } else {
        scroll()
      }
    },
    [navigate, pathname],
  )
}
