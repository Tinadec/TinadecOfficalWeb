<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, ArrowUpRight, Download } from '@lucide/vue'
import CopyCommand from '@/components/CopyCommand.vue'
import { adjacentProducts, productBySlug, productPath } from '@/data/products'

const { t, tm } = useI18n()
const route = useRoute()

const product = computed(() => productBySlug(String(route.params.slug ?? '')))
const neighbors = computed(() => (product.value ? adjacentProducts(product.value) : {}))

const highlights = computed(() => {
  if (!product.value) return []
  const raw = tm(`${product.value.i18nKey}.highlights`) as { title: unknown; desc: unknown }[]
  return Array.isArray(raw)
    ? raw.map((item) => ({ title: String(item.title), desc: String(item.desc) }))
    : []
})

const facts = computed(() => {
  if (!product.value) return []
  const k = product.value.i18nKey
  return [
    { label: t('productsPage.labels.version'), value: t(`${k}.version`) },
    { label: t('productsPage.labels.license'), value: t(`${k}.license`) },
    { label: t('productsPage.labels.stack'), value: t(`${k}.stack`) },
    { label: t('productsPage.labels.contract'), value: t(`${k}.contract`) },
  ]
})
</script>

<template>
  <div v-if="product">
    <section class="hero-atmosphere border-b-hairline pt-10 pb-14 sm:pt-14 sm:pb-16">
      <div class="frame-width px-2 sm:px-6">
        <div class="mb-6 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <router-link to="/products/" class="hover:text-[var(--text-primary)]">{{ t('nav.products') }}</router-link>
          <span>/</span>
          <span class="text-[var(--text-primary)]">{{ t(`${product.i18nKey}.name`) }}</span>
        </div>

        <div class="flex flex-wrap items-start justify-between gap-6">
          <div class="min-w-0 max-w-3xl">
            <div class="flex items-center gap-3">
              <span class="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                <component :is="product.icon" class="h-5 w-5" aria-hidden="true" />
              </span>
              <span class="mono rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1 text-xs text-[var(--text-muted)]">
                {{ product.category === 'platform' ? t('ecosystem.badgePlatform') : t('ecosystem.badgeWorkbench') }}
              </span>
            </div>

            <h1 class="display-section mt-5 text-3xl sm:text-5xl">
              {{ t(`${product.i18nKey}.name`) }}
            </h1>
            <p class="mt-2 text-base font-medium text-[var(--text-secondary)]">
              {{ t(`${product.i18nKey}.tagline`) }}
            </p>
            <p class="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
              {{ t(`${product.i18nKey}.lead`) }}
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <a
                v-if="product.releaseUrl"
                :href="product.releaseUrl"
                target="_blank"
                rel="noreferrer"
                class="btn-primary inline-flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                <Download class="h-4 w-4" aria-hidden="true" />
                <span>{{ t('ecosystem.releaseLink') }}</span>
              </a>
              <a
                :href="product.repoUrl"
                target="_blank"
                rel="noreferrer"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
              >
                <span>{{ t('ecosystem.repoLink') }}</span>
                <ArrowUpRight class="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div class="w-full min-w-0 max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
            <div class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {{ t('productsPage.labels.quickRun') }}
            </div>
            <CopyCommand :command="product.installCmd" />
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="plat in product.platforms"
                :key="plat"
                class="mono rounded-md border border-[var(--border-muted)] bg-[var(--bg-primary)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
              >
                {{ plat }}
              </span>
            </div>
          </div>
        </div>

        <!-- Specs Grid -->
        <dl class="mt-10 grid overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--border-default)] gap-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="fact in facts" :key="fact.label" class="min-w-0 bg-[var(--bg-secondary)] p-4 sm:p-5">
            <dt class="mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {{ fact.label }}
            </dt>
            <dd class="mt-1.5 break-words text-sm font-medium text-[var(--text-primary)]">{{ fact.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="py-16 sm:py-20">
      <div class="frame-width px-2 sm:px-6">
        <h2 class="display-section text-2xl sm:text-3xl">{{ t('productsPage.labels.highlights') }}</h2>
        <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="cap in highlights"
            :key="cap.title"
            class="min-w-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6"
          >
            <h3 class="text-[15px] font-semibold leading-snug">{{ cap.title }}</h3>
            <p class="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">{{ cap.desc }}</p>
          </li>
        </ul>

        <!-- Prev / Next -->
        <div class="mt-14 grid gap-4 border-t-hairline pt-8 sm:grid-cols-2">
          <router-link
            v-if="neighbors.prev"
            :to="productPath(neighbors.prev)"
            class="flex items-center gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 transition-colors hover:bg-[var(--surface-hover)]"
          >
            <ArrowLeft class="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <div>
              <div class="text-[11px] text-[var(--text-muted)]">{{ t('productsPage.labels.prev') }}</div>
              <div class="text-sm font-semibold">{{ t(`${neighbors.prev.i18nKey}.name`) }}</div>
            </div>
          </router-link>
          <span v-else />

          <router-link
            v-if="neighbors.next"
            :to="productPath(neighbors.next)"
            class="flex items-center justify-end gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 text-right transition-colors hover:bg-[var(--surface-hover)]"
          >
            <div>
              <div class="text-[11px] text-[var(--text-muted)]">{{ t('productsPage.labels.next') }}</div>
              <div class="text-sm font-semibold">{{ t(`${neighbors.next.i18nKey}.name`) }}</div>
            </div>
            <ArrowRight class="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          </router-link>
        </div>
      </div>
    </section>
  </div>

  <!-- 404 Not Found -->
  <div v-else class="frame-width px-4 py-24 text-center">
    <h1 class="display-section text-3xl">{{ t('productsPage.notFoundTitle') }}</h1>
    <p class="mt-3 text-sm text-[var(--text-secondary)]">{{ t('productsPage.notFoundDesc') }}</p>
    <div class="mt-8 flex justify-center gap-3">
      <router-link
        to="/products/"
        class="btn-primary rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)]"
      >
        {{ t('productsPage.backProducts') }}
      </router-link>
      <router-link
        to="/"
        class="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-2.5 text-sm font-medium"
      >
        {{ t('productsPage.backHome') }}
      </router-link>
    </div>
  </div>
</template>
