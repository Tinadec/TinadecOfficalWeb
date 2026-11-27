<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { useTheme } from '@/composables/useTheme'

interface Props {
  chapter?: number
}

const props = withDefaults(defineProps<Props>(), {
  chapter: 0,
})

const containerRef = ref<HTMLDivElement | null>(null)
const webglFailed = ref(false)
const { resolvedTheme } = useTheme()

const MAX_CELLS = 32
const DESKTOP_CELLS = 28
const MOBILE_CELLS = 18

let targetChapter = props.chapter
let targetDarkMix = resolvedTheme.value === 'dark' ? 1 : 0
let requestStaticRender: (() => void) | null = null

watch(
  () => props.chapter,
  (next) => {
    targetChapter = Math.max(0, Math.min(3, Math.round(next)))
    requestStaticRender?.()
  },
)

watch(resolvedTheme, (next) => {
  targetDarkMix = next === 'dark' ? 1 : 0
  requestStaticRender?.()
})

let cleanupFn: (() => void) | null = null

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.innerWidth < 768
  const activeCount = isMobile ? MOBILE_CELLS : DESKTOP_CELLS
  const pairCount = activeCount / 2

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
  } catch {
    webglFailed.value = true
    return
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let width = container.clientWidth || window.innerWidth
  let height = container.clientHeight || window.innerHeight
  let aspect = Math.max(0.5, width / Math.max(1, height))

  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const cellUniformsArray: THREE.Vector3[] = Array.from(
    { length: MAX_CELLS },
    () => new THREE.Vector3(99, 99, 0),
  )

  const uniforms = {
    uResolution: { value: new THREE.Vector2(width, height) },
    uDarkMix: { value: targetDarkMix },
    uGlobalAlpha: { value: targetChapter === 3 ? 0.42 : 1.0 },
    uCount: { value: activeCount },
    uCells: { value: cellUniformsArray },
  }

  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      varying vec2 vUv;
      uniform vec2 uResolution;
      uniform float uDarkMix;
      uniform float uGlobalAlpha;
      uniform int uCount;
      uniform vec3 uCells[32];

      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      void main() {
        float aspect = uResolution.x / max(1.0, uResolution.y);
        vec2 p = vec2((vUv.x - 0.5) * 2.0 * aspect, (vUv.y - 0.5) * 2.0);

        const float R = 0.0155;
        const float K = 0.020;

        float d = 10.0;
        for (int i = 0; i < 32; i++) {
          if (i >= uCount) break;
          vec3 c = uCells[i];
          if (c.z > 0.5) {
            float ci = length(p - c.xy) - R;
            d = smin(d, ci, K);
          }
        }

        float px = 1.25 / max(1.0, uResolution.y);
        float mask = 1.0 - smoothstep(-px, px, d);
        if (mask <= 0.001) discard;

        float inner = smoothstep(0.0, -R * 0.45, d);
        vec3 ink = vec3(0.09, 0.09, 0.11);
        vec3 lightStar = vec3(0.95, 0.95, 0.97);
        vec3 col = mix(ink, lightStar, uDarkMix);

        float lightAlpha = mix(0.46, 0.62, inner);
        float darkAlpha = mix(0.50, 0.68, inner);
        float alpha = mask * mix(lightAlpha, darkAlpha, uDarkMix) * uGlobalAlpha;

        gl_FragColor = vec4(col, alpha);
      }
    `,
  })

  const quad = new THREE.Mesh(geometry, material)
  scene.add(quad)

  // Deterministic pseudo-random helper for calm organic layouts
  let seed = 4201
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  interface PairMeta {
    cycleSpeed: number
    phaseOffset: number
    axisAngle: number
    axisSpin: number
    driftFreq: number
    driftPhase: number
    maxSep: number
    anchorFactors: [number, number][] // 4 chapters in normalized [-1..1] aspect-scaled coords
  }

  const pairs: PairMeta[] = []
  for (let p = 0; p < pairCount; p++) {
    const t = p / pairCount
    const theta0 = t * Math.PI * 2 + rand() * 0.22

    // Chapter 0: Elliptical murmuration perimeter around centered Hero text sanctuary
    // On narrow viewports, bias cells above the top badge or below the CTAs
    const r0 = 0.70 + (p % 3) * 0.085
    const c0: [number, number] = isMobile
      ? [
          Math.cos(theta0) * 0.78,
          (p % 2 === 0 ? 1 : -1) * (0.56 + (p % 3) * 0.09),
        ]
      : [Math.cos(theta0) * r0 * 0.9, Math.sin(theta0) * r0 * 0.88]

    // Chapter 1: Grouped mainly in the open left gallery area below sticky header + far outer edge
    const g = p % 4
    const groupCenters: [number, number][] = [
      [-0.66, -0.26],
      [-0.50, -0.58],
      [-0.74, -0.68],
      [0.84, 0.42],
    ]
    const [gx, gy] = groupCenters[g]
    const ga = (p * 2.1) % (Math.PI * 2)
    const gr = 0.08 + (p % 3) * 0.06
    const c1: [number, number] = [gx + Math.cos(ga) * gr, gy + Math.sin(ga) * gr]

    // Chapter 2: Gentle diagonal synaptic sweep across space
    const u = t * 2 - 1
    const c2: [number, number] = [
      u * 0.78,
      Math.sin(u * Math.PI * 1.4) * 0.46 + ((p % 2) === 0 ? 0.12 : -0.12),
    ]

    // Chapter 3: Calm outer margins & lower horizon border behind stage & gallery
    const side = p % 3 === 0 ? -1 : p % 3 === 1 ? 1 : 0
    const c3: [number, number] =
      side !== 0
        ? [side * (0.76 + (p % 2) * 0.08), (t * 1.6 - 0.8)]
        : [(t - 0.5) * 1.4, -0.78 + Math.sin(t * 6.0) * 0.08]

    pairs.push({
      cycleSpeed: 0.115 + rand() * 0.055,
      phaseOffset: rand(),
      axisAngle: rand() * Math.PI * 2,
      axisSpin: (rand() - 0.5) * 0.18,
      driftFreq: 0.25 + rand() * 0.18,
      driftPhase: rand() * Math.PI * 2,
      maxSep: 0.078 + rand() * 0.032,
      anchorFactors: [c0, c1, c2, c3],
    })
  }

  // Physics state for active cells in aspect-corrected world space
  const cellX = new Float32Array(activeCount)
  const cellY = new Float32Array(activeCount)
  const cellVx = new Float32Array(activeCount)
  const cellVy = new Float32Array(activeCount)

  const targetWeights = [0, 0, 0, 0]
  const currentWeights = [0, 0, 0, 0]
  currentWeights[targetChapter] = 1
  let currentDarkMix = targetDarkMix
  let currentGlobalAlpha = targetChapter === 3 ? 0.42 : 1.0

  const pointerWorld = new THREE.Vector2(99, 99)
  let animTime = 0
  let rafId = 0
  let isPaused = document.hidden

  function computePairSeparation(pair: PairMeta, time: number): number {
    if (reducedMotion) {
      // Snapshot a pleasing mix of merged, splitting (peanut), and paired cells
      const f = pair.phaseOffset
      if (f < 0.3) return 0.0
      if (f < 0.65) return 0.039
      return pair.maxSep
    }
    const cyc = (time * pair.cycleSpeed + pair.phaseOffset) % 1.0
    if (cyc < 0.16) {
      // Coalesced single cell breathing
      return 0.004 * Math.sin((cyc / 0.16) * Math.PI)
    }
    if (cyc < 0.48) {
      // Mitosis / division stretching across cleavage waist (sep ~ 0.038-0.048) to full split
      const k = (cyc - 0.16) / 0.32
      return smoothstep(0, 1, k) * pair.maxSep
    }
    if (cyc < 0.72) {
      // Two independent equal-sized dots drifting cleanly
      const k = (cyc - 0.48) / 0.24
      return pair.maxSep + Math.sin(k * Math.PI) * 0.012
    }
    // Coalescence / fusion gliding back together through a liquid meniscus neck
    const k = (cyc - 0.72) / 0.28
    return (1 - smoothstep(0, 1, k)) * pair.maxSep
  }

  // Initialize positions cleanly before first paint
  function computeTargetPositions(time: number, outX: Float32Array, outY: Float32Array) {
    for (let p = 0; p < pairCount; p++) {
      const pair = pairs[p]
      let anchorNx = 0
      let anchorNy = 0
      for (let c = 0; c < 4; c++) {
        const w = currentWeights[c]
        if (w > 0.001) {
          anchorNx += pair.anchorFactors[c][0] * w
          anchorNy += pair.anchorFactors[c][1] * w
        }
      }

      let cx = anchorNx * aspect
      let cy = anchorNy
      if (!reducedMotion) {
        cx += Math.sin(time * pair.driftFreq + pair.driftPhase) * 0.08 * aspect
        cy += Math.cos(time * pair.driftFreq * 0.85 + pair.driftPhase) * 0.08
      }

      const sep = computePairSeparation(pair, time)
      const angle = pair.axisAngle + (reducedMotion ? 0 : time * pair.axisSpin)
      const ox = Math.cos(angle) * (sep * 0.5)
      const oy = Math.sin(angle) * (sep * 0.5)

      outX[p * 2] = cx - ox
      outY[p * 2] = cy - oy
      outX[p * 2 + 1] = cx + ox
      outY[p * 2 + 1] = cy + oy
    }
  }

  computeTargetPositions(0, cellX, cellY)

  const targetX = new Float32Array(activeCount)
  const targetY = new Float32Array(activeCount)

  function stepFrame(dt: number, snapImmediate = false) {
    animTime += dt

    const lerpRate = snapImmediate ? 1.0 : Math.min(1, dt * 3.6)
    currentDarkMix += (targetDarkMix - currentDarkMix) * lerpRate
    uniforms.uDarkMix.value = currentDarkMix

    const desiredAlpha = targetChapter === 0 ? 1.0 : targetChapter === 3 ? 0.36 : 0.56
    currentGlobalAlpha += (desiredAlpha - currentGlobalAlpha) * lerpRate
    uniforms.uGlobalAlpha.value = currentGlobalAlpha

    for (let c = 0; c < 4; c++) targetWeights[c] = c === targetChapter ? 1 : 0
    for (let c = 0; c < 4; c++) {
      currentWeights[c] += (targetWeights[c] - currentWeights[c]) * lerpRate
    }

    computeTargetPositions(animTime, targetX, targetY)

    const ch0Weight = currentWeights[0]
    const currentIsMobile = aspect < 0.85
    const sanctRx = (currentIsMobile ? 0.78 : 0.47) * aspect
    const sanctRy = currentIsMobile ? 0.48 : 0.44
    const sanctCy = 0.04
    const minNonTwinDist = 0.052

    for (let i = 0; i < activeCount; i++) {
      if (snapImmediate) {
        cellX[i] = targetX[i]
        cellY[i] = targetY[i]
        cellVx[i] = 0
        cellVy[i] = 0
      } else {
        let fx = (targetX[i] - cellX[i]) * 0.09
        let fy = (targetY[i] - cellY[i]) * 0.09

        // Gentle pointer attraction/nudge so user can nudge neighboring dots to fuse or split
        const dxM = pointerWorld.x - cellX[i]
        const dyM = pointerWorld.y - cellY[i]
        const distM = Math.hypot(dxM, dyM)
        if (distM < 0.28 && distM > 0.005) {
          const pull = (1 - distM / 0.28) * 0.009
          fx += (dxM / distM) * pull
          fy += (dyM / distM) * pull
        }

        // Prevent non-twin cells from clumping into oversized clusters (preserve uniform dot scale)
        const twinIdx = i ^ 1
        for (let j = 0; j < activeCount; j++) {
          if (j === i || j === twinIdx) continue
          const dxN = cellX[i] - cellX[j]
          const dyN = cellY[i] - cellY[j]
          const distN = Math.hypot(dxN, dyN)
          if (distN < minNonTwinDist && distN > 0.0005) {
            const push = (1 - distN / minNonTwinDist) * 0.014
            fx += (dxN / distN) * push
            fy += (dyN / distN) * push
          }
        }

        cellVx[i] = (cellVx[i] + fx) * 0.82
        cellVy[i] = (cellVy[i] + fy) * 0.82
        cellX[i] += cellVx[i]
        cellY[i] += cellVy[i]
      }

      // Hero center sanctuary exclusion so dots frame typography cleanly without covering headline text
      if (ch0Weight > 0.2) {
        const dySanct = cellY[i] - sanctCy
        const ex = cellX[i] / sanctRx
        const ey = dySanct / sanctRy
        const ellDist = Math.hypot(ex, ey)
        if (ellDist < 1.0 && ellDist > 0.001) {
          const pushFactor = (1.0 - ellDist) * ch0Weight
          cellX[i] += (ex / ellDist) * 0.22 * pushFactor
          cellY[i] += (ey / ellDist) * 0.22 * pushFactor
        }
      }

      // Soft viewport clamping inside [-aspect*0.95..aspect*0.95] x [-0.94..0.94]
      const limX = aspect * 0.94
      const limY = 0.92
      if (cellX[i] > limX) cellX[i] = limX
      else if (cellX[i] < -limX) cellX[i] = -limX
      if (cellY[i] > limY) cellY[i] = limY
      else if (cellY[i] < -limY) cellY[i] = -limY

      cellUniformsArray[i].set(cellX[i], cellY[i], 1.0)
    }

    renderer.render(scene, camera)
  }

  requestStaticRender = () => {
    if (reducedMotion) stepFrame(0, true)
  }

  function onPointerMove(e: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    pointerWorld.set(nx * aspect, ny)
  }

  function onPointerLeave() {
    pointerWorld.set(99, 99)
  }

  function onResize() {
    if (!container) return
    width = container.clientWidth || window.innerWidth
    height = container.clientHeight || window.innerHeight
    aspect = Math.max(0.5, width / Math.max(1, height))
    uniforms.uResolution.value.set(width, height)
    renderer.setSize(width, height)
    if (reducedMotion) stepFrame(0, true)
  }

  function onVisibilityChange() {
    isPaused = document.hidden
    if (!isPaused && !reducedMotion && !rafId) {
      lastTs = performance.now()
      rafId = requestAnimationFrame(loop)
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)

  let lastTs = performance.now()
  function loop(now: number) {
    if (isPaused) {
      rafId = 0
      return
    }
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000))
    lastTs = now
    stepFrame(dt, false)
    rafId = requestAnimationFrame(loop)
  }

  if (reducedMotion) {
    stepFrame(0, true)
  } else if (!isPaused) {
    rafId = requestAnimationFrame(loop)
  }

  cleanupFn = () => {
    if (rafId) cancelAnimationFrame(rafId)
    requestStaticRender = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerleave', onPointerLeave)
    window.removeEventListener('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
  }
})

onBeforeUnmount(() => {
  cleanupFn?.()
})
</script>

<template>
  <div
    ref="containerRef"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    :class="webglFailed ? 'hidden' : ''"
  />
</template>
