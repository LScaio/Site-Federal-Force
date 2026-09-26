import { useMemo, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate, type MotionValue } from 'framer-motion'
import { Reveal } from '../../components/ui/Reveal'
import { DriveImage } from '../../components/ui/DriveImage'
import { reefscape } from '../../content/drive'
import { reefscapeTexto } from '../../content/texts'
import { SeasonSubnav } from '../season/SeasonSubnav'
import { HorizontalGallery } from '../season/HorizontalGallery'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * TEMPORADA REEFSCAPE (2025) — identidade definida pelo moodboard
 * "FIRST DIVE": Rubik Black, Archivo, Space Mono, moldura preta arredondada,
 * silhuetas chapadas, ondas e bolhas soltas; paleta oceano + âmbar do mundial.
 */

const nav = [
  { id: 'rf-inicio', label: 'Reefscape' },
  { id: 'rf-historia', label: 'História' },
  { id: 'rf-desafio', label: 'Desafio' },
  { id: 'rf-robo', label: 'Robô' },
  { id: 'rf-estrategia', label: 'Estratégia' },
  { id: 'rf-resultados', label: 'Resultados' },
  { id: 'rf-galeria', label: 'Galeria' },
]

/* ---------- Grafismos: formas orgânicas (bolhas, ondas, coral, algas) ---------- */

function Bubbles({ count = 16 }: { count?: number }) {
  const reduced = useReducedMotion()
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37) % 100,
        size: 6 + ((i * 13) % 22),
        dur: 9 + ((i * 7) % 10),
        delay: -((i * 3.3) % 12),
      })),
    [count],
  )
  if (reduced) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-[-40px] rounded-full border-2 border-rf-rasa/50"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animation: `rf-rise ${b.dur}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function Wave({ className = '', fill }: { className?: string; fill: string }) {
  return (
    <svg className={`block w-full ${className}`} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
      <path d="M0 40 C 180 0 360 80 540 40 S 900 0 1080 40 S 1300 80 1440 40 V80 H0Z" fill={fill} />
    </svg>
  )
}

const Coral = () => (
  <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden>
    <path fill="currentColor" d="M29 62V40c-8-2-14-9-14-18 0-3 4-3 4 0 0 6 4 11 10 13V14c0-3 6-3 6 0v27c5-2 9-7 9-13 0-3 4-3 4 0 0 9-6 16-13 18v16z" />
  </svg>
)
const Alga = () => (
  <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden>
    <circle cx="32" cy="32" r="22" fill="currentColor" />
    <path d="M20 26c6-4 18-4 24 0M18 38c8 4 20 4 28 0" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
)
const Reef = () => (
  <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden>
    <path fill="currentColor" d="M8 58h48v-8H8zM14 46h36v-8H14zM20 34h24v-8H20zM26 22h12v-8H26z" />
  </svg>
)
const Cage = () => (
  <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden>
    <path d="M32 4v10M16 14h32v34a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6zM24 14v40M32 14v40M40 14v40" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
)

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex rounded-full border-[3px] border-rf-abismo px-4 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] ${className}`}>
      {children}
    </span>
  )
}

function SubScene({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <div id={id} data-scene="reefscape" className={`relative flex min-h-[100svh] items-center py-24 ${className}`}>
      <div className="relative mx-auto w-full max-w-[1240px] px-5 md:px-10 xl:px-24">{children}</div>
    </div>
  )
}

/** Laterais: medidor de profundidade (esq.) e rótulo FIRST DIVE (dir.). */
function DepthRails({ depth }: { depth: MotionValue<string> }) {
  return (
    <>
      <div className="pointer-events-none fixed left-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex" aria-hidden>
        <span className="font-mono text-[0.6rem] tracking-[0.25em] text-rf-rasa/80 [writing-mode:vertical-rl]">PROFUNDIDADE</span>
        <div className="relative h-56 w-[6px] rounded-full border-2 border-rf-abismo bg-rf-rasa/20">
          <motion.div className="absolute inset-x-0 top-0 rounded-full bg-rf-coral" style={{ height: depth }} />
        </div>
      </div>
      <div className="pointer-events-none fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 xl:block" aria-hidden>
        <span className="font-mono text-[0.62rem] font-bold tracking-[0.3em] text-rf-rasa/80 [writing-mode:vertical-rl]">FIRST DIVE · 2025</span>
      </div>
    </>
  )
}

export default function Reefscape() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // Mergulho: o oceano escurece à medida que a temporada avança.
  const light = useTransform(scrollYProgress, [0, 0.45, 1], [34, 18, 6])
  const bg = useMotionTemplate`radial-gradient(120% 70% at 50% 0%, hsl(191 100% ${light}%), #111 85%)`
  const depth = useTransform(scrollYProgress, [0, 1], ['4%', '100%'])
  const inView = useTransform(scrollYProgress, (v) => (v > 0 && v < 1 ? 1 : 0))

  return (
    <section ref={ref} id="reefscape" className="relative overflow-clip font-archivo text-white">
      <motion.div className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh] w-full" style={{ background: bg }} aria-hidden>
        <Bubbles />
      </motion.div>
      <motion.div style={{ opacity: inView }}>
        <DepthRails depth={depth} />
      </motion.div>

      <div className="relative">
        <SeasonSubnav
          items={nav}
          className="border-y-4 border-rf-abismo bg-rf-oceano/90 backdrop-blur"
          activeClassName="rounded-full bg-rf-coral text-rf-abismo"
          idleClassName="rounded-full text-white hover:bg-rf-abismo/40"
        />

        {/* HERO DA TEMPORADA */}
        <SubScene id="rf-inicio">
          <Reveal className="flex flex-wrap gap-3">
            <Pill className="bg-rf-rasa text-rf-abismo">FIRST Dive · 2025</Pill>
            <Pill className="bg-rf-anemona text-rf-abismo">Primeira temporada</Pill>
          </Reveal>
          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="rf-title relative mt-8 text-[clamp(3.2rem,11.5vw,9.5rem)] text-rf-coral [-webkit-text-stroke:3px_#111]"
          >
            REEFSCAPE
            <span data-fefo-perch="reefscape" className="absolute -top-2 right-[6%] h-px w-px" aria-hidden />
          </motion.h2>
          <div className="mt-12 grid items-end gap-12 lg:grid-cols-[1fr_1.1fr]">
            <Reveal delay={0.15}>
              <p className="rf-title text-4xl text-rf-rasa md:text-5xl">MERGULHAR~</p>
              <p className="mt-4 max-w-md text-lg font-semibold text-white/90">Explorar o oceano com engenharia.</p>
            </Reveal>
            <Reveal delay={0.1} className="rf-frame relative aspect-[16/10] bg-rf-oceano">
              <DriveImage file={reefscape.fotos[0]} alt="Federal Force na temporada REEFSCAPE 2025" cover className="h-full w-full" />
            </Reveal>
          </div>
        </SubScene>

        {/* HISTÓRIA */}
        <SubScene id="rf-historia">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="rf-frame relative aspect-[4/3] bg-rf-oceano">
              <DriveImage file={reefscape.fotos[2]} alt="Federal Force — REEFSCAPE 2025" cover className="h-full w-full" />
            </Reveal>
            <div>
              <Reveal>
                <Pill className="bg-rf-turquesa text-rf-abismo">01 · História</Pill>
                <h3 className="rf-title mt-6 text-[clamp(2.4rem,5.5vw,4.4rem)]">Kickoff · 4 de janeiro</h3>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 rounded-[28px] border-4 border-rf-abismo bg-rf-abismo/40 p-6 text-lg leading-relaxed backdrop-blur-sm md:p-8 md:text-xl">
                  {reefscapeTexto.historia}
                </p>
              </Reveal>
            </div>
          </div>
        </SubScene>

        {/* DESAFIO */}
        <SubScene id="rf-desafio">
          <Reveal>
            <Pill className="bg-rf-coral text-rf-abismo">02 · Desafio</Pill>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 max-w-4xl text-xl leading-relaxed md:text-2xl md:leading-snug">{reefscapeTexto.desafio}</p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'CORAL', d: 'Tubos posicionados nos níveis do recife', c: 'bg-rf-anemona', i: <Coral /> },
              { t: 'ALGAE', d: 'Bolas levadas ao processador ou lançadas na rede', c: 'bg-rf-turquesa', i: <Alga /> },
              { t: 'REEF', d: 'Estrutura com vários níveis de pontuação', c: 'bg-rf-coral', i: <Reef /> },
              { t: 'CAGE', d: 'Estruturas suspensas para a subida final', c: 'bg-rf-ambar', i: <Cage /> },
            ].map((x, k) => (
              <Reveal key={x.t} delay={k * 0.08} className={`rounded-[28px] border-4 border-rf-abismo p-6 text-rf-abismo ${x.c}`}>
                {x.i}
                <p className="rf-title mt-6 text-4xl">{x.t}</p>
                <p className="mt-2 text-sm font-semibold leading-snug">{x.d}</p>
              </Reveal>
            ))}
          </div>
        </SubScene>

        <Wave fill="#111111" className="h-10 md:h-16" />

        {/* DESENVOLVIMENTO DO ROBÔ */}
        <SubScene id="rf-robo" className="bg-rf-abismo">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <Pill className="bg-rf-rasa text-rf-abismo">03 · Desenvolvimento do robô</Pill>
                <h3 className="rf-title mt-6 text-[clamp(4rem,12vw,9rem)] text-rf-turquesa">GRIFFO</h3>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 text-lg leading-relaxed md:text-xl">{reefscapeTexto.robo}</p>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="rf-frame relative aspect-square border-rf-turquesa bg-rf-oceano">
              <DriveImage file={reefscape.fotos[1]} alt="Griffo — robô da Federal Force na temporada REEFSCAPE" cover className="h-full w-full" />
            </Reveal>
          </div>
        </SubScene>

        {/* ESTRATÉGIA — subida à cage até o último nível */}
        <SubScene id="rf-estrategia" className="bg-rf-abismo">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
            <ClimbGauge />
            <div>
              <Reveal>
                <Pill className="bg-rf-coral text-rf-abismo">04 · Estratégia</Pill>
                <p className="rf-title mt-8 text-[clamp(2.2rem,5vw,4rem)] text-rf-coral">“…ele conseguia alcançar o último nível, sendo seu ponto mais forte”</p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-rf-rasa">Cage · subida final · Griffo</p>
              </Reveal>
            </div>
          </div>
        </SubScene>

        <Wave fill="#3F1A08" className="-mt-px h-10 rotate-180 bg-rf-abismo md:h-16" />

        {/* RESULTADOS */}
        <SubScene id="rf-resultados" className="bg-rf-profundo">
          <Reveal>
            <Pill className="bg-rf-ambar text-rf-abismo">05 · Resultados</Pill>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 max-w-3xl text-xl md:text-2xl">{reefscapeTexto.competicoes}</p>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { k: 'Regional', t: 'Regional de Brasília', c: 'bg-rf-oceano' },
              { k: 'Mundial', t: 'FIRST Championship · Houston', c: 'bg-rf-oceano' },
              { k: 'Prêmio', t: 'Rookie All-Star Award', c: 'bg-rf-coral text-rf-abismo' },
            ].map((r, i) => (
              <Reveal key={r.t} delay={i * 0.1} className={`rounded-[28px] border-4 border-rf-abismo p-7 ${r.c}`}>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] opacity-80">{r.k}</p>
                <p className="rf-title mt-4 text-3xl md:text-4xl">{r.t}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-12 max-w-4xl text-lg leading-relaxed text-white/85 md:text-xl">{reefscapeTexto.premio}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="rf-title mt-10 text-[clamp(2rem,4.6vw,3.8rem)] text-rf-coral">{reefscapeTexto.fecho}</p>
          </Reveal>
        </SubScene>

        {/* GALERIA */}
        <div id="rf-galeria" data-scene="reefscape">
          <HorizontalGallery className="bg-rf-profundo">
            <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-center pr-4 md:w-auto md:pr-10">
              <Pill className="w-fit bg-rf-rasa text-rf-abismo">06 · Galeria</Pill>
              <h3 className="rf-title mt-6 whitespace-nowrap text-[clamp(2.6rem,6vw,5.5rem)]">Exploração</h3>
            </div>
            {reefscape.fotos.map((f, k) => (
              <div key={f.id} className="shrink-0 snap-center py-6">
                <div className={`rf-frame relative h-[52svh] w-[78vw] bg-rf-oceano md:h-[62svh] md:w-[38vw] ${k % 2 ? 'md:translate-y-16' : ''}`}>
                  <DriveImage file={f} alt={`REEFSCAPE 2025 — registro ${k + 1}`} cover sizes="(min-width: 900px) 40vw, 80vw" className="h-full w-full" />
                </div>
              </div>
            ))}
          </HorizontalGallery>
        </div>
      </div>

      <style>{`@keyframes rf-rise{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:.8}50%{transform:translateY(-55vh) translateX(12px)}100%{transform:translateY(-110vh) translateX(-8px);opacity:0}}`}</style>
    </section>
  )
}

/** Níveis da subida: o último nível acende quando entra em cena. */
function ClimbGauge() {
  const levels = [3, 2, 1]
  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col gap-4">
      {levels.map((l, i) => (
        <motion.div
          key={l}
          initial={{ opacity: 0.25, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.9, delay: (levels.length - i) * 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`flex items-center justify-between rounded-full border-4 border-rf-abismo px-6 py-5 ${
            i === 0 ? 'bg-rf-coral text-rf-abismo shadow-[0_0_60px_rgba(255,230,0,0.35)]' : 'bg-rf-oceano/60 text-white/80'
          }`}
        >
          <span className="rf-title text-2xl">{i === 0 ? 'ÚLTIMO NÍVEL' : 'NÍVEL'}</span>
          <Cage />
        </motion.div>
      ))}
    </div>
  )
}
