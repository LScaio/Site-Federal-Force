#!/usr/bin/env node
/**
 * Baixa os arquivos do Drive "Dados_Site_Federal" listados em
 * src/content/drive.ts (pasta pública, sem credenciais).
 *
 *   npm run sync:drive            → imagens para public/drive/<id>.<ext>
 *   npm run sync:drive -- --cad   → também o CAD 3D da Hero (Assembly final.obj + .mtl, com cores) para cad-source/
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

async function download(entry, dest, attempts = 4) {
  if (await exists(dest)) return console.log(`= ${entry.name}`)
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url(entry.id), { redirect: 'follow' })
      if (!res.ok || (res.headers.get('content-type') ?? '').includes('text/html')) {
        throw new Error(`HTTP ${res.status} ${res.headers.get('content-type')}`)
      }
      await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
      return console.log(`↓ ${entry.name}`)
    } catch (err) {
      if (i >= attempts) throw new Error(`${entry.name}: ${err.message}`)
      await new Promise((r) => setTimeout(r, 1500 * 2 ** (i - 1)))
    }
  }
}

const failures = []
const safeDownload = (entry, dest) => download(entry, dest).catch((err) => failures.push(err.message))

const images = entries.filter((e) => e.mime.startsWith('image/'))
await mkdir(path.join(root, 'public/drive'), { recursive: true })
for (const e of images) await safeDownload(e, path.join(root, 'public/drive', `${e.id}.${ext(e.name)}`))

if (withCad) {
  // OBJ + MTL coloridos (padrão); --stl baixa também o STL sem cores (CAAD3D)
  const mimes = process.argv.includes('--stl') ? ['model/robot', 'model/robot-stl'] : ['model/robot']
  const cad = entries.filter((e) => mimes.includes(e.mime))
  if (!cad.length) throw new Error('Entradas do CAD (mime model/robot) não encontradas em src/content/drive.ts')
  await mkdir(path.join(root, 'cad-source'), { recursive: true })
  for (const e of cad) await safeDownload(e, path.join(root, 'cad-source', e.name))
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} arquivo(s) falharam:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log(`\n✓ ${images.length} imagens${withCad ? ' + CAD' : ''} sincronizadas do Drive.`)
