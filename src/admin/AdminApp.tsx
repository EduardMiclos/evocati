import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { ExternalLink, FileText, Inbox, KeyRound, LogOut, Mail, Phone, ShieldCheck } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import Logo from '../components/Logo'
import { errMsg, inputCls, Notice, PrimaryButton, Spinner } from './ui'
import TextsPanel from './TextsPanel'
import EmailPanel from './EmailPanel'
import SubmissionsPanel from './SubmissionsPanel'
import SecurityPanel, { ChangePasswordForm } from './SecurityPanel'

interface AuthState {
  authenticated: boolean
  mustChangePassword: boolean
}

type Status = { kind: 'loading' } | { kind: 'offline'; message: string } | ({ kind: 'ready' } & AuthState)

export default function AdminApp() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' })

  const refresh = useCallback(() => {
    api<AuthState>('auth.php')
      .then((a) => setStatus({ kind: 'ready', ...a }))
      .catch((e) => setStatus({ kind: 'offline', message: errMsg(e) }))
  }, [])

  useEffect(refresh, [refresh])

  // Any 401 from a panel (expired session) sends the user back to the login screen.
  const onUnauthorized = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      setStatus({ kind: 'ready', authenticated: false, mustChangePassword: false })
      return true
    }
    return false
  }, [])

  if (status.kind === 'loading') return <Shell><Spinner /></Shell>
  if (status.kind === 'offline')
    return (
      <Shell>
        <div className="mx-auto max-w-md">
          <Notice tone="error">
            Serverul de administrare nu răspunde ({status.message}). Panoul are nevoie de PHP: pe cPanel
            funcționează automat; local pornește site-ul cu <code>npm run dev</code>.
          </Notice>
        </div>
      </Shell>
    )
  if (!status.authenticated) return <Shell><Login onDone={refresh} /></Shell>
  if (status.mustChangePassword)
    return (
      <Shell>
        <div className="mx-auto max-w-md space-y-4">
          <Notice tone="warn">
            Te-ai autentificat cu parola inițială. Alege o parolă nouă înainte de a continua.
          </Notice>
          <div className="rounded-2xl border border-white/5 bg-ink-850/70 p-5">
            <ChangePasswordForm onDone={refresh} />
          </div>
        </div>
      </Shell>
    )

  return <Dashboard onLogout={refresh} onUnauthorized={onUnauthorized} />
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="px-4 py-10 sm:px-6">{children}</main>
    </div>
  )
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('auth.php?action=login', { password })
      onDone()
    } catch (err) {
      setError(errMsg(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-2xl border border-white/5 bg-ink-850/70 p-5 sm:p-6">
      <div>
        <h1 className="font-display text-xl font-bold text-white">Administrare</h1>
        <p className="mt-1 text-sm text-slate-400">Introdu parola de administrator.</p>
      </div>
      <input
        type="password"
        autoFocus
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Parolă"
        className={inputCls}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <PrimaryButton type="submit" busy={busy} className="w-full">
        <KeyRound size={16} /> Intră
      </PrimaryButton>
    </form>
  )
}

const tabs = [
  { to: 'texte', label: 'Texte site', icon: FileText },
  { to: 'contact', label: 'Contact', icon: Phone },
  { to: 'email', label: 'Email', icon: Mail },
  { to: 'cereri', label: 'Cereri', icon: Inbox },
  { to: 'securitate', label: 'Securitate', icon: ShieldCheck },
]

export type PanelProps = { onUnauthorized: (e: unknown) => boolean }

function Dashboard({ onLogout, onUnauthorized }: { onLogout: () => void } & PanelProps) {
  const logout = async () => {
    await api('auth.php?action=logout', {}).catch(() => undefined)
    onLogout()
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Logo compact />
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink size={16} /> <span className="hidden sm:inline">Vezi site-ul</span>
            </a>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Ieșire</span>
            </button>
          </div>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={`/admin/${t.to}`}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-gold-500/15 text-gold-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <t.icon size={16} /> {t.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Routes>
          <Route index element={<Navigate to="texte" replace />} />
          <Route path="texte" element={<TextsPanel key="texte" onUnauthorized={onUnauthorized} exclude={['contact']} />} />
          <Route path="contact" element={<TextsPanel key="contact" onUnauthorized={onUnauthorized} only={['contact']} />} />
          <Route path="email" element={<EmailPanel onUnauthorized={onUnauthorized} />} />
          <Route path="cereri" element={<SubmissionsPanel onUnauthorized={onUnauthorized} />} />
          <Route path="securitate" element={<SecurityPanel onUnauthorized={onUnauthorized} />} />
          <Route path="*" element={<Navigate to="texte" replace />} />
        </Routes>
      </main>
    </div>
  )
}
