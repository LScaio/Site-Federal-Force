import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useIntroPhase, useScene } from '../../lib/sceneStore'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { driveUrl } from '../../lib/driveUrl'
import { hero } from '../../content/drive'

/**
 * Fefo — mascote da Federal Force (Drive: Hero(Telainicial)/CorujaFederal.png).
 *
 * Elemento narrativo que acompanha o scroll: atravessa a Hero ao final da
 * abertura, pousa perto de títulos (elementos com `data-fefo-perch="<cena>"`),
 * observa o robô no Visualizador CAD e, nas cenas sem ponto de pouso,
 * recolhe-se discretamente ao canto da tela.
 */
export function Fefo() {
  const scene = useScene()
  const intro = useIntroPhase()
  const reduced = useReducedMotion()
  const [size, setSize] = useState(88)
  const [resting, setResting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const tx = useMotionValue(-200)
  const ty = useMotionValue(260)
  const spring = reduced ? { stiffness: 1000, damping: 100 } : { stiffness: 38, damping: 16, mass: 1.1 }
  const x = useSpring(tx, spring)
  const y = useSpring(ty, spring)
  const vx = useVelocity(x)
  const rotate = useTransform(vx, [-1400, 0, 1400], [-14, 0, 14], { clamp: true })

  const sceneRef = useRef(scene)
  sceneRef.current = scene

  useEffect(() => {
    const onResize = () => setSize(window.innerWidth < 768 ? 54 : 88)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (intro === 'intro') return
    let raf = 0
    let lastResting: boolean | null = null
    const loop = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const perch = document.querySelector<HTMLElement>(`[data-fefo-perch="${sceneRef.current}"]`)
      const r = perch?.getBoundingClientRect()
      const onScreen = r && r.top > size * 0.8 && r.top < vh - 20 && r.left > -40 && r.left < vw
      let rest: boolean
      if (onScreen && r) {
        const left = Math.min(Math.max(r.left - size * 0.35, 12), vw - size - 12)
        tx.set(left)
        ty.set(r.top - size * 0.92)
        rest = false
      } else {
        tx.set(vw - size - (vw < 768 ? 14 : 28))
        ty.set(vh - size - (vw < 768 ? 14 : 28))
        rest = true
      }
      if (rest !== lastResting) {
        lastResting = rest
        setResting(rest)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [intro, size, tx, ty])

  if (intro === 'intro') return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[45]"
      style={{ x, y, rotate, width: size, height: size }}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? (resting ? 0.9 : 1) : 0, scale: resting ? 0.82 : 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={driveUrl(hero.fefo, 240)}
        alt=""
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        className="h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={reduced ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        draggable={false}
      />
    </motion.div>
  )
}
