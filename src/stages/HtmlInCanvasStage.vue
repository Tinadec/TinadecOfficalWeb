<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Maximize2, Minimize2, RotateCcw, Sparkles, Waves } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'

interface ScenarioNodeText {
  role: string
  title: string
  note: string
  status: string
}

interface Scenario {
  id: string
  label: string
  prompt: string
  nodes: ScenarioNodeText[]
}

interface PhysNode {
  x: number
  y: number
  tx: number
  ty: number
  vx: number
  vy: number
}

interface PulseWave {
  x: number
  y: number
  r: number
  maxR: number
  alpha: number
}

const { t, tm } = useI18n()
const { resolvedTheme } = useTheme()

const stageWrapRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])

const nativeHtmlInCanvas = ref(false)
const scenarioIdx = ref(0)
const selectedIdx = ref(0)
const draggingNode = ref<number | null>(null)

const scenarios = computed<Scenario[]>(() => {
  const raw = tm('canvasStage.scenarios') as Record<string, unknown>[]
  if (!Array.isArray(raw)) return []
  return raw.map((sc) => ({
    id: String(sc.id ?? ''),
    label: String(sc.label ?? ''),
    prompt: String(sc.prompt ?? ''),
    nodes: Array.isArray(sc.nodes)
      ? sc.nodes.map((n: Record<string, unknown>) => ({
          role: String(n.role ?? ''),
          title: String(n.title ?? ''),
          note: String(n.note ?? ''),
          status: String(n.status ?? ''),
        }))
      : [],
  }))
})

const currentScenario = computed(() => scenarios.value[scenarioIdx.value] ?? scenarios.value[0])
const currentNodesText = computed(() => currentScenario.value?.nodes ?? [])
const activeNodeText = computed(() => currentNodesText.value[selectedIdx.value] ?? currentNodesText.value[0])

// Three distinct spatial constellation coordinates in a 760x440 logical canvas
const SCENARIO_LAYOUTS: [number, number][][] = [
  [
    [115, 220],
    [325, 110],
    [325, 330],
    [515, 220],
    [665, 220],
  ],
  [
    [130, 145],
    [310, 95],
    [280, 325],
    [495, 165],
    [645, 295],
  ],
  [
    [120, 260],
    [295, 130],
    [350, 345],
    [510, 210],
    [660, 145],
  ],
]

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [1, 4],
  [2, 4],
  [3, 4],
]

const CARD_W = 164
const CARD_H = 74

const physNodes = reactive<PhysNode[]>(
  SCENARIO_LAYOUTS[0].map(([x, y]) => ({
    x,
    y,
    tx: x,
    ty: y,
    vx: 0,
    vy: 0,
  })),
)

const view = reactive({
  panX: 0,
  panY: 0,
  zoom: 1,
  velX: 0,
  velY: 0,
})

const waves: PulseWave[] = []

function setCardRef(el: unknown, idx: number) {
  if (el instanceof HTMLElement) {
    cardRefs.value[idx] = el
  }
}

function fitViewport() {
  const wrap = stageWrapRef.value
  if (!wrap) return
  const w = wrap.clientWidth
  const h = wrap.clientHeight
  const logicalW = 780
  const logicalH = 440
  const scale = Math.min(1.06, Math.max(0.42, Math.min((w - 24) / logicalW, (h - 24) / logicalH)))
  view.zoom = Number(scale.toFixed(3))
  view.panX = (w - logicalW * view.zoom) / 2
  view.panY = (h - logicalH * view.zoom) / 2
  view.velX = 0
  view.velY = 0
  requestNativePaint()
}

function applyScenarioTargets(idx: number) {
  scenarioIdx.value = idx
  const targets = SCENARIO_LAYOUTS[idx] ?? SCENARIO_LAYOUTS[0]
  targets.forEach(([tx, ty], i) => {
    physNodes[i].tx = tx
    physNodes[i].ty = ty
  })
  emitPulseAt(physNodes[0].x, physNodes[0].y)
}

function emitPulseAt(x: number, y: number) {
  waves.push({ x, y, r: 10, maxR: 280, alpha: 0.55 })
  requestNativePaint()
}

function triggerResonance() {
  selectedIdx.value = 0
  emitPulseAt(physNodes[0].x, physNodes[0].y)
  setTimeout(() => emitPulseAt(physNodes[3].x, physNodes[3].y), 140)
  setTimeout(() => emitPulseAt(physNodes[4].x, physNodes[4].y), 280)
}

function zoomStep(delta: number) {
  const wrap = stageWrapRef.value
  if (!wrap) return
  const next = Math.min(1.45, Math.max(0.4, Number((view.zoom + delta).toFixed(2))))
  const cx = wrap.clientWidth / 2
  const cy = wrap.clientHeight / 2
  const ratio = next / view.zoom
  view.panX = cx - (cx - view.panX) * ratio
  view.panY = cy - (cy - view.panY) * ratio
  view.zoom = next
  requestNativePaint()
}

function resetStage() {
  applyScenarioTargets(scenarioIdx.value)
  fitViewport()
}

function requestNativePaint() {
  if (nativeHtmlInCanvas.value) {
    canvasRef.value?.requestPaint?.()
  }
}

// --- Pointer Interaction (Node Drag & Pan) ---
let isPanning = false
let lastClientX = 0
let lastClientY = 0
let dragStartX = 0
let dragStartY = 0

function onCanvasPointerDown(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  isPanning = true
  lastClientX = e.clientX
  lastClientY = e.clientY
  view.velX = 0
  view.velY = 0
  ;(e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
}

function onNodePointerDown(idx: number, e: PointerEvent) {
  e.stopPropagation()
  selectedIdx.value = idx
  emitPulseAt(physNodes[idx].x, physNodes[idx].y)
  if (e.pointerType === 'touch') return
  draggingNode.value = idx
  dragStartX = e.clientX
  dragStartY = e.clientY
  lastClientX = e.clientX
  lastClientY = e.clientY
  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp)
}

function onWindowPointerMove(e: PointerEvent) {
  const dx = e.clientX - lastClientX
  const dy = e.clientY - lastClientY
  lastClientX = e.clientX
  lastClientY = e.clientY

  if (draggingNode.value !== null) {
    const n = physNodes[draggingNode.value]
    n.x += dx / view.zoom
    n.y += dy / view.zoom
    n.vx = 0
    n.vy = 0
    requestNativePaint()
  }
}

function onStagePointerMove(e: PointerEvent) {
  if (!isPanning) return
  const dx = e.clientX - lastClientX
  const dy = e.clientY - lastClientY
  lastClientX = e.clientX
  lastClientY = e.clientY
  view.panX += dx
  view.panY += dy
  view.velX = dx * 0.65
  view.velY = dy * 0.65
  requestNativePaint()
}

function onStagePointerUp(e: PointerEvent) {
  if (!isPanning) return
  isPanning = false
  ;(e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId)
}

function onWindowPointerUp(e: PointerEvent) {
  if (draggingNode.value !== null) {
    const moved = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY)
    if (moved < 4) {
      selectedIdx.value = draggingNode.value
    }
    draggingNode.value = null
    window.removeEventListener('pointermove', onWindowPointerMove)
    window.removeEventListener('pointerup', onWindowPointerUp)
  }
}

// --- Canvas Rendering Pipeline (Native HTML-in-Canvas + Progressive Fallback) ---
let rafId = 0
let reducedMotion = false
let animClock = 0

function renderCanvasScene(ctx: CanvasRenderingContext2D, w: number, h: number, drawHtmlCards: boolean) {
  const dark = resolvedTheme.value === 'dark'
  const gridCol = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(9, 9, 11, 0.09)'
  const ringCol = dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(9, 9, 11, 0.07)'
  const lineCol = dark ? 'rgba(250, 250, 250, 0.2)' : 'rgba(9, 9, 11, 0.16)'
  const activeLineCol = dark ? 'rgba(250, 250, 250, 0.62)' : 'rgba(9, 9, 11, 0.56)'
  const pulseCol = dark ? 'rgba(250, 250, 250, ' : 'rgba(9, 9, 11, '

  ctx.clearRect(0, 0, w, h)

  // 1. Infinite synchronized world dot-matrix grid
  const step = 28 * view.zoom
  if (step >= 8) {
    const startX = ((view.panX % step) + step) % step
    const startY = ((view.panY % step) + step) % step
    ctx.fillStyle = gridCol
    for (let x = startX; x < w; x += step) {
      for (let y = startY; y < h; y += step) {
        ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5)
      }
    }
  }

  ctx.save()
  ctx.translate(view.panX, view.panY)
  ctx.scale(view.zoom, view.zoom)

  // 2. Subtle harmonic field circles around centroid
  const cx = physNodes.reduce((acc, n) => acc + n.x, 0) / physNodes.length
  const cy = physNodes.reduce((acc, n) => acc + n.y, 0) / physNodes.length
  ctx.strokeStyle = ringCol
  ctx.lineWidth = 1 / view.zoom
  for (const r of [110, 210, 310]) {
    ctx.beginPath()
    ctx.arc(cx, cy, r + Math.sin(animClock * 0.7 + r) * 3, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 3. Expanding click / resonance waves
  for (let i = waves.length - 1; i >= 0; i--) {
    const wave = waves[i]
    ctx.strokeStyle = `${pulseCol}${wave.alpha.toFixed(3)})`
    ctx.lineWidth = 1.4 / view.zoom
    ctx.beginPath()
    ctx.arc(wave.x, wave.y, wave.r, 0, Math.PI * 2)
    ctx.stroke()
    if (!reducedMotion) {
      wave.r += 3.2
      wave.alpha *= 0.96
      if (wave.alpha < 0.015 || wave.r > wave.maxR) waves.splice(i, 1)
    }
  }

  // 4. Cubic Bezier synaptic connections & flowing light beads
  for (let idx = 0; idx < EDGES.length; idx++) {
    const [aIdx, bIdx] = EDGES[idx]
    const a = physNodes[aIdx]
    const b = physNodes[bIdx]
    const active = selectedIdx.value === aIdx || selectedIdx.value === bIdx

    const cpx1 = a.x + (b.x - a.x) * 0.5
    const cpy1 = a.y
    const cpx2 = b.x - (b.x - a.x) * 0.5
    const cpy2 = b.y

    ctx.strokeStyle = active ? activeLineCol : lineCol
    ctx.lineWidth = (active ? 1.5 : 1.0) / view.zoom
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, b.x, b.y)
    ctx.stroke()

    if (!reducedMotion) {
      const tPos = ((animClock * 0.28 + idx * 0.17) % 1 + 1) % 1
      const inv = 1 - tPos
      const px =
        inv * inv * inv * a.x +
        3 * inv * inv * tPos * cpx1 +
        3 * inv * tPos * tPos * cpx2 +
        tPos * tPos * tPos * b.x
      const py =
        inv * inv * inv * a.y +
        3 * inv * inv * tPos * cpy1 +
        3 * inv * tPos * tPos * cpy2 +
        tPos * tPos * tPos * b.y
      ctx.fillStyle = `${pulseCol}${active ? '0.88' : '0.45'})`
      ctx.beginPath()
      ctx.arc(px, py, (active ? 3.0 : 2.0) / view.zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 5. WICG html-in-canvas drawElementImage rendering pass when native drawable API succeeds
  if (drawHtmlCards) {
    for (let i = 0; i < physNodes.length; i++) {
      const el = cardRefs.value[i]
      if (!el) continue
      const n = physNodes[i]
      const dx = n.x - CARD_W / 2
      const dy = n.y - CARD_H / 2
      if (typeof ctx.drawElementImage === 'function') {
        ctx.drawElementImage(el, dx, dy, CARD_W, CARD_H)
      } else if (typeof ctx.drawElement === 'function') {
        ctx.drawElement(el, dx, dy, CARD_W, CARD_H)
      }
    }
  }

  ctx.restore()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  fitViewport()

  const canvas = canvasRef.value
  const wrap = stageWrapRef.value
  if (!canvas || !wrap) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Probe WICG html-in-canvas support safely without breaking unsupported browsers
  const hasDrawElementApi =
    typeof ctx.drawElementImage === 'function' || typeof ctx.drawElement === 'function'

  const onNativePaint = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    try {
      renderCanvasScene(ctx, w, h, true)
    } catch {
      nativeHtmlInCanvas.value = false
      canvas.removeAttribute('content')
      canvas.removeAttribute('layoutsubtree')
    }
  }

  if (hasDrawElementApi && 'requestPaint' in canvas) {
    try {
      canvas.setAttribute('content', 'drawable')
      canvas.layoutsubtree = true
      canvas.addEventListener('paint', onNativePaint)
      nativeHtmlInCanvas.value = true
      canvas.requestPaint?.()
    } catch {
      nativeHtmlInCanvas.value = false
      canvas.removeAttribute('content')
      canvas.removeAttribute('layoutsubtree')
    }
  }

  resizeObserver = new ResizeObserver(() => {
    fitViewport()
  })
  resizeObserver.observe(wrap)

  let last = performance.now()
  const tick = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
    last = now
    if (!reducedMotion) animClock += dt

    // Spring settle & inertial pan
    for (let i = 0; i < physNodes.length; i++) {
      if (draggingNode.value === i) continue
      const n = physNodes[i]
      const wobbleX = reducedMotion ? 0 : Math.sin(animClock * 0.9 + i * 1.4) * 4.2
      const wobbleY = reducedMotion ? 0 : Math.cos(animClock * 0.75 + i * 1.1) * 4.2
      const fx = (n.tx + wobbleX - n.x) * 0.06
      const fy = (n.ty + wobbleY - n.y) * 0.06
      n.vx = (n.vx + fx) * 0.82
      n.vy = (n.vy + fy) * 0.82
      n.x += n.vx
      n.y += n.vy
    }

    if (!isPanning && (Math.abs(view.velX) > 0.05 || Math.abs(view.velY) > 0.05)) {
      view.panX += view.velX
      view.panY += view.velY
      view.velX *= 0.91
      view.velY *= 0.91
    }

    const w = wrap.clientWidth
    const h = wrap.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (w > 0 && h > 0) {
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
      }
      if (nativeHtmlInCanvas.value) {
        canvas.requestPaint?.()
      } else {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        renderCanvasScene(ctx, w, h, false)
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
})

watch(resolvedTheme, () => {
  requestNativePaint()
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
})
</script>

<template>
  <section id="spatial-stage" class="scroll-mt-20 border-t-hairline py-24 sm:py-32">
    <div class="frame-width px-3 sm:px-8">
      <!-- Editorial Header -->
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="max-w-2xl">
          <p class="mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {{ t('canvasStage.eyebrow') }}
          </p>
          <h2 class="display-section mt-3 text-3xl text-balance sm:text-[2.65rem]">
            {{ t('canvasStage.title') }}
          </h2>
          <p class="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {{ t('canvasStage.subtitle') }}
          </p>
        </div>

        <!-- Scenario Segmented Switcher -->
        <div class="flex flex-wrap gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]/85 p-1 backdrop-blur-md">
          <button
            v-for="(sc, idx) in scenarios"
            :key="sc.id"
            type="button"
            class="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
            :class="
              scenarioIdx === idx
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            "
            @click="applyScenarioTargets(idx)"
          >
            {{ sc.label }}
          </button>
        </div>
      </div>

      <!-- Concentric Spatial Canvas Installation -->
      <div class="spatial-frame relative mt-10 min-w-0 rounded-[28px] p-1.5 sm:p-2">
        <span aria-hidden="true" class="crosshair-mark absolute -top-[3.5px] -left-[3.5px] hidden sm:block" />
        <span aria-hidden="true" class="crosshair-mark absolute -bottom-[3.5px] -right-[3.5px] hidden sm:block" />

        <div class="spatial-inner min-w-0 overflow-hidden rounded-[22px]">
          <!-- Minimal Chrome Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b-hairline bg-[var(--bg-secondary)]/90 px-4 py-3">
            <div class="flex min-w-0 items-center gap-2.5">
              <Sparkles class="h-3.5 w-3.5 shrink-0 text-[var(--text-primary)]" aria-hidden="true" />
              <span class="truncate text-xs font-medium text-[var(--text-primary)]">
                {{ currentScenario?.prompt }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span class="mono hidden rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-0.5 text-[10px] text-[var(--text-muted)] md:inline-flex">
                {{ nativeHtmlInCanvas ? t('canvasStage.engineNative') : t('canvasStage.engineHybrid') }}
              </span>

              <button
                type="button"
                class="btn-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-opacity hover:opacity-90"
                @click="triggerResonance"
              >
                <Waves class="h-3 w-3" aria-hidden="true" />
                <span>{{ t('canvasStage.pulseBtn') }}</span>
              </button>

              <div class="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] p-0.5">
                <button
                  type="button"
                  aria-label="Zoom out"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  @click="zoomStep(-0.15)"
                >
                  <Minimize2 class="h-3 w-3" aria-hidden="true" />
                </button>
                <span class="mono px-1.5 text-[10px] text-[var(--text-muted)]">
                  {{ Math.round(view.zoom * 100) }}%
                </span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  @click="zoomStep(0.15)"
                >
                  <Maximize2 class="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                @click="resetStage"
              >
                <RotateCcw class="h-3 w-3" aria-hidden="true" />
                <span class="hidden sm:inline">{{ t('canvasStage.resetBtn') }}</span>
              </button>
            </div>
          </div>

          <!-- Interactive Canvas + Spatial HTML Subtree -->
          <div
            ref="stageWrapRef"
            class="relative h-[360px] w-full select-none overflow-hidden bg-[var(--bg-primary)] sm:h-[480px]"
            style="touch-action: manipulation"
            @pointerdown="onCanvasPointerDown"
            @pointermove="onStagePointerMove"
            @pointerup="onStagePointerUp"
            @pointercancel="onStagePointerUp"
          >
            <canvas ref="canvasRef" class="block h-full w-full">
              <!-- When HTML-in-Canvas native drawable mode is active, children inside <canvas> paint natively -->
            </canvas>

            <!-- Spatial Projected HTML Cards Layer (syncs 1:1 with Canvas transform matrix) -->
            <div
              class="pointer-events-none absolute top-0 left-0 origin-top-left"
              :style="{
                transform: `translate3d(${view.panX}px, ${view.panY}px, 0) scale(${view.zoom})`,
                opacity: nativeHtmlInCanvas ? 0.001 : 1,
              }"
            >
              <button
                v-for="(node, idx) in physNodes"
                :key="idx"
                :ref="(el) => setCardRef(el, idx)"
                type="button"
                drawable
                class="pointer-events-auto absolute flex cursor-grab flex-col justify-between rounded-2xl border p-3 text-left transition-shadow active:cursor-grabbing"
                :class="
                  selectedIdx === idx
                    ? 'border-[var(--text-primary)] bg-[var(--bg-elevated)] shadow-lg ring-1 ring-[var(--text-primary)]/15'
                    : 'border-[var(--border-default)] bg-[var(--bg-secondary)]/95 shadow-sm hover:border-[var(--border-strong)]'
                "
                :style="{
                  width: `${CARD_W}px`,
                  height: `${CARD_H}px`,
                  left: `${node.x - CARD_W / 2}px`,
                  top: `${node.y - CARD_H / 2}px`,
                }"
                @pointerdown="onNodePointerDown(idx, $event)"
              >
                <div class="flex items-center justify-between gap-1.5">
                  <span class="mono truncate text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {{ currentNodesText[idx]?.role }}
                  </span>
                  <span
                    class="h-1.5 w-1.5 shrink-0 rounded-full"
                    :style="{
                      backgroundColor:
                        idx === 4
                          ? 'var(--accent-success)'
                          : selectedIdx === idx
                            ? 'var(--accent-signal)'
                            : 'var(--border-strong)',
                    }"
                  />
                </div>
                <div class="truncate text-xs font-semibold text-[var(--text-primary)]">
                  {{ currentNodesText[idx]?.title }}
                </div>
              </button>
            </div>
          </div>

          <!-- Active Node Poetic Detail Readout Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-t-hairline bg-[var(--bg-secondary)]/70 px-4 py-3 text-xs">
            <div v-if="activeNodeText" class="flex min-w-0 items-center gap-2.5">
              <span class="mono shrink-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]">
                {{ activeNodeText.role }}
              </span>
              <span class="truncate text-[var(--text-secondary)]">
                {{ activeNodeText.note }}
              </span>
            </div>
            <span class="mono hidden text-[10px] text-[var(--text-muted)] lg:inline">
              {{ t('canvasStage.hint') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
