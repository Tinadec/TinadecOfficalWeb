<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ArchitectureTopology from '@/stages/ArchitectureTopology.vue'
import HeroSpatialStage from '@/stages/HeroSpatialStage.vue'
import QuickStartBand from '@/stages/QuickStartBand.vue'

const { t } = useI18n()
</script>

<template>
  <div>
    <section class="hero-atmosphere border-b-hairline pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div class="frame-width px-2 sm:px-6">
        <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {{ t('architecture.eyebrow') }}
        </p>
        <h1 class="display-section mt-3 max-w-3xl text-3xl text-balance sm:text-5xl">
          {{ t('architecture.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {{ t('architecture.subtitle') }}
        </p>
      </div>
    </section>

    <ArchitectureTopology />

    <section class="border-t-hairline py-16 sm:py-20">
      <div class="frame-width px-2 sm:px-6">
        <HeroSpatialStage />
      </div>
    </section>

    <QuickStartBand />
  </div>
</template>
