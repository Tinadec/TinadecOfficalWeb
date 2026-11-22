<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, ArrowUpRight, Download } from '@lucide/vue'
import { PRODUCTS, productPath } from '@/data/products'

const { t } = useI18n()

const platformProducts = computed(() => PRODUCTS.filter((p) => p.category === 'platform'))
const workbenchProducts = computed(() => PRODUCTS.filter((p) => p.category === 'workbench'))
</script>

<template>
  <section class="border-t-hairline py-20 sm:py-24">
    <div class="frame-width px-2 sm:px-6">
      <div class="max-w-2xl">
        <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {{ t('ecosystem.eyebrow') }}
        </p>
        <h2 class="display-section mt-3 text-3xl text-balance sm:text-[2.5rem]">
          {{ t('ecosystem.title') }}
        </h2>
        <p class="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {{ t('ecosystem.subtitle') }}
        </p>
      </div>

      <!-- Core Platform 4-Part Stack -->
      <div class="mt-12">
        <div class="flex flex-wrap items-baseline justify-between gap-2 pb-4">
          <h3 class="text-sm font-semibold tracking-tight">{{ t('ecosystem.platformTitle') }}</h3>
          <p class="text-xs text-[var(--text-muted)]">{{ t('ecosystem.platformSubtitle') }}</p>
        </div>

        <div class="grid overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--border-default)] gap-[var(--hairline)] md:grid-cols-2">
          <article
            v-for="item in platformProducts"
            :key="item.slug"
            class="group flex min-w-0 flex-col justify-between bg-[var(--bg-secondary)] p-6 transition-colors hover:bg-[var(--bg-elevated)] sm:p-7"
          >
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-brand)]">
                    <component :is="item.icon" class="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 class="text-base font-semibold tracking-tight">{{ t(`${item.i18nKey}.name`) }}</h4>
                    <p class="text-xs text-[var(--text-muted)]">{{ t(`${item.i18nKey}.tagline`) }}</p>
                  </div>
                </div>
                <span class="mono rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)]">
                  {{ t(`${item.i18nKey}.license`) }}
                </span>
              </div>

              <p class="mt-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {{ t(`${item.i18nKey}.lead`) }}
              </p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <span
                  v-for="plat in item.platforms"
                  :key="plat"
                  class="mono rounded-md border border-[var(--border-muted)] bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]"
                >
                  {{ plat }}
                </span>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-3 border-t-hairline pt-4 text-xs">
              <router-link
                :to="productPath(item)"
                class="inline-flex items-center gap-1.5 font-medium text-[var(--text-brand)] hover:underline"
              >
                <span>{{ t('ecosystem.inspectDetail') }}</span>
                <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
              </router-link>
              <a
                :href="item.repoUrl"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <span>{{ t('ecosystem.repoLink') }}</span>
                <ArrowUpRight class="h-3 w-3" aria-hidden="true" />
              </a>
              <a
                v-if="item.releaseUrl"
                :href="item.releaseUrl"
                target="_blank"
                rel="noreferrer"
                class="btn-primary ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[11px] font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                <Download class="h-3 w-3" aria-hidden="true" />
                <span>{{ t(`${item.i18nKey}.version`) }}</span>
              </a>
            </div>
          </article>
        </div>
      </div>

      <!-- Sibling Workbenches -->
      <div class="mt-12">
        <div class="flex flex-wrap items-baseline justify-between gap-2 pb-4">
          <h3 class="text-sm font-semibold tracking-tight">{{ t('ecosystem.workbenchTitle') }}</h3>
          <p class="text-xs text-[var(--text-muted)]">{{ t('ecosystem.workbenchSubtitle') }}</p>
        </div>

        <div class="grid overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--border-default)] gap-[var(--hairline)] md:grid-cols-2">
          <article
            v-for="item in workbenchProducts"
            :key="item.slug"
            class="group flex min-w-0 flex-col justify-between bg-[var(--bg-secondary)] p-6 transition-colors hover:bg-[var(--bg-elevated)] sm:p-7"
          >
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--brand-soft)] text-[var(--text-brand)]">
                    <component :is="item.icon" class="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 class="text-base font-semibold tracking-tight">{{ t(`${item.i18nKey}.name`) }}</h4>
                    <p class="text-xs text-[var(--text-muted)]">{{ t(`${item.i18nKey}.tagline`) }}</p>
                  </div>
                </div>
                <span class="mono rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-0.5 text-[11px] text-[var(--text-brand)]">
                  {{ t(`${item.i18nKey}.version`) }}
                </span>
              </div>

              <p class="mt-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {{ t(`${item.i18nKey}.lead`) }}
              </p>

              <div class="mt-4 flex flex-wrap items-center gap-1.5">
                <span class="mono rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                  {{ t(`${item.i18nKey}.stack`) }}
                </span>
                <span
                  v-for="plat in item.platforms"
                  :key="plat"
                  class="mono rounded-md border border-[var(--border-muted)] bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]"
                >
                  {{ plat }}
                </span>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-3 border-t-hairline pt-4 text-xs">
              <router-link
                :to="productPath(item)"
                class="inline-flex items-center gap-1.5 font-medium text-[var(--text-brand)] hover:underline"
              >
                <span>{{ t('ecosystem.inspectDetail') }}</span>
                <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
              </router-link>
              <a
                :href="item.repoUrl"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <span>{{ t('ecosystem.repoLink') }}</span>
                <ArrowUpRight class="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
