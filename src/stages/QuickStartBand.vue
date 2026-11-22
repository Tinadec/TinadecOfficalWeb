<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Check, Copy, Terminal } from '@lucide/vue'

const { t, tm } = useI18n()

interface QuickTab {
  id: string
  label: string
  desc: string
  code: string
  ctaText: string
  ctaHref: string
}

const tabs = computed<QuickTab[]>(() => {
  const raw = tm('quickstart.tabs') as QuickTab[]
  return Array.isArray(raw)
    ? raw.map((item) => ({
        id: String(item.id),
        label: String(item.label),
        desc: String(item.desc),
        code: String(item.code),
        ctaText: String(item.ctaText),
        ctaHref: String(item.ctaHref),
      }))
    : []
})

const activeId = ref('office')
const current = computed(() => tabs.value.find((item) => item.id === activeId.value) ?? tabs.value[0])
const copied = ref(false)

async function copyCode() {
  if (!current.value) return
  try {
    await navigator.clipboard.writeText(current.value.code)
  } catch {
    // ignore
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1600)
}
</script>

<template>
  <section class="border-t-hairline py-20 sm:py-24">
    <div class="frame-width px-2 sm:px-6">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div class="min-w-0">
          <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {{ t('quickstart.eyebrow') }}
          </p>
          <h2 class="display-section mt-3 text-3xl text-balance sm:text-[2.4rem]">
            {{ t('quickstart.title') }}
          </h2>
          <p class="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {{ t('quickstart.subtitle') }}
          </p>

          <div class="mt-6 flex flex-wrap gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
              :class="
                activeId === tab.id
                  ? 'border-[var(--text-primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                  : 'border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              "
              @click="activeId = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="current" class="spatial-frame min-w-0 rounded-2xl p-1.5">
          <div class="spatial-inner min-w-0 overflow-hidden rounded-[14px]">
            <div class="flex items-center justify-between border-b-hairline bg-[var(--bg-secondary)] px-4 py-2.5">
              <span class="mono inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                <Terminal class="h-3.5 w-3.5 text-[var(--text-brand)]" aria-hidden="true" />
                {{ current.label }}
              </span>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                @click="copyCode"
              >
                <Check v-if="copied" class="h-3 w-3 text-[var(--accent-success)]" aria-hidden="true" />
                <Copy v-else class="h-3 w-3" aria-hidden="true" />
                <span>{{ copied ? t('hero.copied') : t('hero.copyCmd') }}</span>
              </button>
            </div>
            <pre class="overflow-x-auto bg-[var(--bg-primary)] p-5 text-[13px] leading-relaxed text-[var(--text-primary)]"><code>{{ current.code }}</code></pre>
            <div class="flex flex-wrap items-center justify-between gap-3 border-t-hairline bg-[var(--bg-secondary)]/60 px-4 py-3">
              <p class="max-w-md text-xs text-[var(--text-secondary)]">{{ current.desc }}</p>
              <router-link
                :to="current.ctaHref"
                class="btn-primary inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                <span>{{ current.ctaText }}</span>
                <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
