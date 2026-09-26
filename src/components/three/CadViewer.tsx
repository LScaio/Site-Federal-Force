import { Suspense, useCallback, useRef, useState } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, OrbitControls, Html, useProgress, Bounds, useBounds } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Robot, useRobotAvailable } from './Robot'
import { StudioLighting } from './Lighting'
import { resolveSubsystem, type Subsystem } from './subsystems'

export type CadViewerProps = {
  /** Cor de destaque (hover/seleção) — cada temporada passa a sua. */
  accent?: string
  /** Fundo do palco 3D (sempre escuro). */
  background?: string
  className?: string
  onSelectSubsystem?: (s: Subsystem | null) => void
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="font-mono text-[0.7rem] tracking-[0.2em] text-white/70">CAD {Math.round(progress)}%</div>
    </Html>
  )
}

/** Aplica destaque emissivo em todos os meshes de um nó (subsistema). */
function setHighlight(root: THREE.Object3D | null, color: THREE.Color | null) {
  root?.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const mats = Array.isArray(m.material) ? m.material : [m.material]
    mats.forEach((mat) => {
      const std = mat as THREE.MeshStandardMaterial
      if (!('emissive' in std)) return
      std.emissive.copy(color ?? new THREE.Color(0, 0, 0))
      std.emissiveIntensity = color ? 0.45 : 0
    })
  })
}

function Model({ accent, onSelect }: { accent: string; onSelect: (s: Subsystem | null) => void }) {
  const hovered = useRef<THREE.Object3D | null>(null)
  const selected = useRef<THREE.Object3D | null>(null)
  const color = new THREE.Color(accent)
  const bounds = useBounds()

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const hit = resolveSubsystem(e.object)
    const root = hit?.root ?? null
    if (root === hovered.current) return
    if (hovered.current && hovered.current !== selected.current) setHighlight(hovered.current, null)
    hovered.current = root
    if (root) setHighlight(root, color)
    document.body.style.cursor = root ? 'pointer' : ''
  }
  const onOut = () => {
    if (hovered.current && hovered.current !== selected.current) setHighlight(hovered.current, null)
    hovered.current = null
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const hit = resolveSubsystem(e.object)
    if (selected.current && selected.current !== hit?.root) setHighlight(selected.current, null)
    selected.current = hit?.root ?? null
    if (hit) {
      setHighlight(hit.root, color)
      bounds.refresh(hit.root).fit()
    }
    onSelect(hit?.subsystem ?? null)
  }

  return (
    <group onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}>
      <Robot cloneMaterials />
    </group>
  )
}

/**
 * Visualizador CAD 3D — usa exatamente o mesmo GLB da abertura
 * (ROBOT_GLB_URL). Rotação livre, zoom, luz cinematográfica, sombras suaves.
 */
export default function CadViewer({ accent = '#2f7bff', background = '#05070b', className = '', onSelectSubsystem }: CadViewerProps) {
  const controls = useRef<OrbitControlsImpl>(null)
  const [interacted, setInteracted] = useState(false)
  const [subsystem, setSubsystem] = useState<Subsystem | null>(null)
  const availability = useRobotAvailable()

  const select = useCallback(
    (s: Subsystem | null) => {
      setSubsystem(s)
      onSelectSubsystem?.(s)
    },
    [onSelectSubsystem],
  )

  const reset = () => {
    controls.current?.reset()
    select(null)
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background }}>
      <Canvas
        shadows="percentage"
        dpr={[1, 1.75]}
        camera={{ position: [4.2, 2.6, 4.6], fov: 32 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onPointerMissed={() => select(null)}
      >
        <color attach="background" args={[background]} />
        <fog attach="fog" args={[background, 9, 22]} />
        <StudioLighting />
        <Suspense fallback={<Loader />}>
          <Bounds margin={1.25} maxDuration={0.9}>
            <Model accent={accent} onSelect={select} />
          </Bounds>
          <AccumulativeShadows temporal frames={60} alphaTest={0.85} opacity={0.75} scale={10} position={[0, 0.001, 0]} color="#000">
            <RandomizedLight amount={6} radius={5} ambient={0.5} intensity={1} position={[4, 7, 5]} bias={0.001} />
          </AccumulativeShadows>
        </Suspense>
        <OrbitControls
          ref={controls}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2.4}
          maxDistance={11}
          maxPolarAngle={Math.PI / 2 - 0.04}
          target={[0, 0.9, 0]}
          autoRotate={!interacted}
          autoRotateSpeed={0.6}
          onStart={() => setInteracted(true)}
        />
      </Canvas>

      {/* Interface do visualizador */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 md:p-6">
        <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/55">
          Arraste para girar · Role/pinça para zoom
          {availability === 'missing' && <span className="mt-1 block text-white/35">CAD · aguardando federal-robot.glb</span>}
        </div>
        <button
          type="button"
          onClick={reset}
          className="pointer-events-auto border border-white/15 bg-black/50 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/80 backdrop-blur-md hover:border-white/40"
        >
          Resetar vista
        </button>
      </div>

      {/* Ficha técnica do subsistema selecionado (preenchida via subsystems.ts) */}
      {subsystem?.ficha && (
        <aside className="absolute right-4 top-4 w-72 max-w-[calc(100%-2rem)] border border-white/15 bg-black/70 p-5 text-white backdrop-blur-xl">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em]" style={{ color: accent }}>
            Subsistema
          </p>
          <h4 className="mt-2 text-xl font-semibold">{subsystem.nome}</h4>
          <p className="mt-3 text-sm text-white/70">{subsystem.ficha.resumo}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {subsystem.ficha.specs.map((s) => (
              <div key={s.rotulo} className="flex justify-between gap-4 border-t border-white/10 pt-2">
                <dt className="text-white/50">{s.rotulo}</dt>
                <dd>{s.valor}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </div>
  )
}
