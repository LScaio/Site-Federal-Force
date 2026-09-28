import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Reveal, SceneTitle } from '../components/ui/Reveal'
import { DriveImage } from '../components/ui/DriveImage'
import { frc } from '../content/drive'
import { frcTexto } from '../content/texts'
import { driveUrl } from '../lib/driveUrl'
import { useReducedMotion } from '../lib/useReducedMotion'

/**
 * Palavras-chave (briefing) acompanhadas de trechos literais de "O que é a FRC.txt".
 */
const pillars = [
  { word: 'BUILD', text: 'As equipes têm poucas semanas para projetar, construir…' },
  { word: 'CODE', text: '…e programar um robô capaz de cumpri-lo.' },
  { word: 'COMPETE', text: 'Alianças formadas por três equipes, o que torna a colaboração tão importante quanto o desempenho.' },
  { word: 'INSPIRE', text: 'A formação de jovens preparados para transformar o mundo por meio da ciência e da tecnologia.' },
]

const strip = [frc.imagens.campo2026, frc.imagens.ccbdo, frc.imagens.fbbo, frc.imagens.ddfeo, frc.imagens.foto1, frc.imagens.kit, frc.imagens.maxres200]

export default function Frc() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1.18, 1])
  const stripX = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['6%', '-28%'])

  return (
    <section ref={ref} id="frc" data-scene="frc" className="scene overflow-hidden bg-ff-void">
      {/* Arena ao fundo */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0">
        <DriveImage file={frc.imagens.houston} alt="FIRST Robotics Competition em Houston" cover sizes="100vw" className="h-full w-full" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,3,5,0.92),rgba(2,3,5,0.7)_40%,rgba(2,3,5,0.96))]" />
      <p className="absolute right-5 top-24 z-10 font-mono text-[0.6rem] tracking-[0.18em] text-white/40 md:right-10">
        FOTO: AERTON GUIMARÃES / CNI
      </p>

      <div className="relative z-10 mx-auto max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pt-40">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <SceneTitle index="04" kicker="FIRST Robotics Competition" perch="frc">
            O que é a FIRST
            <br />
            Robotics Competition
          </SceneTitle>
          <Reveal delay={0.15} className="flex items-center gap-5">
            <img
              src={driveUrl(frc.logo, 400)}
              alt="Logo FIRST Robotics Competition"
              referrerPolicy="no-referrer"
              loading="lazy"
              className="h-14 w-auto md:h-16"
            />
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-ff-text/85 md:text-2xl md:leading-snug">{frcTexto.paragrafos[0]}</p>
        </Reveal>

        {/* BUILD · CODE · COMPETE · INSPIRE */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-ff-line bg-ff-line sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, k) => (
            <Reveal key={p.word} delay={k * 0.09} className="group relative bg-ff-black/85 p-6 backdrop-blur-sm md:p-8">
              <span className="font-mono text-xs text-ff-blue">{String(k + 1).padStart(2, '0')}</span>
              <h3 className="mt-6 font-display text-4xl font-bold tracking-[-0.03em] md:text-5xl">{p.word}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ff-muted md:text-base">{p.text}</p>
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ff-blue transition-transform duration-700 ease-[var(--ease-cine)] group-hover:scale-x-100" />
            </Reveal>
          ))}
        </div>
      </div>

      {/* Faixa de imagens: arenas, robôs e equipes */}
      <motion.div style={{ x: stripX }} className="relative z-10 flex gap-4 px-5 pb-16 md:px-10">
        {strip.map((f, k) => (
          <div key={f.id} className="relative h-44 w-72 shrink-0 overflow-hidden rounded-sm border border-ff-line md:h-60 md:w-96">
            <DriveImage file={f} alt={`FIRST Robotics Competition — imagem ${k + 1}`} cover sizes="400px" className="h-full w-full" />
          </div>
        ))}
      </motion.div>

      <div className="relative z-10 mx-auto grid max-w-[1400px] gap-10 px-5 pb-28 md:px-10 lg:grid-cols-2">
        <div className="space-y-5 text-base leading-relaxed text-ff-text/75 md:text-lg">
          {frcTexto.paragrafos.slice(1).map((p, k) => (
            <Reveal key={k} delay={k * 0.06}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <VideoFacade />
        </Reveal>
      </div>
    </section>
  )
}

/** Vídeo do Drive ("Link vídeo") carregado somente após o clique. */
function VideoFacade() {
  const [play, setPlay] = useState(false)
  return (
    <div className="relative aspect-video overflow-hidden rounded-sm border border-ff-line bg-black">
      {play ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${frc.videoYoutubeId}?autoplay=1&rel=0`}
          title="FIRST Robotics Competition"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label="Reproduzir vídeo sobre a FRC">
          <DriveImage file={frc.imagens.maxres165} alt="" cover sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full" />
          <span className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/15" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
          </span>
          <span className="absolute bottom-4 left-4 hud-chip">Assistir · FRC</span>
        </button>
      )}
    </div>
  )
}
