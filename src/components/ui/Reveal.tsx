import { motion, type HTMLMotionProps } from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** Entrada suave de elementos ao cruzar a viewport. */
export function Reveal({
  delay = 0,
  y = 28,
  children,
  ...rest
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Título de cena com índice de telemetria. */
export function SceneTitle({
  index,
  kicker,
  children,
  className = '',
  perch,
}: {
  index: string
  kicker: string
  children: React.ReactNode
  className?: string
  /** id do ponto de pouso do Fefo próximo ao título */
  perch?: string
}) {
  return (
    <div className={className}>
      <Reveal className="mb-5 flex items-center gap-3">
        <span className="font-mono text-xs text-ff-blue">{index}</span>
        <span className="h-px w-10 bg-ff-line" />
        <span className="hud-label">{kicker}</span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="relative font-display text-[clamp(2.4rem,5.6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
          {children}
          {perch && <span data-fefo-perch={perch} className="absolute -top-2 right-0 inline-block h-px w-px" aria-hidden />}
        </h2>
      </Reveal>
    </div>
  )
}
