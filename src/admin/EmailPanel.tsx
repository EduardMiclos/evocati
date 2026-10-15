import { useEffect, useState } from 'react'
import { Save, Send } from 'lucide-react'
import { api } from '../lib/api'
import type { PanelProps } from './AdminApp'
import { Card, errMsg, FieldRow, inputCls, Notice, PrimaryButton, SecondaryButton, Spinner } from './ui'

interface MailSettings {
  transport: 'smtp' | 'mail'
  host: string
  port: number
  secure: 'ssl' | 'tls' | 'none'
  username: string
  fromEmail: string
  fromName: string
  recipients: string
  subject: string
  hasPassword: boolean
}

type Msg = { tone: 'ok' | 'error'; text: string } | null

const domain = typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '') : ''

const presets: { label: string; apply: Partial<MailSettings> }[] = [
  { label: 'Email cPanel', apply: { transport: 'smtp', host: `mail.${domain}`, port: 465, secure: 'ssl' } },
  { label: 'Gmail / Workspace', apply: { transport: 'smtp', host: 'smtp.gmail.com', port: 465, secure: 'ssl' } },
  { label: 'Microsoft 365', apply: { transport: 'smtp', host: 'smtp.office365.com', port: 587, secure: 'tls' } },
]

export default function EmailPanel({ onUnauthorized }: PanelProps) {
  const [s, setS] = useState<MailSettings | null>(null)
  const [password, setPassword] = useState('')
  const [testTo, setTestTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)
  const [testMsg, setTestMsg] = useState<Msg>(null)

  useEffect(() => {
    api<{ settings: MailSettings }>('settings.php')
      .then((r) => setS(r.settings))
      .catch((e) => onUnauthorized(e) || setMsg({ tone: 'error', text: errMsg(e) }))
  }, [onUnauthorized])

  if (!s) return msg ? <Notice tone="error">{msg.text}</Notice> : <Spinner />

  const set = (patch: Partial<MailSettings>) => {
    setMsg(null)
    setS({ ...s, ...patch })
  }

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const r = await api<{ settings: MailSettings }>('settings.php', { ...s, password })
      setS(r.settings)
      setPassword('')
      setMsg({ tone: 'ok', text: 'Setările au fost salvate.' })
    } catch (e) {
      if (!onUnauthorized(e)) setMsg({ tone: 'error', text: errMsg(e) })
    } finally {
      setSaving(false)
    }
  }

  const test = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      const r = await api<{ sentTo: string[] }>('settings.php?action=test', { to: testTo })
      setTestMsg({ tone: 'ok', text: `Email de test trimis către ${r.sentTo.join(', ')}. Verifică și folderul Spam.` })
    } catch (e) {
      if (!onUnauthorized(e)) setTestMsg({ tone: 'error', text: errMsg(e) })
    } finally {
      setTesting(false)
    }
  }

  const smtp = s.transport === 'smtp'

  return (
    <div className="space-y-6">
      <Card
        title="Unde ajung cererile"
        description="Cererile din formularul „Solicită o analiză” sunt trimise pe email la aceste adrese și salvate în tabul Cereri."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldRow label="Destinatari" hint="Separă mai multe adrese prin virgulă." htmlFor="m-rcpt">
            <input
              id="m-rcpt"
              value={s.recipients}
              onChange={(e) => set({ recipients: e.target.value })}
              placeholder="office@firma.ro, avocat@firma.ro"
              className={inputCls}
            />
          </FieldRow>
          <FieldRow label="Subiect email" hint="{name} se înlocuiește cu numele clientului." htmlFor="m-subj">
            <input id="m-subj" value={s.subject} onChange={(e) => set({ subject: e.target.value })} className={inputCls} />
          </FieldRow>
        </div>
      </Card>

      <Card
        title="Server de email (SMTP)"
        description="Contul prin care site-ul trimite emailurile. Datele le găsești în cPanel → Email Accounts → Connect Devices."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-xs text-slate-500">Completează rapid:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => set(p.apply)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-gold-400/50 hover:text-gold-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          <FieldRow label="Metodă de trimitere">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['smtp', 'SMTP (recomandat)'],
                  ['mail', 'Funcția mail() a serverului'],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => set({ transport: v })}
                  className={`rounded-lg border px-3 py-2.5 text-sm ${
                    s.transport === v ? 'border-gold-400/60 bg-gold-500/10 text-gold-100' : 'border-white/10 text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </FieldRow>

          {smtp && (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px_160px]">
                <FieldRow label="Server SMTP" htmlFor="m-host">
                  <input
                    id="m-host"
                    value={s.host}
                    onChange={(e) => set({ host: e.target.value })}
                    placeholder={`mail.${domain || 'domeniu.ro'}`}
                    className={inputCls}
                  />
                </FieldRow>
                <FieldRow label="Port" htmlFor="m-port">
                  <input
                    id="m-port"
                    type="number"
                    value={s.port}
                    onChange={(e) => set({ port: Number(e.target.value) })}
                    className={inputCls}
                  />
                </FieldRow>
                <FieldRow label="Securitate" htmlFor="m-sec">
                  <select
                    id="m-sec"
                    value={s.secure}
                    onChange={(e) => {
                      const secure = e.target.value as MailSettings['secure']
                      set({ secure, port: secure === 'ssl' ? 465 : secure === 'tls' ? 587 : 25 })
                    }}
                    className={inputCls}
                  >
                    <option value="ssl">SSL (465)</option>
                    <option value="tls">STARTTLS (587)</option>
                    <option value="none">Fără (25)</option>
                  </select>
                </FieldRow>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldRow label="Utilizator" hint="De obicei adresa de email completă." htmlFor="m-user">
                  <input
                    id="m-user"
                    value={s.username}
                    autoComplete="off"
                    onChange={(e) => set({ username: e.target.value })}
                    placeholder={`site@${domain || 'domeniu.ro'}`}
                    className={inputCls}
                  />
                </FieldRow>
                <FieldRow
                  label="Parolă"
                  htmlFor="m-pass"
                  hint={s.hasPassword ? 'O parolă este salvată. Lasă gol ca să o păstrezi.' : 'Nu este salvată nicio parolă.'}
                >
                  <input
                    id="m-pass"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={s.hasPassword ? '••••••••' : ''}
                    className={inputCls}
                  />
                </FieldRow>
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldRow label="Adresă expeditor („De la”)" hint="Folosește o adresă de pe domeniul site-ului, ca să nu ajungă în Spam." htmlFor="m-from">
              <input
                id="m-from"
                value={s.fromEmail}
                onChange={(e) => set({ fromEmail: e.target.value })}
                placeholder={`site@${domain || 'domeniu.ro'}`}
                className={inputCls}
              />
            </FieldRow>
            <FieldRow label="Nume expeditor" htmlFor="m-fromname">
              <input id="m-fromname" value={s.fromName} onChange={(e) => set({ fromName: e.target.value })} className={inputCls} />
            </FieldRow>
          </div>

          {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
          <PrimaryButton onClick={save} busy={saving}>
            <Save size={16} /> Salvează setările
          </PrimaryButton>
        </div>
      </Card>

      <Card title="Testează" description="Trimite un email de test cu setările salvate.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="Lasă gol pentru destinatarii de mai sus"
            className={inputCls}
          />
          <SecondaryButton onClick={test} busy={testing} className="shrink-0">
            <Send size={16} /> Trimite test
          </SecondaryButton>
        </div>
        {testMsg && (
          <div className="mt-3">
            <Notice tone={testMsg.tone}>{testMsg.text}</Notice>
          </div>
        )}
      </Card>
    </div>
  )
}
