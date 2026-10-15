import AnimatedSection from '../components/AnimatedSection'

// Reusable placeholder for Termeni / Confidențialitate. Replace body with the
// real legal text when available.
export default function LegalPage({
  title,
  intro,
}: {
  title: string
  intro: string
}) {
  return (
    <section className="pt-32 pb-24">
      <div className="container-page max-w-3xl">
        <AnimatedSection>
          <h1 className="font-display text-4xl font-extrabold text-white">{title}</h1>
          <p className="mt-4 leading-relaxed text-slate-400">{intro}</p>

          <div className="mt-10 space-y-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n}>
                <h2 className="font-display text-xl font-bold text-white">
                  {n}. Secțiune exemplu
                </h2>
                <p className="mt-2 leading-relaxed text-slate-400">
                  Conținut demonstrativ. Textul legal complet va fi adăugat aici.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
