<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Stanza {
  index: string
  label: string
  title: string
  body: string
  cadence: string
}

const emit = defineEmits<{
  chapterChange: [chapter: number]
}>()

const { t, tm } = useI18n()

const stanzas = computed<Stanza[]>(() => {
  const raw = tm('manifesto.stanzas') as Record<string, unknown>[]
  return Array.isArray(raw)
    ? raw.map((item) => ({
        index: String(item.index ?? ''),
        label: String(item.label ?? ''),
        title: String(item.title ?? ''),
        body: String(item.body ?? ''),
        cadence: String(item.cadence ?? ''),
      }))
    : []
})

const activeStanza = ref(0)
const stanzaRefs = ref<HTMLElement[]>([])

function setStanzaRef(el: unknown, idx: number) {
  if (el instanceof HTMLElement) {
    stanzaRefs.value[idx] = el
  }
}

function scrollToStanza(idx: number) {
  const target = stanzaRefs.value[idx]
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const idx = Number((entry.target as HTMLElement).dataset.stanzaIdx ?? 0)
        if (!Number.isNaN(idx)) {
          activeStanza.value = idx
          emit('chapterChange', idx === 0 ? 1 : 2)
        }
      }
    },
    { threshold: 0.45, rootMargin: '-18% 0px -24% 0px' },
  )
  for (const el of stanzaRefs.value) {
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section id="philosophy" class="border-t-hairline py-24 sm:py-32">
    <div class="frame-width px-3 sm:px-8">
      <div class="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <!-- Sticky Left Header & Chapter Index -->
        <div class="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p class="mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {{ t('manifesto.eyebrow') }}
          </p>
          <h2 class="display-section mt-4 text-3xl text-balance sm:text-[2.65rem]">
            {{ t('manifesto.title') }}
          </h2>
          <p class="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {{ t('manifesto.subtitle') }}
          </p>

          <!-- Interactive Chapter Indicator -->
          <div class="mt-10 flex items-center gap-3">
            <button
              v-for="(item, idx) in stanzas"
              :key="item.index"
              type="button"
              class="group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all"
              :class="
                activeStanza === idx
                  ? 'border-[var(--text-primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-secondary)]/80 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              "
              @click="scrollToStanza(idx)"
            >
              <span class="mono text-[10px] font-semibold">{{ item.index }}</span>
            </button>
          </div>
        </div>

        <!-- Right Stanzas Column -->
        <div class="min-w-0">
          <article
            v-for="(item, idx) in stanzas"
            :key="item.index"
            :ref="(el) => setStanzaRef(el, idx)"
            :data-stanza-idx="idx"
            class="relative min-w-0 border-t-hairline py-14 first:pt-8 lg:first:border-t-0 lg:first:pt-0 sm:py-20"
          >
            <span
              aria-hidden="true"
              class="crosshair-mark absolute -top-[3.5px] -left-[3.5px] hidden lg:block"
              :class="idx === 0 ? 'lg:hidden' : ''"
            />

            <div class="grid gap-8 sm:grid-cols-[1fr_180px] sm:items-center">
              <div class="min-w-0">
                <div class="flex items-center gap-3">
                  <span class="mono text-[11px] font-semibold text-[var(--text-primary)]">{{ item.index }}</span>
                  <span class="h-[var(--hairline)] w-6 bg-[var(--border-strong)]" aria-hidden="true" />
                  <span class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {{ item.label }}
                  </span>
                </div>

                <h3 class="display-section mt-4 text-2xl text-balance sm:text-[1.9rem]">
                  {{ item.title }}
                </h3>
                <p class="mt-4 max-w-xl text-[15px] leading-[1.75] text-[var(--text-secondary)]">
                  {{ item.body }}
                </p>
                <p class="mono mt-5 text-[11px] text-[var(--text-muted)]">
                  {{ item.cadence }}
                </p>
              </div>

              <!-- Kinetic Monochrome SVG Diagram -->
              <div
                aria-hidden="true"
                class="flex h-36 w-full items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/70 backdrop-blur-sm sm:h-40"
              >
                <!-- Stanza 0: Discrete Autonomous Points -->
                <svg v-if="idx === 0" viewBox="0 0 160 120" class="h-28 w-36 text-[var(--text-primary)]">
                  <circle cx="80" cy="60" r="44" fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="2 4" />
                  <circle cx="80" cy="60" r="24" fill="none" stroke="currentColor" stroke-opacity="0.18" />
                  <g class="animate-[spin_22s_linear_infinite]" style="transform-origin: 80px 60px">
                    <circle cx="80" cy="16" r="3" fill="currentColor" />
                    <circle cx="122" cy="46" r="2.5" fill="currentColor" fill-opacity="0.7" />
                    <circle cx="106" cy="96" r="3.2" fill="currentColor" fill-opacity="0.85" />
                    <circle cx="52" cy="94" r="2.5" fill="currentColor" fill-opacity="0.65" />
                    <circle cx="38" cy="48" r="2.8" fill="currentColor" fill-opacity="0.8" />
                  </g>
                </svg>

                <!-- Stanza 1: Resonance & Connection -->
                <svg v-else-if="idx === 1" viewBox="0 0 160 120" class="h-28 w-36 text-[var(--text-primary)]">
                  <path
                    d="M 16 60 Q 48 22, 80 60 T 144 60"
                    fill="none"
                    stroke="currentColor"
                    stroke-opacity="0.28"
                    stroke-width="1.2"
                  />
                  <path
                    d="M 16 60 Q 48 98, 80 60 T 144 60"
                    fill="none"
                    stroke="currentColor"
                    stroke-opacity="0.55"
                    stroke-width="1.4"
                    class="flow-dash"
                  />
                  <circle cx="48" cy="41" r="2.8" fill="currentColor" />
                  <circle cx="80" cy="60" r="4" fill="currentColor" />
                  <circle cx="112" cy="79" r="2.8" fill="currentColor" />
                </svg>

                <!-- Stanza 2: Symbiosis & Measure -->
                <svg v-else viewBox="0 0 160 120" class="h-28 w-36 text-[var(--text-primary)]">
                  <rect x="34" y="20" width="92" height="80" rx="14" fill="none" stroke="currentColor" stroke-opacity="0.16" />
                  <circle cx="80" cy="60" r="28" fill="none" stroke="currentColor" stroke-opacity="0.32" stroke-dasharray="4 4" />
                  <circle cx="80" cy="60" r="14" fill="none" stroke="currentColor" stroke-opacity="0.7" />
                  <circle cx="80" cy="60" r="3.5" fill="currentColor" />
                  <line x1="80" y1="20" x2="80" y2="32" stroke="currentColor" stroke-opacity="0.35" />
                  <line x1="80" y1="88" x2="80" y2="100" stroke="currentColor" stroke-opacity="0.35" />
                </svg>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
