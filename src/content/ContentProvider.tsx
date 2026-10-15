import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaults } from './schema'
import { api } from '../lib/api'

type Overrides = Record<string, string>

interface ContentCtx {
  overrides: Overrides
  setOverrides: (o: Overrides) => void
  /** Text for a key (override, else default). */
  t: (key: string) => string
  /** Non-empty rows of a multi-line field. */
  list: (key: string) => string[]
}

const Ctx = createContext<ContentCtx | null>(null)
const CACHE_KEY = 'evocati.content'

function readCache(): Overrides {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Overrides
  } catch {
    return {}
  }
}

// Shows the defaults (or the last cached copy) immediately, then swaps in the live
// overrides from the API. Caching makes repeat visits render the edited text at once.
export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setState] = useState<Overrides>(readCache)

  const setOverrides = useCallback((o: Overrides) => {
    setState(o)
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(o))
    } catch {
      // Storage unavailable (private mode) — the live copy still works.
    }
  }, [])

  useEffect(() => {
    api<{ overrides: Overrides }>('content.php')
      .then((r) => setOverrides(r.overrides ?? {}))
      .catch(() => {
        // API unreachable: keep defaults / cache.
      })
  }, [setOverrides])

  const value = useMemo<ContentCtx>(() => {
    const t = (key: string) => overrides[key] ?? defaults[key] ?? key
    const list = (key: string) =>
      t(key)
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    return { overrides, setOverrides, t, list }
  }, [overrides, setOverrides])

  useEffect(() => {
    document.title = value.t('site.title')
  }, [value])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useContent() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

// Renders `*words*` as highlighted spans.
export function rich(text: string, highlightClass = 'text-gradient'): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g)
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <span key={i} className={highlightClass}>
        {p}
      </span>
    ) : (
      p
    ),
  )
}
