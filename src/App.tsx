import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import Home from './pages/Home'
import LegalPage from './pages/LegalPage'
import ScrollToTop from './components/ScrollToTop'
import { t } from './content/text'
import { privacy, terms } from './content/legal'

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
          <Route path="/termeni" element={<LegalPage doc={terms} />} />
          <Route path="/confidentialitate" element={<LegalPage doc={privacy} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
