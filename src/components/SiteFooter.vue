<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ThemeSegmented from '@/components/ThemeSegmented.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { COMMUNITY_LINKS, PRODUCTS, productPath } from '@/data/products'

const { t } = useI18n()

const coreItems = computed(() => PRODUCTS.filter((p) => p.category === 'platform'))
const siblingItems = computed(() => PRODUCTS.filter((p) => p.category === 'workbench'))
</script>

<template>
  <footer class="border-t-hairline bg-[var(--bg-secondary)]/50">
    <div class="frame-width px-4 py-14 sm:px-8">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <router-link to="/" class="inline-flex items-center gap-2.5 text-[var(--text-primary)]">
            <svg viewBox="0 0 453.04 350" class="h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true">
              <path d="M0,152.01929L0,231.13193C0,267.12656,23.88369,298.75122,58.504963,308.59903L182.44873,343.85413C211.25745,352.04858,241.78033,352.04858,270.58905,343.85413L394.53281,308.59903C429.15408,298.75122,453.03775,267.12656,453.03775,231.13193L453.03775,152.01929C453.03775,131.48445,440.98279,113.76516,423.5636,105.55234L394.22815,35.020775C385.58447,14.237647,359.06622,0.0035646637,328.98392,0L317.35669,0C304.81461,0,294.64725,7.3336515,294.64725,16.380161C294.64725,25.426661,304.81461,32.760319,317.35669,32.760319L328.98392,32.760319C339.01624,32.759811,347.86035,37.507561,350.73959,44.439369L374.11868,100.67502L78.907547,100.67502L102.29823,44.439369C105.17747,37.507561,114.02158,32.759811,124.05387,32.760319L135.68109,32.760319C148.22321,32.760319,158.39055,25.426661,158.39055,16.380161C158.39055,7.3336515,148.22321,0,135.68109,0L124.05387,0C93.971581,0.0035561048,67.45327,14.237639,58.809616,35.020775L29.474157,105.55235C12.054992,113.76519,0,131.48445,0,152.01929Z" />
            </svg>
            <span class="text-base font-semibold tracking-tight">Tinadec</span>
          </router-link>
          <p class="mt-3 max-w-xs text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {{ t('footer.tagline') }}
          </p>
          <div class="mt-5 flex flex-wrap items-center gap-2.5">
            <ThemeSegmented />
          </div>
          <p class="mt-2.5 text-[11px] text-[var(--text-muted)]">{{ t('footer.switchHint') }}</p>
        </div>

        <div>
          <div class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {{ t('footer.colCore') }}
          </div>
          <ul class="space-y-2 text-[13px]">
            <li v-for="item in coreItems" :key="item.slug">
              <router-link :to="productPath(item)" class="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                {{ t(`${item.i18nKey}.name`) }}
              </router-link>
            </li>
          </ul>
        </div>

        <div>
          <div class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {{ t('footer.colFamily') }}
          </div>
          <ul class="space-y-2 text-[13px]">
            <li v-for="item in siblingItems" :key="item.slug">
              <router-link :to="productPath(item)" class="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                {{ t(`${item.i18nKey}.name`) }}
              </router-link>
            </li>
            <li>
              <router-link to="/products/" class="font-medium text-[var(--text-primary)] transition-opacity hover:opacity-75">
                {{ t('productsPage.filterAll') }}
              </router-link>
            </li>
          </ul>
        </div>

        <div>
          <div class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {{ t('footer.colResources') }}
          </div>
          <ul class="space-y-2 text-[13px]">
            <li><router-link to="/architecture/" class="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">{{ t('nav.architecture') }}</router-link></li>
            <li><router-link to="/download/" class="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">{{ t('nav.download') }}</router-link></li>
            <li><a :href="COMMUNITY_LINKS.officeRepo" target="_blank" rel="noreferrer" class="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">GitHub · TinadecOffice</a></li>
            <li><a :href="COMMUNITY_LINKS.coreRepo" target="_blank" rel="noreferrer" class="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">GitHub · TinadecCore</a></li>
            <li><a :href="COMMUNITY_LINKS.discord" target="_blank" rel="noreferrer" class="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Discord</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-start justify-between gap-4 border-t-hairline pt-6 sm:flex-row sm:items-center">
        <p class="text-xs text-[var(--text-muted)]">{{ t('footer.rights') }}</p>
        <LanguageSwitcher />
      </div>
    </div>
  </footer>
</template>
