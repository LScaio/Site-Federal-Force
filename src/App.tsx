import { lazy, Suspense, useEffect } from 'react'
import Hero from './sections/Hero'
import About from './sections/About'
import Frc from './sections/Frc'
import { Hud, type SceneLink } from './components/ui/Hud'
import { Fefo } from './components/ui/Fefo'
import { initSmoothScroll, ScrollTrigger } from './lib/scroll'
import { setScene } from './lib/sceneStore'
import { useRouteSync } from './lib/useRouteSync'
import { parceiros } from './content/texts'

// Code splitting: cenas abaixo da dobra carregam em paralelo durante a abertura.
const Rebuilt = lazy(() => import('./sections/rebuilt/Rebuilt'))
const Reefscape = lazy(() => import('./sections/reefscape/Reefscape'))
const Evolution = lazy(() => import('./sections/Evolution'))
const Beyond = lazy(() => import('./sections/Beyond'))
const Partners = lazy(() => import('./sections/Partners'))
const Finale = lazy(() => import('./sections/Finale'))
const Footer = lazy(() => import('./sections/Footer'))

const scenes: SceneLink[] = [
  { id: 'hero', label: 'Início' },
  { id: 'quem-somos', label: 'Quem Somos' },
  { id: 'frc', label: 'FIRST Robotics Competition' },
  { id: 'rebuilt', label: 'Temporada Rebuilt' },
  { id: 'reefscape', label: 'Temporada Reefscape' },
  { id: 'evolucao', label: 'Nossa Evolução' },
  { id: 'alem-da-arena', label: 'Além da Arena' },
  ...(parceiros.length ? [{ id: 'parceiros', label: 'Parceiros' }] : []),
  { id: 'final', label: 'A Federal tá a milhão' },
]

/** Placeholder com altura de tela enquanto o chunk da cena carrega. */
const Hold = () => <div className="min-h-[100svh] bg-ff-void" />

function Refresh() {
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [])
  return null
}

/** Detecta a cena no centro da viewport (alimenta HUD e Fefo). */
function useSceneDirector() {
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      const scene = el?.closest<HTMLElement>('[data-scene]')?.dataset.scene
      if (scene) setScene(scene)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    check()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
}

export default function App() {
  useEffect(() => {
    initSmoothScroll()
    // Aquece o chunk 3D e o GLB em paralelo à abertura.
    void import('./components/three/HeroScene')
  }, [])
  useSceneDirector()
  useRouteSync()

  return (
    <>
      <a href="#quem-somos" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] hud-chip">
        Pular para o conteúdo
      </a>
      <Hud scenes={scenes} />
      <Fefo />
      <main>
        <Hero />
        <About />
        <Frc />
        <Suspense fallback={<Hold />}>
          <Rebuilt />
          <Reefscape />
          <Evolution />
          <Beyond />
          <Partners />
          <Finale />
          <Refresh />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}
