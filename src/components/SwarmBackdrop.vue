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

const MAX_SEGMENTS = 650
const ANCHOR_COUNT = 120

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

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.innerWidth < 768
  const particleCount = isMobile ? 600 : 1400

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
  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || window.innerHeight
  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200)
  camera.position.set(0, 0, 34)

  // Deterministic pseudo-random helper for calm organic layouts
  let seed = 1337
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  const clusterCenters: [number, number, number][] = [
    [-13.5, 6.2, -2.5],
    [13.5, 5.4, 1.5],
    [-11.0, -7.2, 2.0],
    [12.2, -6.4, -1.5],
    [0.0, 9.6, -4.0],
  ]

  function computeFormationPoint(chapterIdx: number, idx: number, total: number, isAnchor: boolean): [number, number, number] {
    const t = idx / total
    const angle = t * Math.PI * 2 + (isAnchor ? 0.17 : rand() * 0.45)
    const clusterId = idx % 5

    if (chapterIdx === 0) {
      // Emergence Halo: wide toroidal murmuration leaving a serene center sanctuary
      const majorR = isAnchor ? 10.6 + (idx % 7) * 0.72 : 9.6 + rand() * 7.2
      const tubeR = isAnchor ? ((idx % 5) - 2) * 0.75 : (rand() - 0.5) * 3.8
      const spin = angle + (idx % 3) * 0.25
      const x = Math.cos(spin) * (majorR + tubeR * 0.55)
      const y = Math.sin(spin) * (majorR * 0.64 + tubeR * 0.45)
      const z = Math.sin(spin * 2.0 + idx) * 2.6 + (rand() - 0.5) * 2.4
      return [x, y, z]
    }

    if (chapterIdx === 1) {
      // Autonomous Clusters: 5 orbiting galaxies separated across space
      const [cx, cy, cz] = clusterCenters[clusterId]
      const r = isAnchor ? 1.4 + ((idx * 13) % 10) * 0.26 : 0.7 + Math.pow(rand(), 0.7) * 3.8
      const phi = (idx * 2.39996) + rand() * 0.3
      const theta = ((idx % 11) / 11) * Math.PI
      return [
        cx + Math.cos(phi) * Math.sin(theta) * r,
        cy + Math.sin(phi) * Math.sin(theta) * r,
        cz + Math.cos(theta) * r * 0.85,
      ]
    }

    if (chapterIdx === 2) {
      // Synaptic Lattice: interwoven double-helix harmonic ribbon across space
      const u = (t - 0.5) * Math.PI * 3.2
      const strand = idx % 2 === 0 ? 1 : -1
      const spread = isAnchor ? 0.8 : (rand() - 0.5) * 2.4
      const x = (t - 0.5) * 30.0 + spread * 0.4
      const y = Math.sin(u) * 5.8 * strand + Math.cos(u * 0.5) * 1.4 + spread * 0.65
      const z = Math.cos(u) * 4.5 * strand + (rand() - 0.5) * 2.0
      return [x, y, z]
    }

    // Chapter 3: Calm Horizon Wave beneath stage/gallery
    const cols = isAnchor ? 20 : 50
    const row = Math.floor(idx / cols)
    const rows = Math.max(1, Math.ceil(total / cols))
    const nx = (idx % cols) / Math.max(1, cols - 1) - 0.5
    const nz = row / Math.max(1, rows - 1) - 0.5
    const x = nx * 44.0 + (isAnchor ? 0 : (rand() - 0.5) * 0.9)
    const z = nz * 16.0 - 2.0
    const wave = Math.sin(nx * 5.2 + nz * 3.1) * 1.5
    const y = -8.8 + wave + (isAnchor ? 0 : (rand() - 0.5) * 1.2)
    return [x, y, z]
  }

  // --- 1. Ambient GPU Particle Cloud (1400 desktop / 600 mobile) ---
  const pos0 = new Float32Array(particleCount * 3)
  const pos1 = new Float32Array(particleCount * 3)
  const pos2 = new Float32Array(particleCount * 3)
  const pos3 = new Float32Array(particleCount * 3)
  const phases = new Float32Array(particleCount)
  const sizes = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const p0 = computeFormationPoint(0, i, particleCount, false)
    const p1 = computeFormationPoint(1, i, particleCount, false)
    const p2 = computeFormationPoint(2, i, particleCount, false)
    const p3 = computeFormationPoint(3, i, particleCount, false)
    pos0[i3] = p0[0]
    pos0[i3 + 1] = p0[1]
    pos0[i3 + 2] = p0[2]
    pos1[i3] = p1[0]
    pos1[i3 + 1] = p1[1]
    pos1[i3 + 2] = p1[2]
    pos2[i3] = p2[0]
    pos2[i3 + 1] = p2[1]
    pos2[i3 + 2] = p2[2]
    pos3[i3] = p3[0]
    pos3[i3 + 1] = p3[1]
    pos3[i3 + 2] = p3[2]
    phases[i] = rand() * Math.PI * 2
    sizes[i] = (1.35 + rand() * 2.15) * dpr
  }

  const cloudGeo = new THREE.BufferGeometry()
  cloudGeo.setAttribute('position', new THREE.BufferAttribute(pos0, 3))
  cloudGeo.setAttribute('aPos1', new THREE.BufferAttribute(pos1, 3))
  cloudGeo.setAttribute('aPos2', new THREE.BufferAttribute(pos2, 3))
  cloudGeo.setAttribute('aPos3', new THREE.BufferAttribute(pos3, 3))
  cloudGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  cloudGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const cloudUniforms = {
    uTime: { value: 0 },
    uDarkMix: { value: targetDarkMix },
    uWeights: { value: new THREE.Vector4(1, 0, 0, 0) },
    uPointer: { value: new THREE.Vector2(999, 999) },
    uGlobalAlpha: { value: 1.0 },
  }

  const cloudMat = new THREE.ShaderMaterial({
    uniforms: cloudUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: `
      attribute vec3 aPos1;
      attribute vec3 aPos2;
      attribute vec3 aPos3;
      attribute float aPhase;
      attribute float aSize;

      uniform float uTime;
      uniform vec4 uWeights;
      uniform vec2 uPointer;

      varying float vAlpha;

      void main() {
        vec3 basePos = position * uWeights.x
          + aPos1 * uWeights.y
          + aPos2 * uWeights.z
          + aPos3 * uWeights.w;

        // Gentle organic curl drift
        basePos.x += sin(uTime * 0.42 + aPhase) * 0.36;
        basePos.y += cos(uTime * 0.35 + aPhase * 1.3) * 0.32;
        basePos.z += sin(uTime * 0.28 + aPhase * 0.7) * 0.28;

        // Cursor field deflection
        vec2 toPoint = basePos.xy - uPointer;
        float dist = length(toPoint);
        if (dist < 7.5 && dist > 0.001) {
          float push = (1.0 - dist / 7.5);
          vec2 dir = normalize(toPoint);
          basePos.xy += dir * push * 2.1;
          basePos.z += push * 1.2;
        }

        vec4 mvPosition = modelViewMatrix * vec4(basePos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = clamp(aSize * (28.0 / max(8.0, -mvPosition.z)), 1.5, 9.0);

        float shimmer = 0.58 + 0.42 * sin(uTime * 0.9 + aPhase);
        vAlpha = shimmer;
      }
    `,
    fragmentShader: `
      uniform float uDarkMix;
      uniform float uGlobalAlpha;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float disc = 1.0 - smoothstep(0.18, 0.5, d);
        vec3 ink = vec3(0.05, 0.05, 0.07);
        vec3 star = vec3(0.96, 0.97, 0.99);
        vec3 col = mix(ink, star, uDarkMix);
        float baseOp = mix(0.32, 0.44, uDarkMix);
        gl_FragColor = vec4(col, disc * vAlpha * baseOp * uGlobalAlpha);
      }
    `,
  })

  const cloudPoints = new THREE.Points(cloudGeo, cloudMat)
  scene.add(cloudPoints)

  // --- 2. Core Boids Anchors & Dynamic Synaptic Threads ---
  const anchorPositions = new Float32Array(ANCHOR_COUNT * 3)
  const anchorVelocities = new Float32Array(ANCHOR_COUNT * 3)
  const anchorSizes = new Float32Array(ANCHOR_COUNT)
  const anchorTargets: [number, number, number][][] = [0, 1, 2, 3].map((ch) =>
    Array.from({ length: ANCHOR_COUNT }, (_, idx) => computeFormationPoint(ch, idx, ANCHOR_COUNT, true)),
  )

  for (let i = 0; i < ANCHOR_COUNT; i++) {
    const p = anchorTargets[targetChapter][i]
    anchorPositions[i * 3] = p[0]
    anchorPositions[i * 3 + 1] = p[1]
    anchorPositions[i * 3 + 2] = p[2]
    anchorSizes[i] = (3.2 + (i % 3) * 0.7) * dpr
  }

  const anchorGeo = new THREE.BufferGeometry()
  const anchorPosAttr = new THREE.BufferAttribute(anchorPositions, 3)
  anchorPosAttr.setUsage(THREE.DynamicDrawUsage)
  anchorGeo.setAttribute('position', anchorPosAttr)
  anchorGeo.setAttribute('aSize', new THREE.BufferAttribute(anchorSizes, 1))

  const anchorMat = new THREE.ShaderMaterial({
    uniforms: {
      uDarkMix: cloudUniforms.uDarkMix,
      uGlobalAlpha: cloudUniforms.uGlobalAlpha,
    },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float aSize;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = clamp(aSize * (30.0 / max(8.0, -mvPosition.z)), 2.5, 11.0);
      }
    `,
    fragmentShader: `
      uniform float uDarkMix;
      uniform float uGlobalAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float core = 1.0 - smoothstep(0.14, 0.48, d);
        vec3 col = mix(vec3(0.05, 0.05, 0.07), vec3(0.98, 0.98, 1.0), uDarkMix);
        gl_FragColor = vec4(col, core * mix(0.55, 0.72, uDarkMix) * uGlobalAlpha);
      }
    `,
  })

  const anchorPoints = new THREE.Points(anchorGeo, anchorMat)
  scene.add(anchorPoints)

  // Synaptic LineSegments
  const linePositions = new Float32Array(MAX_SEGMENTS * 6)
  const lineAlphas = new Float32Array(MAX_SEGMENTS * 2)
  const lineGeo = new THREE.BufferGeometry()
  const linePosAttr = new THREE.BufferAttribute(linePositions, 3)
  const lineAlphaAttr = new THREE.BufferAttribute(lineAlphas, 1)
  linePosAttr.setUsage(THREE.DynamicDrawUsage)
  lineAlphaAttr.setUsage(THREE.DynamicDrawUsage)
  lineGeo.setAttribute('position', linePosAttr)
  lineGeo.setAttribute('aAlpha', lineAlphaAttr)
  lineGeo.setDrawRange(0, 0)

  const lineMat = new THREE.ShaderMaterial({
    uniforms: {
      uDarkMix: cloudUniforms.uDarkMix,
      uGlobalAlpha: cloudUniforms.uGlobalAlpha,
    },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float aAlpha;
      varying float vAlpha;
      void main() {
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uDarkMix;
      uniform float uGlobalAlpha;
      varying float vAlpha;
      void main() {
        vec3 col = mix(vec3(0.06, 0.06, 0.09), vec3(0.96, 0.97, 1.0), uDarkMix);
        gl_FragColor = vec4(col, vAlpha * mix(0.24, 0.34, uDarkMix) * uGlobalAlpha);
      }
    `,
  })

  const lineSegments = new THREE.LineSegments(lineGeo, lineMat)
  scene.add(lineSegments)

  // --- Pointer & State Tracking ---
  const pointerWorld = new THREE.Vector2(999, 999)
  const targetWeights = [0, 0, 0, 0]
  const currentWeights = [0, 0, 0, 0]
  currentWeights[targetChapter] = 1
  let currentDarkMix = targetDarkMix
  let currentGlobalAlpha = targetChapter === 3 ? 0.42 : 1.0
  let animTime = 0
  let rafId = 0
  let isPaused = document.hidden

  function onPointerMove(e: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    const halfH = Math.tan((55 * Math.PI) / 360) * camera.position.z
    const halfW = halfH * camera.aspect
    pointerWorld.set(ndcX * halfW, ndcY * halfH)
  }

  function onPointerLeave() {
    pointerWorld.set(999, 999)
  }

  function onResize() {
    if (!container) return
    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (reducedMotion) renderStep(0.016, true)
  }

  function onVisibilityChange() {
    isPaused = document.hidden
    if (!isPaused && !reducedMotion && !rafId) {
      lastTimestamp = performance.now()
      rafId = requestAnimationFrame(loop)
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)

  function renderStep(dt: number, snapImmediate = false) {
    animTime += dt
    cloudUniforms.uTime.value = animTime

    const lerpRate = snapImmediate ? 1.0 : Math.min(1, dt * 3.4)
    currentDarkMix += (targetDarkMix - currentDarkMix) * lerpRate
    cloudUniforms.uDarkMix.value = currentDarkMix

    const desiredAlpha = targetChapter === 3 ? 0.42 : 1.0
    currentGlobalAlpha += (desiredAlpha - currentGlobalAlpha) * lerpRate
    cloudUniforms.uGlobalAlpha.value = currentGlobalAlpha

    for (let c = 0; c < 4; c++) targetWeights[c] = c === targetChapter ? 1 : 0
    for (let c = 0; c < 4; c++) {
      currentWeights[c] += (targetWeights[c] - currentWeights[c]) * lerpRate
    }
    cloudUniforms.uWeights.value.set(
      currentWeights[0],
      currentWeights[1],
      currentWeights[2],
      currentWeights[3],
    )
    cloudUniforms.uPointer.value.lerp(pointerWorld, snapImmediate ? 1 : 0.12)

    // Slow celestial drift on container scene
    scene.rotation.y = Math.sin(animTime * 0.08) * 0.08
    scene.rotation.x = Math.cos(animTime * 0.06) * 0.04

    // Update anchor boid physics
    const reachThreshold = targetChapter === 2 ? 5.8 : targetChapter === 3 ? 4.8 : 4.4
    for (let i = 0; i < ANCHOR_COUNT; i++) {
      const i3 = i * 3
      let tx = 0
      let ty = 0
      let tz = 0
      for (let c = 0; c < 4; c++) {
        const w = currentWeights[c]
        if (w > 0.001) {
          tx += anchorTargets[c][i][0] * w
          ty += anchorTargets[c][i][1] * w
          tz += anchorTargets[c][i][2] * w
        }
      }
      if (!reducedMotion) {
        tx += Math.sin(animTime * 0.55 + i * 0.6) * 0.6
        ty += Math.cos(animTime * 0.48 + i * 0.4) * 0.5
        tz += Math.sin(animTime * 0.4 + i * 0.8) * 0.45
      }

      if (snapImmediate) {
        anchorPositions[i3] = tx
        anchorPositions[i3 + 1] = ty
        anchorPositions[i3 + 2] = tz
        anchorVelocities[i3] = 0
        anchorVelocities[i3 + 1] = 0
        anchorVelocities[i3 + 2] = 0
      } else {
        let fx = (tx - anchorPositions[i3]) * 0.045
        let fy = (ty - anchorPositions[i3 + 1]) * 0.045
        let fz = (tz - anchorPositions[i3 + 2]) * 0.045

        const dxP = anchorPositions[i3] - pointerWorld.x
        const dyP = anchorPositions[i3 + 1] - pointerWorld.y
        const distP = Math.hypot(dxP, dyP)
        if (distP < 6.5 && distP > 0.01) {
          const repel = (1 - distP / 6.5) * 0.16
          fx += (dxP / distP) * repel
          fy += (dyP / distP) * repel
        }

        anchorVelocities[i3] = (anchorVelocities[i3] + fx) * 0.84
        anchorVelocities[i3 + 1] = (anchorVelocities[i3 + 1] + fy) * 0.84
        anchorVelocities[i3 + 2] = (anchorVelocities[i3 + 2] + fz) * 0.84

        anchorPositions[i3] += anchorVelocities[i3]
        anchorPositions[i3 + 1] += anchorVelocities[i3 + 1]
        anchorPositions[i3 + 2] += anchorVelocities[i3 + 2]
      }
    }
    anchorPosAttr.needsUpdate = true

    // Connect proximal anchor agents with distance-faded synaptic filaments
    let segCount = 0
    for (let i = 0; i < ANCHOR_COUNT && segCount < MAX_SEGMENTS; i++) {
      const i3 = i * 3
      const ax = anchorPositions[i3]
      const ay = anchorPositions[i3 + 1]
      const az = anchorPositions[i3 + 2]

      for (let j = i + 1; j < ANCHOR_COUNT && segCount < MAX_SEGMENTS; j++) {
        const j3 = j * 3
        const dx = anchorPositions[j3] - ax
        const dy = anchorPositions[j3 + 1] - ay
        const dz = anchorPositions[j3 + 2] - az
        const dSq = dx * dx + dy * dy + dz * dz
        if (dSq < reachThreshold * reachThreshold) {
          const d = Math.sqrt(dSq)
          const alpha = Math.max(0, 1 - d / reachThreshold)
          const s6 = segCount * 6
          const s2 = segCount * 2
          linePositions[s6] = ax
          linePositions[s6 + 1] = ay
          linePositions[s6 + 2] = az
          linePositions[s6 + 3] = anchorPositions[j3]
          linePositions[s6 + 4] = anchorPositions[j3 + 1]
          linePositions[s6 + 5] = anchorPositions[j3 + 2]
          lineAlphas[s2] = alpha
          lineAlphas[s2 + 1] = alpha
          segCount++
        }
      }
    }
    linePosAttr.needsUpdate = true
    lineAlphaAttr.needsUpdate = true
    lineGeo.setDrawRange(0, segCount * 2)

    renderer.render(scene, camera)
  }

  requestStaticRender = () => {
    if (reducedMotion) renderStep(0, true)
  }

  let lastTimestamp = performance.now()
  function loop(now: number) {
    if (isPaused) {
      rafId = 0
      return
    }
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTimestamp) / 1000))
    lastTimestamp = now
    renderStep(dt, false)
    rafId = requestAnimationFrame(loop)
  }

  if (reducedMotion) {
    renderStep(0, true)
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
    cloudGeo.dispose()
    cloudMat.dispose()
    anchorGeo.dispose()
    anchorMat.dispose()
    lineGeo.dispose()
    lineMat.dispose()
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
