import { Environment, Lightformer } from '@react-three/drei'

/**
 * Iluminação cinematográfica 100% procedural (sem HDRI externo):
 * softboxes longos em estilo estúdio automotivo + recorte azul.
 */
export function StudioLighting({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.15 * intensity} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={2.2 * intensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <spotLight position={[-6, 3, -4]} angle={0.5} penumbra={1} intensity={60 * intensity} color="#2f7bff" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#020305']} />
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1.5, 1]} rotation-y={Math.PI / 2} scale={[8, 0.6, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[5, 1.5, 1]} rotation-y={-Math.PI / 2} scale={[8, 0.6, 1]} />
        <Lightformer form="ring" color="#2f7bff" intensity={4} position={[0, 1, 6]} scale={3} />
      </Environment>
    </>
  )
}
