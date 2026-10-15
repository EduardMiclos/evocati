// Legal pages, copied verbatim from evocati-legal.ro (Oct 2026).
// Blocks: { p } paragraph · { h } subheading · { n, text, bullets?, after? } numbered clause.

export type LegalBlock =
  | { p: string }
  | { h: string }
  | { n: number; text: string; bullets?: string[]; after?: string[] }

export interface LegalDoc {
  title: string
  blocks: LegalBlock[]
}

export const terms: LegalDoc = {
  "title": "Termeni și condiții",
  "blocks": [
    {
      "p": "S.C. EVOCATI DEBTS MANAGEMENT S.R.L., persoană juridică română, cu sediul social in loc. Timișoara, str. Danaide nr 30A, apt. 1, Dumbrăvița, jud. Timiș, e-mail office@evocati-legal.ro, înregistrată la Registrul Comerțului sub nr. J35/1619/2016, CUI 36154280, având contul nr. RO11 INGB 0000 9999 0598 9202, deschis la ING Bank Timișoara, reprezentată legal prin Tamas Raluca, în calitate de deținător al domeniului evocati-legal.ro, respectiv al web site-ului: https://evocati-legal.ro convenim următoarele:"
    },
    {
      "p": "Prin fiecare accesare a website-ului antenumit, utilizatorul este de acord cu privire la următorii termeni si conditii:"
    },
    {
      "n": 1,
      "text": "Deținătorul domeniului, respectiv EVOCATI DEBTS MANAGEMENT S.R.L, își asumă transmiterea informațiilor publicate prin formularele puse la dispoziție de utilizator, în campurile aferente, conform informațiilor transmise de utilizator -respectiv- pe adresa de e-mail, sold comunicat, documentele atasate;"
    },
    {
      "n": 2,
      "text": "Utilizatorul este deplin responsabil de corectitudinea, veridicitatea și legitimitatea informațiilor transmise;"
    },
    {
      "n": 3,
      "text": "EVOCATI DEBTS MANAGEMENT S.R.L nu are obligația de a verifica corectitudinea precum și legitimitatea informațiilor oferite de utilizator, respectiv adresele de e-mail, sold comunicat, continut documente atasate de user;"
    },
    {
      "n": 4,
      "text": "EVOCATI DEBTS MANAGEMENT SRL NU ESTE RĂSPUNZĂTOR DE DOCUMENTELE ÎNCĂRCATE DE USER PE WEBSITE-UL Evocati-legal.ro, acesta datorând direct atât deținătorului domeniului cât și destinatarului final al adreselor de email introduse de către acesta, orice despagubiri privitoare la o eventuala prejudiciere de imagine cauzată. Evocati Debts Management este complet absolvită de orice acțiune de despăgubiri ce ar putea fi promovată atat de debitor cât și de user. În acest sens, Userul va fi direct răspunzător de orice acțiune privitoare la debite, penalități și prejudicii de orice natura aduse debitorului precum și societății Evocati Debts Management SRL prin transmiterea informațiilor eronate sau neconforme cu realitatea sau care nu sunt conforme cu interesul comercial al website-ului.",
      "after": [
        "În cazul încălcării clauzei de mai sus, user-ul va fi supus unei clauze penale de 100 000 euro."
      ]
    },
    {
      "n": 5,
      "text": "EVOCATI DEBTS MANAGEMENT S.R.L are obligația de pune la dispoziție sistemul informatic de redactare automată a notificarii de plată pe baza informațiilor transmise de utilizator. Aceasta va fi transmisă conform adreselor indicate de utilizator, fără nicio obligație de a verifica adresele de e-mail în prealabil."
    },
    {
      "n": 6,
      "text": "Prețul poate suferi modificări în orice moment, aceste prețuri nu reprezintă o ofertă contractuală."
    },
    {
      "n": 7,
      "text": "Acceptarea termenilor și condițiilor se va face la orice acțiune realizată de utilizatori prin intermediul site-ului. Folosirea site-ului se face doar în baza acceptării acestor termeni contractuali. Fără nicio excepție."
    },
    {
      "n": 8,
      "text": "Evocati Debts Management SRL menționează că întreg conținutul site-ului web este protejat prin intermediul drepturilor de proprietate intelectuală."
    },
    {
      "n": 9,
      "text": "Evocati Debts Management SRL își asumă răspunderea pentru păstrarea confidențialității datelor vizitatorilor și userilor website-ului său."
    },
    {
      "n": 10,
      "text": "Prin completarea câmpurilor dispuse pe website-ul Evocati Debts Management SRL, utilizatorul nu mandatează societatea în vederea recuperării debitelor introduse ci strict transmiterea prin sistemul informatic, a informațiilor introduse de utilizator."
    },
    {
      "n": 11,
      "text": "Evocati Debts Management respectă Regulamentul GDPR, respectiv Regulamentul 679/ 2016 în vigoare. Astfel că, utilizatorii website-ului își asumă în integralitate răspunderea pentru încălcarea Regulamentului antenumit."
    },
    {
      "h": "Politica de anulare serviciu"
    },
    {
      "p": "S.C. EVOCATI DEBTS MANAGEMENT S.R.L., persoană juridică română, cu sediul social in loc. Timișoara, str. Danaide nr 30A, apt. 1, Dumbrăvița, jud. Timiș, e-mail office@evocati-legal.ro, înregistrată la Registrul Comerțului sub nr. J35/1619/2016, CUI 36154280, având contul nr. RO11 INGB 0000 9999 0598 9202, deschis la ING Bank Timișoara, reprezentată legal prin Tamas Raluca, în calitate de deținător al domeniului evocati-legal.ro, respectiv al web site-ului: https://evocati-legal.ro convenim următoarele:"
    },
    {
      "p": "Deținătorul domeniului nu va rambursa nicio sumă decontata de utilizatori, pentru serviciile prestate pe website-ul său având în vedere natura serviciilor prestate."
    },
    {
      "h": "Sesizări"
    },
    {
      "p": "Pentru orice sesizări cu privire la funcționalitatea serviciului furnizat, ne puteți contacta la adresa de email: sesizari@evocati-legal.ro, termen de răspuns 5 zile lucrătoare de la data transmiterii sesizării."
    }
  ]
}

export const privacy: LegalDoc = {
  "title": "Politica de confidențialitate",
  "blocks": [
    {
      "p": "EVOCATI DEBTS MANAGEMENT SRL, cu sediul procesual ales în Localitatea Dumbrăvița, str. Conac, nr. 60, et. 3, Biroul 24, Jud. Timiș având CUI 36154280, Nr. Înmatriculare J35/1619/2016, reprezentată prin administrator, cu ocazia încheierii contractului, vă aduce la cunoștință următoarele:"
    },
    {
      "p": "Prin fiecare accesare a website-ului antenumit, utilizatorul este de acord cu privire la următorii termeni si conditii:"
    },
    {
      "n": 1,
      "text": "Respectăm dispozițiile legale privitoare la protecția datelor cu caracter personal și punem în aplicare măsuri tehnice și organizatorice de protejare a tuturor operațiunilor privitoare în mod direct sau indirect la datele cu caracter personal, care previn prelucrările neautorizate sau ilegale, precum și pierderile sau distrugerile accidentale sau ilegale."
    },
    {
      "n": 2,
      "text": "Prelucrăm numele și prenumele dumneavoastră, domiciliul și codul numeric personal cuprinse în contractul încheiat cu noi, pentru:",
      "bullets": [
        "executarea contractului încheiat cu dumneavoastră, inclusiv realizarea activităților efectuate de noi în interesul dumneavoastră în virtutea contractului dintre noi;",
        "îndeplinirea obligațiilor fiscale legate de plata onorariului;",
        "redactarea înscrisurilor în numele dumneavoastră, potrivit mandatului încredințat;",
        "înaintarea către instanțe și alte instituții, autorități, organizații și persoane fizice, din România și din alte țări, în calitate de reprezentant convențional a cererilor și altor înscrisuri necesare executării mandatului încredințat;",
        "îndeplinirea obligațiilor instituite de lege în sarcina noastră;",
        "îndeplinirea obligației noastre profesionale de ținere a evidenței contractelor încheiate."
      ],
      "after": [
        "Aceste date vor fi păstrate pe durata ținerii evidențelor profesionale ."
      ]
    },
    {
      "n": 3,
      "text": "Prelucrăm numărul dumneavoastră de telefon și adresa dumneavoastră de e-mail, pentru:",
      "bullets": [
        "comunicarea cu dumneavoastră."
      ],
      "after": [
        "Aceste date vor fi păstrate pe durata ținerii evidențelor profesionale."
      ]
    },
    {
      "n": 4,
      "text": "Prelucrăm datele cuprinse în solicitările și informările dumneavoastră către noi și datele prepușilor și terților cuprinse în înscrisurile pe care ni le aduceți la cunoștință, pentru:",
      "bullets": [
        "realizarea interesului dumneavoastră legitim de a beneficia de reprezentare;",
        "realizarea interesului public de realizare a serviciilor și scopurilor legitime ale societății."
      ],
      "after": [
        "Aceste date vor fi păstrate pe durata executării contractului dintre dumneavoastră și subscrisa."
      ]
    },
    {
      "n": 5,
      "text": "Nu utilizăm datele cu caracter personal pentru prelucrare automatizată și nici pentru realizarea de profile. Nu luăm niciodată decizii automate cu privire la dumneavoastră. Utilizăm mijloace tehnice pentru stocarea datelor în condiții de securitate. Nu prelucrăm date în scopuri secundare incompatibile cu scopurile pentru care le-am colectat."
    },
    {
      "n": 6,
      "text": "Respectăm și asigurăm în mod strict secretul profesional. Nu dezvăluim datele decât pentru realizarea intereselor dumneavoastră sau îndeplinirea obligațiilor legale. Confidențialitatea este pentru noi nu doar o obligație profesională, ci și o valoare esențială."
    },
    {
      "n": 7,
      "text": "Revizuim în fiecare an datele colectate, analizând în ce măsură păstrarea lor este necesară scopurilor menționate, intereselor dumneavoastră legitime sau îndeplinirii obligațiilor legale de către avocat. Datele care nu mai sunt necesare vor fi șterse."
    },
    {
      "n": 8,
      "text": "EVOCATI DEBTS MANAGEMENT SRL nu își asumă răspunderea pentru date, informațiile și înscrisurile pe care ni le puneți la dispoziție, această răspundere aparține mandantului."
    },
    {
      "n": 9,
      "text": "Beneficiați de dreptul de acces, intervenție, rectificare și portare cu privire la datele pe care ni le furnizați, să limitați prelucrarea realizată de noi și chiar să solicitați ștergerea datelor. Menționăm că intervenția asupra datelor pe care ni le-ați furnizat poate fi de natură să împiedice executarea contractului încheiat între dumneavoastră și subscrisa. În acest caz subscrisa societate este exonerată de răspundere. Vă rugăm să ne aduceți la cunoștință solicitările dumneavoastră, în orice modalitate care este asigurătoare cu privire la identitatea solicitantului și îndreptățirea lui. Vă vom răspunde neîntârziat. Dacă sunteți nemulțumit, aveți posibilitatea să vă adresați ANSPDCP."
    }
  ]
}
