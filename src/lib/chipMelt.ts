// Hero chip hover náhled — „melt" efekt ve WebGL.
// Až 3 zaoblené obrázky u kurzoru, které postupně vytékají jeden z druhého
// a v místě dotyku se hladce slévají (SDF rounded rect + smooth union).
// Jeden malý canvas, žádná knihovna; kreslí se jen během hoveru.
import { gsap } from 'gsap'

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec4 uRect[3];     // cx, cy, hw, hh (device px, y nahoru)
uniform float uZ[3];       // priorita (novější navrchu)
uniform float uR;          // radius rohů
uniform float uK;          // šíře „roztečení"
uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform sampler2D uTex2;

float sdRR(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
vec2 coverUv(vec2 p, vec4 r) {
  vec2 uv = (p - r.xy) / (2.0 * r.zw);
  float a = r.z / max(r.w, 0.001);
  float ta = 1.0;                 // náhledy jsou čtverce
  vec2 sc = a > ta ? vec2(1.0, ta / a) : vec2(a / ta, 1.0);
  uv = uv * sc + 0.5;
  uv.y = 1.0 - uv.y;
  return clamp(uv, 0.0, 1.0);
}
float blobD(vec2 p, vec4 r) {
  if (r.z < 0.5) return 1e5;
  return sdRR(p - r.xy, r.zw, min(uR, min(r.z, r.w)));
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float d0 = blobD(p, uRect[0]);
  float d1 = blobD(p, uRect[1]);
  float d2 = blobD(p, uRect[2]);
  float d = smin(smin(d0, d1, uK), d2, uK);
  float a = clamp(0.5 - d, 0.0, 1.0);
  if (a <= 0.0) { gl_FragColor = vec4(0.0); return; }

  // Váhy barev: uvnitř obrázku jeho barva, v „mostu" plynulý přechod
  float w0 = d0 > 1e4 ? 0.0 : exp(-max(d0, 0.0) / (uK * 0.35)) * uZ[0];
  float w1 = d1 > 1e4 ? 0.0 : exp(-max(d1, 0.0) / (uK * 0.35)) * uZ[1];
  float w2 = d2 > 1e4 ? 0.0 : exp(-max(d2, 0.0) / (uK * 0.35)) * uZ[2];
  float ws = max(w0 + w1 + w2, 1e-5);
  vec3 c = texture2D(uTex0, coverUv(p, uRect[0])).rgb * w0
         + texture2D(uTex1, coverUv(p, uRect[1])).rgb * w1
         + texture2D(uTex2, coverUv(p, uRect[2])).rgb * w2;
  gl_FragColor = vec4(c / ws * a, a);
}
`

// Rozložení (CSS px vůči středu canvasu, y dolů) — schod jako na referenci
const W = 300, H = 250
const BW = 92, BH = 92                      // malé čtverce
const SLOTS: [number, number][] = [[-62, 26], [14, -40], [70, 42]]
const STEP_MS = 520

type Blob = { x: number; y: number; fx: number; fy: number; t: number; s: number; z: number; url: string }

export function initChipMelt(chips: HTMLElement[], host: HTMLElement): boolean {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true })
  if (!gl) return false

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src); gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return false
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uRect = gl.getUniformLocation(prog, 'uRect')
  const uZ = gl.getUniformLocation(prog, 'uZ')
  const uR = gl.getUniformLocation(prog, 'uR')
  const uK = gl.getUniformLocation(prog, 'uK')

  const texs = [0, 1, 2].map((i) => {
    const t = gl.createTexture()!
    gl.activeTexture(gl.TEXTURE0 + i)
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
    gl.uniform1i(gl.getUniformLocation(prog, `uTex${i}`), i)
    return t
  })

  canvas.className = 'chip-melt'
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'absolute', left: '0', top: '0', width: `${W}px`, height: `${H}px`,
    pointerEvents: 'none', opacity: '0',
  })
  // První potomek kontejneru chipů → kreslí se POD chipy (ty zůstanou čitelné nahoře)
  host.prepend(canvas)

  let dpr = 1
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr; canvas.height = H * dpr
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()
  window.addEventListener('resize', resize)

  // Obrázky — načtou se až při prvním najetí na daný chip
  const cache = new Map<string, HTMLImageElement>()
  const load = (url: string) => {
    let im = cache.get(url)
    if (!im) {
      im = new Image()
      im.crossOrigin = 'anonymous'
      im.decoding = 'async'
      im.src = url
      cache.set(url, im)
    }
    return im
  }
  const ready = (im: HTMLImageElement) => im.complete && im.naturalWidth > 0

  const blobs: Blob[] = [0, 1, 2].map(() => ({ x: 0, y: 0, fx: 0, fy: 0, t: 0, s: 0, z: 1, url: '' }))
  let zTop = 1

  // Pozice canvasu: jede za kurzorem s lehkým zpožděním
  let mx = 0, my = 0, cx = 0, cy = 0, below = false, running = false

  const render = () => {
    cx += (mx - cx) * 0.14
    cy += (my - cy) * 0.14
    const hr = host.getBoundingClientRect()
    const ox = cx - hr.left - W / 2
    const oy = (below ? cy + 18 : cy - H - 18) - hr.top
    canvas.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0)`

    const rects = new Float32Array(12), zs = new Float32Array(3)
    let any = false
    blobs.forEach((b, i) => {
      const x = b.fx + (b.x - b.fx) * b.t
      const y = b.fy + (b.y - b.fy) * b.t
      const s = Math.max(b.s, 0)
      if (s > 0.004) any = true
      rects[i * 4] = (W / 2 + x) * dpr
      rects[i * 4 + 1] = (H / 2 - y) * dpr
      rects[i * 4 + 2] = (BW / 2) * s * dpr
      rects[i * 4 + 3] = (BH / 2) * s * dpr
      zs[i] = Math.pow(3, b.z - zTop)
    })
    gl.uniform4fv(uRect, rects)
    gl.uniform1fv(uZ, zs)
    gl.uniform1f(uR, 14 * dpr)
    gl.uniform1f(uK, 26 * dpr)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    if (!any && !active) stop()
  }
  const start = () => { if (!running) { running = true; gsap.ticker.add(render) } }
  const stop = () => { running = false; gsap.ticker.remove(render); canvas.style.opacity = '0' }

  let active: HTMLElement | null = null
  let timer: number | undefined
  let urls: string[] = []
  let imgIdx = 0, slotIdx = 0, lastShown = -1

  const setTex = (i: number, im: HTMLImageElement) => {
    gl.activeTexture(gl.TEXTURE0 + i)
    gl.bindTexture(gl.TEXTURE_2D, texs[i])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im)
  }

  // Další obrázek: vyteče z naposledy zobrazeného do svého slotu.
  // Při víc než 3 obrázcích nejstarší nejdřív „odteče" a slot převezme nový.
  const step = () => {
    if (!urls.length || imgIdx >= Math.min(urls.length, 3)) return
    const url = urls[imgIdx % urls.length]
    const im = load(url)
    if (!ready(im)) return                         // počká na další takt
    const i = slotIdx % 3
    const b = blobs[i]
    const enter = () => {
      setTex(i, im)
      b.url = url
      const [sx, sy] = SLOTS[i]
      const from = lastShown >= 0 ? blobs[lastShown] : null
      b.x = sx; b.y = sy
      b.fx = from ? from.x : sx; b.fy = from ? from.y : sy
      b.z = ++zTop
      gsap.fromTo(b, { t: 0, s: from ? 0.35 : 0 }, { t: 1, duration: 0.8, ease: 'power3.out' })
      gsap.to(b, { s: 1, duration: 0.9, ease: 'elastic.out(1, 0.7)' })
      lastShown = i
    }
    if (b.s > 0.01) {
      gsap.killTweensOf(b)
      gsap.to(b, { s: 0, duration: 0.35, ease: 'power2.in', onComplete: enter })
    } else enter()
    imgIdx++; slotIdx++
    // Max 3 obrázky: po zobrazení všech stojíme (žádné točení dokola)
    if (imgIdx >= Math.min(urls.length, 3) && timer) { clearInterval(timer); timer = undefined }
  }

  const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }

  chips.forEach((chip) => {
    const list = Array.from(chip.querySelectorAll<HTMLImageElement>('.hero__chip-preview-img'))
      .map((im) => im.getAttribute('src') || '').filter(Boolean)
    if (!list.length) return

    chip.addEventListener('mouseenter', (e) => {
      active = chip
      urls = list
      list.forEach(load)
      below = chip.classList.contains('hero__chip--pbelow')
      mx = cx = e.clientX; my = cy = e.clientY
      gsap.killTweensOf(blobs)
      blobs.forEach((b) => { b.s = 0; b.t = 0 })
      imgIdx = 0; slotIdx = 0; lastShown = -1
      canvas.style.opacity = '1'
      start()
      window.addEventListener('mousemove', onMove, { passive: true })
      // první obrázek hned, jakmile je načtený
      const first = load(list[0])
      if (ready(first)) step()
      else first.addEventListener('load', () => { if (active === chip && imgIdx === 0) step() }, { once: true })
      if (timer) clearInterval(timer)
      timer = window.setInterval(() => { if (active === chip) step() }, STEP_MS)
    })

    chip.addEventListener('mouseleave', () => {
      if (active !== chip) return
      active = null
      if (timer) { clearInterval(timer); timer = undefined }
      window.removeEventListener('mousemove', onMove)
      gsap.killTweensOf(blobs)
      gsap.to(blobs, { s: 0, duration: 0.3, ease: 'power2.in', stagger: 0.04 })
    })
  })

  return true
}
