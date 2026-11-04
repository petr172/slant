// Liquid glass lom pro hero chipy (jen Chromium — Safari/Firefox neumí
// SVG filtr v backdrop-filter, tam zůstává CSS matné sklo).
// Pro každý chip se vygeneruje displacement mapa pilulky: uprostřed rovno,
// na hraně (bezelu) se pozadí „ohýbá" dovnitř jako v čočce.

const SVG_NS = 'http://www.w3.org/2000/svg'
const SCALE = 22          // síla lomu (px)
const BEZEL = 12          // šíře hrany s lomem (px)

const isChromium = () =>
  !!(navigator as any).userAgentData?.brands?.some((b: any) => /Chromium/i.test(b.brand))

function displacementMap(w: number, h: number, bezel = BEZEL): string {
  const k = w * h > 40000 ? 1 : 2              // 2× rozlišení → hladší hrana; velké prvky (nav) stačí 1×
  const cw = Math.round(w * k), ch = Math.round(h * k)
  const c = document.createElement('canvas')
  c.width = cw; c.height = ch
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(cw, ch)
  const hw = w / 2, hh = h / 2, r = hh
  const sd = (x: number, y: number) => {
    const qx = Math.abs(x - hw) - (hw - r), qy = Math.abs(y - hh) - (hh - r)
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  }
  const b = Math.min(bezel, hh)
  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const x = (i + 0.5) / k, y = (j + 0.5) / k
      const d = sd(x, y)
      let dx = 0, dy = 0
      const e = -d                               // vzdálenost od hrany dovnitř
      if (e > 0 && e < b) {
        const gx = sd(x + 0.5, y) - sd(x - 0.5, y)
        const gy = sd(x, y + 0.5) - sd(x, y - 0.5)
        const gl = Math.hypot(gx, gy) || 1
        const t = 1 - e / b
        const m = t * t                          // konvexní profil čočky
        dx = -(gx / gl) * m                      // vzorkuje směrem dovnitř
        dy = -(gy / gl) * m
      }
      const o = (j * cw + i) * 4
      img.data[o] = 128 + dx * 127
      img.data[o + 1] = 128 + dy * 127
      img.data[o + 2] = 128
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}

type GlassOpts = { id: string; scale?: number; bezel?: number; blur?: number; minWidth?: string }

let svgHost: SVGSVGElement | null = null
const host = () => {
  if (svgHost) return svgHost
  svgHost = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
  svgHost.setAttribute('aria-hidden', 'true')
  svgHost.setAttribute('width', '0'); svgHost.setAttribute('height', '0')
  Object.assign(svgHost.style, { position: 'absolute', width: '0', height: '0', overflow: 'hidden' })
  document.body.appendChild(svgHost)
  return svgHost
}

/** Liquid glass lom na libovolném prvku (pilulka s radius = výška/2). Jen Chromium. */
export function applyLiquidGlass(el: HTMLElement, o: GlassOpts) {
  if (!isChromium() || !CSS.supports('backdrop-filter', 'url(#x)')) return
  const mq = o.minWidth ? window.matchMedia(`(min-width: ${o.minWidth})`) : null
  let lastW = 0, lastH = 0

  const build = () => {
    if (mq && !mq.matches) {
      host().querySelector(`#${o.id}`)?.remove()
      el.style.backdropFilter = ''; lastW = lastH = 0; return
    }
    const w = el.offsetWidth, h = el.offsetHeight
    if (!w || !h || (w === lastW && h === lastH)) return
    lastW = w; lastH = h
    host().querySelector(`#${o.id}`)?.remove()
    host().insertAdjacentHTML('beforeend', `
      <filter id="${o.id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage href="${displacementMap(w, h, o.bezel ?? BEZEL)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
        <feGaussianBlur in="SourceGraphic" stdDeviation="${o.blur ?? 1.2}" result="soft"/>
        <feDisplacementMap in="soft" in2="map" scale="${o.scale ?? SCALE}" xChannelSelector="R" yChannelSelector="G" result="bent"/>
        <feColorMatrix in="bent" type="saturate" values="1.5"/>
      </filter>`)
    el.style.backdropFilter = `url(#${o.id})`
  }

  build()
  // Při animaci šířky (nav se při scrollu zužuje) mapu přepočítáme až po doběhnutí
  let t: number | undefined
  new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(build, 140) }).observe(el)
  mq?.addEventListener('change', build)
  document.fonts?.ready.then(build)
}

export function initChipGlass(chips: HTMLElement[]) {
  // na mobilu chipy leží mimo nadpis → lom zbytečný
  chips.forEach((chip, n) => applyLiquidGlass(chip, { id: `chip-glass-${n}`, minWidth: '48.0625em' }))
}
