import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Reveal, SceneTitle } from '../components/ui/Reveal'
import { DriveImage } from '../components/ui/DriveImage'
import { quemSomos } from '../content/drive'
import { quemSomosTexto } from '../content/texts'
import { useReducedMotion } from '../lib/useReducedMotion'
import { SeasonPickerButton } from '../components/ui/SeasonPicker'

/** Mosaico: posições em grid de 6 colunas; cada coluna desliza em velocidade própria. */
const tiles = [
  { i: 0, cls: 'col-span-4 row-span-3', speed: -40 },
  { i: 1, cls: 'col-span-2 row-span-2', speed: 30 },
  { i: 2, cls: 'col-span-2 row-span-2', speed: 60 },
  { i: 3, cls: 'col-span-3 row-span-2', speed: -20 },
  { i: 4, cls: 'col-span-3 row-span-3', speed: 45 },
  { i: 5, cls: 'col-span-3 row-span-2', speed: -55 },
]

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  return (
    <section ref={ref} id="quem-somos" data-scene="quem-somos" className="scene bg-ff-black py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* Texto */}
        <div>
          <SceneTitle index="02" kicker="Quem somos" perch="quem-somos">
            Somos a Federal Force <span className="text-ff-blue">#10466</span>
          </SceneTitle>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ff-text/80 md:text-xl">
            {quemSomosTexto.paragrafos.map((p, k) => (
              <Reveal key={k} delay={0.1 + k * 0.08}>
                <p className={k === 2 ? 'border-l border-ff-blue pl-5 text-ff-text' : ''}>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-2">
            <span className="hud-chip">
              <span className="hud-dot" /> Federal Force #10466
            </span>
            <span className="hud-chip">Brazil</span>
            <span className="hud-chip">FIRST Robotics Competition</span>
          </Reveal>
          <Reveal delay={0.35}>
            <SeasonPickerButton />
          </Reveal>
        </div>

        {/* Mosaico */}
        <div className="grid auto-rows-[70px] grid-cols-6 gap-3 sm:auto-rows-[90px] md:gap-4">
          {tiles.map((t, k) => (
            <Tile key={t.i} index={k} cls={t.cls} speed={reduced ? 0 : t.speed} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Tile({
  index,
  cls,
  speed,
  progress,
}: {
  index: number
  cls: string
  speed: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const y = useTransform(progress, [0, 1], [speed, -speed])
  const file = quemSomos.fotos[index]
  return (
    <motion.div style={{ y }} className={`${cls} group relative`}>
      <Reveal delay={index * 0.07} y={40} className="h-full w-full">
        <div className="relative h-full w-full overflow-hidden rounded-sm border border-ff-line">
          <DriveImage
            file={file}
            alt={`Federal Force #10466 — registro ${index + 1}`}
            cover
            sizes="(min-width: 1024px) 30vw, 60vw"
            className="h-full w-full"
            imgClassName="transition-transform duration-[1600ms] group-hover:scale-[1.05]"
          />
          <span className="absolute bottom-2 left-2 font-mono text-[0.6rem] tracking-[0.2em] text-white/60">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </Reveal>
    </motion.div>
  )
}
