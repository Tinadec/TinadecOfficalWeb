<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Play, Sparkles } from '@lucide/vue'
import ManifestoChoreography from '@/stages/ManifestoChoreography.vue'
import HtmlInCanvasStage from '@/stages/HtmlInCanvasStage.vue'
import CuratedWorksGallery from '@/stages/CuratedWorksGallery.vue'
import EthosClosingBand from '@/stages/EthosClosingBand.vue'
import { openFilmDialog } from '@/composables/useFilmModal'

// The swarm backdrop pulls in three.js (~500 kB). Loading it asynchronously
// keeps it off the critical path: the hero paints first and the backdrop
// arrives as a separate chunk, still tree-shaken because three stays a
// static import inside SwarmBackdrop.
const SwarmBackdrop = defineAsyncComponent(() => import('@/components/SwarmBackdrop.vue'))

const { t } = useI18n()

const activeChapter = ref(0)
const heroSectionRef = ref<HTMLElement | null>(null)
const lowerSectionRef = ref<HTMLElement | null>(null)

function enterSpatialStage() {
  const target = document.getElementById('spatial-stage')
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        if (entry.target === heroSectionRef.value) {
          activeChapter.value = 0
        } else if (entry.target === lowerSectionRef.value) {
          activeChapter.value = 3
        }
      }
    },
    { threshold: 0.25 },
  )
  if (heroSectionRef.value) observer.observe(heroSectionRef.value)
  if (lowerSectionRef.value) observer.observe(lowerSectionRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="relative">
    <!-- Persistent Three.js Swarm Field morphing across scroll chapters -->
    <SwarmBackdrop :chapter="activeChapter" />

    <div class="relative z-10">
      <!-- Act I · Emergence (Pure Spatial Hero Sanctuary) -->
      <section
        ref="heroSectionRef"
        class="relative flex min-h-[82vh] flex-col items-center justify-center overflow-hidden px-3 pt-16 pb-20 sm:px-8 sm:pt-20 sm:pb-24"
      >
        <div class="grain-overlay pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />

        <div class="frame-width relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <!-- Quiet Eyebrow Pill -->
          <div
            class="hero-reveal inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/85 px-3.5 py-1 text-xs backdrop-blur-md"
            style="--reveal-delay: 40ms"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-[var(--text-primary)]" aria-hidden="true" />
            <span class="mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {{ t('hero.eyebrow') }}
            </span>
          </div>

          <!-- Two-Tone Symmetric Poetic Headline -->
          <h1
            class="display-hero hero-reveal mt-8 text-[2rem] text-balance sm:text-[3.5rem] lg:text-[4.25rem]"
            style="--reveal-delay: 110ms"
          >
            <span class="block text-[var(--text-primary)]">{{ t('hero.titleLine1') }}</span>
            <span class="mt-1.5 block text-[var(--text-muted)]">{{ t('hero.titleLine2') }}</span>
          </h1>

          <!-- Concise Poetic Statement -->
          <p
            class="hero-reveal mt-6 max-w-2xl text-[15px] leading-[1.8] text-pretty text-[var(--text-secondary)] sm:text-[17px]"
            style="--reveal-delay: 180ms"
          >
            {{ t('hero.subtitle') }}
          </p>

          <!-- Pure Action Pair (No CLI clutter) -->
          <div
            class="hero-reveal mt-10 flex flex-wrap items-center justify-center gap-3.5"
            style="--reveal-delay: 240ms"
          >
            <button
              type="button"
              class="btn-primary inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90"
              @click="enterSpatialStage"
            >
              <Sparkles class="h-4 w-4" aria-hidden="true" />
              <span>{{ t('hero.ctaEnter') }}</span>
            </button>

            <button
              type="button"
              class="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/85 px-5 text-sm font-medium text-[var(--text-primary)] backdrop-blur-md transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
              @click="openFilmDialog"
            >
              <Play class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ t('hero.ctaFilm') }}</span>
            </button>
          </div>
        </div>

        <!-- Subtle Hairline Scroll Indicator -->
        <a
          href="#philosophy"
          class="hero-reveal mt-16 inline-flex flex-col items-center gap-2 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] sm:mt-20"
          style="--reveal-delay: 320ms"
        >
          <span class="mono uppercase tracking-[0.18em]">{{ t('hero.scrollCue') }}</span>
          <ArrowDown class="h-3.5 w-3.5 animate-bounce" aria-hidden="true" />
        </a>
      </section>

      <!-- Act II · Manifesto Choreography -->
      <ManifestoChoreography @chapter-change="(ch) => (activeChapter = ch)" />

      <!-- Acts III, IV, V · Stage, Curated Works & Ethos (Horizon Swarm Backdrop) -->
      <div ref="lowerSectionRef">
        <HtmlInCanvasStage />
        <CuratedWorksGallery />
        <EthosClosingBand />
      </div>
    </div>
  </div>
</template>
