// Liquid glass lom pro hero chipy (jen Chromium — Safari/Firefox neumí
// SVG filtr v backdrop-filter, tam zůstává CSS matné sklo).
// Pro každý chip se vygeneruje displacement mapa pilulky: uprostřed rovno,
// na hraně (bezelu) se pozadí „ohýbá" dovnitř jako v čočce.

const SVG_NS = 'http://www.w3.org/2000/svg'
const SCALE = 22          // síla lomu (px)
const BEZEL = 12          // šíře hrany s lomem (px)

const isChromium = () =>
  !!(navigator as any).userAgentData?.brands?.some((b: any) => /Chromium/i.test(b.brand))

function displacementMap(w: number, h: number): string {
  const k = 2                                  // 2× rozlišení → hladší hrana
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
  const b = Math.min(BEZEL, hh)
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

export function initChipGlass(chips: HTMLElement[]) {
  if (!isChromium() || !CSS.supports('backdrop-filter', 'url(#x)')) return

  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0')
  Object.assign(svg.style, { position: 'absolute', width: '0', height: '0', overflow: 'hidden' })
  document.body.appendChild(svg)

  const mq = window.matchMedia('(min-width: 48.0625em)')   // na mobilu chipy leží mimo nadpis → lom zbytečný

  const apply = () => {
    svg.innerHTML = ''
    chips.forEach((chip, n) => {
      if (!mq.matches) { chip.style.backdropFilter = ''; return }
      const w = chip.offsetWidth, h = chip.offsetHeight
      if (!w || !h) return
      const id = `chip-glass-${n}`
      svg.insertAdjacentHTML('beforeend', `
        <filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse"
                primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feImage href="${displacementMap(w, h)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="soft"/>
          <feDisplacementMap in="soft" in2="map" scale="${SCALE}" xChannelSelector="R" yChannelSelector="G" result="bent"/>
          <feColorMatrix in="bent" type="saturate" values="1.5"/>
        </filter>`)
      chip.style.backdropFilter = `url(#${id})`
    })
  }

  apply()
  let t: number | undefined
  window.addEventListener('resize', () => { clearTimeout(t); t = window.setTimeout(apply, 200) })
  document.fonts?.ready.then(apply)              // šířka chipu závisí na fontu
}
