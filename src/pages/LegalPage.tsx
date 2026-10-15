import type { ReactNode } from 'react'
import AnimatedSection from '../components/AnimatedSection'
import type { LegalBlock, LegalDoc } from '../content/legal'

// Turns emails and URLs inside the legal text into links.
function linkify(text: string): ReactNode {
  return text.split(/(\S+@\S+\.[a-z]{2,}|https?:\/\/\S+)/gi).map((part, i) => {
    if (i % 2 === 0) return part
    const clean = part.replace(/[.,;:]+$/, '')
    const href = clean.includes('@') && !clean.startsWith('http') ? `mailto:${clean}` : clean
    return (
      <span key={i}>
        <a href={href} className="text-gold-300 underline-offset-2 hover:underline">
          {clean}
        </a>
        {part.slice(clean.length)}
      </span>
    )
  })
}

function Block({ block }: { block: LegalBlock }) {
  if ('h' in block) {
    return <h2 className="t-h3 pt-4 text-white sm:pt-6">{block.h}</h2>
  }
  if ('p' in block) {
    return <p>{linkify(block.p)}</p>
  }
  return (
    <div className="flex gap-3 sm:gap-4">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gold-500/10 text-xs font-bold text-gold-400 sm:h-7 sm:w-7 sm:text-sm">
        {block.n}
      </span>
      <div className="min-w-0 space-y-2.5">
        <p>{linkify(block.text)}</p>
        {block.bullets && (
          <ul className="space-y-1.5 border-l border-white/10 pl-4">
            {block.bullets.map((b, i) => (
              <li key={i} className="relative before:absolute before:-left-[1.1rem] before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-gold-500/70">
                {linkify(b)}
              </li>
            ))}
          </ul>
        )}
        {block.after?.map((a, i) => (
          <p key={i} className="text-slate-300">
            {linkify(a)}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <section className="pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="container-page max-w-3xl">
        <AnimatedSection>
          <h1 className="t-h2">{doc.title}</h1>
          <div className="t-sm mt-6 space-y-4 break-words text-slate-400 sm:mt-10 sm:space-y-5 sm:text-base">
            {doc.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
