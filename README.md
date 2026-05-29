# Slant Web

Portfolio web pro studio Slant — postavený na **Astro 5** + **Sanity** + **GSAP/Lenis**.

## Stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend framework | [Astro 5](https://astro.build) |
| CMS | [Sanity](https://sanity.io) (free tier) |
| Animace | [GSAP 3](https://gsap.com) + [Lenis](https://lenis.darkroom.engineering) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) (free, komerční use OK) |

---

## Spuštění

### 1. Závislosti

```bash
npm install
```

### 2. Vytvoř Sanity projekt

1. Jdi na [sanity.io/manage](https://sanity.io/manage)
2. „New project" → pojmenuj ho „Slant Studio"
3. Zkopíruj **Project ID**

### 3. Nastav proměnné

```bash
cp .env.example .env
```

Otevři `.env` a doplň svůj Project ID:
```
PUBLIC_SANITY_PROJECT_ID=tvuj-project-id
PUBLIC_SANITY_DATASET=production
```

Stejný Project ID doplň i v `sanity.config.ts`:
```ts
const projectId = 'tvuj-project-id'
```

### 4. Spusť

Ve **dvou terminálech**:

```bash
# Terminál 1 — Sanity Studio (editor obsahu)
npm run studio
# → http://localhost:3333

# Terminál 2 — Astro (frontend)
npm run dev
# → http://localhost:4321
```

### 5. Přidej první case study

1. Otevři `http://localhost:3333`
2. „Publish" pro aktivaci datasetu
3. „New document" → Case Study
4. Vyplň pole, nahraj obrázky, klikni **Publish**
5. Frontend se automaticky aktualizuje

---

## Struktura projektu

```
slant-web/
├── schemas/                  ← Sanity schémata (datový model)
│   ├── documents/caseStudy.ts
│   └── objects/contentSection.ts
├── src/
│   ├── components/
│   │   ├── AnimationInit.astro   ← GSAP + Lenis init
│   │   ├── CaseStudyCard.astro   ← Karta v listingu
│   │   └── PortableText.astro    ← Rich text renderer
│   ├── layouts/Layout.astro      ← Základní šablona
│   ├── lib/
│   │   ├── sanity.ts             ← Sanity klient
│   │   ├── queries.ts            ← GROQ dotazy
│   │   └── imageUrl.ts           ← Image URL builder
│   ├── pages/
│   │   ├── index.astro           ← Homepage
│   │   └── work/
│   │       ├── index.astro       ← Listing
│   │       └── [slug].astro      ← Detail case study
│   └── styles/global.css         ← CSS tokeny + reset
├── sanity.config.ts              ← Sanity Studio konfigurace
├── astro.config.mjs
└── .env.example
```

---

## Nasazení na Cloudflare Pages

1. Pushni repo na GitHub
2. Na [dash.cloudflare.com](https://dash.cloudflare.com) → „Pages" → „Connect to Git"
3. Build command: `npm run build`
4. Build output: `dist`
5. Environment variables: přidej `PUBLIC_SANITY_PROJECT_ID` a `PUBLIC_SANITY_DATASET`
6. Pro automatický rebuild po publikaci v Sanity: nastav Deploy Hook (Cloudflare Pages → Settings → Deploy hooks) a vlož URL do Sanity projektu (sanity.io/manage → API → Webhooks)

---

## GSAP animace

GSAP a pluginy jsou od dubna 2025 **100% zdarma** včetně SplitText, ScrollTrigger, ScrollSmoother.

`AnimationInit.astro` inicializuje vše automaticky. V libovolné stránce/komponentě pak:

```html
<!-- data-fade: element se vyjeví zdola při načtení -->
<h1 data-fade>Nadpis</h1>

<!-- Vlastní animace v <script> tagu nebo .ts souboru: -->
<script>
  const gsap = window.__gsap
  const ST = window.__ScrollTrigger

  gsap.from('.cs-hero__title', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: { trigger: '.cs-hero', start: 'top 80%' }
  })
</script>
```

---

## Přidání fontu

Aktuálně: DM Sans + DM Serif Display (Google Fonts).
Uprav v `src/layouts/Layout.astro` → sekce `<!-- FONTY -->` a v `src/styles/global.css` → `--font-sans` + `--font-display`.

---

## Cena provozu

| Služba | Cena |
|--------|------|
| Sanity (free tier) | 0 Kč |
| Cloudflare Pages | 0 Kč |
| GitHub | 0 Kč |
| Doména (~10–12 $/rok) | ~25 Kč/měsíc |
| **Celkem** | **~25 Kč/měsíc** |
