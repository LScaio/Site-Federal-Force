import { useEffect, useState } from 'react'
import { scrollToId } from '../../lib/scroll'

/** Navegação interna do mini-site de uma temporada (fica fixa enquanto a temporada está em cena). */
export function SeasonSubnav({
  items,
  className,
  activeClassName,
  idleClassName,
}: {
  items: { id: string; label: string }[]
  className: string
  activeClassName: string
  idleClassName: string
}) {
  const [active, setActive] = useState(items[0]?.id)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    items.forEach((i) => {
      const el = document.getElementById(i.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [items])

  return (
    <nav className={`sticky top-[68px] z-30 overflow-x-auto [scrollbar-width:none] ${className}`} aria-label="Navegação da temporada">
      <ul className="mx-auto flex w-max gap-1 px-4 py-2 md:px-8">
        {items.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => scrollToId(i.id)}
              className={`whitespace-nowrap px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.16em] transition-colors ${
                active === i.id ? activeClassName : idleClassName
              }`}
            >
              {i.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
