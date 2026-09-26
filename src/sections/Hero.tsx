import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, lockScroll, scrollToId } from '../lib/scroll'
import { useReducedMotion } from '../lib/useReducedMotion'
import { setIntroPhase, useIntroPhase } from '../lib/sceneStore'
import { createRobotMotion } from '../components/three/robotMotion'
import { DriveImage } from '../components/ui/DriveImage'
import { hero } from '../content/drive'
import { slogan } from '../content/texts'
import { useNearViewport } from '../lib/useInViewOnce'
import { isDeepLink } from '../lib/routes'

const HeroScene = lazy(() => import('../components/three/HeroScene'))

const isDesktop = () => window.matchMedia('(min-width: 900px)').matches

/** Linhas discretas de telemetria da abertura. */
function TelemetryLines() {
  const rows = [18, 31, 47, 62, 79]
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
      {rows.map((y, i) => (
        <g key={y} className="tl-line" style={{ opacity: 0 }}>
          <line x1="0" x2="100" y1={y} y2={y} stroke="rgb(150 180 230 / 0.16)" strokeWidth="0.08" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: 24 }, (_, k) => (
            <line
              key={k}
              x1={k * 4.3 + (i % 2) * 2}
              x2={k * 4.3 + (i % 2) * 2}
              y1={y - 0.5}
              y2={y + 0.5}
              stroke="rgb(150 180 230 / 0.22)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  const phase = useIntroPhase()
  const root = useRef<HTMLElement>(null)
  const blurNode = useRef<SVGFEGaussianBlurElement>(null)
  const motion = useRef(createRobotMotion()).current
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const readyRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const velRef = useRef<HTMLSpanElement>(null)
  const [canvasRef, near] = useNearViewport<HTMLDivElement>('200px')

  const markReady = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    const tl = tlRef.current
    if (tl && tl.paused() && tl.time() >= tl.labels.enter - 0.01) tl.play()
  }, [])

  const onProgress = useCallback(
    (p: number, done: boolean) => {
      setProgress(Math.round(p))
      if (done) markReady()
    },
    [markReady],
  )

  // Salvaguarda: em conexões muito lentas a abertura segue após 12s mesmo sem o CAD completo.
  useEffect(() => {
    const id = window.setTimeout(markReady, 12000)
    return () => window.clearTimeout(id)
  }, [markReady])

  // Posição final do robô na Hero (desktop: à direita; mobile: centralizado, atrás do texto).
  const settle = useCallback(() => {
    const desk = isDesktop()
    return { x: desk ? 1.15 : 0, y: desk ? 0 : 1.1, yaw: -0.55 }
  }, [])

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      if (reduced) {
        Object.assign(motion, settle(), { float: 0, parallax: 0, trail: 0 })
        gsap.set('.intro-layer', { autoAlpha: 0 })
        gsap.set('.hero-reveal', { autoAlpha: 1, y: 0 })
        setIntroPhase('done')
        return
      }

      lockScroll(true)
      gsap.set('.hero-reveal', { autoAlpha: 0, y: 24 })
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          setIntroPhase('done')
          lockScroll(false)
        },
      })
      tlRef.current = tl
      if (import.meta.env.DEV) (window as unknown as { __introTl?: gsap.core.Timeline }).__introTl = tl

      // 1. Escuridão + linhas de telemetria
      tl.to('.tl-line', { opacity: 1, duration: 1.2, stagger: 0.12, ease: 'power1.inOut' }, 0.2)
        .from('.tl-readout', { autoAlpha: 0, y: 6, duration: 0.6, stagger: 0.08 }, 0.5)
        // 2. Luz azul atravessa a tela
        .fromTo('.light-sweep', { xPercent: -120, autoAlpha: 1 }, { xPercent: 120, duration: 1.1, ease: 'power2.inOut' }, 1.4)
        .addLabel('enter', 2.05)
        .call(() => {
          if (!readyRef.current) tl.pause()
        }, [], 'enter')
        // 3. Robô entra pela lateral em altíssima velocidade e desacelera até o centro
        .to(motion, { x: 0, duration: 2.1, ease: 'expo.out' }, 'enter')
        .to(motion, { yaw: -0.55, duration: 2.4, ease: 'power2.out' }, 'enter')
        .to('.intro-flash', { autoAlpha: 0.35, duration: 0.12, yoyo: true, repeat: 1, ease: 'none' }, 'enter+=0.05')
        // 4. Para no centro e passa a flutuar
        .to(motion, { float: 1, duration: 1.4, ease: 'sine.inOut' }, 'enter+=1.5')
        .to(motion, { trail: 0, duration: 0.6 }, 'enter+=2.2')
        // 5. Logo + slogan
        .addLabel('brand', 'enter+=2.0')
        .fromTo(
          '.intro-logo',
          { autoAlpha: 0, scale: 0.94, filter: 'blur(10px)', clipPath: 'inset(0 50% 0 50%)' },
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0%)', duration: 1.1, ease: 'expo.out' },
          'brand',
        )
        .from('.intro-slogan-char', { yPercent: 110, duration: 0.9, stagger: 0.025, ease: 'expo.out' }, 'brand+=0.35')
        .fromTo('.intro-rule', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 'brand+=0.3')
        // 6. A abertura se dissolve e revela o site
        .addLabel('reveal', 'brand+=2.4')
        .call(() => setIntroPhase('reveal'), [], 'reveal')
        .to('.intro-brand', { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: 0.9, ease: 'power2.in' }, 'reveal')
        .to('.tl-line, .tl-readout', { autoAlpha: 0, duration: 0.8 }, 'reveal')
        .to(motion, { ...settle(), duration: 1.6, ease: 'power3.inOut' }, 'reveal+=0.2')
        .to(motion, { parallax: 1, duration: 1.2 }, 'reveal+=0.8')
        .to('.hero-reveal', { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, 'reveal+=0.7')
        .set('.intro-layer', { autoAlpha: 0 })

      // Link direto para uma seção (ex.: /reefscape/galeria): sem abertura.
      // Marca como pronto antes de saltar, senão o ponto de espera pelo CAD
      // (label "enter") pausaria a timeline no meio do salto.
      if (isDeepLink) {
        readyRef.current = true
        tl.progress(1)
        setIntroPhase('done')
        lockScroll(false)
      }
    }, el)

    // Parallax de scroll: o robô sobe e gira levemente ao sair da Hero.
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        motion.scroll = self.progress
      },
    })

    const onResize = () => {
      if (tlRef.current?.isActive()) return
      Object.assign(motion, settle())
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      st.kill()
      ctx.revert()
      lockScroll(false)
    }
  }, [reduced, motion, settle])

  // Velocímetro da telemetria acompanha a velocidade real do robô na abertura.
  useEffect(() => {
    if (reduced || phase === 'done') return
    let raf = 0
    let prev = motion.x
    const loop = () => {
      const v = Math.abs(motion.x - prev) * 60 * 18
      prev = motion.x
      if (velRef.current) velRef.current.textContent = String(Math.round(v)).padStart(3, '0')
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced, phase, motion])

  const skip = () => tlRef.current?.progress(1)
  const chars = Array.from(slogan)

  return (
    <section ref={root} id="hero" data-scene="hero" className="scene overflow-hidden bg-ff-void">
      {/* filtro SVG de motion blur horizontal usado pelo canvas */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="ff-motion-blur" x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur ref={blurNode} in="SourceGraphic" stdDeviation="0 0" />
        </filter>
      </svg>

      {/* Atmosfera */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(47,123,255,0.14),transparent_65%)]" />

      {/* Robô 3D */}
      <div ref={canvasRef} className="absolute inset-0 z-10">
        <Suspense fallback={null}>
          <HeroScene motion={motion} active={near} blurNode={blurNode} onProgress={onProgress} />
        </Suspense>
      </div>

      {/* Poleiro do Fefo sobre o robô (acompanha o enquadramento de cada layout) */}
      <span
        data-fefo-perch="hero"
        aria-hidden
        className="pointer-events-none absolute left-[36%] top-[23%] z-0 h-px w-px md:left-[64%] md:top-[45.5%]"
      />

      {/* Camada da abertura */}
      {!reduced && phase !== 'done' && (
        <div className="intro-layer pointer-events-none absolute inset-0 z-30">
          <TelemetryLines />
          <div className="intro-flash absolute inset-0 bg-ff-blue/40 opacity-0 mix-blend-screen" />
          <div className="light-sweep absolute inset-y-0 left-0 w-full opacity-0">
            <div className="h-full w-[38%] bg-[linear-gradient(90deg,transparent,rgba(47,123,255,0.0)_15%,rgba(47,123,255,0.55)_48%,rgba(190,225,255,0.9)_50%,rgba(47,123,255,0.55)_52%,transparent_85%)] blur-2xl" />
          </div>

          <div className="absolute left-5 top-5 flex flex-col gap-1 md:left-10 md:top-8">
            <span className="tl-readout hud-label">Federal Force · #10466</span>
            <span className="tl-readout hud-label">Taguatinga · DF · Brasil</span>
          </div>
          <div className="absolute right-5 top-5 text-right md:right-10 md:top-8">
            <span className="tl-readout hud-label block">
              VEL <span ref={velRef} className="text-ff-text tabular-nums">000</span>
            </span>
            <span className="tl-readout hud-label block">
              CAD <span className="text-ff-text tabular-nums">{String(progress).padStart(3, '0')}%</span>
            </span>
          </div>
          <div className="absolute bottom-6 left-5 md:left-10">
            <span className="tl-readout hud-label">FIRST Robotics Competition</span>
          </div>

          <div className="intro-brand absolute inset-x-0 bottom-[7%] flex flex-col items-center gap-5 px-6 md:bottom-[6%]">
            <div className="intro-logo overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_60px_rgba(47,123,255,0.25)]">
              <DriveImage file={hero.logo} alt="Logo Federal Force" width={320} className="h-16 w-auto md:h-20" eager />
            </div>
            <div className="intro-rule h-px w-40 origin-center bg-gradient-to-r from-transparent via-ff-blue to-transparent" />
            <p className="overflow-hidden text-center font-display text-2xl font-semibold tracking-tight md:text-4xl" aria-label={slogan}>
              {chars.map((c, i) => (
                <span key={i} className="intro-slogan-char inline-block whitespace-pre" aria-hidden>
                  {c}
                </span>
              ))}
            </p>
          </div>

          <button
            type="button"
            onClick={skip}
            className="pointer-events-auto absolute bottom-6 right-5 hud-chip hover:border-ff-blue/60 md:right-10"
          >
            Pular abertura
          </button>
        </div>
      )}

      {/* Conteúdo real da Hero */}
      <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-24 pt-28 md:justify-center md:px-10 md:pb-16">
        <div className="max-w-xl">
          <div className="hero-reveal mb-6 flex flex-wrap gap-2">
            <span className="hud-chip">
              <span className="hud-dot" /> Federal Force #10466
            </span>
            <span className="hud-chip">SESI-DF · SENAI-DF</span>
          </div>
          <h1 className="hero-reveal font-display text-[clamp(3.2rem,9vw,8.5rem)] font-bold leading-[0.86] tracking-[-0.04em]">
            Federal
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_rgb(233_238_245)]">Force</span>
          </h1>
          <p className="hero-reveal mt-6 font-display text-xl font-medium text-ff-ice md:text-2xl">{slogan}</p>
          <p className="hero-reveal mt-3 hud-label">Taguatinga · Distrito Federal · Brasil</p>
        </div>

        <button
          type="button"
          onClick={() => scrollToId('quem-somos')}
          className="hero-reveal absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 hud-label hover:text-ff-text"
        >
          Role para entrar
          <span className="relative h-10 w-px overflow-hidden bg-ff-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_var(--ease-cine)_infinite] bg-ff-blue" />
          </span>
        </button>
      </div>

      {/* cantoneiras de interface */}
      <div className="pointer-events-none absolute inset-4 z-20 md:inset-6" aria-hidden>
        {['left-0 top-0 border-l border-t', 'right-0 top-0 border-r border-t', 'left-0 bottom-0 border-l border-b', 'right-0 bottom-0 border-r border-b'].map(
          (c) => (
            <span key={c} className={`absolute h-4 w-4 border-ff-ice/30 ${c}`} />
          ),
        )}
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  )
}
