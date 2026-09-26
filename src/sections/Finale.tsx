import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { fraseFinal } from '../content/texts'
import { useReducedMotion } from '../lib/useReducedMotion'

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const blur = useTransform(progress, range, ['blur(8px)', 'blur(0px)'])
  return (
    <motion.span style={{ opacity, filter: blur }} className="mr-[0.25em] inline-block">
      {word}
    </motion.span>
  )
}

/** Última cena antes do rodapé. */
export default function Finale() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const progress = useTransform(scrollYProgress, (v) => (reduced ? 1 : v))
  const words = fraseFinal.flatMap((l, li) => l.split(' ').map((w) => ({ w, li })))
  const lineX = useTransform(progress, [0.3, 1], ['-100%', '0%'])

  return (
    <section ref={ref} id="final" data-scene="final" className="scene flex items-center overflow-hidden bg-ff-void">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(47,123,255,0.12),transparent)]" />
      {/* linhas de velocidade */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 space-y-6 opacity-60" aria-hidden>
        {[0, 1, 2].map((k) => (
          <motion.div key={k} style={{ x: lineX }} className="h-px w-full bg-gradient-to-r from-transparent via-ff-blue/60 to-transparent" />
        ))}
      </div>
      <div className="relative mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <p className="relative font-display text-[clamp(2.6rem,8vw,7.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          {words.map(({ w, li }, i) => {
            const start = 0.15 + (i / words.length) * 0.6
            return (
              <span key={i} className={li === 1 ? 'text-ff-ice' : ''}>
                {li === 1 && words[i - 1]?.li === 0 && <br />}
                <Word word={w} range={[start, start + 0.12]} progress={progress} />
              </span>
            )
          })}
          <span data-fefo-perch="final" className="absolute -top-4 right-[10%] h-px w-px" aria-hidden />
        </p>
      </div>
    </section>
  )
}
