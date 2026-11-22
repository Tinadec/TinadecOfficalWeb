<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, ArrowUpRight, Download } from '@lucide/vue'
import CopyCommand from '@/components/CopyCommand.vue'
import { PRODUCTS, productPath, type ProductCategory } from '@/data/products'

const { t } = useI18n()

const filter = ref<'all' | ProductCategory>('all')

const filtered = computed(() =>
  filter.value === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter.value),
)
</script>

<template>
  <div>
    <section class="hero-atmosphere border-b-hairline pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div class="frame-width px-2 sm:px-6">
        <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {{ t('productsPage.eyebrow') }}
        </p>
        <h1 class="display-section mt-3 max-w-3xl text-3xl text-balance sm:text-5xl">
          {{ t('productsPage.title') }}
        </h1>
        <p class="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {{ t('productsPage.subtitle') }}
        </p>

        <!-- Category Filters -->
        <div class="mt-8 inline-flex flex-wrap gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] p-1">
          <button
            type="button"
            class="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
            :class="filter === 'all' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
            @click="filter = 'all'"
          >
            {{ t('productsPage.filterAll') }}
          </button>
          <button
            type="button"
            class="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
            :class="filter === 'platform' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
            @click="filter = 'platform'"
          >
            {{ t('productsPage.filterPlatform') }}
          </button>
          <button
            type="button"
            class="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
            :class="filter === 'workbench' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
            @click="filter = 'workbench'"
          >
            {{ t('productsPage.filterWorkbench') }}
          </button>
        </div>
      </div>
    </section>

    <section class="py-14 sm:py-20">
      <div class="frame-width px-2 sm:px-6">
        <div class="grid gap-5 md:grid-cols-2">
          <article
            v-for="item in filtered"
            :key="item.slug"
            class="flex min-w-0 flex-col justify-between rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 transition-colors hover:bg-[var(--bg-elevated)] sm:p-7"
          >
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)]">
                    <component :is="item.icon" class="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span class="mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {{ item.category === 'platform' ? t('ecosystem.badgePlatform') : t('ecosystem.badgeWorkbench') }}
                    </span>
                    <h2 class="text-lg font-semibold tracking-tight">{{ t(`${item.i18nKey}.name`) }}</h2>
                  </div>
                </div>
                <span class="mono rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)]">
                  {{ t(`${item.i18nKey}.license`) }}
                </span>
              </div>

              <p class="mt-2 text-xs font-medium text-[var(--text-muted)]">{{ t(`${item.i18nKey}.tagline`) }}</p>
              <p class="mt-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {{ t(`${item.i18nKey}.lead`) }}
              </p>

              <div class="mt-4 flex flex-wrap gap-1.5">
                <span class="mono rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] text-[var(--text-primary)]">
                  {{ t(`${item.i18nKey}.version`) }}
                </span>
                <span
                  v-for="plat in item.platforms"
                  :key="plat"
                  class="mono rounded-md border border-[var(--border-muted)] bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]"
                >
                  {{ plat }}
                </span>
              </div>

              <div class="mt-4">
                <CopyCommand :command="item.installCmd" compact />
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
                class="btn-primary ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                <Download class="h-3 w-3" aria-hidden="true" />
                <span>{{ t('ecosystem.releaseLink') }}</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
