import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Save, Search } from 'lucide-react'
import { contentSchema, type Field } from '../content/schema'
import { useContent } from '../content/ContentProvider'
import { api } from '../lib/api'
import type { PanelProps } from './AdminApp'
import { errMsg, inputCls, Notice, PrimaryButton } from './ui'

type Overrides = Record<string, string>

// Edits site texts. `only` / `exclude` pick which schema sections this tab shows
// (the Contact tab reuses this editor for the contact section).
export default function TextsPanel({
  onUnauthorized,
  only,
  exclude,
}: PanelProps & { only?: string[]; exclude?: string[] }) {
  const { overrides, setOverrides } = useContent()
  const [draft, setDraft] = useState<Overrides>(overrides)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const sections = useMemo(
    () => contentSchema.filter((s) => (!only || only.includes(s.id)) && !exclude?.includes(s.id)),
    [only, exclude],
  )
  const [active, setActive] = useState(sections[0]?.id)

  const dirty = JSON.stringify(draft) !== JSON.stringify(overrides)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const setValue = (field: Field, value: string) => {
    setMsg(null)
    setDraft((d) => {
      const next = { ...d }
      // Storing only real changes keeps future default-text updates flowing through.
      if (value === field.default) delete next[field.key]
      else next[field.key] = value
      return next
    })
  }

  const save = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const r = await api<{ overrides: Overrides }>('content.php', { overrides: draft })
      setOverrides(r.overrides)
      setDraft(r.overrides)
      setMsg({ tone: 'ok', text: 'Salvat. Modificările sunt deja vizibile pe site.' })
    } catch (e) {
      if (!onUnauthorized(e)) setMsg({ tone: 'error', text: errMsg(e) })
    } finally {
      setBusy(false)
    }
  }

  const q = query.trim().toLowerCase()
  const visible = q
    ? sections
        .map((s) => ({
          ...s,
          fields: s.fields.filter(
            (f) =>
              f.label.toLowerCase().includes(q) || (draft[f.key] ?? f.default).toLowerCase().includes(q),
          ),
        }))
        .filter((s) => s.fields.length)
    : sections.filter((s) => s.id === active)

  const changedIn = (id: string) =>
    sections.find((s) => s.id === id)?.fields.filter((f) => f.key in draft).length ?? 0

  return (
    <div className="pb-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        {sections.length > 1 && (
          <aside className="lg:w-64 lg:shrink-0">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută în texte…"
                className={`${inputCls} pl-9`}
              />
            </div>

            {/* Phones: compact select. Desktop: sticky list. */}
            <select
              value={active}
              onChange={(e) => {
                setActive(e.target.value)
                setQuery('')
              }}
              className={`${inputCls} mt-3 lg:hidden`}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                  {changedIn(s.id) ? ` (${changedIn(s.id)} modificate)` : ''}
                </option>
              ))}
            </select>
            <nav className="mt-3 hidden space-y-0.5 lg:sticky lg:top-36 lg:block">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActive(s.id)
                    setQuery('')
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active === s.id && !q ? 'bg-gold-500/15 text-gold-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {s.title}
                  {changedIn(s.id) > 0 && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}
                </button>
              ))}
            </nav>
          </aside>
        )}

        <div className="min-w-0 flex-1 space-y-6">
          <Notice tone="info">
            Scrie cuvintele între steluțe ca să apară <span className="font-semibold text-gold-300">evidențiate cu auriu</span>,
            de ex. <code className="text-gold-200">*singure.*</code> La listele marcate „un element pe rând”, fiecare
            rând devine un element separat.
          </Notice>

          {visible.length === 0 && <p className="text-sm text-slate-500">Niciun text nu conține „{query}”.</p>}

          {visible.map((s) => (
            <section key={s.id} className="rounded-2xl border border-white/5 bg-ink-850/70 p-4 sm:p-6">
              <h2 className="font-display text-base font-bold text-white sm:text-lg">{s.title}</h2>
              <div className="mt-5 space-y-5">
                {s.fields.map((f) => (
                  <FieldEditor key={f.key} field={f} value={draft[f.key] ?? f.default} onChange={(v) => setValue(f, v)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-ink-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 text-sm">
            {msg ? (
              <span className={msg.tone === 'ok' ? 'text-emerald-400' : 'text-red-400'}>{msg.text}</span>
            ) : dirty ? (
              <span className="text-amber-300">Ai modificări nesalvate.</span>
            ) : (
              <span className="text-slate-500">Toate modificările sunt salvate.</span>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {dirty && (
              <button
                onClick={() => setDraft(overrides)}
                className="rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
              >
                Anulează
              </button>
            )}
            <PrimaryButton onClick={save} busy={busy} disabled={!dirty}>
              <Save size={16} /> Salvează
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldEditor({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const changed = value !== field.default
  const multi = field.type !== 'text'
  const hint =
    field.type === 'list' ? 'Un element pe rând.' : field.type === 'lines' ? 'Fiecare rând este un paragraf separat.' : null
  const id = `f-${field.key}`

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {field.label}
          {changed && <span className="ml-2 rounded bg-gold-500/15 px-1.5 py-0.5 text-[10px] text-gold-300">modificat</span>}
        </label>
        {changed && (
          <button
            onClick={() => onChange(field.default)}
            title={`Text original: ${field.default}`}
            className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 hover:text-gold-300"
          >
            <RotateCcw size={12} /> Original
          </button>
        )}
      </div>
      {multi ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.min(10, Math.max(2, value.split('\n').length + (field.type === 'textarea' ? 1 : 0)))}
          className={`${inputCls} resize-y leading-relaxed`}
        />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
