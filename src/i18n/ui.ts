export const languages = {
  cs: 'CZ',
  en: 'EN',
} as const

export type Lang = keyof typeof languages

export const ui = {
  cs: {
    'nav.work':    'Práce',
    'nav.contact': 'Kontakt',

    'work.viewAll':   'Zobrazit vše →',
    'work.projects':  'projektů',
    'work.empty':     'Projekty sem brzy přidáme.',
    'work.backToWork': '← Práce',
    'work.viewSite':  'Zobrazit web ↗',
    'work.notFound':  'Projekt nebyl nalezen.',

    'home.location':  'Brno, CZ',
    'home.type':      'Branding & UX Studio',
    'home.headline':  'Identity pro<br>značky, které<br>chtějí vyniknout.',
    'home.desc':      'Vizuální identity, naming a digitální zážitky pro ambiciózní značky. Od prvního konceptu po spuštění.',
    'home.cta':       'Prohlédnout projekty',
    'home.selected':  'Vybrané práce',
    'home.collab':    'Pojďme spolupracovat',
    'home.contact.headline': 'Máte projekt?<br>Ozvěte se.',

    'meta.home.title': 'Slant — Branding & UX Studio',
    'meta.home.desc':  'Branding & UX studio z Brna. Tvoříme vizuální identity, naming a digitální zážitky pro ambiciózní značky.',
    'meta.work.title': 'Práce',
    'meta.work.desc':  'Vybrané projekty studia Slant — branding, naming, webdesign, obalový a grafický design.',

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
    'work.empty':     'Projects coming soon.',
    'work.backToWork': '← Work',
    'work.viewSite':  'Visit site ↗',
    'work.notFound':  'Project not found.',

    'home.location':  'Brno, CZ',
    'home.type':      'Branding & UX Studio',
    'home.headline':  'Identities for<br>brands that<br>want to stand out.',
    'home.desc':      'Visual identities, naming and digital experiences for ambitious brands. From first concept to launch.',
    'home.cta':       'View projects',
    'home.selected':  'Selected work',
    'home.collab':    'Let\'s work together',
    'home.contact.headline': 'Got a project?<br>Get in touch.',

    'meta.home.title': 'Slant — Branding & UX Studio',
    'meta.home.desc':  'Branding & UX studio based in Brno, Czech Republic. We create visual identities, naming and digital experiences for ambitious brands.',
    'meta.work.title': 'Work',
    'meta.work.desc':  'Selected work by Slant — branding, naming, web design, packaging and graphic design.',

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
