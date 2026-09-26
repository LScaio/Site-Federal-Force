#!/usr/bin/env node
/**
 * Baixa os arquivos do Drive "Dados_Site_Federal" listados em
 * src/content/drive.ts (pasta pública, sem credenciais).
 *
 *   npm run sync:drive            → imagens para public/drive/<id>.<ext>
 *   npm run sync:drive -- --cad   → também o CAD 3D da Hero (arquivo "CAAD3D") para cad-source/
 *
 * Depois use VITE_DRIVE_SOURCE=local para servir as imagens localmente.
 */
import { mkdir, readFile, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = await readFile(path.join(root, 'src/content/drive.ts'), 'utf8')
const withCad = process.argv.includes('--cad')

// f('<id>', '<nome>', '<mime>?')
const entries = [...manifest.matchAll(/f\(\s*'([\w-]+)',\s*'([^']+)'(?:,\s*'([^']+)')?\s*\)/g)].map(([, id, name, mime]) => ({
  id,
  name,
  mime: mime ?? 'image/jpeg',
}))

const ext = (name) => (name.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'bin').toLowerCase()
const url = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`

async function exists(p) {
  try {
    return (await stat(p)).size > 0
  } catch {
    return false
  }
}

async function download(entry, dest) {
  if (await exists(dest)) return console.log(`= ${entry.name}`)
  const res = await fetch(url(entry.id), { redirect: 'follow' })
  if (!res.ok || (res.headers.get('content-type') ?? '').includes('text/html')) {
    throw new Error(`${entry.name}: HTTP ${res.status} ${res.headers.get('content-type')}`)
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  console.log(`↓ ${entry.name}`)
}

const images = entries.filter((e) => e.mime.startsWith('image/'))
await mkdir(path.join(root, 'public/drive'), { recursive: true })
for (const e of images) await download(e, path.join(root, 'public/drive', `${e.id}.${ext(e.name)}`))

if (withCad) {
  const cad = entries.find((e) => e.mime === 'model/robot')
  if (!cad) throw new Error('Entrada do CAD (mime model/robot) não encontrada em src/content/drive.ts')
  await mkdir(path.join(root, 'cad-source'), { recursive: true })
  // O arquivo não tem extensão no Drive; o formato é detectado em `npm run cad:convert`.
  await download(cad, path.join(root, 'cad-source', 'CAAD3D'))
}

console.log(`\n✓ ${images.length} imagens${withCad ? ' + CAD' : ''} sincronizadas do Drive.`)
