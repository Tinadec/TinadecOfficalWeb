<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, Download, Monitor, Package } from '@lucide/vue'
import QuickStartBand from '@/stages/QuickStartBand.vue'
import { COMMUNITY_LINKS } from '@/data/products'

const { t, tm } = useI18n()

const platforms = computed(() => {
  const raw = tm('downloadPage.officePlatforms') as { os: unknown; note: unknown }[]
  return Array.isArray(raw) ? raw.map((p) => ({ os: String(p.os), note: String(p.note) })) : []
})

const prereqs = computed(() => {
  const raw = tm('downloadPage.prereqs') as { tool: unknown; purpose: unknown }[]
  return Array.isArray(raw) ? raw.map((p) => ({ tool: String(p.tool), purpose: String(p.purpose) })) : []
})
</script>

<template>
  <div>
    <section class="hero-atmosphere border-b-hairline pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div class="frame-width px-2 sm:px-6">
        <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {{ t('downloadPage.eyebrow') }}
        </p>
        <h1 class="display-section mt-3 max-w-3xl text-3xl text-balance sm:text-5xl">
          {{ t('downloadPage.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {{ t('downloadPage.subtitle') }}
        </p>
      </div>
    </section>

    <section class="py-14 sm:py-20">
      <div class="frame-width px-2 sm:px-6">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Binary Releases -->
          <div class="flex min-w-0 flex-col justify-between rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 sm:p-8">
            <div>
              <div class="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <Monitor class="h-4 w-4" aria-hidden="true" />
                <span>TinadecOffice · v0.4.1</span>
              </div>
              <h2 class="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{{ t('downloadPage.officeCardTitle') }}</h2>
              <p class="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {{ t('downloadPage.officeCardDesc') }}
              </p>

              <ul class="mt-6 space-y-2.5">
                <li
                  v-for="plat in platforms"
                  :key="plat.os"
                  class="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-3 text-xs"
                >
                  <span class="font-semibold">{{ plat.os }}</span>
                  <span class="mono text-[var(--text-muted)]">{{ plat.note }}</span>
                </li>
              </ul>
            </div>

            <div class="mt-7 flex flex-wrap items-center gap-3">
              <a
                :href="COMMUNITY_LINKS.officeReleases"
                target="_blank"
                rel="noreferrer"
                class="btn-primary inline-flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                <Download class="h-4 w-4" aria-hidden="true" />
                <span>{{ t('downloadPage.goReleases') }}</span>
                <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <!-- Source / SDK Prerequisites -->
          <div class="flex min-w-0 flex-col justify-between rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 sm:p-8">
            <div>
              <div class="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <Package class="h-4 w-4" aria-hidden="true" />
                <span>SDK & Toolchain</span>
              </div>
              <h2 class="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{{ t('downloadPage.prereqTitle') }}</h2>

              <ul class="mt-6 space-y-2.5">
                <li
                  v-for="item in prereqs"
                  :key="item.tool"
                  class="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4"
                >
                  <div class="mono text-xs font-semibold text-[var(--text-brand)]">{{ item.tool }}</div>
                  <div class="mt-1 text-xs text-[var(--text-secondary)]">{{ item.purpose }}</div>
                </li>
              </ul>
            </div>

            <div class="mt-7 flex flex-wrap gap-3">
              <a
                :href="COMMUNITY_LINKS.coreRepo"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 text-xs font-medium hover:border-[var(--border-strong)]"
              >
                <span>GitHub · TinadecCore (MIT)</span>
                <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                :href="COMMUNITY_LINKS.tinaclassRepo"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 text-xs font-medium hover:border-[var(--border-strong)]"
              >
                <span>GitHub · TinaClass</span>
                <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                :href="COMMUNITY_LINKS.bandRepo"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 text-xs font-medium hover:border-[var(--border-strong)]"
              >
                <span>GitHub · TinadecBand</span>
                <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <QuickStartBand />
  </div>
</template>
