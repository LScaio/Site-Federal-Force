import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useReducedMotion } from '../lib/useReducedMotion'

/**
 * NOSSA EVOLUÇÃO — pausa narrativa entre as temporadas e os projetos sociais.
 * Dados extraídos dos .txt das temporadas no Drive.
 */
const nodes = [
  {
    ano: '2025',
    jogo: 'REEFSCAPE',
    robo: 'Griffo',
    linhas: ['Primeira temporada na FRC', 'Regional de Brasília · FIRST Championship, Houston', 'Rookie All-Star Award'],
    cor: '#FFE600',
  },
  {
    ano: '2026',
    jogo: 'REBUILT',
    robo: 'Phoenix',
    linhas: ['Kickoff em 10 de janeiro', 'Intake + shooter', 'Média de 7 bolinhas no autônomo'],
    cor: '#FA4614',
  },
  {
    ano: '→',
    jogo: 'PRÓXIMA TEMPORADA',
    robo: '',
    linhas: [],
    cor: '#2f7bff',
  },
]

function Node({ n, i, progress }: { n: (typeof nodes)[number]; i: number; progress: MotionValue<number> }) {
  const start = 0.12 + i * 0.26
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1])
  const y = useTransform(progress, [start, start + 0.12], [30, 0])
  const dot = useTransform(progress, [start - 0.02, start + 0.04], [0, 1])
  const future = i === nodes.length - 1
  return (
    <motion.div style={{ opacity, y }} className="relative pt-10 md:pt-14">
      <motion.span
        style={{ scale: dot, background: n.cor, boxShadow: `0 0 24px ${n.cor}` }}
        className="absolute left-0 top-0 block h-3 w-3 -translate-y-1/2 rounded-full"
      />
      <p className="font-mono text-xs tracking-[0.2em] text-ff-muted">{future ? 'FUTURO' : `TEMPORADA ${n.ano}`}</p>
      <p className="mt-3 font-display text-[clamp(2rem,4.2vw,3.6rem)] font-semibold leading-none tracking-[-0.03em]">
        {future ? (
          <span className="text-transparent [-webkit-text-stroke:1px_rgb(233_238_245_/_0.7)]">{n.jogo}</span>
        ) : (
          n.jogo
        )}
      </p>
      {n.robo && (
        <p className="mt-2 font-mono text-sm" style={{ color: n.cor }}>
          Robô · {n.robo}
        </p>
      )}
      <ul className="mt-5 space-y-2 text-sm text-ff-text/70 md:text-base">
        {n.linhas.map((l) => (
          <li key={l} className="flex gap-3">
            <span className="mt-2.5 h-px w-3 shrink-0 bg-ff-line" />
            {l}
          </li>
        ))}
      </ul>
      {future && (
        <div className="mt-6 h-px w-40 overflow-hidden bg-ff-line">
          <span className="block h-px w-1/3 animate-[ff-load_2.2s_var(--ease-cine)_infinite] bg-ff-blue" />
        </div>
      )}
    </motion.div>
  )
}

export default function Evolution() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useTransform(scrollYProgress, (v) => (reduced ? 1 : v))
  const line = useTransform(progress, [0.05, 0.9], [0, 1])

  return (
    <section ref={ref} id="evolucao" data-scene="evolucao" className="relative bg-ff-void" style={{ height: reduced ? 'auto' : '260svh' }}>
      <div className={`${reduced ? '' : 'sticky top-0'} flex min-h-[100svh] flex-col justify-center overflow-hidden py-24`}>
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 md:px-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs text-ff-blue">06</span>
            <span className="h-px w-10 bg-ff-line" />
            <span className="hud-label">Nossa Evolução</span>
          </div>
          <h2 className="relative max-w-3xl font-display text-[clamp(2.4rem,5.6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            Nossa Evolução
            <span data-fefo-perch="evolucao" className="absolute -top-2 right-0 h-px w-px md:right-auto md:left-[9.5em]" aria-hidden />
          </h2>

          <div className="relative mt-16 md:mt-24">
            {/* trilho de telemetria */}
            <div className="absolute left-0 right-0 top-0 h-px bg-ff-line" />
            <motion.div
              style={{ scaleX: line }}
              className="absolute left-0 right-0 top-0 h-px origin-left bg-gradient-to-r from-[#FFE600] via-[#FA4614] to-ff-blue"
            />
            <div className="grid gap-12 md:grid-cols-3 md:gap-10">
              {nodes.map((n, i) => (
                <Node key={n.jogo} n={n} i={i} progress={progress} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes ff-load{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </section>
  )
}
