import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/scroll'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * Galeria em trilho horizontal: no desktop a cena é fixada e o scroll vertical
 * move o trilho; no mobile / reduced-motion vira um carrossel nativo com snap.
 */
export function HorizontalGallery({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const el = track.current!
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + 80)
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => {
      window.clearTimeout(id)
      mm.revert()
    }
  }, [reduced])

  return (
    <div ref={wrap} className={`relative flex min-h-[100svh] flex-col justify-center overflow-hidden ${className}`}>
      <div
        ref={track}
        className={`flex gap-6 px-5 md:gap-10 md:px-10 ${reduced ? 'overflow-x-auto snap-x snap-mandatory' : 'max-[899px]:overflow-x-auto max-[899px]:snap-x max-[899px]:snap-mandatory'} [scrollbar-width:none]`}
      >
        {children}
      </div>
    </div>
  )
}
