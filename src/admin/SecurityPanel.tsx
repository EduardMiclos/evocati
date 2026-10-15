import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { KeyRound, Lock, LockOpen, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import type { PanelProps } from './AdminApp'
import { Card, errMsg, FieldRow, inputCls, Notice, PrimaryButton, SecondaryButton, Spinner } from './ui'

interface SslStatus {
  host: string
  /** Firebase: Google issues certificates and always serves HTTPS. */
  managed?: boolean
  requestIsHttps: boolean
  certificate: {
    checked: boolean
    reason?: string
    valid?: boolean
    error?: string | null
    subject?: string
    altNames?: string
    issuer?: string
    validFrom?: string
    validTo?: string
    daysLeft?: number
  }
  htaccess: { exists: boolean; writable: boolean; forceHttps: boolean }
}

const day = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—')

export default function SecurityPanel({ onUnauthorized }: PanelProps) {
  const [status, setStatus] = useState<SslStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api<SslStatus>('ssl.php')
      .then(setStatus)
      .catch((e) => onUnauthorized(e) || setMsg({ tone: 'error', text: errMsg(e) }))
      .finally(() => setLoading(false))
  }, [onUnauthorized])

  useEffect(load, [load])

  const toggleHttps = async (forceHttps: boolean) => {
    setToggling(true)
    setMsg(null)
    try {
      const r = await api<{ htaccess: SslStatus['htaccess'] }>('ssl.php', { forceHttps })
      setStatus((s) => (s ? { ...s, htaccess: r.htaccess } : s))
      setMsg({
        tone: 'ok',
        text: forceHttps ? 'Toți vizitatorii sunt acum redirecționați pe HTTPS.' : 'Redirecționarea HTTPS a fost oprită.',
      })
    } catch (e) {
      if (!onUnauthorized(e)) setMsg({ tone: 'error', text: errMsg(e) })
    } finally {
      setToggling(false)
    }
  }

  const c = status?.certificate

  return (
    <div className="space-y-6">
      <Card
        title="Certificat SSL"
        description="Certificatul este emis gratuit de hosting. Aici vezi starea lui pentru domeniul curent."
        actions={
          <SecondaryButton onClick={load} busy={loading}>
            <RefreshCw size={16} /> <span className="hidden sm:inline">Verifică din nou</span>
          </SecondaryButton>
        }
      >
        {!status ? (
          msg ? <Notice tone="error">{msg.text}</Notice> : <Spinner />
        ) : !c?.checked ? (
          <Notice tone="info">{c?.reason}</Notice>
        ) : (
          <div className="space-y-4">
            {c.valid ? (
              <Notice tone={c.daysLeft !== undefined && c.daysLeft < 14 ? 'warn' : 'ok'}>
                Certificat valid pentru <strong>{status.host}</strong>, expiră pe {day(c.validTo)} (în {c.daysLeft} zile).
                {c.daysLeft !== undefined && c.daysLeft < 14 && ' Reînnoirea AutoSSL ar fi trebuit să ruleze deja — verifică în cPanel.'}
              </Notice>
            ) : (
              <Notice tone="error">{c.error}</Notice>
            )}
            {c.issuer && (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Emis de" value={c.issuer} />
                <Info label="Domenii acoperite" value={c.altNames || c.subject || '—'} />
                <Info label="Valabil de la" value={day(c.validFrom)} />
                <Info label="Valabil până la" value={day(c.validTo)} />
              </dl>
            )}
          </div>
        )}

        {status?.managed ? (
          <details className="mt-5 rounded-xl border border-white/5 bg-ink-950/40 p-4 text-sm text-slate-400">
            <summary className="cursor-pointer font-medium text-slate-200">Cum adaug un domeniu nou?</summary>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5">
              <li>Firebase Console → <strong className="text-slate-200">Hosting</strong> → <strong className="text-slate-200">Add custom domain</strong>.</li>
              <li>Adaugă la registrarul domeniului înregistrările DNS afișate de Firebase.</li>
              <li>Certificatul este emis automat (de obicei în câteva ore) și se reînnoiește singur.</li>
            </ol>
          </details>
        ) : (
        <details className="mt-5 rounded-xl border border-white/5 bg-ink-950/40 p-4 text-sm text-slate-400">
          <summary className="cursor-pointer font-medium text-slate-200">Cum obțin sau reînnoiesc certificatul?</summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Intră în cPanel → secțiunea <strong className="text-slate-200">Security</strong> → <strong className="text-slate-200">SSL/TLS Status</strong>.</li>
            <li>Bifează domeniul (și varianta cu www) și apasă <strong className="text-slate-200">Run AutoSSL</strong>.</li>
            <li>După câteva minute revino aici și apasă „Verifică din nou”. AutoSSL reînnoiește automat certificatul înainte de expirare.</li>
            <li>Domeniul trebuie să indice spre serverul de hosting (DNS), altfel certificatul nu poate fi emis.</li>
          </ol>
        </details>
        )}
      </Card>

      {status?.managed ? (
        <Card title="HTTPS" description="Site-ul este găzduit pe Firebase.">
          <Notice tone="ok">
            HTTPS este activ permanent: Firebase redirecționează automat orice vizită http:// și reînnoiește singur
            certificatul.
          </Notice>
        </Card>
      ) : (
      <Card
        title="Forțează HTTPS"
        description="Redirecționează automat orice vizită http:// către https://. Se activează doar dacă certificatul este valid."
      >
        {status && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-ink-950/40 p-4">
              <div className="flex items-center gap-3">
                {status.htaccess.forceHttps ? (
                  <Lock size={20} className="text-emerald-400" />
                ) : (
                  <LockOpen size={20} className="text-slate-500" />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {status.htaccess.forceHttps ? 'Activ' : 'Inactiv'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Vizita curentă: {status.requestIsHttps ? 'HTTPS (securizată)' : 'HTTP (nesecurizată)'}
                  </p>
                </div>
              </div>
              <PrimaryButton
                busy={toggling}
                disabled={!status.htaccess.writable}
                onClick={() => toggleHttps(!status.htaccess.forceHttps)}
              >
                {status.htaccess.forceHttps ? 'Dezactivează' : 'Activează'}
              </PrimaryButton>
            </div>
            {!status.htaccess.writable && (
              <Notice tone="warn">
                Fișierul .htaccess al site-ului nu poate fi modificat de server. Verifică permisiunile (644) în cPanel → File
                Manager.
              </Notice>
            )}
          </div>
        )}
        {msg && status && (
          <div className="mt-4">
            <Notice tone={msg.tone}>{msg.text}</Notice>
          </div>
        )}
      </Card>
      )}

      <Card title="Parola de administrator" description="Folosește minim 10 caractere.">
        <div className="max-w-md">
          <ChangePasswordForm />
        </div>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-950/40 px-3 py-2.5">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-slate-200">{value}</dd>
    </div>
  )
}

export function ChangePasswordForm({ onDone }: { onDone?: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next !== repeat) {
      setMsg({ tone: 'error', text: 'Parolele noi nu coincid.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      await api('auth.php?action=password', { current, next })
      setCurrent('')
      setNext('')
      setRepeat('')
      setMsg({ tone: 'ok', text: 'Parola a fost schimbată.' })
      onDone?.()
    } catch (err) {
      setMsg({ tone: 'error', text: errMsg(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <FieldRow label="Parola actuală" htmlFor="p-cur">
        <input id="p-cur" type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
      </FieldRow>
      <FieldRow label="Parola nouă" htmlFor="p-new">
        <input id="p-new" type="password" required minLength={10} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} />
      </FieldRow>
      <FieldRow label="Repetă parola nouă" htmlFor="p-rep">
        <input id="p-rep" type="password" required minLength={10} autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={inputCls} />
      </FieldRow>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <PrimaryButton type="submit" busy={busy}>
        <KeyRound size={16} /> Schimbă parola
      </PrimaryButton>
    </form>
  )
}
