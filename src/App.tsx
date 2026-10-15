import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import Home from './pages/Home'
import LegalPage from './pages/LegalPage'
import ScrollToTop from './components/ScrollToTop'
import { t } from './content/text'

// HashRouter → deep links (/#/termeni) work on any static host without rewrites.
export default function App() {
  useEffect(() => {
    document.title = t('site.title')
  }, [])

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/termeni"
            element={
              <LegalPage
                title="Termeni și condiții"
                intro="Condițiile de utilizare a site-ului Evocati și a serviciilor de recuperare a creanțelor comerciale."
              />
            }
          />
          <Route
            path="/confidentialitate"
            element={
              <LegalPage
                title="Politica de confidențialitate"
                intro="Cum colectăm, folosim și protejăm datele tale cu caracter personal."
              />
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
