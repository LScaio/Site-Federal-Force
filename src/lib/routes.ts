/**
 * Rotas do site. Há três páginas:
 *
 *   Início (/)
 *     /                  → abertura + Hero
 *     /quem-somos        → Quem Somos (+ botão "Conheça as nossas temporadas")
 *     /alem-da-arena     → Projetos (alias: /projetos)
 *     /frc               → O que é a FRC
 *     /evolucao          → Nossa Evolução
 *     /parceiros         → Parceiros (quando existirem)
 *     /final             → cena final + rodapé (alias: /contato)
 *
 *   Temporada Rebuilt (página própria)
 *     /rebuilt  (+ /historia /desafio /robo /estrategia /resultados /galeria /cad)
 *
 *   Temporada Reefscape (página própria)
 *     /reefscape (+ /historia /desafio /robo /estrategia /resultados /galeria)
 *
 * O endereço é normalizado: maiúsculas, acentos e espaços não importam
 * (ex.: /Reefscape/Galeria, /rebuilt/Robô). É um SPA: o servidor precisa
 * devolver index.html para qualquer caminho (public/_redirects, vercel.json
 * e o 404.html gerado no build).
 */

export type Page = 'home' | 'rebuilt' | 'reefscape'
export type Route = { path: string; id: string; page: Page; aliases?: string[] }

const season = (page: Exclude<Page, 'home'>, prefix: string, extra: Omit<Route, 'page'>[] = []): Route[] =>
  [
    { path: page, id: `${prefix}-inicio` },
    { path: `${page}/historia`, id: `${prefix}-historia` },
    { path: `${page}/desafio`, id: `${prefix}-desafio` },
    { path: `${page}/robo`, id: `${prefix}-robo` },
    { path: `${page}/estrategia`, id: `${prefix}-estrategia` },
    { path: `${page}/resultados`, id: `${prefix}-resultados` },
    { path: `${page}/galeria`, id: `${prefix}-galeria` },
    ...extra,
  ].map((r) => ({ ...r, page }))

const home = (routes: Omit<Route, 'page'>[]): Route[] => routes.map((r) => ({ ...r, page: 'home' as const }))

export const ROUTES: Route[] = [
  ...home([
    { path: '', id: 'hero', aliases: ['inicio', 'home'] },
    { path: 'quem-somos', id: 'quem-somos', aliases: ['sobre', 'temporadas'] },
    { path: 'alem-da-arena', id: 'alem-da-arena', aliases: ['projetos', 'projetos-sociais'] },
    { path: 'frc', id: 'frc', aliases: ['first-robotics-competition'] },
    { path: 'evolucao', id: 'evolucao', aliases: ['nossa-evolucao'] },
    { path: 'parceiros', id: 'parceiros' },
    { path: 'final', id: 'final', aliases: ['contato', 'rodape'] },
  ]),
  ...season('rebuilt', 'rb', [{ path: 'rebuilt/cad', id: 'rb-cad', aliases: ['rebuilt/cad-3d', 'rebuilt/cad3d'] }]),
  ...season('reefscape', 'rf'),
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

/** Ids de seções-contêiner que apontam para a rota da 1ª subseção. */
const ID_ALIASES: Record<string, string> = { rebuilt: 'rb-inicio', reefscape: 'rf-inicio', rodape: 'final' }

export function routeForPath(pathname: string) {
  return byPath.get(normalizePath(pathname)) ?? null
}

export function routeForId(id: string) {
  return byId.get(ID_ALIASES[id] ?? id) ?? null
}

export function hrefFor(id: string) {
  const r = routeForId(id)
  return r ? `${BASE}/${r.path}` : null
}

export function isRouteId(id: string) {
  return byId.has(id)
}
