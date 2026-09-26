import type { Object3D } from 'three'

/**
 * Registro de subsistemas do robô para o Visualizador CAD.
 *
 * Estrutura pronta para, futuramente, permitir clicar em partes do modelo e
 * abrir fichas técnicas. Cada subsistema é identificado pelos nomes dos nós
 * do GLB (herdados dos grupos do CAD). Enquanto nenhuma ficha técnica estiver
 * no Drive, a lista permanece vazia e o clique não abre nada.
 *
 * Exemplo de entrada (preencher somente com dados do Drive):
 *   {
 *     id: 'shooter',
 *     nome: 'Shooter',
 *     nodes: [/shooter/i],
 *     ficha: { resumo: '...', specs: [{ rotulo: 'Motores', valor: '...' }] },
 *   }
 */
export type FichaTecnica = {
  resumo: string
  specs: { rotulo: string; valor: string }[]
}

export type Subsystem = {
  id: string
  nome: string
  /** Padrões testados contra `object.name` subindo pela hierarquia. */
  nodes: RegExp[]
  ficha?: FichaTecnica
}

export const SUBSYSTEMS: Subsystem[] = []

/** Sobe na hierarquia do objeto clicado até achar um subsistema registrado. */
export function resolveSubsystem(obj: Object3D | null): { subsystem: Subsystem; root: Object3D } | null {
  let cur: Object3D | null = obj
  while (cur) {
    const name = cur.name
    const hit = name ? SUBSYSTEMS.find((s) => s.nodes.some((re) => re.test(name))) : undefined
    if (hit) return { subsystem: hit, root: cur }
    cur = cur.parent
  }
  return null
}
