# CLAUDE.md

Portfolio web studia Slant (slant.cz): Astro 5 + Sanity + GSAP/Lenis, Tailwind 4. Komunikace, komentáře v kódu i texty v UI jsou česky; commit messages anglicky.

## Příkazy

```bash
npm run dev       # Astro frontend → http://localhost:4321 (preview v .claude/launch.json běží na 4399)
npm run studio    # Sanity Studio → http://localhost:3333
npm run build     # statický build do dist/ (+ worker pro API routes)
node scripts/<name>.mjs   # seed/migrační skripty do Sanity, potřebují SANITY_WRITE_TOKEN v .env
```

Node 20 (`.nvmrc`). Testy ani linter v projektu nejsou: ověřuje se přes `npm run build` a vizuálně v prohlížeči.

## Architektura

- **Výstup:** `output: 'static'`. Všechny stránky se prerenderují při buildu z dat ze Sanity (`getStaticPaths`). Změna obsahu v Sanity se na webu projeví až po novém buildu/deployi.
- **API routes** (`src/pages/api/*.ts`: `contact`, `booking`, `lottie`) mají `export const prerender = false` a běží jako Cloudflare Worker. Server-only env proměnné jsou bez prefixu `PUBLIC_`, viz `.env.example`.
- **i18n:** `cs` je výchozí jazyk bez prefixu, `en` má prefix `/en/`. Route soubory v `src/pages/` a `src/pages/en/` jsou tenké wrappery: načtou data a renderují sdílenou komponentu ze `src/components/pages/*Page.astro` s propem `lang`. Logika a markup patří do `*Page.astro`, ne do route souborů, a každou novou stránku je potřeba přidat v obou jazycích.
  - Statické UI texty jsou v `src/i18n/ui.ts`.
  - Obsah ze Sanity má lokalizovaná pole jako dvojice `field` / `fieldEn` (např. `title`, `titleEn`).
- **Sanity:**
  - Schémata jsou v `schemas/` (`caseStudy`, `blogPost`, `legalPage`, `siteSettings` jako singleton), konfigurace Studia v `sanity.config.ts`.
  - GROQ dotazy jsou centrálně v `src/lib/queries.ts`, klienti v `src/lib/sanity.ts` (`client` přes CDN, `previewClient` se stega pro visual editing).
  - Obrázky se generují přes `SanityImage.astro` / `src/lib/imageUrl.ts`. Optimalizaci dělá Sanity CDN (Astro image service je `passthrough`). Sanity neumí AVIF, používej WebP.
  - Project ID `wgpoci6t` a dataset `production` jsou veřejné a slouží jako fallback.
- **Layout** (`src/layouts/Layout.astro`): meta/OG/JSON-LD, page-wipe přechody mezi stránkami (čisté CSS transitions, záměrně bez GSAP), FloatBadge, ContactModal (booking + formulář), analytika (GA4, PostHog až po souhlasu) a lazy načtení `@sanity/visual-editing`.
- **Animace:** `AnimationInit.astro` inicializuje Lenis + GSAP (ScrollTrigger, SplitText) a vystaví je jako `window.__gsap`, `window.__lenis`, `window.__ScrollTrigger` a `window.__SplitText`. Respektuje `prefers-reduced-motion` (`window.__reducedMotion`), takže nové animace to musí dodržet také.
- **Styly:** Tailwind 4 přes `@tailwindcss/vite` a k tomu scoped `<style>` v Astro komponentách. Tokeny jsou CSS proměnné v `src/styles/global.css` (např. `--clr-accent: #FF5522`). Font je Ronzino (self-hosted v `public/fonts`). Alias `@/*` míří na `src/*`.

## Hosting a deploy

- Probíhá migrace z Vercelu na **Cloudflare Workers** (větev `cloudflare-migration`). Konfigurace je ve `wrangler.toml` a adaptér je `@astrojs/cloudflare`.
- Bezpečnostní hlavičky a CSP jsou ve dvou kopiích: `public/_headers` (Cloudflare) a `vercel.json` (Vercel). Při úpravě CSP (nový zdroj skriptů, obrázků nebo videa apod.) změň obě. Po přechodu DNS půjde vercelová kopie i `@astrojs/vercel` odstranit.
- `PREVIEW_URL` v `sanity.config.ts` míří na `slant-4od.pages.dev`. Po přechodu DNS ho přepni na `https://slant.cz`.
- `_archiv/` je lokální a nikdy se nedeployuje.

## Zásady

- Kód cílí i na Safari/WebKit. Ten měl opakované problémy s ořezem inline SVG, proto se loga v TrustWall renderují jako `<img>`.
- Velké stránkové komponenty (`HomePage`, `WorkDetailPage`, `Layout`) mají přes 1000 řádků. Edituj cíleně, nepřepisuj je celé.
- Styl commitů: `scope: krátký popis` (např. `fix(TrustWall): …`, `Gallery: …`, `CSP: …`).
