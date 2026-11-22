<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Download, Play } from '@lucide/vue'
import CopyCommand from '@/components/CopyCommand.vue'
import HeroSpatialStage from '@/stages/HeroSpatialStage.vue'
import BentoCapabilities from '@/stages/BentoCapabilities.vue'
import EcosystemMatrix from '@/stages/EcosystemMatrix.vue'
import ArchitectureTopology from '@/stages/ArchitectureTopology.vue'
import QuickStartBand from '@/stages/QuickStartBand.vue'
import OpenSourceBand from '@/stages/OpenSourceBand.vue'
import { openFilmDialog } from '@/composables/useFilmModal'

const { t, tm } = useI18n()

const metrics = computed(() => {
  const raw = tm('metrics') as { value: unknown; label: unknown; detail: unknown }[]
  return Array.isArray(raw)
    ? raw.map((m) => ({ value: String(m.value), label: String(m.label), detail: String(m.detail) }))
    : []
})
</script>

<template>
  <div>
    <!-- Band 1: Antigravity × Codex × AffectUI Monochrome Hero + Spatial Stage -->
    <section class="hero-atmosphere relative overflow-hidden pt-14 pb-20 sm:pt-22 sm:pb-28">
      <!-- Subtle ObsidianUI-style concentric orbital hairlines -->
      <div aria-hidden="true" class="pointer-events-none absolute top-[-120px] left-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-[var(--border-default)] opacity-45" />
      <div aria-hidden="true" class="pointer-events-none absolute top-[-220px] left-1/2 -z-10 h-[860px] w-[860px] -translate-x-1/2 rounded-full border border-[var(--border-default)] opacity-30" />
      <div class="grain-overlay pointer-events-none absolute inset-0 -z-10 opacity-35" aria-hidden="true" />

      <div class="frame-width relative px-2 sm:px-6">
        <!-- AffectUI-inspired subtle flanking ambient agent cards (desktop XL only) -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute top-14 left-4 hidden w-56 -rotate-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/75 p-3.5 opacity-60 shadow-sm backdrop-blur-sm xl:block"
        >
          <div class="flex items-center justify-between text-[10px]">
            <span class="mono font-semibold text-[var(--text-muted)]">{{ t('hero.floatLeftTitle') }}</span>
            <span class="h-1.5 w-1.5 rounded-full bg-[var(--accent-success)]" />
          </div>
          <div class="mono mt-2 text-xs font-medium text-[var(--text-primary)]">{{ t('hero.floatLeftStatus') }}</div>
        </div>

        <div
          aria-hidden="true"
          class="pointer-events-none absolute top-16 right-4 hidden w-56 rotate-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/75 p-3.5 opacity-60 shadow-sm backdrop-blur-sm xl:block"
        >
          <div class="flex items-center justify-between text-[10px]">
            <span class="mono font-semibold text-[var(--text-muted)]">{{ t('hero.floatRightTitle') }}</span>
            <span class="h-1.5 w-1.5 rounded-full bg-[var(--accent-warning)]" />
          </div>
          <div class="mono mt-2 text-xs font-medium text-[var(--text-primary)]">{{ t('hero.floatRightStatus') }}</div>
        </div>

        <div class="mx-auto flex max-w-4xl flex-col items-center text-center">
          <!-- Floating Announcement Pill -->
          <router-link
            to="/download/"
            class="hero-reveal inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/90 px-3 py-1 text-xs shadow-xs backdrop-blur-md transition-colors hover:border-[var(--border-strong)]"
            style="--reveal-delay: 40ms"
          >
            <span class="mono rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary-foreground)]">
              {{ t('hero.badgeTag') }}
            </span>
            <span class="max-w-[210px] truncate text-[var(--text-secondary)] sm:max-w-none">
              {{ t('hero.badgeText') }}
            </span>
            <ArrowRight class="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          </router-link>

          <!-- AICSS / Attio Two-Tone Monochrome Display Headline -->
          <h1
            class="display-hero hero-reveal mt-7 text-[1.95rem] text-balance sm:text-[3.35rem] lg:text-[4rem]"
            style="--reveal-delay: 110ms"
          >
            <span class="block text-[var(--text-primary)]">{{ t('hero.titleLine1') }}</span>
            <span class="mt-1 block text-[var(--text-muted)]">{{ t('hero.titleLine2') }}</span>
          </h1>

          <!-- Subtitle -->
          <p
            class="hero-reveal mt-5 max-w-2xl text-[15px] leading-relaxed text-pretty text-[var(--text-secondary)] sm:text-[17px]"
            style="--reveal-delay: 180ms"
          >
            {{ t('hero.subtitle') }}
          </p>

          <!-- Action Cluster -->
          <div
            class="hero-reveal mt-8 flex flex-wrap items-center justify-center gap-3"
            style="--reveal-delay: 240ms"
          >
            <router-link
              to="/download/"
              class="btn-primary inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <Download class="h-4 w-4" aria-hidden="true" />
              <span>{{ t('hero.ctaDownload') }}</span>
            </router-link>

            <button
              type="button"
              class="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/90 px-5 text-sm font-medium text-[var(--text-primary)] backdrop-blur-md transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
              @click="openFilmDialog"
            >
              <Play class="h-3.5 w-3.5 text-[var(--text-primary)]" aria-hidden="true" />
              <span>{{ t('hero.ctaFilm') }}</span>
            </button>
          </div>

          <!-- Feel-style CLI Pill -->
          <div class="hero-reveal mt-5 flex flex-col items-center gap-1.5" style="--reveal-delay: 300ms">
            <CopyCommand command="dotnet add package TinadecCore.Runtime" compact />
          </div>
        </div>

        <!-- Centerpiece Interactive Spatial Stage -->
        <div id="workbench" class="hero-reveal mt-12 scroll-mt-20 sm:mt-16" style="--reveal-delay: 360ms">
          <HeroSpatialStage />
        </div>
      </div>
    </section>

    <!-- Band 2: Architectural Metrics Strip -->
    <section class="border-t-hairline bg-[var(--bg-secondary)]/45">
      <ul class="frame-width grid grid-cols-2 divide-y divide-[var(--border-default)] lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        <li
          v-for="m in metrics"
          :key="m.label"
          class="flex min-w-0 flex-col justify-between px-4 py-7 odd:border-r odd:border-[var(--border-default)] lg:odd:border-r-0 sm:px-7 sm:py-9"
        >
          <span class="mono text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {{ m.value }}
          </span>
          <div class="mt-3">
            <div class="text-sm font-semibold">{{ m.label }}</div>
            <p class="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{{ m.detail }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Band 2.5: Attio-inspired Two-Tone Architectural Statement -->
    <section class="border-t-hairline py-16 sm:py-20">
      <div class="frame-width px-2 sm:px-6">
        <div class="max-w-4xl">
          <span class="mono inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            {{ t('statement.eyebrow') }}
          </span>
          <p class="display-section mt-5 text-2xl leading-[1.3] sm:text-3xl lg:text-[2.25rem]">
            <span class="text-[var(--text-primary)]">{{ t('statement.lead') }}</span>
            <span class="text-[var(--text-muted)]"> {{ t('statement.body') }}</span>
          </p>
        </div>
      </div>
    </section>

    <!-- Band 3: Bento Capabilities -->
    <BentoCapabilities />

    <!-- Band 4: Ecosystem & Sibling Workbenches -->
    <EcosystemMatrix />

    <!-- Band 5: Architecture & Boundaries -->
    <ArchitectureTopology />

    <!-- Band 6: Quick Start -->
    <QuickStartBand />

    <!-- Band 7: Open Source & Brand CTA -->
    <OpenSourceBand />
  </div>
</template>
