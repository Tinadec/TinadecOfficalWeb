/**
 * Contrast gate for both Light and Dark mode monochrome token layers.
 * Reads :root and .dark directly from src/styles.css and verifies WCAG AA.
 */
import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8')

function block(selector) {
  const start = css.indexOf(selector)
  if (start < 0) throw new Error(`selector not found: ${selector}`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  const body = css.slice(open + 1, close)
  const vars = {}
  for (const match of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[match[1]] = match[2].trim()
  return vars
}

const layers = { light: block(':root {'), dark: block('.dark {') }

function hex(value) {
  const m = /^#([0-9a-f]{6})$/i.exec(value)
  if (!m) throw new Error(`not a hex colour: ${value}`)
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]) {
  const channel = (v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function ratio(fg, bg) {
  const a = luminance(hex(fg))
  const b = luminance(hex(bg))
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const pairs = [
  ['body text', '--text-primary', '--bg-primary', 4.5],
  ['secondary text', '--text-secondary', '--bg-primary', 4.5],
  ['muted text', '--text-muted', '--bg-primary', 4.5],
  ['brand text / links', '--text-brand', '--bg-primary', 4.5],
  ['primary button label', '--primary-foreground', '--primary', 4.5],
  ['text on secondary', '--text-primary', '--bg-secondary', 4.5],
  ['secondary on card', '--text-secondary', '--bg-secondary', 4.5],
  ['muted on card', '--text-muted', '--bg-secondary', 4.5],
  ['text in tertiary', '--text-primary', '--bg-tertiary', 4.5],
  ['muted in tertiary', '--text-muted', '--bg-tertiary', 4.5],
  ['success accent', '--accent-success', '--bg-tertiary', 3],
  ['warning accent', '--accent-warning', '--bg-tertiary', 3],
  ['danger accent', '--accent-danger', '--bg-tertiary', 3],
  ['info accent', '--accent-info', '--bg-tertiary', 3],
  ['signal accent', '--accent-signal', '--bg-tertiary', 3],
]

let failures = 0
for (const mode of ['light', 'dark']) {
  const vars = layers[mode]
  console.log(`\n${mode}`)
  for (const [label, fgToken, bgToken, floor] of pairs) {
    const fg = vars[fgToken]
    const bg = vars[bgToken]
    if (!fg || !bg) throw new Error(`${mode}: missing token ${!fg ? fgToken : bgToken}`)
    const value = ratio(fg, bg)
    const ok = value >= floor
    if (!ok) failures += 1
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(22)} ${fg} on ${bg}  ${value.toFixed(2)}:1 (needs ${floor}:1)`,
    )
  }
}

if (failures > 0) {
  console.error(`\n${failures} contrast failure(s)`)
  process.exit(1)
}
console.log('\nAll contrast pairs pass.')
