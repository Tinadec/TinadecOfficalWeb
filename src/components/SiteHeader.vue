<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ArrowUpRight, ChevronDown, Download, Menu, X } from '@lucide/vue'
import ThemeSegmented from '@/components/ThemeSegmented.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { COMMUNITY_LINKS, PRODUCTS, productPath } from '@/data/products'

const { t } = useI18n()
const route = useRoute()

const scrolled = ref(false)
const menuOpen = ref(false)
const dropdownOpen = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | undefined

const platformProducts = computed(() => PRODUCTS.filter((p) => p.category === 'platform'))
const workbenchProducts = computed(() => PRODUCTS.filter((p) => p.category === 'workbench'))

function updateScroll() {
  scrolled.value = window.scrollY > 12
}

function openDropdown() {
  if (closeTimer) clearTimeout(closeTimer)
  dropdownOpen.value = true
}

function scheduleCloseDropdown() {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    dropdownOpen.value = false
  }, 140)
}

function closeAll() {
  dropdownOpen.value = false
  menuOpen.value = false
}

onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<template>
  <header
    class="sticky top-0 z-40 transition-colors duration-200"
    :class="
      scrolled
        ? 'border-b-hairline bg-[var(--bg-primary)]/85 backdrop-blur-xl'
        : 'border-b border-transparent bg-transparent'
    "
  >
    <div class="frame-width flex h-14 items-center justify-between gap-4 px-2 sm:px-6">
      <!-- Pure Monochrome Brand Mark -->
      <router-link to="/" class="flex shrink-0 items-center gap-2.5 rounded-lg py-1 text-[var(--text-primary)]" @click="closeAll">
        <svg viewBox="0 0 453.04 350" class="h-5 w-5 shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M0,152.01929L0,231.13193C0,267.12656,23.88369,298.75122,58.504963,308.59903L182.44873,343.85413C211.25745,352.04858,241.78033,352.04858,270.58905,343.85413L394.53281,308.59903C429.15408,298.75122,453.03775,267.12656,453.03775,231.13193L453.03775,152.01929C453.03775,131.48445,440.98279,113.76516,423.5636,105.55234L394.22815,35.020775C385.58447,14.237647,359.06622,0.0035646637,328.98392,0L317.35669,0C304.81461,0,294.64725,7.3336515,294.64725,16.380161C294.64725,25.426661,304.81461,32.760319,317.35669,32.760319L328.98392,32.760319C339.01624,32.759811,347.86035,37.507561,350.73959,44.439369L374.11868,100.67502L78.907547,100.67502L102.29823,44.439369C105.17747,37.507561,114.02158,32.759811,124.05387,32.760319L135.68109,32.760319C148.22321,32.760319,158.39055,25.426661,158.39055,16.380161C158.39055,7.3336515,148.22321,0,135.68109,0L124.05387,0C93.971581,0.0035561048,67.45327,14.237639,58.809616,35.020775L29.474157,105.55235C12.054992,113.76519,0,131.48445,0,152.01929Z" />
        </svg>
        <span class="text-[15px] font-semibold tracking-tight">Tinadec</span>
      </router-link>

      <!-- Centered Pill Nav Tray (UI Arc / ObsidianUI inspired) -->
      <nav
        class="hidden items-center gap-0.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]/85 p-1 backdrop-blur-md lg:flex"
        :aria-label="t('nav.menu')"
      >
        <div class="relative" @mouseenter="openDropdown" @mouseleave="scheduleCloseDropdown">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium transition-colors"
            :class="
              route.path.startsWith('/products')
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            "
            :aria-expanded="dropdownOpen"
            @click="dropdownOpen = !dropdownOpen"
          >
            {{ t('nav.products') }}
            <ChevronDown class="h-3.5 w-3.5 transition-transform duration-200" :class="dropdownOpen ? 'rotate-180' : ''" aria-hidden="true" />
          </button>

          <div
            v-if="dropdownOpen"
            class="absolute left-0 top-full mt-2.5 w-[560px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 shadow-2xl"
            @mouseenter="openDropdown"
            @mouseleave="scheduleCloseDropdown"
          >
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {{ t('nav.groupPlatform') }}
                </div>
                <router-link
                  v-for="item in platformProducts"
                  :key="item.slug"
                  :to="productPath(item)"
                  class="mt-0.5 flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-[var(--surface-hover)]"
                  @click="closeAll"
                >
                  <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                    <component :is="item.icon" class="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-[13px] font-medium text-[var(--text-primary)]">{{ t(`${item.i18nKey}.name`) }}</span>
                    <span class="block truncate text-[11px] text-[var(--text-muted)]">{{ t(`${item.i18nKey}.tagline`) }}</span>
                  </span>
                </router-link>
              </div>
              <div class="border-l border-[var(--border-muted)] pl-3">
                <div class="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {{ t('nav.groupWorkbenches') }}
                </div>
                <router-link
                  v-for="item in workbenchProducts"
                  :key="item.slug"
                  :to="productPath(item)"
                  class="mt-0.5 flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-[var(--surface-hover)]"
                  @click="closeAll"
                >
                  <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                    <component :is="item.icon" class="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-[13px] font-medium text-[var(--text-primary)]">{{ t(`${item.i18nKey}.name`) }}</span>
                    <span class="block truncate text-[11px] text-[var(--text-muted)]">{{ t(`${item.i18nKey}.tagline`) }}</span>
                  </span>
                </router-link>
                <div class="mt-3 border-t border-[var(--border-muted)] pt-2.5">
                  <router-link
                    to="/products/"
                    class="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
                    @click="closeAll"
                  >
                    <span>{{ t('productsPage.filterAll') }}</span>
                    <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <router-link
          to="/architecture/"
          class="rounded-full px-3 py-1 text-[13px] font-medium transition-colors"
          :class="
            route.path.startsWith('/architecture')
              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          "
        >
          {{ t('nav.architecture') }}
        </router-link>

        <router-link
          to="/#workbench"
          class="rounded-full px-3 py-1 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          {{ t('nav.workbench') }}
        </router-link>

        <router-link
          to="/download/"
          class="rounded-full px-3 py-1 text-[13px] font-medium transition-colors"
          :class="
            route.path.startsWith('/download')
              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          "
        >
          {{ t('nav.download') }}
        </router-link>
      </nav>

      <!-- Right Controls -->
      <div class="flex items-center gap-2">
        <a
          :href="COMMUNITY_LINKS.officeRepo"
          target="_blank"
          rel="noreferrer"
          class="hidden items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] xl:inline-flex"
        >
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
          </svg>
          <span>{{ t('nav.github') }}</span>
        </a>

        <ThemeSegmented compact class="hidden sm:inline-flex" />
        <LanguageSwitcher class="hidden md:inline-flex" />

        <router-link
          to="/download/"
          class="btn-primary hidden items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 sm:inline-flex"
        >
          <Download class="h-3.5 w-3.5" aria-hidden="true" />
          <span>{{ t('nav.download') }}</span>
        </router-link>

        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] lg:hidden"
          :aria-label="menuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="h-4 w-4" aria-hidden="true" />
          <Menu v-else class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Mobile drawer -->
    <div v-if="menuOpen" class="border-t-hairline bg-[var(--bg-primary)] px-5 py-5 lg:hidden">
      <nav class="flex flex-col gap-1" :aria-label="t('nav.menu')">
        <router-link to="/" class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--surface-hover)]" @click="closeAll">{{ t('nav.home') }}</router-link>
        <router-link to="/products/" class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--surface-hover)]" @click="closeAll">{{ t('nav.products') }}</router-link>
        <router-link to="/architecture/" class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--surface-hover)]" @click="closeAll">{{ t('nav.architecture') }}</router-link>
        <router-link to="/download/" class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--surface-hover)]" @click="closeAll">{{ t('nav.download') }}</router-link>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t-hairline pt-4">
          <ThemeSegmented compact />
          <LanguageSwitcher />
        </div>
      </nav>
    </div>
  </header>
</template>
