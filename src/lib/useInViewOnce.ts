import { useEffect, useRef, useState } from 'react'

/** Monta conteúdo pesado (Canvas WebGL, iframes) só quando próximo da viewport. */
export function useNearViewport<T extends Element>(rootMargin = '400px', once = false) {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          if (once) io.disconnect()
        } else if (!once) setNear(false)
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, once])
  return [ref, near] as const
}
