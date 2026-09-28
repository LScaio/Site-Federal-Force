import { useSyncExternalStore } from 'react'

/**
 * "Diretor" das cenas: guarda qual seção está em foco e a fase da abertura.
 * Consumido pelo HUD, pelo Fefo e pela Hero.
 */
export type IntroPhase = 'intro' | 'reveal' | 'done'

type State = { scene: string; intro: IntroPhase }
let state: State = { scene: 'hero', intro: 'intro' }
const listeners = new Set<() => void>()

export function setScene(scene: string) {
  if (state.scene === scene) return
  state = { ...state, scene }
  listeners.forEach((l) => l())
}
export function setIntroPhase(intro: IntroPhase) {
  if (state.intro === intro) return
  state = { ...state, intro }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useScene() {
  return useSyncExternalStore(subscribe, () => state.scene, () => state.scene)
}
export const getIntroPhase = () => state.intro

export function useIntroPhase() {
  return useSyncExternalStore(subscribe, () => state.intro, () => state.intro)
}
