// Every editable text on the public site. The admin "Texte" editor is generated from
// this list, and `defaults` is what the site shows until an admin overrides a field.
//
// Formatting conventions (documented in the admin UI too):
//   *text*      → highlighted (gold) words
//   type 'lines' → one paragraph / line per row
//   type 'list'  → one item per row (pills, checklists, cards)

export type FieldType = 'text' | 'textarea' | 'lines' | 'list'

export interface Field {
  key: string
  label: string
  type: FieldType
  default: string
}

export interface Section {
  id: string
  title: string
  fields: Field[]
}

const f = (key: string, label: string, def: string, type: FieldType = 'text'): Field => ({
  key,
  label,
  type,
  default: def,
})
const lines = (...l: string[]) => l.join('\n')

export const contentSchema: Section[] = [
  {
    id: 'contact',
    title: 'Date de contact',
    fields: [
      f('contact.phone', 'Telefon', '+40 700 000 000'),
      f('contact.email', 'Email afișat pe site', 'contact@evocati-legal.ro'),
      f('contact.address', 'Adresă', 'București, România'),
    ],
  },
  {
    id: 'general',
    title: 'General',
    fields: [
      f('site.title', 'Titlul paginii (tab browser)', 'Evocati — Recuperări creanțe comerciale'),
      f('cta.primary', 'Text buton principal', 'Solicită o analiză'),
    ],
  },
  {
    id: 'hero',
    title: '1. Hero',
    fields: [
      f('hero.eyebrow', 'Supratitlu', 'Bun venit în casa de recuperări creanțe Evocati'),
      f('hero.title', 'Titlu', 'Creanțele nu se recuperează *singure.*'),
      f('hero.lead', 'Subtitlu', 'Se recuperează când cineva știe exact ce are de făcut.'),
      f('hero.line1', 'Rând 1', 'Evocati recuperează creanțe comerciale.'),
      f('hero.line2', 'Rând 2 (evidențiat)', 'Direct. Strategic. Fără timp pierdut.'),
      f('hero.line3', 'Rând 3', 'Negociem atunci când se poate. Acționăm atunci când trebuie.'),
      f('hero.question', 'Întrebare deasupra butonului', 'Ai o creanță? Noi avem soluția.'),
      f(
        'hero.proof',
        'Argumente (sub buton)',
        lines('Peste 10 ani de experiență', 'Creanțe de milioane de lei recuperate', 'Rezultate care pot fi verificate'),
        'list',
      ),
    ],
  },
  {
    id: 'impact',
    title: '2. Impact',
    fields: [
      f('impact.title1', 'Titlu (gri)', 'Nu promitem că debitorul va plăti.'),
      f('impact.title2', 'Titlu (alb)', 'Promitem că noi vom face *tot ce trebuie* pentru ca el să plătească.', 'textarea'),
      f('impact.text', 'Text', 'Pentru că recuperarea unei creanțe nu înseamnă un telefon.'),
      f('impact.label', 'Etichetă card', 'Înseamnă'),
      f(
        'impact.pills',
        'Cuvinte cheie',
        lines('Strategie.', 'Presiune.', 'Negociere.', 'Documente.', 'Termene.', 'Monitorizare.'),
        'list',
      ),
      f('impact.after', 'Text după cuvinte', 'Și, când situația o cere, acțiune.'),
      f('impact.quote', 'Concluzie', 'Evocati nu așteaptă. Evocati acționează.'),
    ],
  },
  {
    id: 'banners',
    title: 'Bannere scurte',
    fields: [
      f('banner.1.title', 'Banner 1 — întrebare', 'Ai de recuperat bani?'),
      f('banner.1.text', 'Banner 1 — răspuns', 'Hai să vorbim.'),
      f('banner.2.title', 'Banner 2 — întrebare', 'Debitorul nu plătește?'),
      f('banner.2.text', 'Banner 2 — răspuns', 'Noi începem de aici.'),
      f('banner.3.title', 'Banner 3 — întrebare', 'Ai așteptat destul.'),
      f('banner.3.text', 'Banner 3 — răspuns', 'Lasă-ne nouă recuperarea.'),
      f('banner.4.title', 'Banner 4 — întrebare', 'Creanță blocată?'),
      f('banner.4.text', 'Banner 4 — răspuns', 'O deblocăm.'),
    ],
  },
  {
    id: 'about',
    title: '3. Cine suntem',
    fields: [
      f('about.eyebrow', 'Supratitlu', 'Cine suntem'),
      f('about.title', 'Titlu', 'EVOCATI'),
      f('about.tagline', 'Slogan', 'Mâna puternică. Negocierea fină.'),
      f('about.p1', 'Paragraf 1', 'Suntem o companie specializată în recuperarea creanțelor comerciale.', 'textarea'),
      f(
        'about.p2',
        'Paragraf 2',
        'Lucrăm cu antreprenori, companii și grupuri care au de recuperat bani și nu își permit să aștepte la nesfârșit.',
        'textarea',
      ),
      f(
        'about.not',
        'Ce nu suntem',
        lines('Nu suntem un call-center.', 'Nu suntem intermediari care transmit mai departe problema.'),
        'lines',
      ),
      f(
        'about.steps',
        'Pașii (4)',
        lines('Preluăm creanța.', 'O analizăm.', 'Construim strategia.', 'O urmărim până la rezultat.'),
        'list',
      ),
      f('about.note', 'Notă', 'Iar atunci când negocierea nu mai este suficientă, schimbăm instrumentul.', 'textarea'),
    ],
  },
  {
    id: 'why',
    title: '4. De ce Evocati?',
    fields: [
      f('why.eyebrow', 'Supratitlu', 'De ce Evocati?'),
      f('why.title', 'Titlu', 'Pentru că banii tăi merită mai mult decât *o promisiune de plată.*', 'textarea'),
      f(
        'why.cards',
        'Consecințe (carduri roșii)',
        lines(
          'O creanță nerecuperată înseamnă capital blocat.',
          'Înseamnă cash-flow afectat.',
          'Înseamnă timp pierdut.',
          'Înseamnă energie consumată de oamenii din compania ta.',
        ),
        'list',
      ),
      f('why.lead', 'Text', 'Noi preluăm această presiune.'),
      f('why.quote', 'Concluzie', 'Tu îți vezi de business. *Noi ne ocupăm de bani.*'),
    ],
  },
  {
    id: 'advantages',
    title: '5. Avantaje',
    fields: [
      f('adv.eyebrow', 'Supratitlu', 'Avantaje'),
      f('adv.title', 'Titlu', 'De ce ne aleg companiile?'),
      f('adv.1.title', 'Avantaj 1 — titlu', 'Experiență'),
      f('adv.1.text', 'Avantaj 1 — text', 'Peste 10 ani în recuperarea creanțelor comerciale.', 'lines'),
      f('adv.2.title', 'Avantaj 2 — titlu', 'Strategie'),
      f(
        'adv.2.text',
        'Avantaj 2 — text',
        'Nu aplicăm aceeași metodă tuturor debitorilor. Fiecare dosar începe cu o analiză.',
        'lines',
      ),
      f('adv.3.title', 'Avantaj 3 — titlu', 'Negociere'),
      f('adv.3.text', 'Avantaj 3 — text', 'Știm când să cerem. Știm când să insistăm. Știm când să schimbăm tactica.', 'lines'),
      f('adv.4.title', 'Avantaj 4 — titlu', 'Accelerăm situația'),
      f('adv.4.text', 'Avantaj 4 — text', 'Când negocierile nu produc rezultat, trecem la următorul nivel.', 'lines'),
      f('adv.5.title', 'Avantaj 5 — titlu', 'Monitorizare'),
      f('adv.5.text', 'Avantaj 5 — text', 'Un dosar preluat nu este un dosar uitat într-un sertar.', 'lines'),
      f('adv.6.title', 'Avantaj 6 — titlu', 'Rezultate'),
      f(
        'adv.6.text',
        'Avantaj 6 — text',
        lines('Nu ne măsurăm activitatea în notificări trimise.', 'Ne măsurăm în bani recuperați.'),
        'lines',
      ),
    ],
  },
  {
    id: 'process',
    title: '6. Cum recuperăm',
    fields: [
      f('process.eyebrow', 'Supratitlu', 'Procesul de recuperare'),
      f('process.title', 'Titlu', 'Cum recuperăm'),
      f('step.1.title', 'Pas 1 — titlu', 'Analizăm'),
      f(
        'step.1.text',
        'Pas 1 — text',
        lines(
          'Ne uităm la creanță, documente, debitor, situația financiară și istoricul relației comerciale.',
          'Înțelegem problema înainte să acționăm.',
        ),
        'lines',
      ),
      f('step.2.title', 'Pas 2 — titlu', 'Construim strategia'),
      f('step.2.text', 'Pas 2 — text', 'Stabilim ce funcționează în cazul respectiv.', 'lines'),
      f(
        'step.2.pills',
        'Pas 2 — instrumente',
        lines('Negociere?', 'Angajament de plată?', 'Bilet la ordin?', 'Eșalonare?'),
        'list',
      ),
      f(
        'step.2.after',
        'Pas 2 — text final',
        'Instrumentul îl alegem în funcție de situație, nu după un șablon.',
        'lines',
      ),
      f('step.3.title', 'Pas 3 — titlu', 'Negociem'),
      f(
        'step.3.text',
        'Pas 3 — text',
        lines(
          'Începem acolo unde există șanse reale de rezultat.',
          'Discutăm. Accelerăm elegant situația. Stabilim termene.',
          'Și urmărim respectarea lor.',
        ),
        'lines',
      ),
      f('step.4.title', 'Pas 4 — titlu', 'Acționăm'),
      f(
        'step.4.text',
        'Pas 4 — text',
        lines(
          'Când promisiunile nu mai sunt suficiente, trecem la acțiune.',
          'Fără timp pierdut. Timpul costă bani, la tine și la noi!',
          'Doar pașii care trebuie făcuți.',
        ),
        'lines',
      ),
      f('step.5.title', 'Pas 5 — titlu', 'Urmărim până la plată'),
      f(
        'step.5.text',
        'Pas 5 — text',
        lines('Pentru noi, „voi plăti” nu este un rezultat.', '*Plata este rezultatul.*'),
        'lines',
      ),
    ],
  },
  {
    id: 'claims',
    title: '7. Tipuri de creanțe',
    fields: [
      f('claims.eyebrow', 'Supratitlu', 'Pentru ce tip de creanțe?'),
      f('claims.title', 'Titlu', 'Nu orice creanță merită aceeași abordare.'),
      f(
        'claims.text',
        'Text',
        'Lucrăm în special cu creanțe comerciale semnificative, unde experiența, strategia și viteza de reacție pot face diferența.',
        'textarea',
      ),
      f(
        'claims.sectors',
        'Domenii',
        lines(
          'Construcții',
          'Energie',
          'Servicii',
          'Producție',
          'Transport',
          'Distribuție',
          'Retail',
          'Contracte comerciale',
          'Creanțe B2B',
        ),
        'list',
      ),
      f('claims.ctaTitle', 'Card — titlu', 'Ai de recuperat peste *30.000 lei*?'),
      f('claims.ctaText', 'Card — text', 'Atunci merită să discutăm.'),
    ],
  },
  {
    id: 'numbers',
    title: '8. Cifre',
    fields: [
      f('numbers.title1', 'Titlu (gri)', 'Nu spunem că suntem buni.'),
      f('numbers.title2', 'Titlu (alb)', 'Îți arătăm.'),
      f('numbers.1.value', 'Cifra 1 — valoare (ex. 10+ se animă)', '10+'),
      f('numbers.1.label', 'Cifra 1 — etichetă', 'Ani de experiență'),
      f('numbers.2.value', 'Cifra 2 — valoare', 'Milioane'),
      f('numbers.2.label', 'Cifra 2 — etichetă', 'De lei recuperate'),
      f('numbers.3.value', 'Cifra 3 — valoare', 'Sute'),
      f('numbers.3.label', 'Cifra 3 — etichetă', 'De dosare analizate și rezolvate'),
      f('numbers.4.value', 'Cifra 4 — valoare', 'Un singur obiectiv'),
      f('numbers.4.label', 'Cifra 4 — etichetă', 'Banii înapoi în contul tău'),
    ],
  },
  {
    id: 'beyond',
    title: '9. Nu ne oprim la notificare',
    fields: [
      f('beyond.eyebrow', 'Supratitlu', 'Nu ne oprim la notificare'),
      f('beyond.title', 'Titlu', 'O notificare este doar începutul.'),
      f('beyond.p1', 'Rând 1', 'Oricine poate trimite o notificare.'),
      f('beyond.p2', 'Rând 2 (evidențiat)', 'Noi recuperăm creanțe.'),
      f(
        'beyond.steps',
        'Pașii următori',
        lines(
          'Dacă debitorul plătește după prima intervenție, foarte bine.',
          'Dacă nu, avem următorul pas.',
          'Și următorul. Și următorul.',
        ),
        'lines',
      ),
      f('beyond.quote', 'Concluzie', 'Nu ne oprim pentru că debitorul spune „nu”.'),
    ],
  },
  {
    id: 'negotiation',
    title: '10–11. Negociere',
    fields: [
      f('nego.eyebrow', 'Negociere — supratitlu', 'Negociere'),
      f('nego.title', 'Negociere — titlu', 'Negocierea este primul nostru instrument. Nu singurul.'),
      f(
        'nego.text',
        'Negociere — text',
        lines(
          'Știm că multe creanțe se pot recupera fără să ajungă în instanță.',
          'Dar negocierea nu înseamnă să cerem banii. Înseamnă să înțelegem: ce poate plăti debitorul, când poate plăti și ce îl determină să plătească acum.',
        ),
        'lines',
      ),
      f(
        'nego.list',
        'Negociere — pași',
        lines('Construim soluția.', 'Stabilim termenul.', 'Obținem angajamentul.', 'Și îl urmărim.'),
        'list',
      ),
      f('fail.eyebrow', 'Dacă nu plătește — supratitlu', 'Când negocierea nu mai ajunge'),
      f('fail.title', 'Dacă nu plătește — titlu', 'Și dacă nu plătește?'),
      f(
        'fail.text',
        'Dacă nu plătește — text',
        'Atunci nu mai negociem la nesfârșit. Analizăm următorul instrument disponibil și îl folosim.',
        'textarea',
      ),
    ],
  },
  {
    id: 'audience',
    title: '12–13. Antreprenori / Companii mari',
    fields: [
      f('aud.tab1', 'Tab mobil 1', 'Antreprenori'),
      f('aud.tab2', 'Tab mobil 2', 'Companii mari'),
      f('ent.eyebrow', 'Antreprenori — supratitlu', 'Pentru antreprenori'),
      f('ent.title', 'Antreprenori — titlu', 'Ai muncit pentru banii tăi.'),
      f('ent.text1', 'Antreprenori — rând', 'Ai livrat. Ai prestat. Ai facturat.'),
      f('ent.quote', 'Antreprenori — evidențiat', 'Acum este timpul să fii plătit.'),
      f(
        'ent.text2',
        'Antreprenori — text',
        'Nu lăsa o creanță să devină „o problemă de rezolvat când avem timp”. Banii blocați sunt bani care nu lucrează pentru compania ta.',
        'textarea',
      ),
      f('corp.eyebrow', 'Companii mari — supratitlu', 'Pentru companii mari'),
      f(
        'corp.title',
        'Companii mari — titlu',
        'Când ai de recuperat milioane, nu îți permiți să trimiți un email și să aștepți.',
        'textarea',
      ),
      f('corp.lead', 'Companii mari — introducere listă', 'Ai nevoie de:'),
      f(
        'corp.list',
        'Companii mari — listă',
        lines('Strategie', 'Control', 'Raportare', 'Termene', 'Accelerare elegantă', 'O echipă care urmărește dosarul'),
        'list',
      ),
      f('corp.quote', 'Companii mari — concluzie', 'Exact asta facem.'),
    ],
  },
  {
    id: 'different',
    title: '14–15. Ce ne diferențiază',
    fields: [
      f('diff.eyebrow', 'Supratitlu', 'Ce ne diferențiază'),
      f('diff.title', 'Titlu', 'Nu suntem pentru oricine.'),
      f(
        'diff.p1',
        'Paragraf 1',
        'Dacă vrei doar să trimiți o notificare și să vezi ce se întâmplă, există variante mai simple.',
        'textarea',
      ),
      f(
        'diff.p2',
        'Paragraf 2',
        'Dacă vrei să transferi problema către cineva care o preia și o duce până la capăt, discutăm.',
        'textarea',
      ),
      f('diff.quote', 'Concluzie', 'Evocati este pentru companiile care vor rezultate.'),
      f('verify.title1', 'Card — titlu (gri)', 'Nu trebuie să ne crezi.'),
      f('verify.title2', 'Card — titlu (alb)', 'Verifică-ne.'),
      f(
        'verify.list',
        'Card — listă',
        lines('Experiența se verifică.', 'Rezultatele se verifică.', 'Dosarele se verifică.', 'Modul în care lucrăm se vede.'),
        'list',
      ),
      f('verify.note', 'Card — notă', 'Restul sunt doar cuvinte.'),
    ],
  },
  {
    id: 'team',
    title: '16. Echipa',
    fields: [
      f('team.eyebrow', 'Supratitlu', 'Despre echipă'),
      f('team.title', 'Titlu', 'O echipă tânără. *O experiență serioasă.*'),
      f(
        'team.p1',
        'Paragraf 1',
        'Suntem o echipă construită în jurul unui principiu simplu: problemele complicate nu se rezolvă cu soluții standard.',
        'textarea',
      ),
      f(
        'team.p2',
        'Paragraf 2',
        'Avem experiență în negociere, recuperare, strategie comercială și demersuri juridice.',
        'textarea',
      ),
      f('team.card', 'Card — text', 'Lucrăm rapid. Comunicăm direct. Și nu pierdem din vedere obiectivul.', 'textarea'),
      f('team.word', 'Card — cuvânt final', 'Recuperarea.'),
    ],
  },
  {
    id: 'confidentiality',
    title: '17. Confidențialitate',
    fields: [
      f('conf.eyebrow', 'Supratitlu', 'Confidențialitate'),
      f('conf.title', 'Titlu', 'Discreția nu este un bonus. *Este standardul.*'),
      f(
        'conf.p1',
        'Paragraf 1',
        'Creanțele comerciale țin de business. Iar business-ul clientului nostru rămâne al clientului nostru.',
        'textarea',
      ),
      f(
        'conf.p2',
        'Paragraf 2',
        'Tratăm fiecare dosar cu discreție, profesionalism și control asupra informațiilor.',
        'textarea',
      ),
      f('conf.p3', 'Rând final', 'Fără spectacol. Fără expunere inutilă.'),
    ],
  },
  {
    id: 'contactSection',
    title: '18. Formular „Solicită o analiză”',
    fields: [
      f('cs.title', 'Titlu', 'Ai o creanță neîncasată?'),
      f('cs.lead', 'Subtitlu', 'Nu mai aștepta următoarea promisiune.'),
      f(
        'cs.text',
        'Text',
        'Trimite-ne situația. O analizăm. Îți spunem ce putem face. Iar dacă putem recupera, începem.',
        'textarea',
      ),
      f('cs.button', 'Buton trimitere', 'Vreau să recuperez'),
      f('cs.success', 'Mesaj după trimitere', 'Mulțumim. Analizăm situația și te contactăm în cel mai scurt timp.', 'textarea'),
    ],
  },
  {
    id: 'footer',
    title: 'Subsol (footer)',
    fields: [
      f('footer.tagline', 'Slogan', lines('Siguranță. Certitudine. Rezultate.', 'Mâna puternică. Negocierea fină.'), 'lines'),
      f('footer.motto', 'Motto', 'NU PROMITEM. RECUPERĂM.'),
      f(
        'footer.bottom',
        'Text jos',
        'Recuperarea creanțelor comerciale, făcută cu strategie, presiune elegantă și experiență.',
        'textarea',
      ),
    ],
  },
]

export const defaults: Record<string, string> = Object.fromEntries(
  contentSchema.flatMap((s) => s.fields.map((fl) => [fl.key, fl.default])),
)
