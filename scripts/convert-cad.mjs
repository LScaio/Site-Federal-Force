#!/usr/bin/env node
/**
 * Converte o CAD do Drive (Hero(Telainicial)/CAD_objetos.obj + CAD_materiais.mtl)
 * no GLB otimizado usado pela abertura, pela Hero e pelo Visualizador CAD:
 *   public/models/federal-robot.glb
 *
 * Pré-requisito: `npm run sync:drive -- --cad` (ou copiar os arquivos para cad-source/).
 *
 *   npm run cad:convert                 → máximo desempenho (malhas unidas, simplificadas, meshopt)
 *   npm run cad:convert -- --keep-parts → preserva a hierarquia/nomes do CAD (para fichas de subsistemas)
 *   npm run cad:convert -- --ratio 0.2  → proporção de simplificação (padrão 0.25)
 *
 * O OBJ tem ~900 MB: a conversão usa bastante memória (NODE_OPTIONS já é ajustado).
 */
import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, open, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'cad-source')
const obj = path.join(src, 'CAD_objetos.obj')
const mtl = path.join(src, 'CAD_materiais.mtl')
const raw = path.join(src, 'robot-raw.glb')
const out = path.join(root, 'public/models/federal-robot.glb')
const args = process.argv.slice(2)
const keepParts = args.includes('--keep-parts')
const ratio = args.includes('--ratio') ? args[args.indexOf('--ratio') + 1] : '0.25'

const env = { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=16384`.trim() }
const run = (cmd, a) => {
  console.log(`\n$ ${cmd} ${a.join(' ')}`)
  execFileSync('npx', ['--yes', cmd, ...a], { stdio: 'inherit', env, cwd: root })
}

await stat(obj).catch(() => {
  console.error('cad-source/CAD_objetos.obj não encontrado. Rode: npm run sync:drive -- --cad')
  process.exit(1)
})

// O OBJ referencia o .mtl pelo nome original (linha "mtllib"): garante que ele exista com esse nome.
const fh = await open(obj)
const { buffer } = await fh.read(Buffer.alloc(64 * 1024), 0, 64 * 1024, 0)
await fh.close()
const mtllib = buffer.toString('utf8').match(/^mtllib\s+(.+)$/m)?.[1]?.trim()
if (mtllib && mtllib !== path.basename(mtl)) await copyFile(mtl, path.join(src, mtllib)).catch(() => {})

// 1) OBJ → GLB bruto (materiais do .mtl viram PBR)
run('obj2gltf', ['-i', obj, '-o', raw, '--binary'])

// 2) Otimização: limpeza, solda de vértices, simplificação, quantização, meshopt, texturas WebP
await mkdir(path.dirname(out), { recursive: true })
run('@gltf-transform/cli', [
  'optimize',
  raw,
  out,
  '--compress', 'meshopt',
  '--simplify', 'true',
  '--simplify-ratio', ratio,
  '--simplify-error', '0.0008',
  '--texture-compress', 'webp',
  '--texture-size', '2048',
  ...(keepParts ? ['--join', 'false', '--flatten', 'false', '--instance', 'false'] : []),
])

const { size } = await stat(out)
console.log(`\n✓ ${path.relative(root, out)} — ${(size / 1024 / 1024).toFixed(1)} MB`)
console.log('  Meta: < 8 MB para uma abertura fluida. Ajuste --ratio se necessário.')
