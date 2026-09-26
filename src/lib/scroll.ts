import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './useReducedMotion'
import { hrefFor } from './routes'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/** Inicia o Lenis sincronizado com o ticker do GSAP/ScrollTrigger. */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis() {
  return lenis
}

export function lockScroll(locked: boolean) {
  if (lenis) (locked ? lenis.stop() : lenis.start())
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

export function scrollToId(id: string, { push = true, immediate = false } = {}) {
  const el = document.getElementById(id)
  if (!el) return false
  const href = hrefFor(id)
  if (push && href && href !== window.location.pathname) history.pushState({ id }, '', href)
  if (lenis) {
    // a altura da página muda enquanto as cenas lazy carregam: atualiza o limite do Lenis
    lenis.resize()
    lenis.scrollTo(el, { offset: 0, duration: 1.6, immediate, force: true })
  }
  else el.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
  return true
}

export { gsap, ScrollTrigger }
