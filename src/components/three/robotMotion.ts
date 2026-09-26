/**
 * Estado mutável da cena da Hero, animado pela timeline GSAP da abertura.
 * Mantido fora do React para não re-renderizar a cada frame.
 */
export type RobotMotion = {
  x: number // posição horizontal em unidades de cena
  y: number
  yaw: number // rotação base em Y
  float: number // 0..1 intensidade da flutuação
  parallax: number // 0..1 intensidade do parallax por ponteiro/scroll
  scroll: number // 0..1 progresso de scroll da Hero
  trail: number // 0..1 visibilidade do nitro
}

export const createRobotMotion = (): RobotMotion => ({
  x: -16,
  y: 0.3,
  yaw: -1.15,
  float: 0,
  parallax: 0,
  scroll: 0,
  trail: 1,
})
