import type { ReactNode } from 'react'
import { content } from './content'

/** Text for a key from content.ts. */
export function t(key: string): string {
  return content[key] ?? key
}

/** Non-empty lines of a multi-line text. */
export function list(key: string): string[] {
  return t(key)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
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
