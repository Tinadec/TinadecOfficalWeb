<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, ArrowUpRight, Download } from '@lucide/vue'
import { COMMUNITY_LINKS } from '@/data/products'

interface ChannelItem {
  label: string
  value: string
  href: string
}

const { t, tm } = useI18n()

const channels = computed<ChannelItem[]>(() => {
  const raw = tm('ethos.channels') as Record<string, unknown>[]
  return Array.isArray(raw)
    ? raw.map((c) => ({
        label: String(c.label ?? ''),
        value: String(c.value ?? ''),
        href: String(c.href ?? ''),
      }))
    : []
})
</script>

<template>
  <section class="border-t-hairline py-24 sm:py-32">
    <div class="frame-width px-3 sm:px-8">
      <!-- Sculptural Closing Vessel -->
      <div class="relative overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-secondary)]/85 p-2 backdrop-blur-md">
        <span aria-hidden="true" class="crosshair-mark absolute top-4 left-4 hidden sm:block" />
        <span aria-hidden="true" class="crosshair-mark absolute right-4 bottom-4 hidden sm:block" />

        <div class="relative isolate grid overflow-hidden rounded-[22px] border border-[var(--border-default)] bg-[var(--bg-elevated)] lg:grid-cols-[1.3fr_0.7fr]">
          <div class="relative z-10 min-w-0 p-7 sm:p-14">
            <p class="mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {{ t('ethos.eyebrow') }}
            </p>
            <h2 class="display-section mt-4 max-w-xl text-2xl text-balance sm:text-4xl">
              {{ t('ethos.title') }}
            </h2>
            <p class="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              {{ t('ethos.body') }}
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <router-link
                to="/download/"
                class="btn-primary inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90"
              >
                <Download class="h-4 w-4" aria-hidden="true" />
                <span>{{ t('ethos.ctaDownload') }}</span>
              </router-link>
              <a
                :href="COMMUNITY_LINKS.officeRepo"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
              >
                <span>{{ t('ethos.ctaGithub') }}</span>
                <ArrowRight class="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <!-- Serene Architectural Orbital Panel -->
          <div aria-hidden="true" class="relative hidden overflow-hidden border-l-hairline bg-[var(--bg-secondary)] lg:block">
            <div class="spatial-dots absolute inset-0 opacity-65" />
            <svg viewBox="0 0 280 280" class="absolute inset-0 h-full w-full text-[var(--text-primary)]">
              <circle cx="140" cy="140" r="96" fill="none" stroke="currentColor" stroke-opacity="0.1" />
              <circle cx="140" cy="140" r="64" fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-dasharray="3 5" />
              <circle cx="140" cy="140" r="32" fill="none" stroke="currentColor" stroke-opacity="0.24" />
              <circle cx="140" cy="140" r="4" fill="currentColor" fill-opacity="0.65" />
            </svg>
            <svg viewBox="0 0 453.04 350" class="absolute right-7 bottom-7 h-20 w-20 text-[var(--text-primary)] opacity-[0.07]" fill="currentColor">
              <path d="M0,152.01929L0,231.13193C0,267.12656,23.88369,298.75122,58.504963,308.59903L182.44873,343.85413C211.25745,352.04858,241.78033,352.04858,270.58905,343.85413L394.53281,308.59903C429.15408,298.75122,453.03775,267.12656,453.03775,231.13193L453.03775,152.01929C453.03775,131.48445,440.98279,113.76516,423.5636,105.55234L394.22815,35.020775C385.58447,14.237647,359.06622,0.0035646637,328.98392,0L317.35669,0C304.81461,0,294.64725,7.3336515,294.64725,16.380161C294.64725,25.426661,304.81461,32.760319,317.35669,32.760319L328.98392,32.760319C339.01624,32.759811,347.86035,37.507561,350.73959,44.439369L374.11868,100.67502L78.907547,100.67502L102.29823,44.439369C105.17747,37.507561,114.02158,32.759811,124.05387,32.760319L135.68109,32.760319C148.22321,32.760319,158.39055,25.426661,158.39055,16.380161C158.39055,7.3336515,148.22321,0,135.68109,0L124.05387,0C93.971581,0.0035561048,67.45327,14.237639,58.809616,35.020775L29.474157,105.55235C12.054992,113.76519,0,131.48445,0,152.01929Z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Quiet Minimal Community Strip -->
      <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <component
          :is="c.href ? 'a' : 'div'"
          v-for="c in channels"
          :key="c.label"
          :href="c.href || undefined"
          :target="c.href ? '_blank' : undefined"
          :rel="c.href ? 'noreferrer' : undefined"
          class="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/75 px-4 py-3.5 transition-colors"
          :class="c.href ? 'hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]' : ''"
        >
          <div class="min-w-0">
            <div class="text-xs font-semibold text-[var(--text-primary)]">{{ c.label }}</div>
            <div class="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{{ c.value }}</div>
          </div>
          <ArrowUpRight v-if="c.href" class="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
        </component>
      </div>
    </div>
  </section>
</template>
