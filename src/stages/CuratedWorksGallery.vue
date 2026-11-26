<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRight } from '@lucide/vue'
import { PRODUCTS, productPath } from '@/data/products'

const { t } = useI18n()

function indexLabel(idx: number): string {
  return String(idx + 1).padStart(2, '0')
}
</script>

<template>
  <section id="works" class="border-t-hairline py-24 sm:py-32">
    <div class="frame-width px-3 sm:px-8">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="max-w-2xl">
          <p class="mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {{ t('gallery.eyebrow') }}
          </p>
          <h2 class="display-section mt-3 text-3xl text-balance sm:text-[2.65rem]">
            {{ t('gallery.title') }}
          </h2>
          <p class="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {{ t('gallery.subtitle') }}
          </p>
        </div>

        <router-link
          to="/products/"
          class="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
        >
          <span>{{ t('gallery.viewAll') }}</span>
          <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
        </router-link>
      </div>

      <!-- Museum Plinth Grid (all 6 works, zero tech clutter) -->
      <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="(item, idx) in PRODUCTS"
          :key="item.slug"
          :to="productPath(item)"
          class="gallery-plinth group flex min-w-0 flex-col justify-between rounded-3xl p-6 sm:p-7"
        >
          <div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="mono font-semibold text-[var(--text-muted)]">{{ indexLabel(idx) }}</span>
              <span class="text-[var(--text-muted)]">
                {{ item.category === 'platform' ? t('gallery.catPlatform') : t('gallery.catWorkbench') }}
              </span>
            </div>

            <!-- Bespoke Monochrome Geometric Sculpture per Artifact -->
            <div
              aria-hidden="true"
              class="mt-6 flex h-32 items-center justify-center rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-primary)]/85 transition-colors group-hover:border-[var(--border-default)]"
            >
              <!-- Office: Overlapping spatial planes & satellite -->
              <svg v-if="item.key === 'office'" viewBox="0 0 120 80" class="h-20 w-28 text-[var(--text-primary)]">
                <rect x="22" y="16" width="54" height="38" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.26" />
                <rect x="44" y="26" width="54" height="38" rx="6" fill="none" stroke="currentColor" stroke-opacity="0.72" />
                <circle cx="96" cy="20" r="3" fill="currentColor" class="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </svg>

              <!-- Core: Breathing concentric nucleus -->
              <svg v-else-if="item.key === 'core'" viewBox="0 0 120 80" class="h-20 w-28 text-[var(--text-primary)]">
                <circle cx="60" cy="40" r="28" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-dasharray="2 4" />
                <circle cx="60" cy="40" r="16" fill="none" stroke="currentColor" stroke-opacity="0.48" />
                <circle cx="60" cy="40" r="4" fill="currentColor" />
                <circle cx="88" cy="40" r="2" fill="currentColor" fill-opacity="0.65" />
                <circle cx="32" cy="40" r="2" fill="currentColor" fill-opacity="0.65" />
              </svg>

              <!-- Tools: Precision aperture & crosshair -->
              <svg v-else-if="item.key === 'tools'" viewBox="0 0 120 80" class="h-20 w-28 text-[var(--text-primary)]">
                <rect x="34" y="16" width="52" height="48" rx="10" fill="none" stroke="currentColor" stroke-opacity="0.3" />
                <line x1="60" y1="8" x2="60" y2="72" stroke="currentColor" stroke-opacity="0.22" />
                <line x1="24" y1="40" x2="96" y2="40" stroke="currentColor" stroke-opacity="0.22" />
                <circle cx="60" cy="40" r="9" fill="none" stroke="currentColor" stroke-opacity="0.82" stroke-width="1.3" />
              </svg>

              <!-- Gateway: Harmonic wave refraction -->
              <svg v-else-if="item.key === 'gateway'" viewBox="0 0 120 80" class="h-20 w-28 text-[var(--text-primary)]">
                <path d="M 16 40 C 36 16, 48 64, 60 40 C 72 16, 84 64, 104 40" fill="none" stroke="currentColor" stroke-opacity="0.32" />
                <path d="M 16 40 C 36 26, 48 54, 60 40 C 72 26, 84 54, 104 40" fill="none" stroke="currentColor" stroke-opacity="0.82" />
                <line x1="60" y1="14" x2="60" y2="66" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="2 3" />
              </svg>

              <!-- TinaClass: Connected constellation prism -->
              <svg v-else-if="item.key === 'tinaclass'" viewBox="0 0 120 80" class="h-20 w-28 text-[var(--text-primary)]">
                <polygon points="60,12 94,34 80,66 40,66 26,34" fill="none" stroke="currentColor" stroke-opacity="0.38" />
                <circle cx="60" cy="12" r="2.5" fill="currentColor" />
                <circle cx="94" cy="34" r="2.5" fill="currentColor" />
                <circle cx="80" cy="66" r="2.5" fill="currentColor" />
                <circle cx="40" cy="66" r="2.5" fill="currentColor" />
                <circle cx="26" cy="34" r="2.5" fill="currentColor" />
                <circle cx="60" cy="42" r="3.5" fill="currentColor" fill-opacity="0.7" />
              </svg>

              <!-- TinadecBand: Crisp kinetic horizon bars -->
              <svg v-else viewBox="0 0 120 80" class="h-20 w-28 text-[var(--text-primary)]">
                <line x1="28" y1="26" x2="92" y2="26" stroke="currentColor" stroke-opacity="0.28" stroke-width="2" stroke-linecap="round" />
                <line x1="28" y1="40" x2="78" y2="40" stroke="currentColor" stroke-opacity="0.85" stroke-width="2" stroke-linecap="round" />
                <line x1="28" y1="54" x2="64" y2="54" stroke="currentColor" stroke-opacity="0.48" stroke-width="2" stroke-linecap="round" />
                <circle cx="88" cy="40" r="3" fill="currentColor" />
              </svg>
            </div>

            <div class="mt-6">
              <div class="flex items-baseline justify-between gap-2">
                <h3 class="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                  {{ t(`${item.i18nKey}.name`) }}
                </h3>
                <span class="text-xs text-[var(--text-muted)]">
                  {{ t(`${item.i18nKey}.poeticRole`) }}
                </span>
              </div>
              <p class="mt-2.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {{ t(`${item.i18nKey}.poeticSummary`) }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-1.5 border-t-hairline pt-4 text-xs font-medium text-[var(--text-primary)]">
            <span>{{ t('gallery.visit') }}</span>
            <ArrowRight class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>
