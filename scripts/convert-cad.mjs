#!/usr/bin/env node
/**
 * Converte o CAD 3D do Drive (Hero(Telainicial)/Assembly final.obj + .mtl, com cores;
 * ou o STL sem cores CAAD3D)
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
import { createReadStream } from 'node:fs'
import { mkdir, open, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import readline from 'node:readline'
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
// Preferência: OBJ colorido do Onshape (Assembly final.obj + .mtl); senão o STL (CAAD3D).
const DEFAULT_INPUTS = ['cad-source/Assembly final.obj', 'cad-source/CAAD3D']
const exists = (p) => stat(path.resolve(root, p)).then(() => true, () => false)
const input = path.resolve(
  root,
  opt('--in', null) ?? (await (async () => {
    for (const p of DEFAULT_INPUTS) if (await exists(p)) return p
    return DEFAULT_INPUTS[0]
  })()),
)
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

/* ---------------- OBJ (+ MTL) → Document, em streaming ---------------- */

/** Array tipado que cresce sob demanda (evita arrays JS gigantes em OBJs de ~1 GB). */
class Grow {
  constructor(Type, cap = 1 << 16) {
    this.Type = Type
    this.a = new Type(cap)
    this.n = 0
  }
  push(v) {
    if (this.n === this.a.length) {
      const b = new this.Type(this.a.length * 2)
      b.set(this.a)
      this.a = b
    }
    this.a[this.n++] = v
  }
  view() {
    return this.a.subarray(0, this.n)
  }
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

async function parseMtl(file) {
  const mats = new Map()
  let cur = null
  const text = await readFile(file, 'utf8').catch(() => '')
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('newmtl ')) {
      cur = { name: line.slice(7).trim(), kd: [0.7, 0.7, 0.7], d: 1 }
      mats.set(cur.name, cur)
    } else if (cur && line.startsWith('Kd ')) {
      cur.kd = line.slice(3).trim().split(/\s+/).slice(0, 3).map(Number)
    } else if (cur && (line.startsWith('d ') || line.startsWith('Tr '))) {
      const v = Number(line.split(/\s+/)[1])
      cur.d = line.startsWith('Tr ') ? 1 - v : v
    }
  }
  return mats
}

/**
 * Lê o OBJ linha a linha e agrupa os triângulos por material (ou por peça +
 * material com --keep-parts). Exportações do Onshape/SolidWorks têm dezenas de
 * milhares de objetos: agrupar por material preserva as cores com poucas malhas.
 */
async function objToDocument(file) {
  const positions = new Grow(Float32Array, 1 << 20)
  const buckets = new Map()
  let mtllib = null
  let material = ''
  let group = 'Robo'
  let bucket = null
  const select = () => {
    const key = keepParts ? `${group}|${material}` : material
    bucket = buckets.get(key)
    if (!bucket) buckets.set(key, (bucket = { group, material, idx: new Grow(Uint32Array, 1 << 14) }))
  }
  select()

  const rl = readline.createInterface({ input: createReadStream(file, { highWaterMark: 1 << 22 }), crlfDelay: Infinity })
  let lines = 0
  const poly = []
  for await (const line of rl) {
    if (++lines % 5_000_000 === 0) console.log(`  … ${(lines / 1e6).toFixed(0)} mi de linhas`)
    const c0 = line.charCodeAt(0)
    const c1 = line.charCodeAt(1)
    if (c0 === 118 && c1 === 32) {
      // "v x y z"
      const p = line.split(/\s+/)
      positions.push(+p[1])
      positions.push(+p[2])
      positions.push(+p[3])
    } else if (c0 === 102 && c1 === 32) {
      // "f a/b/c ..." — triangulação em leque, índices negativos relativos
      const p = line.split(/\s+/)
      poly.length = 0
      const nv = positions.n / 3
      for (let i = 1; i < p.length; i++) {
        if (!p[i]) continue
        const v = parseInt(p[i], 10)
        poly.push(v < 0 ? nv + v : v - 1)
      }
      for (let i = 1; i + 1 < poly.length; i++) {
        bucket.idx.push(poly[0])
        bucket.idx.push(poly[i])
        bucket.idx.push(poly[i + 1])
      }
    } else if (line.startsWith('usemtl ')) {
      material = line.slice(7).trim()
      select()
    } else if (line.startsWith('g ') && keepParts) {
      group = line.slice(2).trim() || 'Parte'
      select()
    } else if (line.startsWith('mtllib ')) {
      mtllib = line.slice(7).trim()
    }
  }

  const mats = mtllib ? await parseMtl(path.join(path.dirname(file), mtllib)) : new Map()
  console.log(`• OBJ: ${(positions.n / 3).toLocaleString('pt-BR')} vértices, ${buckets.size} grupos, ${mats.size} materiais (${mtllib ?? 'sem .mtl'})`)

  const doc = new Document()
  const buffer = doc.createBuffer()
  const scene = doc.createScene('Scene')
  const gltfMats = new Map()
  const getMaterial = (name) => {
    if (gltfMats.has(name)) return gltfMats.get(name)
    const m = mats.get(name) ?? { kd: [0.7, 0.7, 0.7], d: 1 }
    const mat = doc
      .createMaterial(name || 'Padrao')
      .setBaseColorFactor([...m.kd.map(srgbToLinear), m.d])
      .setMetallicFactor(0.25)
      .setRoughnessFactor(0.5)
    if (m.d < 1) mat.setAlphaMode('BLEND')
    gltfMats.set(name, mat)
    return mat
  }

  const all = positions.view()
  const remap = new Int32Array(all.length / 3).fill(-1)
  for (const b of buckets.values()) {
    const idx = b.idx.view()
    if (!idx.length) continue
    const touched = []
    const local = new Uint32Array(idx.length)
    for (let i = 0; i < idx.length; i++) {
      const g = idx[i]
      if (remap[g] === -1) {
        remap[g] = touched.length
        touched.push(g)
      }
      local[i] = remap[g]
    }
    const pos = new Float32Array(touched.length * 3)
    touched.forEach((g, k) => {
      pos[k * 3] = all[g * 3]
      pos[k * 3 + 1] = all[g * 3 + 1]
      pos[k * 3 + 2] = all[g * 3 + 2]
      remap[g] = -1
    })
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(local).setBuffer(buffer))
      .setMaterial(getMaterial(b.material))
    const name = keepParts ? b.group : b.material || 'Robo'
    scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)))
  }
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
  const fh = await open(file)
  const { buffer: head } = await fh.read(Buffer.alloc(Math.min(size, 1 << 16)), 0, Math.min(size, 1 << 16), 0)
  await fh.close()
  const kind = detect(head, size)
  console.log(`• ${path.relative(root, file)} — ${mb(size)} — formato: ${kind}`)
  const full = () => readFile(file)
  switch (kind) {
    case 'glb':
      return io.readBinary(new Uint8Array(await full()))
    case 'gltf':
      return io.read(file)
    case 'obj':
      return objToDocument(file)
    case 'stl-bin':
    case 'stl-ascii':
      return stlToDocument(await full(), kind === 'stl-bin')
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
