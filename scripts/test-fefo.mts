/**
 * Testa a física/máquina de estados do voo do Fefo simulando 60 fps.
 *   npm run test:fefo
 */
import assert from 'node:assert/strict'
import { FefoFlight, FLAP, LANDING, PERCHED, TAKEOFF, type Target } from '../src/components/ui/fefoFlight.ts'

type Timed = Target & { t: number }

function simulate(from: [number, number], targets: Timed[], seconds: number) {
  const s = new FefoFlight(from[0], from[1], 78)
  s.snap({ key: 'start', x: from[0], y: from[1] })
  const frames: number[] = []
  const modes: string[] = []
  let perchedAt = -1
  const dt = 1 / 60
  for (let i = 0; i * dt < seconds; i++) {
    const time = i * dt
    const tgt = [...targets].reverse().find((t) => time >= t.t)!
    s.update(dt, tgt)
    if (frames.at(-1) !== s.frame) frames.push(s.frame)
    if (modes.at(-1) !== s.mode) modes.push(s.mode)
    if (s.mode === 'perched' && perchedAt < 0 && modes.length > 1) perchedAt = time
  }
  return { s, frames, modes, perchedAt }
}

const cases: [string, [number, number], Timed[], [number, number]][] = [
  ['voo para a esquerda', [900, 400], [{ t: 0, key: 'a', x: 200, y: 250 }], [1.2, 2.8]],
  ['voo curto', [300, 500], [{ t: 0, key: 'b', x: 500, y: 450 }], [0.8, 2]],
  ['voo longo até o canto', [100, 200], [{ t: 0, key: 'rest', x: 1380, y: 880 }], [1.8, 3.5]],
]
for (const [name, from, targets, [min, max]] of cases) {
  const { s, frames, modes, perchedAt } = simulate(from, targets, 5)
  const target = targets.at(-1)!
  assert.deepEqual(modes, ['takeoff', 'flying', 'landing', 'perched'], `${name}: estados`)
  assert.equal(frames[0], TAKEOFF[0], `${name}: começa decolando`)
  assert.ok(frames.some((f) => FLAP.includes(f)), `${name}: bate asas`)
  assert.deepEqual(frames.slice(-LANDING.length), LANDING, `${name}: termina com o pouso completo`)
  assert.equal(s.frame, PERCHED)
  assert.ok(Math.hypot(s.x - target.x, s.y - target.y) < 0.01, `${name}: pousa no alvo`)
  assert.ok(perchedAt >= min && perchedAt <= max, `${name}: duração ${perchedAt.toFixed(2)}s fora de [${min}, ${max}]`)
  console.log(`✓ ${name}: pousou em ${perchedAt.toFixed(2)}s`)
}

// direção segue o sentido do voo
assert.equal(simulate([900, 400], [{ t: 0, key: 'a', x: 200, y: 250 }], 0.5).s.dir, 'esq')
assert.equal(simulate([200, 400], [{ t: 0, key: 'a', x: 900, y: 250 }], 0.5).s.dir, 'dir')
console.log('✓ direção direita/esquerda')

// pousado + rolagem (mesmo poleiro) não decola: só acompanha
const follow = simulate([400, 300], [{ t: 0, key: 'start', x: 400, y: 300 }, { t: 0.2, key: 'start', x: 400, y: 120 }], 1)
assert.deepEqual(follow.modes, ['perched'])
assert.equal(follow.s.y, 120)
console.log('✓ acompanha o título na rolagem sem decolar')

// troca de alvo no meio do voo
const retarget = simulate([900, 400], [{ t: 0, key: 'a', x: 200, y: 250 }, { t: 0.5, key: 'c', x: 1200, y: 300 }], 5)
assert.equal(retarget.s.x, 1200)
assert.equal(retarget.s.dir, 'dir')
console.log('✓ muda de rota no ar')
