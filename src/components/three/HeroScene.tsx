import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Trail, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { Robot, useRobotAvailable } from './Robot'
import type { RobotMotion } from './robotMotion'
import { StudioLighting } from './Lighting'

const BLUE = new THREE.Color('#2f7bff')
const MAX_BLUR = 14

function Streaks({ speedRef }: { speedRef: React.RefObject<number> }) {
  const COUNT = 42
  const mesh = useRef<THREE.InstancedMesh>(null)
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: THREE.MathUtils.randFloat(-10, 10),
        y: THREE.MathUtils.randFloat(0.05, 2.6),
        z: THREE.MathUtils.randFloat(-4, 1.5),
        len: THREE.MathUtils.randFloat(0.8, 3.2),
        k: THREE.MathUtils.randFloat(0.6, 1.4),
      })),
    [],
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: BLUE,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  useFrame((_, dt) => {
    const speed = speedRef.current ?? 0
    const intensity = THREE.MathUtils.clamp((speed - 4) / 30, 0, 1)
    material.opacity = intensity * 0.55
    if (!mesh.current) return
    mesh.current.visible = intensity > 0.001
    if (!mesh.current.visible) return
    data.forEach((d, i) => {
      d.x -= speed * d.k * dt * 0.9
      if (d.x < -12) d.x = 12
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.set(d.len * (0.4 + intensity), 0.006, 0.006)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} material={material} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

function NitroGlow({ speedRef }: { speedRef: React.RefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, 'rgba(160,205,255,1)')
    grd.addColorStop(0.25, 'rgba(47,123,255,0.65)')
    grd.addColorStop(1, 'rgba(47,123,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  useFrame(() => {
    if (!ref.current) return
    const s = THREE.MathUtils.clamp((speedRef.current ?? 0) / 25, 0, 1)
    ref.current.scale.set(0.6 + s * 4.5, 0.5 + s * 0.4, 1)
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity = s * 0.9
  })
  return (
    <mesh ref={ref} position={[-1.5, 0.5, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0} />
    </mesh>
  )
}

function Rig({ motion, blurNode }: { motion: RobotMotion; blurNode: React.RefObject<SVGFEGaussianBlurElement | null> }) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const speedRef = useRef(0)
  const prevX = useRef(motion.x)
  const [trailOn, setTrailOn] = useState(true)
  const smoothPointer = useRef(new THREE.Vector2())

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 20)
    const rawSpeed = Math.abs(motion.x - prevX.current) / Math.max(d, 1e-4)
    prevX.current = motion.x
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, rawSpeed, 0.35)
    const speed = speedRef.current

    smoothPointer.current.lerp(state.pointer, 0.04)
    const px = smoothPointer.current.x * motion.parallax
    const py = smoothPointer.current.y * motion.parallax
    const t = state.clock.elapsedTime
    const bob = Math.sin(t * 1.3) * 0.07 * motion.float
    const sway = Math.sin(t * 0.7) * 0.03 * motion.float

    if (outer.current) {
      outer.current.position.set(
        motion.x + px * 0.18,
        motion.y + bob + 0.12 * motion.float + motion.scroll * 0.9,
        py * 0.1,
      )
      const stretch = THREE.MathUtils.clamp(speed / 40, 0, 0.22)
      outer.current.scale.set(1 + stretch, 1 - stretch * 0.25, 1)
    }
    if (inner.current) {
      inner.current.rotation.set(
        -py * 0.06 + sway,
        motion.yaw + px * 0.22 + motion.scroll * 0.6,
        Math.sin(t * 0.9) * 0.015 * motion.float,
      )
    }

    // Motion blur direcional: filtro SVG horizontal aplicado ao canvas só em alta velocidade.
    if (blurNode.current) {
      const b = speed > 6 ? Math.min((speed - 6) * 0.35, MAX_BLUR) : 0
      blurNode.current.setAttribute('stdDeviation', `${b.toFixed(2)} 0`)
    }

    // Câmera: recua em telas estreitas (retrato) para o robô caber acima do texto
    const aspect = state.size.width / Math.max(state.size.height, 1)
    const camZ = aspect < 0.8 ? 10.5 : aspect < 1.2 ? 8 : 6.4
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, camZ, 0.1)
    // Câmera: parallax muito sutil
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, px * 0.35, 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.35 + py * 0.2, 0.05)
    state.camera.lookAt(0, 0.9 + motion.scroll * 0.4, 0)

    if (trailOn && motion.trail <= 0.01) setTrailOn(false)
    if (!trailOn && motion.trail > 0.01) setTrailOn(true)
  })

  return (
    <>
      <Streaks speedRef={speedRef} />
      <group ref={outer}>
        <NitroGlow speedRef={speedRef} />
        {trailOn && (
          <>
            <Trail width={1.4} length={7} color={BLUE} attenuation={(w) => w * w} decay={1.6}>
              <mesh position={[-1.05, 0.28, 0.3]}>
                <sphereGeometry args={[0.001]} />
              </mesh>
            </Trail>
            <Trail width={0.9} length={5.5} color={'#9fd0ff'} attenuation={(w) => w * w * w} decay={1.8}>
              <mesh position={[-1.05, 0.55, -0.3]}>
                <sphereGeometry args={[0.001]} />
              </mesh>
            </Trail>
          </>
        )}
        <group ref={inner}>
          <Robot />
        </group>
      </group>
    </>
  )
}

/** Reporta ao DOM quando o robô (GLB ou placeholder) está pronto para entrar em cena. */
function LoadReporter({ onProgress }: { onProgress?: (p: number, done: boolean) => void }) {
  const availability = useRobotAvailable()
  const { progress, active, loaded } = useProgress()
  const last = useRef('')
  useFrame(() => {
    const done = availability === 'missing' || (availability === 'glb' && !active && loaded > 0)
    const p = done ? 100 : availability === 'glb' ? progress : 0
    const key = `${p}|${done}`
    if (key !== last.current) {
      last.current = key
      onProgress?.(p, done)
    }
  })
  return null
}

export default function HeroScene({
  motion,
  active,
  blurNode,
  onProgress,
}: {
  motion: RobotMotion
  active: boolean
  blurNode: React.RefObject<SVGFEGaussianBlurElement | null>
  onProgress?: (p: number, done: boolean) => void
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.35, 6.4], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ filter: 'url(#ff-motion-blur)' }}
    >
      <StudioLighting />
      <Suspense fallback={null}>
        <Rig motion={motion} blurNode={blurNode} />
      </Suspense>
      <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={12} blur={2.8} far={3} resolution={512} color="#000" />
      <LoadReporter onProgress={onProgress} />
    </Canvas>
  )
}
