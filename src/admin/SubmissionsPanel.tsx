import { useCallback, useEffect, useState } from 'react'
import { Building2, ChevronDown, Mail, Phone, RefreshCw, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import type { PanelProps } from './AdminApp'
import { errMsg, Notice, SecondaryButton, Spinner } from './ui'

interface Submission {
  id: string
  createdAt: string
  name: string
  company: string
  phone: string
  email: string
  amount: string
  message: string
  read: boolean
  mailStatus?: 'sent' | 'failed'
  mailError?: string
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function SubmissionsPanel({ onUnauthorized }: PanelProps) {
  const [items, setItems] = useState<Submission[] | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api<{ submissions: Submission[] }>('submissions.php')
      .then((r) => {
        setItems(r.submissions)
        setError('')
      })
      .catch((e) => onUnauthorized(e) || setError(errMsg(e)))
      .finally(() => setLoading(false))
  }, [onUnauthorized])

  useEffect(load, [load])

  const act = async (action: 'read' | 'delete', id: string) => {
    try {
      const r = await api<{ submissions: Submission[] }>(`submissions.php?action=${action}`, { id })
      setItems(r.submissions)
    } catch (e) {
      if (!onUnauthorized(e)) setError(errMsg(e))
    }
  }

  const toggle = (s: Submission) => {
    setOpen(open === s.id ? null : s.id)
    if (!s.read) act('read', s.id)
  }

  if (!items) return error ? <Notice tone="error">{error}</Notice> : <Spinner />

  const unread = items.filter((s) => !s.read).length
  const failed = items.filter((s) => s.mailStatus === 'failed').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Cereri primite</h2>
          <p className="text-sm text-slate-400">
            {items.length} în total{unread > 0 && <>, <span className="text-gold-300">{unread} necitite</span></>}
          </p>
        </div>
        <SecondaryButton onClick={load} busy={loading}>
          <RefreshCw size={16} /> <span className="hidden sm:inline">Reîncarcă</span>
        </SecondaryButton>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {failed > 0 && (
        <Notice tone="warn">
          {failed} {failed === 1 ? 'cerere nu a putut fi trimisă' : 'cereri nu au putut fi trimise'} pe email. Ele sunt
          salvate aici; verifică setările din tabul Email.
        </Notice>
      )}

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm text-slate-500">
          Nicio cerere încă. Cererile din formularul „Solicită o analiză” vor apărea aici.
        </div>
      )}

      <ul className="space-y-2">
        {items.map((s) => {
          const isOpen = open === s.id
          return (
            <li key={s.id} className={`rounded-xl border ${s.read ? 'border-white/5 bg-ink-850/50' : 'border-gold-500/25 bg-ink-850'}`}>
              <button onClick={() => toggle(s)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                {!s.read && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" />}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${s.read ? 'text-slate-300' : 'font-semibold text-white'}`}>
                    {s.name}
                    {s.company && <span className="font-normal text-slate-500"> · {s.company}</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {fmt(s.createdAt)}
                    {s.amount && <> · {s.amount}</>}
                  </p>
                </div>
                {s.mailStatus === 'failed' && (
                  <span className="shrink-0 rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-red-300">email eșuat</span>
                )}
                <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-white/5 px-4 py-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-slate-200 hover:text-gold-200">
                      <Phone size={14} /> {s.phone}
                    </a>
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-slate-200 hover:text-gold-200">
                        <Mail size={14} /> {s.email}
                      </a>
                    )}
                    {s.company && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-slate-300">
                        <Building2 size={14} /> {s.company}
                      </span>
                    )}
                  </div>
                  {s.amount && (
                    <p className="text-slate-400">
                      Valoarea creanței: <span className="text-white">{s.amount}</span>
                    </p>
                  )}
                  {s.message && <p className="whitespace-pre-wrap rounded-lg bg-ink-950/60 p-3 text-slate-200">{s.message}</p>}
                  {s.mailStatus === 'failed' && s.mailError && <Notice tone="error">Email netrimis: {s.mailError}</Notice>}
                  <button
                    onClick={() => confirm(`Ștergi cererea de la ${s.name}?`) && act('delete', s.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={14} /> Șterge
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
