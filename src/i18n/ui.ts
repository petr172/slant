export const languages = {
  cs: 'CZ',
  en: 'EN',
} as const

export type Lang = keyof typeof languages

export const ui = {
  cs: {
    'nav.work':    'Work',
    'nav.contact': 'Contact',

    'work.viewAll':   'Zobrazit vše →',
    'work.projects':  'projektů',
    'work.empty':     'Zatím žádné projekty — přidej je v Sanity Studiu.',
    'work.backToWork': '← Work',
    'work.viewSite':  'Zobrazit web ↗',
    'work.notFound':  'Projekt nebyl nalezen.',

    'home.location':  'Brno, CZ',
    'home.type':      'Branding & UX Studio',
    'home.headline':  'Identity pro<br>značky, které<br>chtějí vyniknout.',
    'home.desc':      'Vytváříme vizuální systémy, pojmenování a digitální zážitky pro ambiciózní značky — od prvního konceptu až po spuštění.',
    'home.cta':       'Prohlédnout projekty',
    'home.selected':  'Selected Work',
    'home.collab':    'Pojďme spolupracovat',
    'home.contact.headline': 'Máš projekt?<br>Ozvi se.',

    'meta.home.title': 'Slant — Branding & UX Studio',
    'meta.home.desc':  'Branding & UX Studio z Brna. Vytváříme vizuální identity, pojmenování a digitální zážitky pro ambiciózní značky.',
    'meta.work.title': 'Work',
    'meta.work.desc':  'Vybrané projekty — branding, UX/UI, packaging a vizuální identity.',

    'cs.client':   'Klient',
    'cs.year':     'Rok',
    'cs.industry': 'Odvětví',
    'cs.live':     'Live',
  },
  en: {
    'nav.work':    'Work',
    'nav.contact': 'Contact',

    'work.viewAll':   'View all →',
    'work.projects':  'projects',
    'work.empty':     'No projects yet — add them in Sanity Studio.',
    'work.backToWork': '← Work',
    'work.viewSite':  'Visit site ↗',
    'work.notFound':  'Project not found.',

    'home.location':  'Brno, CZ',
    'home.type':      'Branding & UX Studio',
    'home.headline':  'Identities for<br>brands that<br>want to stand out.',
    'home.desc':      'We create visual systems, naming, and digital experiences for ambitious brands — from first concept to launch.',
    'home.cta':       'View projects',
    'home.selected':  'Selected Work',
    'home.collab':    'Let\'s work together',
    'home.contact.headline': 'Got a project?<br>Get in touch.',

    'meta.home.title': 'Slant — Branding & UX Studio',
    'meta.home.desc':  'Branding & UX Studio based in Brno. We create visual identities, naming, and digital experiences for ambitious brands.',
    'meta.work.title': 'Work',
    'meta.work.desc':  'Selected projects — branding, UX/UI, packaging, and visual identities.',

    'cs.client':   'Client',
    'cs.year':     'Year',
    'cs.industry': 'Industry',
    'cs.live':     'Live',
  },
} satisfies Record<Lang, Record<string, string>>

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof ui['cs']): string {
    return ui[lang][key] ?? ui['cs'][key]
  }
}
