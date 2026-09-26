/**
 * Rotas do site: cada seção/subseção tem um endereço próprio.
 *
 *   /                       → abertura + Hero
 *   /quem-somos             → Quem Somos
 *   /frc                    → O que é a FRC
 *   /rebuilt                → Temporada Rebuilt  (+ /historia /desafio /robo
 *                              /estrategia /resultados /galeria /cad)
 *   /reefscape              → Temporada Reefscape (+ /historia /desafio /robo
 *                              /estrategia /resultados /galeria)
 *   /evolucao               → Nossa Evolução
 *   /alem-da-arena          → Projetos (alias: /projetos)
 *   /parceiros              → Parceiros (quando existirem)
 *   /final                  → cena final + rodapé (alias: /contato)
 *
 * O endereço é normalizado: maiúsculas, acentos e espaços não importam
 * (ex.: /Reefscape/Galeria, /rebuilt/Robô, /rebuilt/estratégia).
 * É um SPA: o servidor precisa devolver index.html para qualquer caminho
 * (ver public/_redirects, vercel.json e o 404.html gerado no build).
 */

type Route = { path: string; id: string; aliases?: string[] }

const season = (slug: string, prefix: string, extra: Route[] = []): Route[] => [
  { path: slug, id: `${prefix}-inicio` },
  { path: `${slug}/historia`, id: `${prefix}-historia` },
  { path: `${slug}/desafio`, id: `${prefix}-desafio` },
  { path: `${slug}/robo`, id: `${prefix}-robo` },
  { path: `${slug}/estrategia`, id: `${prefix}-estrategia` },
  { path: `${slug}/resultados`, id: `${prefix}-resultados` },
  { path: `${slug}/galeria`, id: `${prefix}-galeria` },
  ...extra,
]

export const ROUTES: Route[] = [
  { path: '', id: 'hero', aliases: ['inicio', 'home'] },
  { path: 'quem-somos', id: 'quem-somos', aliases: ['sobre'] },
  { path: 'frc', id: 'frc', aliases: ['first-robotics-competition'] },
  ...season('rebuilt', 'rb', [{ path: 'rebuilt/cad', id: 'rb-cad', aliases: ['rebuilt/cad-3d', 'rebuilt/cad3d'] }]),
  ...season('reefscape', 'rf'),
  { path: 'evolucao', id: 'evolucao', aliases: ['nossa-evolucao'] },
  { path: 'alem-da-arena', id: 'alem-da-arena', aliases: ['projetos', 'projetos-sociais'] },
  { path: 'parceiros', id: 'parceiros' },
  { path: 'final', id: 'final', aliases: ['contato', 'rodape'] },
]

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')

/** "/Reefscape/Galeria/" → "reefscape/galeria" (sem acentos, minúsculas). */
export function normalizePath(pathname: string) {
  let p = decodeURIComponent(pathname)
  if (BASE && p.toLowerCase().startsWith(BASE.toLowerCase())) p = p.slice(BASE.length)
  return p
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '')
}

const byPath = new Map<string, Route>()
for (const r of ROUTES) {
  byPath.set(r.path, r)
  r.aliases?.forEach((a) => byPath.set(a, r))
}
const byId = new Map(ROUTES.map((r) => [r.id, r]))

export function routeForPath(pathname: string) {
  return byPath.get(normalizePath(pathname)) ?? null
}

/** Ids de seções-contêiner que apontam para a rota da 1ª subseção. */
const ID_ALIASES: Record<string, string> = { rebuilt: 'rb-inicio', reefscape: 'rf-inicio', rodape: 'final' }

export function hrefFor(id: string) {
  const r = byId.get(ID_ALIASES[id] ?? id)
  return r ? `${BASE}/${r.path}` : null
}

export function isRouteId(id: string) {
  return byId.has(id)
}

/** Rota da página no carregamento (null = caminho desconhecido). */
export const initialRoute = typeof window !== 'undefined' ? routeForPath(window.location.pathname) : null

/** Chegou por um link direto para uma seção (pula a abertura). */
export const isDeepLink = !!initialRoute && initialRoute.id !== 'hero'
