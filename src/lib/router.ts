import { useEffect, useSyncExternalStore } from 'react'
import { hrefFor, isRouteId, routeForId, routeForPath, type Page } from './routes'
import { ScrollTrigger, scrollToId, scrollToTop } from './scroll'

/**
 * Roteador mínimo do SPA.
 * - `usePage()` diz qual página renderizar (início, Rebuilt, Reefscape);
 * - `navigate(id)` leva a uma seção: na mesma página rola suavemente, em outra
 *   página troca a página e "salta" direto para a seção;
 * - `goBack()` volta das temporadas para Quem Somos (onde fica o seletor);
 * - `useRouter()` sincroniza URL ⇄ rolagem e trata voltar/avançar.
 */

const initial = typeof window !== 'undefined' ? routeForPath(window.location.pathname) : null
let page: Page = initial?.page ?? 'home'
/** Seção a alcançar assim que a página atual estiver montada. */
let pendingJump: string | null = initial && initial.id !== 'hero' ? initial.id : null

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function usePage() {
  return useSyncExternalStore(subscribe, () => page, () => page)
}

/** A abertura só roda quando o site é aberto pelo endereço raiz. */
export const openedAtRoot = !initial || initial.id === 'hero'

export function navigate(id: string) {
  const r = routeForId(id)
  if (!r) return
  if (r.page === page) {
    scrollToId(r.id)
    return
  }
  history.pushState({ id: r.id }, '', hrefFor(r.id))
  pendingJump = r.id
  page = r.page
  emit()
}

/** Botão "voltar" das páginas de temporada: retorna ao seletor, em Quem Somos. */
export function goBack() {
  navigate('quem-somos')
}

/** Leva até a seção `id` da página já renderizada, corrigindo a posição enquanto o layout assenta. */
function jumpTo(id: string, signal: { cancelled: boolean }, onSettled: () => void) {
  const started = performance.now()
  const cleanups: (() => void)[] = []
  const stopOnUser = () => {
    signal.cancelled = true
    if (pendingJump === id) pendingJump = null
  }
  const opts = { passive: true } as const
  window.addEventListener('wheel', stopOnUser, opts)
  window.addEventListener('touchstart', stopOnUser, opts)
  window.addEventListener('keydown', stopOnUser)
  cleanups.push(() => {
    window.removeEventListener('wheel', stopOnUser)
    window.removeEventListener('touchstart', stopOnUser)
    window.removeEventListener('keydown', stopOnUser)
  })
  const finish = () => {
    cleanups.forEach((c) => c())
    onSettled()
  }

  const jump = () => !signal.cancelled && scrollToId(id, { push: false, immediate: true })
  const wait = () => {
    if (signal.cancelled) return finish()
    if (jump()) {
      const onRefresh = () => jump()
      ScrollTrigger.addEventListener('refresh', onRefresh)
      const timers = [window.setTimeout(jump, 400), window.setTimeout(jump, 1200)]
      const done = window.setTimeout(() => {
        jump()
        finish()
      }, 2600)
      cleanups.push(() => {
        ScrollTrigger.removeEventListener('refresh', onRefresh)
        ;[...timers, done].forEach(clearTimeout)
      })
    } else if (performance.now() - started < 15000) requestAnimationFrame(wait)
    else finish()
  }
  requestAnimationFrame(wait)
  return () => {
    signal.cancelled = true
    cleanups.forEach((c) => c())
  }
}

/** Liga URL, rolagem e histórico. Chamar uma vez, no App (depende da página montada). */
export function useRouter() {
  const current = usePage()

  // Endereço canônico (ex.: /Reefscape/Galeria → /reefscape/galeria); desconhecido → raiz.
  useEffect(() => {
    const canonical = hrefFor(initial?.id ?? 'hero')
    if (canonical && canonical !== window.location.pathname) history.replaceState(null, '', canonical)
  }, [])

  // A cada troca de página (ou link direto): vai para a seção pedida ou para o topo.
  useEffect(() => {
    let settling = true
    const signal = { cancelled: false }
    // O destino só é descartado quando o salto termina (em modo estrito o React
    // monta os efeitos duas vezes; consumir antes perderia o destino).
    const target = pendingJump
    let stop = () => {}
    if (target)
      stop = jumpTo(target, signal, () => {
        settling = false
        if (pendingJump === target && !signal.cancelled) pendingJump = null
      })
    else {
      scrollToTop()
      settling = false
    }
    requestAnimationFrame(() => ScrollTrigger.refresh())

    // URL acompanha a seção no centro da tela.
    let raf = 0
    let last = window.location.pathname
    const sync = () => {
      raf = 0
      if (settling) return
      let n: Element | null = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      while (n && !(n.id && isRouteId(n.id) && routeForId(n.id)?.page === current)) n = n.parentElement
      const href = n && hrefFor(n.id)
      if (!href || href === last) return
      last = href
      history.replaceState(history.state, '', href)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      stop()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [current])

  // Voltar/avançar do navegador.
  useEffect(() => {
    const onPop = () => {
      const r = routeForPath(window.location.pathname)
      if (!r) return
      if (r.page !== page) {
        pendingJump = r.id === 'hero' ? null : r.id
        page = r.page
        emit()
      } else scrollToId(r.id, { push: false })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
}
