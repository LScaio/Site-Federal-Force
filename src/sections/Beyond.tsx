import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { SceneTitle, Reveal } from '../components/ui/Reveal'
import { projetosTexto } from '../content/texts'
import { projetosImagens, type DriveFile } from '../content/drive'
import { DriveImage } from '../components/ui/DriveImage'
import { useCoarsePointer, useReducedMotion } from '../lib/useReducedMotion'

/** ALÉM DA ARENA — todos os projetos de Drive/Projetos_Sociais. */
export default function Beyond() {
  return (
    <section id="alem-da-arena" data-scene="alem-da-arena" className="scene flex items-center bg-ff-black py-28">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SceneTitle index="07" kicker="Projetos" perch="alem-da-arena">
            Além da Arena
          </SceneTitle>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {projetosTexto.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <ProjectCard nome={p.nome} texto={p.texto} index={i} imagens={projetosImagens[p.id] ?? []} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Enquadramento das artes verticais no card quadrado (centraliza logo/pessoas). */
const ENQUADRAMENTO: Record<string, string> = {
  '1sQzKtHSUQb_m5iCglUd9cgqPkWuAFj-3': 'center 64%', // Force Voice — logo
  '1iAsN6nvdO7-dcksRun9CrThP5GH_0z0u': 'center 68%', // Rocket Force — equipe no lançamento
  '1jQ7675amkkwmUkO5QeDHH9nol6SAJepH': 'center 55%', // STEAM Girls — retrato
}

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function ProjectCard({ nome, texto, index, imagens }: { nome: string; texto: string; index: number; imagens: DriveFile[] }) {
  const coarse = useCoarsePointer()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(false)
  const [slide, setSlide] = useState(0)

  // Projetos com mais de uma imagem alternam suavemente entre elas (pausa ao abrir o card).
  useEffect(() => {
    if (imagens.length < 2 || reduced || active) return
    const id = window.setInterval(() => setSlide((s) => (s + 1) % imagens.length), 4500)
    return () => window.clearInterval(id)
  }, [imagens.length, reduced, active])
  const ref = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 140, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 18 })

  const onMove = (e: React.PointerEvent) => {
    if (coarse || reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <div style={{ perspective: 1100 }}>
      <motion.button
        ref={ref}
        type="button"
        aria-expanded={active}
        aria-label={`${nome} — ${active ? 'ocultar' : 'ver'} descrição`}
        onPointerMove={onMove}
        onPointerEnter={() => !coarse && setActive(true)}
        onPointerLeave={() => {
          if (!coarse) setActive(false)
          reset()
        }}
        onClick={() => coarse && setActive((a) => !a)}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && setActive(true)}
        onBlur={() => setActive(false)}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        animate={{ z: active && !reduced ? 40 : 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        className={`group relative block aspect-square w-full overflow-hidden rounded-md border text-left transition-[border-color,box-shadow] duration-700 ${
          active ? 'border-ff-blue/60 shadow-[0_40px_80px_-30px_rgba(47,123,255,0.45)]' : 'border-ff-line'
        }`}
      >
        {/* Fundo: imagens do projeto (ou tipografia monumental), desfocado quando ativo */}
        <div
          className={`absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,#132341,#070a10_60%)] transition-[filter,transform] duration-700 ease-[var(--ease-cine)] ${
            active ? 'scale-110 blur-md' : 'scale-100 blur-0'
          }`}
        >
          {imagens.length > 0 ? (
            imagens.map((file, k) => (
              <div
                key={file.id}
                className={`absolute inset-0 transition-opacity duration-[1400ms] ${k === slide ? 'opacity-100' : 'opacity-0'}`}
              >
                <DriveImage
                  file={file}
                  alt={k === 0 ? `${nome} — Federal Force #10466` : ''}
                  cover
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  objectPosition={ENQUADRAMENTO[file.id]}
                  className="h-full w-full"
                />
              </div>
            ))
          ) : (
            <>
              <div className="absolute inset-0 grid-lines opacity-40" />
              <span className="absolute -bottom-[0.18em] -right-[0.05em] select-none font-display text-[12rem] font-bold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(159,208,255,0.35)] md:text-[14rem]">
                {initials(nome)}
              </span>
            </>
          )}
          {/* leitura do título sobre a imagem */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />
        </div>
        <div className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative flex h-full flex-col justify-between p-6 md:p-8" style={{ transform: 'translateZ(40px)' }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-ff-blue">{String(index + 1).padStart(2, '0')}</span>
            <span className="hud-label">{coarse ? (active ? 'Fechar' : 'Toque') : 'Projeto'}</span>
          </div>
          <div>
            <h3 className="font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{nome}</h3>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-cine)] ${
                active ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <p className="overflow-hidden text-sm leading-relaxed text-ff-text/85 md:text-[0.95rem]">{texto}</p>
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  )
}
