import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import PublicLayout from './components/PublicLayout'
import Home from './pages/Home'
import LegalPage from './pages/LegalPage'
import ScrollToTop from './components/ScrollToTop'
import { ContentProvider } from './content/ContentProvider'

// The admin is code-split so visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function Fallback() {
  return (
    <div className="grid min-h-screen place-items-center text-slate-500">
      <Loader2 className="animate-spin" size={30} />
    </div>
  )
}

// HashRouter → deep links (/#/termeni, /#/admin) work on any static cPanel host
// without .htaccess rewrites.
export default function App() {
  return (
    <ContentProvider>
      <HashRouter>
        <ScrollToTop />
        <Suspense fallback={<Fallback />}>
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
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ContentProvider>
  )
}
