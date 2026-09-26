import { useEffect, useRef, useState } from 'react'
import { useIntroPhase, useScene } from '../../lib/sceneStore'
import { scrollToId } from '../../lib/scroll'
import { DriveImage } from './DriveImage'
import { hero } from '../../content/drive'

export type SceneLink = { id: string; label: string }

/** Barra superior + trilho lateral de cenas, em estilo de telemetria. */
export function Hud({ scenes }: { scenes: SceneLink[] }) {
  const scene = useScene()
  const intro = useIntroPhase()
  const bar = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const idx = Math.max(0, scenes.findIndex((s) => scene === s.id || scene.startsWith(`${s.id}-`)))

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const visible = intro !== 'intro'
  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-ff-void/75 backdrop-blur-md transition-[opacity,transform] duration-1000 ease-[var(--ease-cine)] ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
          <button type="button" onClick={() => go('hero')} className="flex items-center gap-3" aria-label="Início">
            <span className="block overflow-hidden rounded-md border border-white/10 bg-black">
              <DriveImage file={hero.logo} alt="" width={120} className="h-8 w-auto" eager />
            </span>
            <span className="hidden font-mono text-[0.7rem] tracking-[0.2em] text-ff-text sm:block">FEDERAL FORCE #10466</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="hud-chip hover:border-ff-blue/60"
            aria-expanded={open}
            aria-controls="scene-menu"
          >
            <span className="tabular-nums text-ff-blue">{String(idx + 1).padStart(2, '0')}</span>
            <span className="text-ff-muted">/{String(scenes.length).padStart(2, '0')}</span>
            <span className="hidden sm:inline">{scenes[idx]?.label}</span>
            <span className="ml-1">{open ? '×' : '≡'}</span>
          </button>
        </div>
        <div className="h-px w-full bg-ff-line">
          <div ref={bar} className="h-px origin-left bg-ff-blue" style={{ transform: 'scaleX(0)' }} />
        </div>
      </header>

      {/* Menu de cenas */}
      <nav
        id="scene-menu"
        className={`fixed inset-0 z-40 bg-ff-void/85 backdrop-blur-xl transition-opacity duration-500 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <ol className="mx-auto flex h-full max-w-[1400px] flex-col justify-center gap-1 px-6 md:px-10">
          {scenes.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={() => go(s.id)}
                className={`group flex items-baseline gap-5 py-1 text-left font-display text-[clamp(1.6rem,4.2vw,3.4rem)] font-semibold tracking-tight transition-colors ${
                  i === idx ? 'text-ff-text' : 'text-ff-muted hover:text-ff-text'
                }`}
              >
                <span className="font-mono text-xs text-ff-blue">{String(i + 1).padStart(2, '0')}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Trilho lateral (desktop) */}
      <div
        className={`fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-700 lg:flex ${
          visible && !open && !/^(rebuilt|reefscape)/.test(scene) ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {scenes.map((s, i) => (
          <button key={s.id} type="button" onClick={() => go(s.id)} className="group flex items-center justify-end gap-3" aria-label={s.label}>
            <span className="hud-label opacity-0 transition-opacity group-hover:opacity-100">{s.label}</span>
            <span
              className={`block h-px transition-all duration-500 ${i === idx ? 'w-8 bg-ff-blue' : 'w-3 bg-ff-muted/50 group-hover:w-5'}`}
            />
          </button>
        ))}
      </div>
    </>
  )
}
