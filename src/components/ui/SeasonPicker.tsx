import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { navigate } from '../../lib/router'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { getLenis } from '../../lib/scroll'
import { Arch, Bricks, Gear, Hammer } from '../../sections/rebuilt/icons'

/**
 * "Conheça as nossas temporadas": botão grande em Quem Somos que abre um
 * seletor com as duas temporadas. Cada opção segue o moodboard da sua
 * temporada (Drive: "Moodboard REBUILT 2026.pdf" e "Moodboards FRC – REBUILT
 * e REEFSCAPE.pdf"):
 *  - REBUILT 2026: Bowlby One inclinada, contorno preto grosso, bloco com
 *    sombra sólida, moldura tracejada, paleta deserto (Areia Sol, Laranja Base,
 *    Mostarda, Menta) e iconografia de traço grosso;
 *  - REEFSCAPE 2025: Rubik Black, moldura preta arredondada, silhuetas
 *    chapadas, ondas e bolhas, paleta oceano (Oceano, Água Rasa, Amarelo Coral).
 */
export function SeasonPickerButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        className="group relative mt-10 flex w-full items-center justify-between gap-6 overflow-hidden rounded-md border border-ff-blue/60 bg-ff-blue px-6 py-5 text-left text-white shadow-[0_24px_60px_-20px_rgba(47,123,255,0.7)] md:px-8 md:py-6"
        aria-haspopup="dialog"
      >
        <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-[900ms] ease-[var(--ease-cine)] group-hover:translate-x-full" />
        <span className="relative">
          <span className="block font-mono text-[0.66rem] uppercase tracking-[0.22em] text-white/75">Rebuilt 2026 · Reefscape 2025</span>
          <span className="mt-1 block font-display text-2xl font-semibold tracking-tight md:text-3xl">Conheça as nossas temporadas</span>
        </span>
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 transition-transform duration-500 group-hover:translate-x-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </motion.button>
      <SeasonPickerDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function SeasonPickerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion()
  const first = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    const prev = document.activeElement as HTMLElement | null
    requestAnimationFrame(() => first.current?.focus())
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, onClose])

  const go = (id: string) => {
    onClose()
    navigate(id)
  }

  // Portal no <body>: ancestrais animados (transform/filter) quebrariam o position: fixed.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-ff-void/80 p-4 backdrop-blur-xl md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="season-picker-title"
        >
          <motion.div
            className="relative w-full max-w-5xl"
            initial={reduced ? false : { y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4 md:mb-8">
              <div>
                <p className="hud-label">Federal Force #10466</p>
                <h2 id="season-picker-title" className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-5xl">
                  Qual temporada você quer conhecer?
                </h2>
              </div>
              <button type="button" onClick={onClose} className="hud-chip shrink-0 hover:border-ff-blue/60" aria-label="Fechar">
                Fechar ×
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <RebuiltOption buttonRef={first} onClick={() => go('rb-inicio')} />
              <ReefscapeOption onClick={() => go('rf-inicio')} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ---------------- REBUILT 2026 ---------------- */

function RebuiltOption({ onClick, buttonRef }: { onClick: () => void; buttonRef?: React.Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label="Temporada Rebuilt 2026"
      className="group relative block text-left outline-offset-8"
    >
      {/* moldura tracejada */}
      <span className="pointer-events-none absolute -inset-3 border-2 border-dashed border-rb-areia/60 transition-colors group-hover:border-rb-areia" />
      <span className="relative block overflow-hidden border-[3px] border-rb-contorno bg-rb-areia p-6 text-rb-contorno shadow-[10px_10px_0_#111] transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[16px_16px_0_#111] group-active:translate-x-1 group-active:translate-y-1 group-active:shadow-[4px_4px_0_#111] md:p-8">
        {/* grafismo de arco/ruína ao fundo */}
        <span className="pointer-events-none absolute -bottom-10 -right-8 text-rb-duna/45 transition-transform duration-700 group-hover:-translate-y-2">
          <Arch size={220} />
        </span>
        <span className="relative flex flex-wrap gap-2">
          <span className="border-[3px] border-rb-contorno bg-rb-areia px-2.5 py-0.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.18em]">
            FIRST Age
          </span>
          <span className="border-[3px] border-rb-contorno bg-rb-menta px-2.5 py-0.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.18em]">
            XXXV
          </span>
        </span>
        <span className="rb-title relative mt-6 block text-[clamp(3rem,7vw,4.6rem)] text-rb-laranja [-webkit-text-stroke:2.5px_#111] [text-shadow:6px_6px_0_#111]">
          REBUILT
        </span>
        <span className="relative mt-3 flex items-end justify-between gap-4">
          <span className="rb-title text-4xl md:text-5xl">2026</span>
          <span className="flex gap-2 text-rb-contorno">
            <Gear size={30} />
            <Bricks size={30} />
            <Hammer size={30} />
          </span>
        </span>
        <span className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-rb-contorno pt-4 font-mono text-xs font-bold uppercase tracking-[0.18em]">
          Reconstruir. Escavar.
          <span className="inline-flex items-center gap-2 whitespace-nowrap bg-rb-mostarda px-2 py-1 transition-transform group-hover:translate-x-1">
            Entrar →
          </span>
        </span>
      </span>
    </button>
  )
}

/* ---------------- REEFSCAPE 2025 ---------------- */

function ReefscapeOption({ onClick }: { onClick: () => void }) {
  const reduced = useReducedMotion()
  const bubbles = [
    { l: '12%', s: 10, d: 5.5, delay: 0 },
    { l: '30%', s: 16, d: 7, delay: -2 },
    { l: '55%', s: 8, d: 6, delay: -4 },
    { l: '72%', s: 14, d: 8, delay: -1 },
    { l: '88%', s: 9, d: 5, delay: -3 },
  ]
  return (
    <button type="button" onClick={onClick} aria-label="Temporada Reefscape 2025" className="group relative block text-left outline-offset-8">
      <span className="relative block overflow-hidden rounded-[28px] border-4 border-rf-abismo bg-[radial-gradient(120%_90%_at_30%_0%,#7FE4F6_0%,#0088A5_45%,#111_100%)] p-6 text-white shadow-[0_24px_60px_-24px_rgba(0,136,165,0.8)] transition-transform duration-500 ease-[var(--ease-cine)] group-hover:-translate-y-1.5 md:p-8">
        {/* bolhas soltas */}
        {!reduced &&
          bubbles.map((b, i) => (
            <span
              key={i}
              aria-hidden
              className="pointer-events-none absolute bottom-[-20px] rounded-full border-2 border-rf-rasa/70 opacity-60 group-hover:opacity-100"
              style={{ left: b.l, width: b.s, height: b.s, animation: `rf-card-rise ${b.d}s linear ${b.delay}s infinite` }}
            />
          ))}
        {/* coral chapado */}
        <svg viewBox="0 0 64 64" className="pointer-events-none absolute right-4 top-[44%] h-24 w-24 text-rf-anemona/70 transition-transform duration-700 group-hover:-translate-y-1 md:right-6" aria-hidden>
          <path fill="currentColor" d="M29 62V40c-8-2-14-9-14-18 0-3 4-3 4 0 0 6 4 11 10 13V14c0-3 6-3 6 0v27c5-2 9-7 9-13 0-3 4-3 4 0 0 9-6 16-13 18v16z" />
        </svg>
        <span className="relative flex flex-wrap gap-2">
          <span className="rounded-full border-[3px] border-rf-abismo bg-rf-rasa px-3 py-0.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.18em] text-rf-abismo">
            FIRST Dive
          </span>
          <span className="rounded-full border-[3px] border-rf-abismo bg-rf-anemona px-3 py-0.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.18em] text-rf-abismo">
            Primeira temporada
          </span>
        </span>
        <span className="rf-title relative mt-6 block text-[clamp(2.6rem,6vw,4rem)] text-rf-coral [-webkit-text-stroke:2.5px_#111]">
          REEFSCAPE
        </span>
        <span className="relative mt-3 block">
          <span className="rf-title text-4xl text-rf-rasa md:text-5xl">2025</span>
        </span>
        {/* onda */}
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="relative mt-6 block h-4 w-full text-rf-abismo" aria-hidden>
          <path d="M0 12 C 50 0 100 24 150 12 S 250 0 300 12 S 370 24 400 12" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
        <span className="relative mt-3 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-[0.18em]">
          Mergulhar~
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-rf-coral px-3 py-1 text-rf-abismo transition-transform group-hover:translate-x-1">
            Entrar →
          </span>
        </span>
      </span>
      <style>{`@keyframes rf-card-rise{0%{transform:translateY(0);opacity:0}15%{opacity:.8}100%{transform:translateY(-320px);opacity:0}}`}</style>
    </button>
  )
}
