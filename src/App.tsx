import { lazy, Suspense, useEffect } from 'react'
import { Hud, type SceneLink } from './components/ui/Hud'
import { Fefo } from './components/ui/Fefo'
import { initSmoothScroll } from './lib/scroll'
import { setScene } from './lib/sceneStore'
import { usePage, useRouter } from './lib/router'
import { parceiros } from './content/texts'
import HomePage from './pages/HomePage'

const SeasonPage = lazy(() => import('./pages/SeasonPage'))

/** Cenas da página inicial (menu e trilho lateral do HUD). */
const scenes: SceneLink[] = [
  { id: 'hero', label: 'Início' },
  { id: 'quem-somos', label: 'Quem Somos' },
  { id: 'alem-da-arena', label: 'Além da Arena' },
  { id: 'frc', label: 'FIRST Robotics Competition' },
  { id: 'evolucao', label: 'Nossa Evolução' },
  ...(parceiros.length ? [{ id: 'parceiros', label: 'Parceiros' }] : []),
  { id: 'final', label: 'A Federal tá a milhão' },
]

/** Detecta a cena no centro da viewport (alimenta HUD e Fefo). */
function useSceneDirector(page: string) {
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
    const t = window.setTimeout(check, 400)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [page])
}

export default function App() {
  const page = usePage()
  useEffect(() => {
    initSmoothScroll()
    // Aquece o chunk 3D e o GLB.
    void import('./components/three/HeroScene')
  }, [])
  useSceneDirector(page)
  useRouter()

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] hud-chip">
        Pular para o conteúdo
      </a>
      <Hud scenes={scenes} page={page} />
      <Fefo />
      <main id="main" key={page}>
        {page === 'home' ? (
          <HomePage />
        ) : (
          <Suspense fallback={<div className="min-h-[100svh] bg-ff-void" />}>
            <SeasonPage season={page} />
          </Suspense>
        )}
      </main>
    </>
  )
}
