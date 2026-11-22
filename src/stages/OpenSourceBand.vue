<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, ArrowUpRight, Download, Scale, Users } from '@lucide/vue'
import { COMMUNITY_LINKS } from '@/data/products'

const { t, tm } = useI18n()

const licenses = computed(() => {
  const raw = tm('opensource.licenses') as { name: unknown; scope: unknown; license: unknown }[]
  return Array.isArray(raw)
    ? raw.map((r) => ({ name: String(r.name), scope: String(r.scope), license: String(r.license) }))
    : []
})

const communityItems = computed(() => {
  const raw = tm('opensource.communityItems') as { label: unknown; value: unknown; href: unknown }[]
  return Array.isArray(raw)
    ? raw.map((r) => ({ label: String(r.label), value: String(r.value), href: String(r.href) }))
    : []
})
</script>

<template>
  <section class="border-t-hairline py-20 sm:py-24">
    <div class="frame-width px-2 sm:px-6">
      <!-- License + Community Dual Grid -->
      <div class="grid gap-5 lg:grid-cols-2">
        <div class="min-w-0 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 sm:p-8">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <Scale class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('opensource.licenseTitle') }}</span>
          </div>
          <ul class="mt-5 divide-y divide-[var(--border-muted)]">
            <li v-for="row in licenses" :key="row.name" class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div class="min-w-0">
                <div class="text-sm font-semibold">{{ row.name }}</div>
                <div class="truncate text-xs text-[var(--text-muted)]">{{ row.scope }}</div>
              </div>
              <span class="mono shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-primary)]">
                {{ row.license }}
              </span>
            </li>
          </ul>
        </div>

        <div class="min-w-0 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 sm:p-8">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <Users class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('opensource.communityTitle') }}</span>
          </div>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <component
              :is="c.href ? 'a' : 'div'"
              v-for="c in communityItems"
              :key="c.label"
              :href="c.href || undefined"
              :target="c.href ? '_blank' : undefined"
              :rel="c.href ? 'noreferrer' : undefined"
              class="flex flex-col justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4 transition-colors"
              :class="c.href ? 'hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]' : ''"
            >
              <div class="flex items-center justify-between text-xs font-semibold">
                <span>{{ c.label }}</span>
                <ArrowUpRight v-if="c.href" class="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              </div>
              <div class="mono mt-2 text-xs text-[var(--text-secondary)]">{{ c.value }}</div>
            </component>
          </div>
        </div>
      </div>

      <!-- Framed Closing Brand CTA (HextaUI/Antigravity structural grid banner) -->
      <div class="relative mt-10 overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-2">
        <div class="relative isolate grid overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] sm:grid-cols-[1.35fr_0.65fr]">
          <div class="relative z-10 min-w-0 p-7 sm:p-12">
            <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {{ t('opensource.eyebrow') }}
            </p>
            <h2 class="display-section mt-3 max-w-xl text-2xl text-balance sm:text-4xl">
              {{ t('opensource.title') }}
            </h2>
            <p class="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              {{ t('opensource.subtitle') }}
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              <router-link
                to="/download/"
                class="btn-primary inline-flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
              >
                <Download class="h-4 w-4" aria-hidden="true" />
                <span>{{ t('opensource.ctaDownload') }}</span>
              </router-link>
              <a
                :href="COMMUNITY_LINKS.officeRepo"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
              >
                <span>{{ t('opensource.ctaGithub') }}</span>
                <ArrowRight class="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <!-- Architectural Grid Ornament Panel -->
          <div aria-hidden="true" class="relative hidden overflow-hidden border-l-hairline bg-[var(--bg-secondary)] sm:block">
            <div class="spatial-dots absolute inset-0 opacity-75" />
            <div
              class="absolute inset-0"
              style="background: radial-gradient(circle at 60% 45%, var(--glow-a), transparent 70%)"
            />
            <span class="absolute inset-x-0 top-1/3 h-px bg-[var(--border-default)]" />
            <span class="absolute inset-x-0 top-2/3 h-px bg-[var(--border-default)]" />
            <span class="absolute inset-y-0 left-1/3 w-px bg-[var(--border-default)]" />
            <span class="absolute inset-y-0 left-2/3 w-px bg-[var(--border-default)]" />
            <svg viewBox="0 0 453.04 350" class="absolute right-6 bottom-6 h-24 w-24 text-[var(--text-primary)] opacity-[0.08]" fill="currentColor">
              <path d="M0,152.01929L0,231.13193C0,267.12656,23.88369,298.75122,58.504963,308.59903L182.44873,343.85413C211.25745,352.04858,241.78033,352.04858,270.58905,343.85413L394.53281,308.59903C429.15408,298.75122,453.03775,267.12656,453.03775,231.13193L453.03775,152.01929C453.03775,131.48445,440.98279,113.76516,423.5636,105.55234L394.22815,35.020775C385.58447,14.237647,359.06622,0.0035646637,328.98392,0L317.35669,0C304.81461,0,294.64725,7.3336515,294.64725,16.380161C294.64725,25.426661,304.81461,32.760319,317.35669,32.760319L328.98392,32.760319C339.01624,32.759811,347.86035,37.507561,350.73959,44.439369L374.11868,100.67502L78.907547,100.67502L102.29823,44.439369C105.17747,37.507561,114.02158,32.759811,124.05387,32.760319L135.68109,32.760319C148.22321,32.760319,158.39055,25.426661,158.39055,16.380161C158.39055,7.3336515,148.22321,0,135.68109,0L124.05387,0C93.971581,0.0035561048,67.45327,14.237639,58.809616,35.020775L29.474157,105.55235C12.054992,113.76519,0,131.48445,0,152.01929Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
