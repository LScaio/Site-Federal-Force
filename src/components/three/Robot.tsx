import { forwardRef, useEffect, useMemo, useState } from 'react'
import { useGLTF, Edges } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { ROBOT_GLB_URL, checkRobotAsset } from './robotAsset'

type GroupProps = ThreeElements['group']

/** Tamanho (maior dimensão) em unidades de cena para o robô normalizado. */
const TARGET_SIZE = 2.15

export function useRobotAvailable() {
  const [state, setState] = useState<'checking' | 'glb' | 'missing'>('checking')
  useEffect(() => {
    let alive = true
    checkRobotAsset().then((ok) => alive && setState(ok ? 'glb' : 'missing'))
    return () => {
      alive = false
    }
  }, [])
  return state
}

/**
 * Robô a partir do GLB do Drive. Normaliza escala e centraliza no chão (y=0),
 * independente das unidades exportadas do CAD. `cloneMaterials` permite que o
 * visualizador destaque partes sem afetar a instância da Hero.
 */
const GlbRobot = forwardRef<THREE.Group, GroupProps & { cloneMaterials?: boolean }>(function GlbRobot(
  { cloneMaterials, ...props },
  ref,
) {
  // meshopt habilitado (terceiro argumento) — o decoder é embutido, sem CDN.
  const { scene } = useGLTF(ROBOT_GLB_URL, false, true)
  const model = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
        if (cloneMaterials) {
          m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone()
        }
      }
    })
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = TARGET_SIZE / Math.max(size.x, size.y, size.z)
    const wrapper = new THREE.Group()
    root.position.set(-center.x, -box.min.y, -center.z)
    wrapper.add(root)
    wrapper.scale.setScalar(s)
    return wrapper
  }, [scene, cloneMaterials])

  return (
    <group ref={ref} {...props}>
      <primitive object={model} />
    </group>
  )
})

/**
 * Silhueta técnica exibida SOMENTE enquanto `public/models/federal-robot.glb`
 * não foi gerado a partir do CAD do Drive. Não representa o robô real.
 */
const BlueprintPlaceholder = forwardRef<THREE.Group, GroupProps>(function BlueprintPlaceholder(props, ref) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0c1220', metalness: 0.6, roughness: 0.45 }),
    [],
  )
  const edge = '#4f93ff'
  const wheel = (x: number, z: number) => (
    <mesh key={`${x}${z}`} position={[x, 0.16, z]} rotation={[0, 0, Math.PI / 2]} material={mat} castShadow>
      <cylinderGeometry args={[0.16, 0.16, 0.12, 20]} />
      <Edges color={edge} threshold={20} />
    </mesh>
  )
  return (
    <group ref={ref} {...props}>
      <mesh position={[0, 0.22, 0]} material={mat} castShadow>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <Edges color={edge} />
      </mesh>
      {[-0.62, 0.62].flatMap((x) => [-0.62, 0.62].map((z) => wheel(x, z)))}
      <mesh position={[0, 0.8, -0.35]} material={mat} castShadow>
        <boxGeometry args={[1.1, 0.95, 0.12]} />
        <Edges color={edge} />
      </mesh>
      <mesh position={[0, 0.72, 0.25]} rotation={[-0.5, 0, 0]} material={mat} castShadow>
        <boxGeometry args={[0.9, 0.12, 0.8]} />
        <Edges color={edge} />
      </mesh>
    </group>
  )
})

export const Robot = forwardRef<THREE.Group, GroupProps & { cloneMaterials?: boolean }>(function Robot(props, ref) {
  const state = useRobotAvailable()
  if (state === 'checking') return null
  if (state === 'glb') return <GlbRobot ref={ref} {...props} />
  const { cloneMaterials: _ignored, ...rest } = props
  void _ignored
  return <BlueprintPlaceholder ref={ref} {...rest} />
})

if (typeof window !== 'undefined') {
  checkRobotAsset().then((ok) => ok && useGLTF.preload(ROBOT_GLB_URL, false, true))
}
