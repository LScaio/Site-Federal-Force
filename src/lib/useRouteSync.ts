import { useEffect } from 'react'
import { hrefFor, initialRoute, isDeepLink, isRouteId, routeForPath } from './routes'
import { ScrollTrigger, scrollToId } from './scroll'

/**
 * Liga as URLs às seções:
 * - link direto (ex.: /reefscape/galeria): espera a seção existir (cenas são
 *   lazy) e rola até ela, corrigindo a posição enquanto o layout acima se
 *   acomoda (seções carregando, galerias fixadas pelo ScrollTrigger);
 * - durante a rolagem, a URL acompanha a seção no centro da tela (replaceState);
 * - voltar/avançar do navegador rola até a seção correspondente.
 */
export function useRouteSync() {
  useEffect(() => {
    let settling = isDeepLink
    let cancelled = false
    const cleanups: (() => void)[] = []

    // Caminho desconhecido → raiz; caminho válido → forma canônica
    // (ex.: /Reefscape/Galeria → /reefscape/galeria), sem recarregar.
    const canonical = hrefFor(initialRoute?.id ?? 'hero')
    if (canonical && canonical !== window.location.pathname) history.replaceState(null, '', canonical)

    if (isDeepLink && initialRoute) {
      const id = initialRoute.id
      const started = performance.now()
      const stop = () => {
        settling = false
        cancelled = true
      }
      // Se a pessoa rolar por conta própria, paramos de corrigir a posição.
      const userIntent = () => stop()
      const opts = { passive: true } as const
      window.addEventListener('wheel', userIntent, opts)
      window.addEventListener('touchstart', userIntent, opts)
      window.addEventListener('keydown', userIntent)
      cleanups.push(() => {
        window.removeEventListener('wheel', userIntent)
        window.removeEventListener('touchstart', userIntent)
        window.removeEventListener('keydown', userIntent)
      })

      const jump = () => !cancelled && scrollToId(id, { push: false, immediate: true })
      const wait = () => {
        if (cancelled) return
        if (jump()) {
          // reajusta após cada refresh de layout durante ~3 s
          const onRefresh = () => jump()
          ScrollTrigger.addEventListener('refresh', onRefresh)
          const t1 = window.setTimeout(jump, 400)
          const t2 = window.setTimeout(jump, 1200)
          const done = window.setTimeout(() => {
            jump()
            settling = false
            ScrollTrigger.removeEventListener('refresh', onRefresh)
          }, 3000)
          cleanups.push(() => {
            ScrollTrigger.removeEventListener('refresh', onRefresh)
            ;[t1, t2, done].forEach(clearTimeout)
          })
        } else if (performance.now() - started < 15000) requestAnimationFrame(wait)
        else settling = false
      }
      requestAnimationFrame(wait)
    }

    // URL acompanha a seção no centro da tela.
    let raf = 0
    let current = initialRoute?.id ?? 'hero'
    const sync = () => {
      raf = 0
      if (settling) return
      let n: Element | null = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      while (n && !(n.id && isRouteId(n.id))) n = n.parentElement
      if (!n || n.id === current) return
      const href = hrefFor(n.id)
      if (!href) return
      current = n.id
      history.replaceState({ id: current }, '', href)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Voltar/avançar
    const onPop = () => {
      const r = routeForPath(window.location.pathname)
      if (!r) return
      current = r.id
      scrollToId(r.id, { push: false })
    }
    window.addEventListener('popstate', onPop)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('popstate', onPop)
      cleanups.forEach((c) => c())
    }
  }, [])
}
