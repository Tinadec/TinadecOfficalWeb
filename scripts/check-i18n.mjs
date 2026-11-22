/**
 * Verifies every referenced i18n key resolves in both locales, compiles cleanly
 * through vue-i18n, and maintains full leaf parity between zh-CN and en.
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

const files = []
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(vue|ts)$/.test(entry.name) && !full.includes(`${path.sep}locales${path.sep}`)) files.push(full)
  }
}
walk(path.join(root, 'src'))

const KEY = /\b(?:t|tm)\(\s*'([a-zA-Z0-9_.]+)'/g
const keys = new Map()
for (const file of files) {
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(KEY)) {
    if (!m[1].includes('.')) continue
    if (!keys.has(m[1])) keys.set(m[1], path.relative(root, file))
  }
}

const productsSrc = readFileSync(path.join(root, 'src/data/products.ts'), 'utf8')
const productKeys = [...productsSrc.matchAll(/i18nKey:\s*'([^']+)'/g)].map((m) => m[1])
if (!productKeys.length) throw new Error('no product entries found in src/data/products.ts')

for (const base of productKeys) {
  for (const suffix of ['.name', '.tagline', '.version', '.license', '.stack', '.contract', '.lead', '.highlights']) {
    const key = base + suffix
    if (!keys.has(key)) keys.set(key, 'src/data/products.ts (dynamic)')
  }
}

const locales = {}
for (const [name, file] of [['zh-CN', 'src/locales/zh-CN.ts'], ['en', 'src/locales/en.ts']]) {
  locales[name] = (await import(pathToFileURL(path.join(root, file)).href)).default
}

function has(obj, dotted) {
  return dotted.split('.').every((part) => {
    if (obj == null && part !== '') return false
    if (!Object.prototype.hasOwnProperty.call(obj ?? {}, part)) return false
    obj = obj[part]
    return true
  })
}

const missing = []
for (const [key, where] of [...keys].sort()) {
  for (const [name, tree] of Object.entries(locales)) {
    if (!has(tree, key)) missing.push(`${name}  ${key}   (${where})`)
  }
}

function leaves(obj, prefix = '') {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const dotted = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...leaves(v, dotted))
    else out.push(dotted)
  }
  return out
}
const zh = new Set(leaves(locales['zh-CN']))
const en = new Set(leaves(locales.en))
const parity = [...zh]
  .filter((k) => !en.has(k))
  .concat([...en].filter((k) => !zh.has(k)).map((k) => `only in en: ${k}`))

function textLeaves(node) {
  const out = []
  const walkNode = (value, p) => {
    if (typeof value === 'string') return out.push([p, value])
    if (Array.isArray(value)) return value.forEach((item, i) => walkNode(item, `${p}[${i}]`))
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walkNode(v, p ? `${p}.${k}` : k)
    }
  }
  walkNode(node, '')
  return out
}

const { createI18n } = await import('vue-i18n')
const i18n = createI18n({ legacy: false, locale: 'zh-CN', fallbackWarn: false, missingWarn: false, messages: locales })
const compileErrors = []
for (const name of Object.keys(locales)) {
  i18n.global.locale.value = name
  for (const [key, value] of textLeaves(locales[name])) {
    try {
      const rendered = i18n.global.t(key)
      if (!/\{[a-zA-Z_]/.test(value) && rendered !== value.replace(/\\/g, '')) {
        compileErrors.push(`${name}  ${key}  -> compiler rewrote it: ${JSON.stringify(value)} != ${JSON.stringify(rendered)}`)
      }
    } catch (e) {
      compileErrors.push(`${name}  ${key}  -> ${String(e.message).split('\n')[0]}`)
    }
  }
}

console.log(`checked ${keys.size} referenced keys against ${zh.size}/${en.size} leaves`)
if (compileErrors.length) {
  console.log(`\nMESSAGE COMPILER ERRORS (${compileErrors.length}):`)
  for (const e of compileErrors.slice(0, 20)) console.log('  ' + e)
}
if (parity.length) {
  console.log(`\nLOCALE PARITY MISMATCH (${parity.length}):`)
  for (const k of parity) console.log('  ' + k)
}
if (missing.length || compileErrors.length || parity.length) {
  if (missing.length) {
    console.log(`\nMISSING KEYS (${missing.length}):`)
    for (const m of missing) console.log('  ' + m)
  }
  process.exit(1)
}
console.log('\nAll keys resolve, compile, and match parity cleanly.')
