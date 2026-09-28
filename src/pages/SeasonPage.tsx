import { lazy, Suspense, useEffect } from 'react'
import { motion } from 'framer-motion'
import { goBack } from '../lib/router'
import { setIntroPhase } from '../lib/sceneStore'
import { ScrollTrigger } from '../lib/scroll'

const Rebuilt = lazy(() => import('../sections/rebuilt/Rebuilt'))
const Reefscape = lazy(() => import('../sections/reefscape/Reefscape'))
const Footer = lazy(() => import('../sections/Footer'))

const INFO = {
  rebuilt: { nome: 'Rebuilt', ano: '2026' },
  reefscape: { nome: 'Reefscape', ano: '2025' },
} as const

/** Página independente de uma temporada: conteúdo da temporada + botões de voltar. */
export default function SeasonPage({ season }: { season: 'rebuilt' | 'reefscape' }) {
  useEffect(() => {
    // Páginas de temporada não têm abertura: HUD e Fefo aparecem direto.
    setIntroPhase('done')
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => window.clearTimeout(id)
  }, [season])

  const info = INFO[season]
  return (
    <>
      {/* espaço do header fixo, para a navegação da temporada não nascer escondida */}
      <div className={`h-[68px] ${season === 'rebuilt' ? 'bg-rb-areia' : 'bg-rf-oceano'}`} aria-hidden />
      <Suspense fallback={<div className="min-h-[100svh] bg-ff-void" />}>
        {season === 'rebuilt' ? <Rebuilt /> : <Reefscape />}
      </Suspense>

      <section className="relative flex flex-col items-center gap-6 bg-ff-void px-5 py-24 text-center" data-scene="final-temporada">
        <p className="hud-label">
          Temporada {info.nome} · {info.ano}
        </p>
        <motion.button
          type="button"
          onClick={goBack}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="group inline-flex items-center gap-4 rounded-md border border-ff-blue/60 bg-ff-blue px-7 py-4 font-display text-xl font-semibold tracking-tight text-white shadow-[0_24px_60px_-20px_rgba(47,123,255,0.7)] md:text-2xl"
        >
          <span className="transition-transform group-hover:-translate-x-1" aria-hidden>
            ←
          </span>
          Voltar para a Federal Force
        </motion.button>
      </section>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}
