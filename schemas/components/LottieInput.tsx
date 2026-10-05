import { useEffect, useRef, useState } from 'react'
import { Card, Stack, Text } from '@sanity/ui'
import { useWorkspace, type ObjectInputProps } from 'sanity'
import { DotLottie } from '@lottiefiles/dotlottie-web'

// Živý náhled Lottie přímo v Studiu.
// cdn.sanity.io neposílá CORS hlavičky (přímý fetch z prohlížeče spadne),
// takže animaci — stejně jako web — taháme přes same-origin proxy na nasazeném
// webu (`/api/lottie`), která přidává `Access-Control-Allow-Origin: *`.
const PROXY_ORIGIN = 'https://slant-4od.pages.dev'

function refToCdnUrl(ref: string | undefined, projectId: string, dataset: string): string | undefined {
  if (!ref) return undefined
  // file-<hash>-<ext>  →  https://cdn.sanity.io/files/<project>/<dataset>/<hash>.<ext>
  const m = /^file-([a-f0-9]+)-(\w+)$/.exec(ref)
  return m ? `https://cdn.sanity.io/files/${projectId}/${dataset}/${m[1]}.${m[2]}` : undefined
}

function Player({ src, bg }: { src: string; bg?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setErr(null)
    let dl: DotLottie | null = null
    try {
      dl = new DotLottie({ canvas, src, loop: true, autoplay: true })
      dl.addEventListener('loadError', () => setErr('Soubor se nepodařilo načíst jako Lottie.'))
    } catch {
      setErr('Přehrávač Lottie se nepodařilo spustit.')
    }
    return () => { try { dl?.destroy() } catch { /* noop */ } }
  }, [src])

  return (
    <Card
      padding={2}
      radius={2}
      shadow={1}
      style={{ position: 'relative', background: bg && bg !== 'transparent' ? bg : 'repeating-conic-gradient(#e8e8e8 0% 25%, #f6f6f6 0% 50%) 50% / 16px 16px' }}
    >
      {/* Canvas renderujeme vždy — přehrávač se tak při změně zdroje spolehlivě zotaví. */}
      <canvas ref={canvasRef} style={{ width: '100%', aspectRatio: '16 / 9', display: 'block', visibility: err ? 'hidden' : 'visible' }} />
      {err && (
        <Text size={1} muted style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>{err}</Text>
      )}
    </Card>
  )
}

export function LottieInput(props: ObjectInputProps) {
  const { projectId, dataset } = useWorkspace()
  const value = props.value as
    | { file?: { asset?: { _ref?: string } }; url?: string; bg?: string }
    | undefined

  const raw = value?.url || refToCdnUrl(value?.file?.asset?._ref, projectId, dataset)
  const src = raw ? `${PROXY_ORIGIN}/api/lottie?u=${encodeURIComponent(raw)}` : undefined

  return (
    <Stack space={3}>
      <Stack space={2}>
        <Text size={1} weight="semibold" muted>Náhled animace</Text>
        {src ? (
          <Player src={src} bg={value?.bg} />
        ) : (
          <Card padding={3} radius={2} tone="caution">
            <Text size={1}>Nahraj soubor (.lottie / .json) nebo vlož URL — tady se objeví živý náhled.</Text>
          </Card>
        )}
      </Stack>
      {props.renderDefault(props)}
    </Stack>
  )
}
