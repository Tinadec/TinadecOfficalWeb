<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppWindow, ArrowRight, CheckCircle2, Cpu, MinusCircle, Route, Wrench } from '@lucide/vue'

type LayerKey = 'apps' | 'gateway' | 'core' | 'tools'

const { t, tm } = useI18n()

const selectedLayer = ref<LayerKey>('core')

const layerDefs: { key: LayerKey; icon: typeof Cpu }[] = [
  { key: 'apps', icon: AppWindow },
  { key: 'gateway', icon: Route },
  { key: 'core', icon: Cpu },
  { key: 'tools', icon: Wrench },
]

function strList(key: string): string[] {
  const raw = tm(key) as unknown[]
  return Array.isArray(raw) ? raw.map((x) => String(x)) : []
}

const activeMust = computed(() => strList(`architecture.layers.${selectedLayer.value}.must`))
const activeMustNot = computed(() => strList(`architecture.layers.${selectedLayer.value}.mustNot`))
</script>

<template>
  <section class="border-t-hairline py-20 sm:py-24">
    <div class="frame-width px-2 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="max-w-2xl">
          <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {{ t('architecture.eyebrow') }}
          </p>
          <h2 class="display-section mt-3 text-3xl text-balance sm:text-[2.5rem]">
            {{ t('architecture.title') }}
          </h2>
          <p class="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {{ t('architecture.subtitle') }}
          </p>
        </div>
        <router-link
          to="/architecture/"
          class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
        >
          <span>{{ t('nav.architecture') }}</span>
          <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
        </router-link>
      </div>

      <!-- Interactive Topology Chain -->
      <div class="mt-10 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5 sm:p-7">
        <p class="mb-5 text-xs text-[var(--text-muted)]">{{ t('architecture.topologyHint') }}</p>

        <div class="grid gap-3 md:grid-cols-4">
          <button
            v-for="item in layerDefs"
            :key="item.key"
            type="button"
            class="flex min-w-0 flex-col rounded-2xl border p-4 text-left transition-all"
            :class="
              selectedLayer === item.key
                ? 'border-[var(--text-primary)] bg-[var(--bg-elevated)] shadow-sm ring-1 ring-[var(--text-primary)]/15'
                : 'border-[var(--border-default)] bg-[var(--bg-primary)]/70 hover:border-[var(--border-strong)]'
            "
            @click="selectedLayer = item.key"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                <component :is="item.icon" class="h-4 w-4" aria-hidden="true" />
              </span>
              <span class="mono text-[10px] text-[var(--text-muted)]">{{ t(`architecture.layers.${item.key}.tag`) }}</span>
            </div>
            <div class="mt-3 text-sm font-semibold">{{ t(`architecture.layers.${item.key}.name`) }}</div>
            <div class="mt-1 text-xs text-[var(--text-secondary)]">{{ t(`architecture.layers.${item.key}.role`) }}</div>
          </button>
        </div>

        <!-- Selected Layer Deep Inspector -->
        <div class="mt-5 grid gap-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-5 sm:p-6 lg:grid-cols-[1fr_1fr_1fr]">
          <div class="min-w-0">
            <div class="mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              {{ t('architecture.labels.contract') }}
            </div>
            <div class="mt-2 text-base font-semibold">{{ t(`architecture.layers.${selectedLayer}.name`) }}</div>
            <p class="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {{ t(`architecture.layers.${selectedLayer}.summary`) }}
            </p>
            <div class="mono mt-3 inline-block max-w-full break-words rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-[11px] text-[var(--text-primary)]">
              {{ t(`architecture.layers.${selectedLayer}.contract`) }}
            </div>
          </div>

          <div class="min-w-0 border-t-hairline pt-4 lg:border-t-0 lg:border-l lg:border-[var(--border-muted)] lg:pl-6 lg:pt-0">
            <div class="mono text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-success)]">
              {{ t('architecture.labels.must') }}
            </div>
            <ul class="mt-3 space-y-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              <li v-for="line in activeMust" :key="line" class="flex items-start gap-2">
                <CheckCircle2 class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-success)]" aria-hidden="true" />
                <span>{{ line }}</span>
              </li>
            </ul>
          </div>

          <div class="min-w-0 border-t-hairline pt-4 lg:border-t-0 lg:border-l lg:border-[var(--border-muted)] lg:pl-6 lg:pt-0">
            <div class="mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {{ t('architecture.labels.mustNot') }}
            </div>
            <ul class="mt-3 space-y-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              <li v-for="line in activeMustNot" :key="line" class="flex items-start gap-2">
                <MinusCircle class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                <span>{{ line }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
