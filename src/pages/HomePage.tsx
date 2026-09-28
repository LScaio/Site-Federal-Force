import { lazy, Suspense, useEffect } from 'react'
import Hero from '../sections/Hero'
import About from '../sections/About'
import { ScrollTrigger } from '../lib/scroll'

// Code splitting: cenas abaixo da dobra carregam em paralelo durante a abertura.
const Beyond = lazy(() => import('../sections/Beyond'))
const Frc = lazy(() => import('../sections/Frc'))
const Evolution = lazy(() => import('../sections/Evolution'))
const Partners = lazy(() => import('../sections/Partners'))
const Finale = lazy(() => import('../sections/Finale'))
const Footer = lazy(() => import('../sections/Footer'))

/** Placeholder com altura de tela enquanto o chunk da cena carrega. */
const Hold = () => <div className="min-h-[100svh] bg-ff-void" />

function Refresh() {
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [])
  return null
}

/** Página inicial: Hero → Quem Somos → Além da Arena → FRC → Nossa Evolução → (Parceiros) → Final. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Suspense fallback={<Hold />}>
        <Beyond />
        <Frc />
        <Evolution />
        <Partners />
        <Finale />
        <Refresh />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}
