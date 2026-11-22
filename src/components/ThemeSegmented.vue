<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Monitor, Moon, Sun } from '@lucide/vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

interface Props {
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  compact: false,
})

const { t } = useI18n()
const { mode, setTheme } = useTheme()

const options = computed(() => [
  { value: 'light' as ThemeMode, label: t('theme.light'), icon: Sun },
  { value: 'dark' as ThemeMode, label: t('theme.dark'), icon: Moon },
  { value: 'system' as ThemeMode, label: t('theme.system'), icon: Monitor },
])

const activeIndex = computed(() => {
  const idx = options.value.findIndex((o) => o.value === mode.value)
  return idx < 0 ? 0 : idx
})
</script>

<template>
  <div
    class="relative inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] p-0.5"
    role="group"
    :aria-label="t('theme.toggle')"
  >
    <div
      aria-hidden="true"
      class="spring-transition pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-[var(--bg-elevated)] shadow-xs ring-1 ring-[var(--border-default)]"
      :style="{
        width: compact ? '28px' : 'calc((100% - 4px) / 3)',
        transform: `translateX(${activeIndex * 100}%)`,
      }"
    />
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :title="opt.label"
      :aria-label="opt.label"
      :aria-pressed="mode === opt.value"
      class="relative z-10 inline-flex h-7 items-center justify-center rounded-full text-xs font-medium transition-colors"
      :class="[
        compact ? 'w-7' : 'gap-1.5 px-2.5',
        mode === opt.value
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
      ]"
      @click="setTheme(opt.value)"
    >
      <component :is="opt.icon" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span v-if="!compact" class="whitespace-nowrap">{{ opt.label }}</span>
    </button>
  </div>
</template>
