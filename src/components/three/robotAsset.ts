/**
 * Modelo único do robô — o MESMO arquivo é usado na abertura, na Hero e no
 * Visualizador CAD. Gerado a partir de "Hero(Telainicial)/CAD_objetos.obj"
 * (+ CAD_materiais.mtl) do Drive por `npm run cad:convert`.
 */
export const ROBOT_GLB_URL = '/models/federal-robot.glb'

let availability: Promise<boolean> | null = null

/** Verifica (uma única vez) se o GLB otimizado já foi publicado em /public/models. */
export function checkRobotAsset() {
  availability ??= fetch(ROBOT_GLB_URL, { method: 'HEAD' })
    .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
    .catch(() => false)
  return availability
}
