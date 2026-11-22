<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CheckCircle2,
  Cpu,
  FolderLock,
  Lock,
  PanelLeft,
  PanelRight,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from '@lucide/vue'

const { t, tm } = useI18n()

/* Fig 01: Approval Gate */
const gateState = ref<'pending' | 'approved' | 'blocked'>('pending')

/* Fig 02: Context segments */
const activeSeg = ref<number | null>(null)
const segments = computed(() => {
  const raw = tm('bento.cells.context.segments') as { name: unknown; tokens: unknown; pct: unknown }[]
  return Array.isArray(raw)
    ? raw.map((s) => ({ name: String(s.name), tokens: String(s.tokens), pct: Number(s.pct) }))
    : []
})

/* Fig 03: Routing policy & calibrated tick ruler */
const activePolicy = ref('route')
const policies = computed(() => {
  const raw = tm('bento.cells.routing.policies') as { key: unknown; label: unknown; model: unknown; note: unknown }[]
  return Array.isArray(raw)
    ? raw.map((p) => ({ key: String(p.key), label: String(p.label), model: String(p.model), note: String(p.note) }))
    : []
})
const currentPolicy = computed(() => policies.value.find((p) => p.key === activePolicy.value) ?? policies.value[0])
const effortIdx = ref(3)
const efforts = computed(() => (tm('bento.cells.routing.efforts') as unknown[]).map((x) => String(x)))

/* Fig 04: Durable Run + Eval Gate */
const activeEvalStep = ref(2)
const evalSteps = computed(() => {
  const raw = tm('bento.cells.eval.steps') as { seq: unknown; name: unknown; status: unknown }[]
  return Array.isArray(raw)
    ? raw.map((s) => ({ seq: String(s.seq), name: String(s.name), status: String(s.status) }))
    : []
})

/* Fig 05: Workspace Guard */
const singleFileMode = ref(true)
const boundaryFiles = computed(() => {
  const raw = tm('bento.cells.boundary.files') as { path: unknown; allowedSingle: unknown; allowedDir: unknown }[]
  return Array.isArray(raw)
    ? raw.map((f) => ({
        path: String(f.path),
        allowedSingle: Boolean(f.allowedSingle),
        allowedDir: Boolean(f.allowedDir),
      }))
    : []
})

/* Fig 06: Magnetic Companion Capsule */
const companionSide = ref<'left' | 'right'>('right')
const companionExpanded = ref(true)
</script>

<template>
  <section class="border-t-hairline py-20 sm:py-24">
    <div class="frame-width px-2 sm:px-6">
      <div class="max-w-2xl">
        <p class="mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {{ t('bento.eyebrow') }}
        </p>
        <h2 class="display-section mt-3 text-3xl text-balance sm:text-[2.5rem]">
          {{ t('bento.title') }}
        </h2>
        <p class="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {{ t('bento.subtitle') }}
        </p>
      </div>

      <!-- Hairline Architectural Bento Grid (min-w-0 prevents mobile overflow) -->
      <div class="mt-12 grid overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--border-default)] gap-[var(--hairline)] lg:grid-cols-12">
        <!-- Fig 01: Approval Gate (Span 7) -->
        <article class="flex min-w-0 flex-col justify-between overflow-hidden bg-[var(--bg-secondary)] p-5 sm:p-8 lg:col-span-7">
          <div>
            <span class="mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Fig. 01 · {{ t('bento.cells.approval.tag') }}
            </span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
              {{ t('bento.cells.approval.title') }}
            </h3>
            <p class="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {{ t('bento.cells.approval.desc') }}
            </p>
          </div>

          <div class="mt-6 min-w-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span class="mono truncate text-[var(--text-muted)]">{{ t('bento.cells.approval.manifest') }}</span>
              <span
                class="inline-flex items-center gap-1.5 font-medium"
                :style="{
                  color:
                    gateState === 'approved'
                      ? 'var(--accent-success)'
                      : gateState === 'blocked'
                        ? 'var(--accent-danger)'
                        : 'var(--accent-warning)',
                }"
              >
                <ShieldCheck v-if="gateState === 'approved'" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <XCircle v-else-if="gateState === 'blocked'" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <ShieldAlert v-else class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{{ t(`bento.cells.approval.${gateState}`) }}</span>
              </span>
            </div>
            <div class="mono mt-3 truncate rounded-lg border border-[var(--border-muted)] bg-[var(--bg-secondary)] px-3 py-2 text-xs">
              $ {{ t('bento.cells.approval.target') }}
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="btn-primary rounded-full px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                :disabled="gateState === 'approved'"
                @click="gateState = 'approved'"
              >
                {{ t('bento.cells.approval.btnApprove') }}
              </button>
              <button
                type="button"
                class="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-40"
                :disabled="gateState === 'blocked'"
                @click="gateState = 'blocked'"
              >
                {{ t('bento.cells.approval.btnBlock') }}
              </button>
              <button
                v-if="gateState !== 'pending'"
                type="button"
                class="ml-auto inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                @click="gateState = 'pending'"
              >
                <RotateCcw class="h-3 w-3" aria-hidden="true" />
                {{ t('bento.cells.approval.btnReset') }}
              </button>
            </div>
          </div>
        </article>

        <!-- Fig 02: Context Agent (Span 5) -->
        <article class="flex min-w-0 flex-col justify-between overflow-hidden bg-[var(--bg-secondary)] p-5 sm:p-8 lg:col-span-5">
          <div>
            <span class="mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Fig. 02 · {{ t('bento.cells.context.tag') }}
            </span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
              {{ t('bento.cells.context.title') }}
            </h3>
            <p class="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {{ t('bento.cells.context.desc') }}
            </p>
          </div>

          <div class="mt-6 min-w-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
            <div class="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span class="text-[var(--text-muted)] line-through">{{ t('bento.cells.context.before') }}</span>
              <span class="mono font-semibold text-[var(--text-primary)]">{{ t('bento.cells.context.after') }}</span>
            </div>
            <!-- Bencho-inspired crisp functional telemetry bar -->
            <div class="mt-3 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-[var(--bg-tertiary)] p-0.5">
              <button
                v-for="(seg, idx) in segments"
                :key="seg.name"
                type="button"
                :aria-label="`${seg.name} ${seg.tokens}`"
                class="h-full rounded-full transition-all"
                :style="{
                  width: `${seg.pct}%`,
                  backgroundColor:
                    idx === 0
                      ? 'var(--accent-info)'
                      : idx === 1
                        ? 'var(--accent-success)'
                        : idx === 2
                          ? 'var(--accent-signal)'
                          : 'var(--border-strong)',
                  opacity: activeSeg === null || activeSeg === idx ? 1 : 0.3,
                }"
                @mouseenter="activeSeg = idx"
                @mouseleave="activeSeg = null"
                @focus="activeSeg = idx"
                @blur="activeSeg = null"
              />
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <div
                v-for="(seg, idx) in segments"
                :key="seg.name"
                class="flex min-w-0 items-center justify-between gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors"
                :class="activeSeg === idx ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--border-muted)] bg-[var(--bg-secondary)]'"
                @mouseenter="activeSeg = idx"
                @mouseleave="activeSeg = null"
              >
                <span class="truncate text-[var(--text-secondary)]">{{ seg.name }}</span>
                <span class="mono shrink-0 font-medium">{{ seg.tokens }}</span>
              </div>
            </div>
            <p class="mono mt-2.5 text-[10px] text-[var(--text-muted)]">{{ t('bento.cells.context.saved') }}</p>
          </div>
        </article>

        <!-- Fig 03: Model Routing & Bencho-style Calibrated Tick Slider (Span 5) -->
        <article class="flex min-w-0 flex-col justify-between overflow-hidden bg-[var(--bg-secondary)] p-5 sm:p-8 lg:col-span-5">
          <div>
            <span class="mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Fig. 03 · {{ t('bento.cells.routing.tag') }}
            </span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
              {{ t('bento.cells.routing.title') }}
            </h3>
            <p class="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {{ t('bento.cells.routing.desc') }}
            </p>
          </div>

          <div class="mt-6 min-w-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="p in policies"
                :key="p.key"
                type="button"
                class="mono rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                :class="
                  activePolicy === p.key
                    ? 'border-[var(--text-primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                "
                @click="activePolicy = p.key"
              >
                {{ p.key }}
              </button>
            </div>
            <div v-if="currentPolicy" class="mt-3 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-secondary)] p-2.5">
              <div class="mono truncate text-xs font-medium text-[var(--text-primary)]">{{ currentPolicy.model }}</div>
              <div class="mt-0.5 text-[11px] text-[var(--text-muted)]">{{ currentPolicy.note }}</div>
            </div>

            <!-- Bencho-inspired Calibrated Tick Ruler -->
            <div class="mt-4">
              <div class="flex items-center justify-between gap-2 text-[11px]">
                <span class="truncate text-[var(--text-muted)]">{{ t('bento.cells.routing.effortLabel') }}</span>
                <span class="mono shrink-0 font-medium text-[var(--text-primary)]">
                  {{ efforts[effortIdx] }}
                </span>
              </div>
              <div class="mt-2.5 grid grid-cols-4 gap-2">
                <button
                  v-for="(label, idx) in efforts"
                  :key="label"
                  type="button"
                  :aria-label="label"
                  class="flex items-center justify-between gap-0.5 py-1"
                  @click="effortIdx = idx"
                >
                  <span
                    v-for="tick in 6"
                    :key="tick"
                    class="h-3.5 w-[2px] rounded-full transition-colors"
                    :style="{
                      backgroundColor:
                        idx <= effortIdx
                          ? effortIdx === 3 && idx === 3
                            ? 'var(--accent-signal)'
                            : 'var(--text-primary)'
                          : 'var(--border-strong)',
                    }"
                  />
                </button>
              </div>
            </div>
          </div>
        </article>

        <!-- Fig 04: Durable Run + Eval Gate (Span 7) -->
        <article class="flex min-w-0 flex-col justify-between overflow-hidden bg-[var(--bg-secondary)] p-5 sm:p-8 lg:col-span-7">
          <div>
            <span class="mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Fig. 04 · {{ t('bento.cells.eval.tag') }}
            </span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
              {{ t('bento.cells.eval.title') }}
            </h3>
            <p class="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {{ t('bento.cells.eval.desc') }}
            </p>
          </div>

          <div class="mt-6 min-w-0 space-y-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
            <button
              v-for="(step, idx) in evalSteps"
              :key="step.seq"
              type="button"
              class="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border px-3 py-2.5 text-left transition-colors"
              :class="
                activeEvalStep === idx
                  ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'border-[var(--border-muted)] bg-[var(--bg-secondary)]/50 hover:border-[var(--border-strong)]'
              "
              @click="activeEvalStep = idx"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span class="mono shrink-0 text-[11px] text-[var(--text-muted)]">{{ step.seq }}</span>
                <Cpu class="h-3.5 w-3.5 shrink-0 text-[var(--text-primary)]" aria-hidden="true" />
                <span class="mono truncate text-xs font-medium">{{ step.name }}</span>
              </div>
              <span class="mono text-[11px] font-medium text-[var(--accent-success)]">
                {{ step.status }}
              </span>
            </button>
          </div>
        </article>

        <!-- Fig 05: Workspace Boundary (Span 6) -->
        <article class="flex min-w-0 flex-col justify-between overflow-hidden bg-[var(--bg-secondary)] p-5 sm:p-8 lg:col-span-6">
          <div>
            <span class="mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Fig. 05 · {{ t('bento.cells.boundary.tag') }}
            </span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
              {{ t('bento.cells.boundary.title') }}
            </h3>
            <p class="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {{ t('bento.cells.boundary.desc') }}
            </p>
          </div>

          <div class="mt-6 min-w-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
            <div class="flex flex-wrap gap-1 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-1 text-[11px]">
              <button
                type="button"
                class="rounded-full px-3 py-1 font-medium transition-colors"
                :class="singleFileMode ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)]'"
                @click="singleFileMode = true"
              >
                {{ t('bento.cells.boundary.modeSingle') }}
              </button>
              <button
                type="button"
                class="rounded-full px-3 py-1 font-medium transition-colors"
                :class="!singleFileMode ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs' : 'text-[var(--text-muted)]'"
                @click="singleFileMode = false"
              >
                {{ t('bento.cells.boundary.modeDir') }}
              </button>
            </div>
            <ul class="mt-3 space-y-1.5">
              <li
                v-for="f in boundaryFiles"
                :key="f.path"
                class="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-secondary)] px-3 py-2 text-xs"
              >
                <span class="mono flex min-w-0 items-center gap-2">
                  <FolderLock class="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                  <span class="truncate">{{ f.path }}</span>
                </span>
                <span
                  class="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium"
                  :style="{
                    color: (singleFileMode ? f.allowedSingle : f.allowedDir)
                      ? 'var(--accent-success)'
                      : 'var(--accent-danger)',
                  }"
                >
                  <CheckCircle2 v-if="singleFileMode ? f.allowedSingle : f.allowedDir" class="h-3.5 w-3.5" aria-hidden="true" />
                  <Lock v-else class="h-3.5 w-3.5" aria-hidden="true" />
                  {{ (singleFileMode ? f.allowedSingle : f.allowedDir) ? t('bento.cells.boundary.allowed') : t('bento.cells.boundary.denied') }}
                </span>
              </li>
            </ul>
          </div>
        </article>

        <!-- Fig 06: Feel-style Tactile Companion Capsule Playground (Span 6) -->
        <article class="flex min-w-0 flex-col justify-between overflow-hidden bg-[var(--bg-secondary)] p-5 sm:p-8 lg:col-span-6">
          <div>
            <span class="mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Fig. 06 · {{ t('bento.cells.companion.tag') }}
            </span>
            <h3 class="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
              {{ t('bento.cells.companion.title') }}
            </h3>
            <p class="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {{ t('bento.cells.companion.desc') }}
            </p>
          </div>

          <div class="mt-6 min-w-0 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div class="inline-flex gap-1.5">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                  :class="companionSide === 'left' ? 'border-[var(--text-primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border-[var(--border-default)] text-[var(--text-secondary)]'"
                  @click="companionSide = 'left'"
                >
                  <PanelLeft class="h-3 w-3" aria-hidden="true" />
                  {{ t('bento.cells.companion.dockLeft') }}
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                  :class="companionSide === 'right' ? 'border-[var(--text-primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border-[var(--border-default)] text-[var(--text-secondary)]'"
                  @click="companionSide = 'right'"
                >
                  <PanelRight class="h-3 w-3" aria-hidden="true" />
                  {{ t('bento.cells.companion.dockRight') }}
                </button>
              </div>
              <button
                type="button"
                class="text-[11px] font-medium text-[var(--text-primary)] underline underline-offset-4"
                @click="companionExpanded = !companionExpanded"
              >
                {{ companionExpanded ? t('bento.cells.companion.collapse') : t('bento.cells.companion.expand') }}
              </button>
            </div>

            <!-- Simulated Screen Edge with Tactile Feel-style 3D Pill -->
            <div class="spatial-dots relative flex h-24 items-center overflow-hidden rounded-xl border border-[var(--border-muted)] bg-[var(--bg-secondary)] px-3">
              <div
                class="spring-transition flex max-w-full items-center gap-2.5 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2"
                :style="{ boxShadow: 'var(--shadow-thumb)' }"
                :class="companionSide === 'right' ? 'ml-auto' : 'mr-auto'"
              >
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                  <Sparkles class="h-4 w-4" aria-hidden="true" />
                </span>
                <div v-if="companionExpanded" class="min-w-0 pr-2">
                  <div class="truncate text-xs font-semibold">Tinadec Companion</div>
                  <div class="truncate text-[11px] text-[var(--text-muted)]">{{ t('bento.cells.companion.statusText') }}</div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
