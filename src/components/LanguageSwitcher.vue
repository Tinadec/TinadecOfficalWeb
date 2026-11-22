<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

const options = computed(() => [
  { value: 'zh-CN', label: t('nav.langChina') },
  { value: 'en', label: t('nav.langGlobal') },
])

const activeIndex = computed(() => (locale.value === 'en' ? 1 : 0))

function setLocale(value: string) {
  locale.value = value
  try {
    localStorage.setItem('tinadec-locale', value)
  } catch {
    // ignore
  }
  document.documentElement.lang = value === 'zh-CN' ? 'zh-CN' : 'en'
}
</script>

<template>
  <div
    class="relative inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] p-0.5"
    role="tablist"
    aria-label="Language"
  >
    <div
      aria-hidden="true"
      class="spring-transition pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/2)] rounded-full bg-[var(--bg-elevated)] shadow-xs ring-1 ring-[var(--border-default)]"
      :style="{ transform: `translateX(${activeIndex * 100}%)` }"
    />
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="tab"
      :aria-selected="locale === opt.value"
      class="relative z-10 h-7 w-12 rounded-full text-center text-xs font-medium transition-colors"
      :class="
        locale === opt.value
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
      "
      @click="setLocale(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
