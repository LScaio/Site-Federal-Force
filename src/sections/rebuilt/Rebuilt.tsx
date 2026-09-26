import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Reveal } from '../../components/ui/Reveal'
import { DriveImage } from '../../components/ui/DriveImage'
import { rebuilt } from '../../content/drive'
import { rebuiltTexto } from '../../content/texts'
import { SeasonSubnav } from '../season/SeasonSubnav'
import { HorizontalGallery } from '../season/HorizontalGallery'
import { useNearViewport } from '../../lib/useInViewOnce'
import { Arch, Bricks, Gear, Hammer } from './icons'

const CadViewer = lazy(() => import('../../components/three/CadViewer'))

/**
 * TEMPORADA REBUILT (2026) — identidade própria definida pelo
 * "Moodboard REBUILT 2026.pdf": Bowlby One inclinada, Archivo, Space Mono,
 * contorno preto grosso, blocos com sombra sólida e moldura tracejada.
 */

const nav = [
  { id: 'rb-inicio', label: 'Rebuilt' },
  { id: 'rb-historia', label: 'História' },
  { id: 'rb-desafio', label: 'Desafio' },
  { id: 'rb-robo', label: 'Robô' },
  { id: 'rb-estrategia', label: 'Estratégia' },
  { id: 'rb-resultados', label: 'Resultados' },
  { id: 'rb-galeria', label: 'Galeria' },
  { id: 'rb-cad', label: 'CAD 3D' },
]

/** Laterais: faixas de tijolos com moldura tracejada e rótulos verticais em Space Mono. */
function Sides() {
  const side = (pos: string) => (
    <div className={`pointer-events-none absolute inset-y-0 ${pos} hidden w-14 border-rb-contorno xl:block`} aria-hidden>
      <div
        className="absolute inset-y-0 left-3 right-3 border-x-[3px] border-rb-contorno opacity-90"
        style={{
          backgroundImage:
            'linear-gradient(#111 3px, transparent 3px), linear-gradient(90deg, #111 3px, transparent 3px)',
          backgroundSize: '100% 28px, 50% 56px',
          backgroundColor: '#DA8832',
        }}
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap bg-rb-areia px-3 font-mono text-[0.62rem] font-bold tracking-[0.3em] text-rb-contorno">
        REBUILT · XXXV · 2026
      </span>
    </div>
  )
  return (
    <>
      {side('left-0')}
      {side('right-0')}
    </>
  )
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-block border-[3px] border-rb-contorno bg-rb-areia px-3 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-rb-contorno ${className}`}>
      {children}
    </span>
  )
}

function Block({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} y={34} className={`rb-block ${className}`}>
      {children}
    </Reveal>
  )
}

function SubScene({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <div id={id} data-scene="rebuilt" className={`relative flex min-h-[100svh] items-center py-24 ${className}`}>
      <div className="relative mx-auto w-full max-w-[1240px] px-5 md:px-10 xl:px-24">{children}</div>
    </div>
  )
}

export default function Rebuilt() {
  const [cadRef, cadNear] = useNearViewport<HTMLDivElement>('600px', true)

  return (
    <section id="rebuilt" className="relative bg-rb-areia font-archivo text-rb-contorno">
      <SeasonSubnav
        items={nav}
        className="border-y-[3px] border-rb-contorno bg-rb-areia/95 backdrop-blur"
        activeClassName="bg-rb-contorno text-rb-areia"
        idleClassName="text-rb-contorno hover:bg-rb-mostarda"
      />
      <Sides />

      {/* HERO DA TEMPORADA */}
      <SubScene id="rb-inicio" className="overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-10 text-rb-duna/40 md:right-10">
          <Arch size={420} />
        </div>
        <Reveal className="flex flex-wrap gap-3">
          <Label>FIRST Age</Label>
          <Label className="bg-rb-menta">XXXV · 2026</Label>
        </Reveal>
        <motion.h2
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="rb-title relative mt-8 text-[clamp(4rem,14.5vw,11.5rem)] text-rb-laranja [-webkit-text-stroke:3px_#111] [text-shadow:8px_8px_0_#111]"
        >
          REBUILT
          <span data-fefo-perch="rebuilt" className="absolute -top-2 right-[8%] h-px w-px" aria-hidden />
        </motion.h2>
        <div className="mt-12 grid items-end gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Reveal delay={0.15}>
              <p className="rb-title text-3xl md:text-4xl">RECONSTRUIR. ESCAVAR.</p>
              <p className="mt-4 max-w-md text-lg font-semibold">Reimaginar o passado com engenharia.</p>
            </Reveal>
            <Reveal delay={0.25} className="mt-8 flex gap-4 text-rb-contorno">
              <Gear /> <Bricks /> <Hammer /> <Arch />
            </Reveal>
          </div>
          <Block className="rb-dashed relative aspect-[16/10] bg-rb-duna" delay={0.1}>
            <DriveImage file={rebuilt.fotos[0]} alt="Federal Force na temporada REBUILT 2026" cover className="h-full w-full" />
            <span className="absolute -bottom-5 left-4">
              <Label className="bg-rb-mostarda">Temporada 2026</Label>
            </span>
          </Block>
        </div>
      </SubScene>

      {/* HISTÓRIA */}
      <SubScene id="rb-historia" className="bg-rb-duna">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <Label>01 · História</Label>
              <h3 className="rb-title mt-6 text-[clamp(2.6rem,6vw,4.8rem)]">Kickoff · 10 de janeiro</h3>
            </Reveal>
            <Block className="mt-10 bg-rb-areia p-6 md:p-8" delay={0.1}>
              <p className="text-lg leading-relaxed md:text-xl">{rebuiltTexto.historia}</p>
            </Block>
          </div>
          <Block className="relative aspect-[4/3] bg-rb-terra" delay={0.15}>
            <DriveImage file={rebuilt.fotos[1]} alt="Federal Force — REBUILT 2026" cover className="h-full w-full" />
          </Block>
        </div>
      </SubScene>

      {/* DESAFIO */}
      <SubScene id="rb-desafio">
        <Reveal>
          <Label>02 · Desafio</Label>
        </Reveal>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Reveal>
            <h3 className="rb-title text-[clamp(2.6rem,6vw,4.8rem)]">
              FUEL, HUB
              <br />E TOWER
            </h3>
          </Reveal>
          <Block className="rb-dashed bg-white/60 p-6 md:p-8" delay={0.1}>
            <p className="text-lg leading-relaxed md:text-xl">{rebuiltTexto.desafio}</p>
          </Block>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            { t: 'FUEL', d: 'Bolas de espuma lançadas no alvo', bg: 'bg-rb-mostarda', icon: <Gear /> },
            { t: 'HUB', d: 'Alvo central, ativo em turnos', bg: 'bg-rb-menta', icon: <Arch /> },
            { t: 'TOWER', d: 'Escalada em até três níveis', bg: 'bg-rb-azul text-white', icon: <Bricks /> },
          ].map((c, k) => (
            <Block key={c.t} className={`${c.bg} p-6`} delay={k * 0.1}>
              {c.icon}
              <p className="rb-title mt-5 text-4xl">{c.t}</p>
              <p className="mt-2 font-mono text-sm font-bold uppercase tracking-wide">{c.d}</p>
            </Block>
          ))}
        </div>
      </SubScene>

      {/* DESENVOLVIMENTO DO ROBÔ */}
      <SubScene id="rb-robo" className="bg-rb-terra text-rb-areia">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <Block className="relative aspect-square bg-rb-contorno !border-rb-areia !shadow-[8px_8px_0_#F9C468]" delay={0.05}>
            <DriveImage file={rebuilt.fotos[2]} alt="Phoenix — robô da Federal Force na temporada REBUILT" cover className="h-full w-full" />
          </Block>
          <div>
            <Reveal>
              <Label>03 · Desenvolvimento do robô</Label>
              <h3 className="rb-title mt-6 text-[clamp(3.6rem,10vw,8rem)] text-rb-laranja [-webkit-text-stroke:2px_#111] [text-shadow:6px_6px_0_#111]">
                PHOENIX
              </h3>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed md:text-xl">{rebuiltTexto.robo}</p>
            </Reveal>
            <div className="mt-8 grid grid-cols-3 gap-4 text-rb-contorno">
              {[
                { t: 'Intake', d: 'coletar as bolas do chão', on: true },
                { t: 'Shooter', d: 'lançá-las', on: true },
                { t: 'Climber', d: 'não compensava na nossa estratégia', on: false },
              ].map((s, k) => (
                <Block key={s.t} className={`${s.on ? 'bg-rb-mostarda' : 'bg-rb-areia/70'} p-4`} delay={0.15 + k * 0.08}>
                  <p className={`font-mono text-xs font-bold uppercase tracking-widest ${s.on ? '' : 'line-through decoration-[3px]'}`}>{s.t}</p>
                  <p className="mt-2 text-sm leading-snug">{s.d}</p>
                </Block>
              ))}
            </div>
          </div>
        </div>
      </SubScene>

      {/* ESTRATÉGIA */}
      <SubScene id="rb-estrategia" className="bg-rb-azul text-white">
        <Reveal>
          <Label>04 · Estratégia</Label>
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <Block className="bg-rb-areia p-8 text-rb-contorno md:p-10" delay={0.05}>
            <p className="rb-title text-[clamp(1.8rem,3.6vw,3rem)]">“…onde estratégia e comunicação fazem toda a diferença.”</p>
            <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em]">Alianças de três equipes</p>
          </Block>
          <Block className="rb-dashed bg-rb-laranja p-8 text-rb-contorno md:p-10" delay={0.15}>
            <p className="rb-title text-[clamp(1.8rem,3.6vw,3rem)]">“…sem um sistema de Climber porque não compensava na nossa estratégia.”</p>
            <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em]">Phoenix · 2026</p>
          </Block>
        </div>
      </SubScene>

      {/* RESULTADOS */}
      <SubScene id="rb-resultados" className="bg-rb-mostarda">
        <div className="grid items-center gap-12 lg:grid-cols-[auto_1fr]">
          <Reveal>
            <Label>05 · Resultados</Label>
            <p className="rb-title mt-6 text-[clamp(10rem,30vw,22rem)] leading-[0.8] text-rb-laranja [-webkit-text-stroke:4px_#111] [text-shadow:12px_12px_0_#111]">
              7
            </p>
          </Reveal>
          <Block className="bg-rb-areia p-8 md:p-10" delay={0.1}>
            <p className="rb-title text-[clamp(2rem,4.5vw,3.6rem)]">bolinhas em média</p>
            <p className="mt-4 font-mono text-sm font-bold uppercase tracking-[0.18em]">No período autônomo · Phoenix · 2026</p>
          </Block>
        </div>
      </SubScene>

      {/* GALERIA */}
      <div id="rb-galeria" data-scene="rebuilt">
        <HorizontalGallery className="bg-rb-duna">
          <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-center md:w-[34vw]">
            <Label>06 · Galeria</Label>
            <h3 className="rb-title mt-6 text-[clamp(3rem,7vw,6rem)]">Descoberta</h3>
          </div>
          {rebuilt.fotos.map((f, k) => (
            <div key={f.id} className={`shrink-0 snap-center py-6 ${k % 2 ? 'md:mt-24' : ''}`}>
              <div className={`rb-block relative h-[52svh] w-[78vw] bg-rb-terra md:h-[62svh] md:w-[40vw] ${k % 3 === 1 ? 'rb-dashed' : ''}`}>
                <DriveImage file={f} alt={`REBUILT 2026 — registro ${k + 1}`} cover sizes="(min-width: 900px) 40vw, 80vw" className="h-full w-full" />
                <span className="absolute -top-4 left-4">
                  <Label className="bg-rb-menta">{String(k + 1).padStart(2, '0')}</Label>
                </span>
              </div>
            </div>
          ))}
        </HorizontalGallery>
      </div>

      {/* CAD 3D */}
      <div id="rb-cad" data-scene="rebuilt-cad" className="relative bg-rb-contorno py-24 text-rb-areia">
        <div className="mx-auto max-w-[1240px] px-5 md:px-10 xl:px-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Label>07 · Visualizador CAD 3D</Label>
              <h3 className="rb-title relative mt-6 text-[clamp(2.6rem,6vw,4.8rem)] text-rb-laranja">
                Explore o robô
                <span data-fefo-perch="rebuilt-cad" className="absolute -top-2 right-0 h-px w-px" aria-hidden />
              </h3>
            </div>
            <p className="max-w-xs font-mono text-xs uppercase tracking-[0.16em] text-rb-areia/70">Modelo CAD do Drive · Hero(Telainicial)</p>
          </Reveal>
          <div ref={cadRef} className="mt-10 border-[3px] border-rb-areia shadow-[10px_10px_0_#FA4614]">
            {cadNear ? (
              <Suspense fallback={<div className="h-[70svh] bg-[#0b0a09]" />}>
                <CadViewer accent="#FA4614" background="#0b0a09" className="h-[70svh] min-h-[420px]" />
              </Suspense>
            ) : (
              <div className="h-[70svh] min-h-[420px] bg-[#0b0a09]" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
