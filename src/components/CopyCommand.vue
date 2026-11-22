<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Copy, Terminal } from '@lucide/vue'

interface Props {
  command: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const { t } = useI18n()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.command)
  } catch {
    // Fallback if clipboard API blocked
    const ta = document.createElement('textarea')
    ta.value = props.command
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
  }, 1800)
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <button
    type="button"
    :aria-label="copied ? t('hero.copied') : t('hero.copyCmd')"
    class="group inline-flex min-w-0 max-w-full items-center gap-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3.5 py-2 text-left transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
    :class="compact ? 'h-9 text-xs' : 'h-10 text-[13px]'"
    @click="copy"
  >
    <Terminal class="h-3.5 w-3.5 shrink-0 text-[var(--text-brand)]" aria-hidden="true" />
    <code class="mono truncate text-[var(--text-primary)]">{{ command }}</code>
    <span class="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]">
      <Check v-if="copied" class="h-3 w-3 text-[var(--accent-success)]" aria-hidden="true" />
      <Copy v-else class="h-3 w-3" aria-hidden="true" />
    </span>
  </button>
</template>
