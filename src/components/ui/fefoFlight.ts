/**
 * Física e máquina de estados do voo do Fefo — sem DOM, testável isoladamente
 * (ver scripts/test-fefo.mts).
 *
 *   perched ──(alvo mudou)──▶ takeoff ──▶ flying (bater de asas em loop)
 *      ▲                                        │ (perto do alvo)
 *      └──── landing: aproximação → toque no chão → retorno à pose
 *
 * Os quadros vêm do vídeo "Coruja_Decolagem" (atlas em public/fefo/, gerado por
 * scripts/fefo-atlas.py): flexão das pernas → asas abrindo → impulso;
 * batida descendente / asas voltando / voo estável; desaceleração → garras
 * estendidas; toque no chão → retorno à pose.
 */

export type Mode = 'hidden' | 'perched' | 'takeoff' | 'flying' | 'landing'
export type Dir = 'dir' | 'esq'
export type Target = { key: string; x: number; y: number }

const range = (from: number, n: number) => Array.from({ length: n }, (_, i) => from + i)
export const TAKEOFF = range(0, 12)
export const FLAP = range(12, 12)
/** aproximação (desaceleração + garras estendidas) seguida do toque no chão */
const APPROACH = range(24, 15)
const TOUCHDOWN = range(39, 12)
export const LANDING = [...APPROACH, ...TOUCHDOWN]
export const PERCHED = LANDING[LANDING.length - 1]
export const FRAME_COUNT = PERCHED + 1
const FRAME_MS = { takeoff: 45, flying: 58, landing: 42 }
const MAX_SPEED = 950
const SUBSTEP = 1 / 120

export class FefoFlight {
  mode: Mode = 'hidden'
  dir: Dir = 'dir'
  frame = PERCHED
  x: number
  y: number
  vx = 0
  vy = 0
  /** deslocamento vertical do arco de voo (px, negativo = para cima) */
  arc = 0
  tilt = 0
  private step = 0
  private clock = 0
  private startDist = 1
  private key = ''
  private touching = false

  /** raio de início do pouso (px) — depende do tamanho do sprite */
  private landingRadius: number

  constructor(x: number, y: number, landingRadius = 80) {
    this.x = x
    this.y = y
    this.landingRadius = landingRadius
  }

  /** Posiciona direto no alvo, sem voo (prefers-reduced-motion). */
  snap(t: Target) {
    this.mode = 'perched'
    this.touching = false
    this.key = t.key
    this.x = t.x
    this.y = t.y
    this.vx = this.vy = this.arc = this.tilt = 0
    this.frame = PERCHED
  }

  update(dt: number, t: Target) {
    if (this.mode === 'hidden') {
      // entrada: já chega voando (atravessa a Hero)
      this.mode = 'flying'
      this.dir = t.x >= this.x ? 'dir' : 'esq'
      this.retarget(t)
    }

    if (this.mode === 'perched') {
      if (t.key !== this.key) {
        this.retarget(t)
        if (this.startDist < 24) {
          this.x = t.x
          this.y = t.y
          return
        }
        this.dir = t.x >= this.x ? 'dir' : 'esq'
        this.mode = 'takeoff'
        this.touching = false
        this.step = 0
        this.clock = 0
        this.frame = TAKEOFF[0]
      } else {
        // pousado: acompanha o poleiro (que se move com a rolagem)
        this.x = t.x
        this.y = t.y
        this.vx = this.vy = this.arc = this.tilt = 0
        return
      }
    } else if (t.key !== this.key) {
      this.retarget(t)
      if (this.mode === 'landing') {
        this.mode = 'flying'
        this.step = 0
        this.touching = false
      }
    }

    // mola criticamente amortecida + teto de velocidade, em sub-passos
    const k = this.mode === 'landing' ? 42 : this.mode === 'takeoff' ? 5 : 9
    const c = 2 * Math.sqrt(k)
    for (let left = dt; left > 1e-6; left -= SUBSTEP) {
      const h = Math.min(left, SUBSTEP)
      this.vx += ((t.x - this.x) * k - this.vx * c) * h
      this.vy += ((t.y - this.y) * k - this.vy * c) * h
      const sp = Math.hypot(this.vx, this.vy)
      if (sp > MAX_SPEED) {
        this.vx *= MAX_SPEED / sp
        this.vy *= MAX_SPEED / sp
      }
      this.x += this.vx * h
      this.y += this.vy * h
      if (this.mode === 'takeoff') this.y -= 70 * h
    }

    let dist = Math.hypot(t.x - this.x, t.y - this.y)
    if (this.mode === 'landing' && !this.touching && dist < 6 && Math.hypot(this.vx, this.vy) < 120) this.touching = true
    if (this.touching) {
      // no chão: acompanha o poleiro enquanto recolhe as asas
      this.x = t.x
      this.y = t.y
      this.vx = this.vy = 0
      dist = 0
    }
    if (Math.abs(this.vx) > 60) this.dir = this.vx > 0 ? 'dir' : 'esq'

    // frames
    this.clock += dt * 1000
    const ms = FRAME_MS[this.mode === 'takeoff' ? 'takeoff' : this.mode === 'landing' ? 'landing' : 'flying']
    while (this.clock >= ms) {
      this.clock -= ms
      this.step++
      if (this.mode === 'takeoff' && this.step >= TAKEOFF.length) {
        this.mode = 'flying'
        this.step = 0
      } else if (this.mode === 'landing') {
        // Só toca o chão quando chega ao poleiro: até lá, garras estendidas.
        if (this.step >= APPROACH.length && !this.touching) this.step = APPROACH.length - 1
        if (this.step >= LANDING.length) this.step = LANDING.length - 1
      }
    }
    if (this.mode === 'flying' && dist < this.landingRadius) {
      this.mode = 'landing'
      this.step = 0
      this.clock = 0
    }
    this.frame =
      this.mode === 'takeoff'
        ? TAKEOFF[this.step]
        : this.mode === 'landing'
          ? LANDING[this.step]
          : FLAP[this.step % FLAP.length]

    if (this.mode === 'landing' && this.touching && this.step === LANDING.length - 1) {
      this.snap(t)
      return
    }

    // arco: sobe no meio do trajeto; leve inclinação na direção do voo
    const progress = 1 - Math.min(dist / this.startDist, 1)
    this.arc =
      this.mode === 'flying' || this.mode === 'takeoff' ? -Math.sin(Math.PI * progress) * Math.min(110, this.startDist * 0.22) : 0
    this.tilt = Math.max(-12, Math.min(12, this.vx / 90))
  }

  private retarget(t: Target) {
    this.key = t.key
    this.startDist = Math.max(Math.hypot(t.x - this.x, t.y - this.y), 1)
  }
}
