/**
 * Post-build step for static hosts without a history-API fallback.
 *
 * GitHub Pages resolves "/products/" by looking for "products/index.html" and
 * returns 404 when that file is missing — it has no SPA fallback, so the
 * trailing-slash route convention this project uses buys nothing there (unlike
 * the previous Qoder Sites host, which answered directory URLs with the app
 * shell). This script materialises one real index.html per application route so
 * every deep link is served natively with HTTP 200, and drops a 404.html copy
 * so unknown paths still boot the SPA and reach the client-side not-found view.
 *
 * The route table is read from src/router.ts and the product slugs from
 * src/data/products.ts, so a new route that is not covered here fails the
 * build instead of shipping a dead deep link.
 */
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = path.join(root, 'dist')
const indexHtml = path.join(dist, 'index.html')

if (!existsSync(indexHtml)) {
  console.error('dist/index.html not found — run the build before this step.')
  process.exit(1)
}

const routerSrc = readFileSync(path.join(root, 'src', 'router.ts'), 'utf8')
const productsSrc = readFileSync(path.join(root, 'src', 'data', 'products.ts'), 'utf8')

const slugs = [...productsSrc.matchAll(/\bslug:\s*'([^']+)'/g)].map((m) => m[1])
if (!slugs.length) throw new Error('no product slugs found in src/data/products.ts')

const routePaths = [...routerSrc.matchAll(/\bpath:\s*'([^']+)'/g)].map((m) => m[1])
if (!routePaths.length) throw new Error('no routes found in src/router.ts')

// The site root already serves index.html; catch-all routes have no static page.
const staticPaths = routePaths.filter((p) => p !== '/' && !p.includes('*'))

const targets = new Set()
for (const route of staticPaths) {
  const params = [...new Set([...route.matchAll(/:([^/]+)/g)].map((m) => m[1]))]
  if (!params.length) {
    targets.add(route)
    continue
  }
  if (params.length === 1 && params[0] === 'slug') {
    for (const slug of slugs) targets.add(route.replace(/:slug/g, slug))
    continue
  }
  throw new Error(
    `route "${route}" uses params [${params.join(', ')}] that this script cannot expand — extend it`,
  )
}

let written = 0
for (const route of [...targets].sort()) {
  const dir = path.join(dist, route.replace(/^\/+|\/+$/g, ''))
  mkdirSync(dir, { recursive: true })
  copyFileSync(indexHtml, path.join(dir, 'index.html'))
  written += 1
}

// Unknown paths still boot the SPA so the client router renders its 404 view.
copyFileSync(indexHtml, path.join(dist, '404.html'))

console.log(`generated ${written} route directories + 404.html`)
for (const route of [...targets].sort()) console.log(`  ${route}`)
