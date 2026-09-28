import { useEffect, useRef, useState } from 'react'
import { useIntroPhase, useScene } from '../../lib/sceneStore'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { FefoFlight, FRAME_COUNT, type Dir, type Target } from './fefoFlight'

/**
 * Fefo — mascote da Federal Force, animado quadro a quadro com os quadros do
 * vídeo "Coruja_Decolagem" (um atlas por sentido em public/fefo/, gerado por
 * scripts/fefo-atlas.py).
 *
 * Atravessa a Hero ao fim da abertura e pousa sobre o robô; durante a rolagem
 * decola, voa em arco e pousa no fim da primeira linha dos títulos marcados com
 * <Perch id="<cena>" />. Pousado, acompanha o título; só voa quando o poleiro
 * muda (outra cena, ou o título saiu da tela e ele se recolhe ao canto).
 * A física/máquina de estados está em ./fefoFlight.ts.
 */

/** Geometria do atlas (ver scripts/fefo-atlas.py). */
const ATLAS = { fw: 324, fh: 300, cols: 8 }
const RATIO = ATLAS.fh / ATLAS.fw
/** Linha dos pés no quadro pousado (fração da altura); a coruja fica centrada na largura. */
const FOOT_Y = 0.957
/** Altura da coruja pousada (fração da altura do quadro). */
const OWL_H = 0.62

function loadAtlas(dir: Dir) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = `${import.meta.env.BASE_URL}fefo/fefo-${dir}.webp`
  })
}

export function Fefo() {
  const scene = useScene()
  const intro = useIntroPhase()
  const reduced = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [frames, setFrames] = useState<Record<Dir, HTMLImageElement> | null>(null)

  const sceneRef = useRef(scene)
  sceneRef.current = scene

  useEffect(() => {
    let alive = true
    Promise.all([loadAtlas('dir'), loadAtlas('esq')])
      .then(([dir, esq]) => alive && setFrames({ dir, esq }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!frames || intro === 'intro') return
    const el = wrap.current
    const cv = canvas.current
    const ctx = cv?.getContext('2d')
    if (!el || !cv || !ctx) return

    let W = 0
    let H = 0
    let drawn = ''
    const resize = () => {
      W = window.innerWidth < 768 ? 112 : 168
      H = Math.round(W * RATIO)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      cv.style.width = `${W}px`
      cv.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawn = ''
    }
    resize()

    const sim = new FefoFlight(-W, window.innerHeight * 0.3, Math.max(70, W * 0.5))
    // O quadro tem folga para as asas abertas; a coruja pousada ocupa ~metade da largura.
    const clampX = (px: number, vw: number) => Math.min(Math.max(px, W * 0.28 + 8), vw - W * 0.28 - 8)

    /** Alvo = ponto onde os pés do Fefo tocam (base central do sprite). */
    const findTarget = (): Target => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const key = `perch:${sceneRef.current}`
      const perch = document.querySelector<HTMLElement>(`[data-fefo-perch="${sceneRef.current}"]`)
      const r = perch?.getBoundingClientRect()
      const visible = perch && r && r.top > vh * 0.14 && r.top < vh * 0.9 && r.left > -20 && r.left < vw + 20
      if (visible) {
        if (perch.dataset.fefoPerch === 'hero') return { key, x: clampX(r.left, vw), y: r.top }
        // Títulos: pousa sobre o fim da PRIMEIRA linha (não cobre o texto).
        // O marcador <Perch> fica na linha de base da última linha com altura de
        // ~maiúscula; deslocando pela distância entre linhas obtemos o topo das
        // letras da 1ª linha — funciona com qualquer fonte (Bowlby, Rubik…).
        const range = document.createRange()
        range.selectNodeContents(perch.parentElement ?? perch)
        const rects = [...range.getClientRects()].filter((q) => q.width > 1)
        if (rects.length) {
          const firstTop = Math.min(...rects.map((q) => q.top))
          const lastTop = Math.max(...rects.filter((q) => q.top <= r.top + 1).map((q) => q.top), firstTop)
          const line = rects.filter((q) => q.top - firstTop < 6)
          const right = Math.max(...line.map((q) => q.right))
          const y = r.top - (lastTop - firstTop)
          // Sob o header fixo não dá para pousar: recolhe-se ao canto.
          if (y - H * OWL_H > 76) return { key, x: clampX(right - W * 0.22, vw), y }
        } else if (r.top - H * OWL_H > 76) return { key, x: clampX(r.left, vw), y: r.top }
      }
      return { key: 'rest', x: vw - W * 0.28 - (vw < 768 ? 10 : 22), y: vh - (vw < 768 ? 12 : 22) }
    }

    const draw = () => {
      const key = `${sim.dir}${sim.frame}`
      if (key === drawn) return
      drawn = key
      ctx.clearRect(0, 0, W, H)
      const f = Math.min(sim.frame, FRAME_COUNT - 1)
      const { fw, fh, cols } = ATLAS
      ctx.drawImage(frames[sim.dir], (f % cols) * fw, Math.floor(f / cols) * fh, fw, fh, 0, 0, W, H)
    }

    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.25)
      last = now
      const t = findTarget()
      if (reduced) sim.snap(t)
      else sim.update(dt, t)

      const bob = sim.mode === 'perched' && !reduced ? Math.sin(now / 700) * 1.2 : 0
      const tilt = sim.mode === 'perched' ? 0 : sim.tilt
      el.style.transform = `translate3d(${(sim.x - W / 2).toFixed(1)}px, ${(sim.y + sim.arc - H * FOOT_Y + bob).toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`
      el.style.opacity = '1'
      el.dataset.mode = sim.mode
      draw()
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [frames, intro, reduced])

  if (intro === 'intro') return null

  return (
    <div
      ref={wrap}
      aria-hidden
      data-fefo
      className="pointer-events-none fixed left-0 top-0 z-[45] opacity-0 transition-opacity duration-500 will-change-transform"
      style={{ transformOrigin: `50% ${FOOT_Y * 100}%` }}
    >
      <canvas ref={canvas} className="block drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)]" />
    </div>
  )
}
