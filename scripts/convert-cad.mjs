#!/usr/bin/env node
/**
 * Converte o CAD 3D do Drive (Hero(Telainicial)/CAAD3D — arquivo sem extensão)
 * no GLB otimizado usado pela abertura, pela Hero e pelo Visualizador CAD:
 *   public/models/federal-robot.glb
 *
 * Pré-requisito: `npm run sync:drive -- --cad` (ou copiar o arquivo para cad-source/CAAD3D).
 *
 * O formato é detectado pelo conteúdo: GLB, glTF, OBJ, STL (binário/ASCII) ou ZIP
 * contendo um desses. FBX/STEP não são suportados (exporte como GLB).
 *
 *   npm run cad:convert                    → máximo desempenho (malhas unidas, simplificadas, meshopt)
 *   npm run cad:convert -- --keep-parts    → preserva hierarquia/nomes (fichas de subsistemas)
 *   npm run cad:convert -- --ratio 0.15    → proporção de simplificação (padrão: automático, ~300 mil triângulos)
 *   npm run cad:convert -- --z-up          → gira modelos exportados com Z para cima
 *   npm run cad:convert -- --in caminho    → usa outro arquivo de entrada
 */
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions'
import { dedup, flatten, join, normals, prune, quantize, reorder, simplify, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import draco3d from 'draco3dgltf'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def)
const input = path.resolve(root, opt('--in', 'cad-source/CAAD3D'))
const out = path.join(root, 'public/models/federal-robot.glb')
const keepParts = args.includes('--keep-parts')
const zUp = args.includes('--z-up')
const ratioArg = opt('--ratio', null)
/** Meta de triângulos quando --ratio não é informado (bom equilíbrio entre detalhe e peso na web). */
const TARGET_TRIANGLES = Number(opt('--target', '300000'))

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`

/* ---------------- detecção de formato ---------------- */

function detect(buf, size) {
  const head = buf.subarray(0, 512).toString('latin1')
  if (head.startsWith('glTF')) return 'glb'
  if (head.startsWith('PK\u0003\u0004')) return 'zip'
  if (head.startsWith('Kaydara FBX')) return 'fbx'
  if (head.startsWith('ISO-10303')) return 'step'
  if (/^\s*\{[\s\S]*"asset"/.test(head)) return 'gltf'
  if (buf.length >= 84 && 84 + buf.readUInt32LE(80) * 50 === size) return 'stl-bin'
  if (/^\s*solid\b/.test(head) && /facet\s+normal/.test(buf.subarray(0, 4096).toString('latin1'))) return 'stl-ascii'
  if (/^(#.*|mtllib .*|o .*|g .*|v\s+-?\d.*|\s*)$/m.test(head) && /^v\s+-?[\d.]/m.test(buf.subarray(0, 65536).toString('latin1'))) return 'obj'
  return 'unknown'
}

/* ---------------- STL → Document ---------------- */

function stlToDocument(buf, binary) {
  let positions
  if (binary) {
    const n = buf.readUInt32LE(80)
    positions = new Float32Array(n * 9)
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    for (let i = 0, o = 96; i < n; i++, o += 50) {
      const j = i * 9
      for (let k = 0; k < 9; k++) positions[j + k] = view.getFloat32(o + k * 4, true)
    }
  } else {
    const nums = [...buf.toString('latin1').matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)].flatMap((m) => [+m[1], +m[2], +m[3]])
    positions = new Float32Array(nums)
  }
  const doc = new Document()
  const buffer = doc.createBuffer()
  const material = doc.createMaterial('Robo').setBaseColorFactor([0.62, 0.64, 0.68, 1]).setMetallicFactor(0.55).setRoughnessFactor(0.42)
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer))
    .setMaterial(material)
  const mesh = doc.createMesh('Robo').addPrimitive(prim)
  const node = doc.createNode('Robo').setMesh(mesh)
  doc.createScene('Scene').addChild(node)
  return doc
}

/* ---------------- carregamento ---------------- */

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready])
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
  // GLBs exportados com Draco também são aceitos na entrada
  'draco3d.decoder': await draco3d.createDecoderModule(),
})

async function load(file) {
  const { size } = await stat(file)
  const buf = await readFile(file)
  const kind = detect(buf, size)
  console.log(`• ${path.relative(root, file)} — ${mb(size)} — formato: ${kind}`)
  switch (kind) {
    case 'glb':
      return io.readBinary(new Uint8Array(buf))
    case 'gltf':
      return io.read(file)
    case 'obj': {
      const { default: obj2gltf } = await import('obj2gltf')
      const glb = await obj2gltf(file, { binary: true })
      return io.readBinary(new Uint8Array(glb))
    }
    case 'stl-bin':
    case 'stl-ascii':
      return stlToDocument(buf, kind === 'stl-bin')
    case 'zip': {
      const dir = path.join(path.dirname(file), 'unzipped')
      await rm(dir, { recursive: true, force: true })
      execFileSync('unzip', ['-q', '-o', file, '-d', dir], { stdio: 'inherit' })
      const found = await findModel(dir)
      if (!found) throw new Error('Nenhum .glb/.gltf/.obj/.stl encontrado dentro do ZIP.')
      return load(found)
    }
    case 'fbx':
    case 'step':
      throw new Error(`Formato ${kind.toUpperCase()} não suportado. Exporte o CAD como GLB (ou OBJ/STL) e substitua o arquivo no Drive.`)
    default:
      throw new Error('Formato do CAD não reconhecido. Esperado: GLB, glTF, OBJ, STL ou ZIP.')
  }
}

async function findModel(dir) {
  const rank = ['.glb', '.gltf', '.obj', '.stl']
  const files = []
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) await walk(p)
      else if (rank.includes(path.extname(e.name).toLowerCase())) files.push(p)
    }
  }
  await walk(dir)
  files.sort((a, b) => rank.indexOf(path.extname(a).toLowerCase()) - rank.indexOf(path.extname(b).toLowerCase()))
  return files[0]
}

/* ---------------- otimização ---------------- */

await stat(input).catch(() => {
  console.error(`${path.relative(root, input)} não encontrado. Rode: npm run sync:drive -- --cad`)
  process.exit(1)
})

const doc = await load(input)

if (zUp) {
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0]
  const pivot = doc.createNode('ZUp').setRotation([-Math.SQRT1_2, 0, 0, Math.SQRT1_2])
  for (const child of scene.listChildren()) {
    scene.removeChild(child)
    pivot.addChild(child)
  }
  scene.addChild(pivot)
}

const countTriangles = () =>
  doc
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0)
const inputTris = countTriangles()
const ratio = ratioArg ? Number(ratioArg) : Math.min(1, TARGET_TRIANGLES / Math.max(inputTris, 1))
console.log(`• ${Math.round(inputTris).toLocaleString('pt-BR')} triângulos na entrada → simplificação ${(ratio * 100).toFixed(1)}%`)
console.time('• otimização')

await doc.transform(
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio, error: Number(opt('--error', '0.004')) }),
  // gera normais suaves apenas onde faltam (ex.: STL) — depois da simplificação,
  // para que as normais não travem a redução de vértices
  normals({ overwrite: false }),
  ...(keepParts ? [] : [flatten(), join()]),
  prune(),
  quantize(),
  reorder({ encoder: MeshoptEncoder }),
)
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })

console.timeEnd('• otimização')
await mkdir(path.dirname(out), { recursive: true })
await writeFile(out, await io.writeBinary(doc))
const { size } = await stat(out)
const tris = countTriangles()
console.log(`\n✓ ${path.relative(root, out)} — ${mb(size)} — ${Math.round(tris).toLocaleString('pt-BR')} triângulos`)
if (size > 8 * 1024 * 1024) console.log('  Acima da meta de 8 MB: tente --target 150000.')
