<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CheckCircle2,
  Cpu,
  Eye,
  Film,
  GitBranch,
  Layers,
  ListTodo,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Paperclip,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
  XCircle,
} from '@lucide/vue'

type StageTab = 'graph' | 'spatial' | 'thread' | 'film'
type NodeId = 'plan' | 'coordinate' | 'context' | 'search' | 'build' | 'review'

const { t, tm } = useI18n()

const activeTab = ref<StageTab>('graph')
const tabListRef = ref<HTMLElement | null>(null)

const tabs = computed<{ id: StageTab; label: string; icon: typeof Cpu }[]>(() => [
  { id: 'graph', label: t('stage.tabs.graph'), icon: Cpu },
  { id: 'spatial', label: t('stage.tabs.spatial'), icon: Layers },
  { id: 'thread', label: t('stage.tabs.thread'), icon: Terminal },
  { id: 'film', label: t('stage.tabs.film'), icon: Film },
])

const activeTabIndex = computed(() => {
  const idx = tabs.value.findIndex((item) => item.id === activeTab.value)
  return idx < 0 ? 0 : idx
})

function onTabKeydown(event: KeyboardEvent) {
  const list = tabs.value
  const current = activeTabIndex.value
  let next = -1
  if (event.key === 'ArrowRight') next = (current + 1) % list.length
  else if (event.key === 'ArrowLeft') next = (current - 1 + list.length) % list.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = list.length - 1
  if (next < 0) return
  event.preventDefault()
  activeTab.value = list[next].id
  const buttons = tabListRef.value?.querySelectorAll('button')
  ;(buttons?.[next] as HTMLElement | undefined)?.focus()
}

/* --- Tab 1: Dual-Layer Graph state --- */
const selectedNode = ref<NodeId>('plan')
const graphPhase = ref<'normal' | 'replanned' | 'approved'>('normal')

const govNodes: { id: NodeId; icon: typeof Sparkles }[] = [
  { id: 'plan', icon: ListTodo },
  { id: 'coordinate', icon: Sparkles },
  { id: 'context', icon: Layers },
]

const execNodes: { id: NodeId; icon: typeof Search }[] = [
  { id: 'search', icon: Search },
  { id: 'build', icon: Wrench },
  { id: 'review', icon: Eye },
]

function nodeItems(id: NodeId): string[] {
  const raw = tm(`stage.graph.nodes.${id}.items`) as unknown[]
  return Array.isArray(raw) ? raw.map((x) => String(x)) : []
}

function nodeStateText(id: NodeId): string {
  if (graphPhase.value === 'replanned' && (id === 'plan' || id === 'context' || id === 'coordinate')) {
    return t(`stage.graph.nodes.${id}.replanState`)
  }
  if (graphPhase.value === 'approved' && (id === 'search' || id === 'build' || id === 'review')) {
    return t(`stage.graph.nodes.${id}.replanState`)
  }
  return t(`stage.graph.nodes.${id}.state`)
}

/* --- Tab 2: Spatial Canvas state --- */
const spatialZoomMacro = ref(false)
const spatialApproval = ref<'pending' | 'approved' | 'rejected'>('pending')

/* --- Tab 3: Thread & Treemap state --- */
const deliverableRows = computed(() => {
  const raw = tm('stage.thread.deliverableRows') as { k: unknown; v: unknown }[]
  return Array.isArray(raw) ? raw.map((r) => ({ k: String(r.k), v: String(r.v) })) : []
})

const stageStatusLabel = computed(() => {
  if (activeTab.value === 'graph') {
    if (graphPhase.value === 'approved') return t('stage.statusDone')
    if (graphPhase.value === 'replanned') return t('stage.statusReview')
    return t('stage.statusLive')
  }
  if (activeTab.value === 'spatial') {
    if (spatialApproval.value === 'approved') return t('stage.statusDone')
    return t('stage.statusReview')
  }
  return t('stage.statusDone')
})

const stageStatusColor = computed(() => {
  if (stageStatusLabel.value === t('stage.statusDone')) return 'var(--accent-success)'
  if (stageStatusLabel.value === t('stage.statusReview')) return 'var(--accent-warning)'
  return 'var(--accent-info)'
})
</script>

<template>
  <div class="mx-auto w-full max-w-6xl">
    <!-- Segmented Stage Switcher -->
    <div class="mb-4 flex justify-center">
      <div
        ref="tabListRef"
        role="tablist"
        aria-label="Interactive Product Stage"
        class="inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/90 p-1 backdrop-blur-md"
        @keydown="onTabKeydown"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          :id="`hero-stage-tab-${tab.id}`"
          :aria-controls="`hero-stage-panel-${tab.id}`"
          :aria-selected="activeTab === tab.id"
          :tabindex="activeTab === tab.id ? 0 : -1"
          class="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all sm:text-[13px]"
          :class="
            activeTab === tab.id
              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs ring-1 ring-[var(--border-default)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          "
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="h-3.5 w-3.5 shrink-0" :class="activeTab === tab.id ? 'text-[var(--text-primary)]' : ''" aria-hidden="true" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- Outer Concentric Spatial Frame -->
    <div class="spatial-frame rounded-[24px] p-1.5 sm:p-2">
      <div class="spatial-inner overflow-hidden rounded-[18px]">
        <!-- Window Chrome -->
        <div class="flex flex-wrap items-center gap-3 border-b-hairline bg-[var(--bg-secondary)] px-4 py-2.5">
          <div class="flex items-center gap-1.5" aria-hidden="true">
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
            <span class="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
          </div>
          <span class="text-xs font-medium text-[var(--text-secondary)]">{{ t('stage.windowTitle') }}</span>
          <span class="mono hidden rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] sm:inline-block">
            /api/v1 · SSE
          </span>
          <span
            class="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
            :style="{
              borderColor: 'color-mix(in srgb, ' + stageStatusColor + ' 35%, transparent)',
              color: stageStatusColor,
              backgroundColor: 'color-mix(in srgb, ' + stageStatusColor + ' 10%, transparent)',
            }"
          >
            <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: stageStatusColor }" />
            {{ stageStatusLabel }}
          </span>
        </div>

        <!-- PANEL 1: Dual-Layer DmaEA Graph -->
        <div
          v-show="activeTab === 'graph'"
          id="hero-stage-panel-graph"
          role="tabpanel"
          aria-labelledby="hero-stage-tab-graph"
          class="relative overflow-hidden p-4 sm:p-6"
        >
          <div class="spatial-dots pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />

          <div class="relative z-10">
            <!-- Control bar -->
            <div class="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p class="text-xs text-[var(--text-muted)]">{{ t('stage.graph.note') }}</p>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                  @click="graphPhase = 'replanned'; selectedNode = 'plan'"
                >
                  <RotateCcw class="h-3 w-3 text-[var(--accent-signal)]" aria-hidden="true" />
                  {{ t('stage.graph.replanBtn') }}
                </button>
                <button
                  type="button"
                  class="btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                  @click="graphPhase = 'approved'; selectedNode = 'review'"
                >
                  <ShieldCheck class="h-3.5 w-3.5" aria-hidden="true" />
                  {{ t('stage.graph.approveBtn') }}
                </button>
                <button
                  v-if="graphPhase !== 'normal'"
                  type="button"
                  class="rounded-full px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  @click="graphPhase = 'normal'"
                >
                  {{ t('stage.graph.resetBtn') }}
                </button>
              </div>
            </div>

            <!-- Two-Layer Node Canvas -->
            <div class="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/85 p-4 backdrop-blur-sm sm:p-6">
              <div class="mb-2.5 flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)]">
                <span class="mono uppercase tracking-wider">{{ t('stage.graph.govLabel') }}</span>
                <span class="mono hidden text-[10px] text-[var(--text-muted)] md:inline">main loop</span>
              </div>

              <div class="grid gap-3 md:grid-cols-3">
                <button
                  v-for="node in govNodes"
                  :key="node.id"
                  type="button"
                  class="group relative flex min-w-0 flex-col rounded-xl border p-3.5 text-left transition-all"
                  :class="
                    selectedNode === node.id
                      ? 'border-[var(--text-primary)] bg-[var(--bg-elevated)] shadow-sm ring-1 ring-[var(--text-primary)]/15'
                      : 'border-[var(--border-default)] bg-[var(--bg-primary)]/90 hover:border-[var(--border-strong)]'
                  "
                  @click="selectedNode = node.id"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                      <component :is="node.icon" class="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span class="mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)]">
                      {{ t(`stage.graph.nodes.${node.id}.en`) }}
                    </span>
                  </div>
                  <div class="mt-2.5 text-sm font-semibold">{{ t(`stage.graph.nodes.${node.id}.title`) }}</div>
                  <div
                    class="mt-1 flex items-center gap-1.5 text-xs font-medium"
                    :style="{
                      color:
                        graphPhase === 'replanned' && node.id === 'plan'
                          ? 'var(--accent-signal)'
                          : 'var(--text-secondary)',
                    }"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :style="{
                        backgroundColor:
                          graphPhase === 'replanned' && node.id === 'plan'
                            ? 'var(--accent-signal)'
                            : 'var(--accent-info)',
                      }"
                    />
                    {{ nodeStateText(node.id) }}
                  </div>
                </button>
              </div>

              <!-- Animated SVG Bridge -->
              <div class="my-3 hidden h-12 items-center justify-center md:flex" aria-hidden="true">
                <svg viewBox="0 0 800 56" class="h-full w-full overflow-visible">
                  <path
                    d="M 135 4 C 135 28, 400 18, 400 28 C 400 38, 135 28, 135 52"
                    fill="none"
                    stroke="var(--border-strong)"
                    stroke-width="1.2"
                  />
                  <path
                    d="M 400 4 L 400 52"
                    fill="none"
                    :stroke="graphPhase === 'approved' ? 'var(--accent-success)' : 'var(--text-primary)'"
                    stroke-width="1.5"
                    class="flow-dash"
                  />
                  <path
                    d="M 665 4 C 665 28, 400 18, 400 28 C 400 38, 665 28, 665 52"
                    fill="none"
                    :stroke="graphPhase === 'replanned' ? 'var(--accent-signal)' : 'var(--border-strong)'"
                    :stroke-width="graphPhase === 'replanned' ? '1.8' : '1.2'"
                    :class="graphPhase === 'replanned' ? 'flow-dash' : ''"
                  />
                  <rect x="330" y="16" width="140" height="24" rx="12" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
                  <text x="400" y="32" text-anchor="middle" fill="var(--text-primary)" font-size="10" font-family="var(--font-mono)">
                    {{ graphPhase === 'approved' ? 'PERMISSION: ALLOWED' : graphPhase === 'replanned' ? 'RE-PLAN ON FAIL' : 'SUBAGENT DISPATCH' }}
                  </text>
                </svg>
              </div>
              <div class="my-3 border-t-hairline md:hidden" />

              <!-- Execution Row -->
              <div class="mb-2.5 flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)]">
                <span class="mono uppercase tracking-wider">{{ t('stage.graph.execLabel') }}</span>
                <span class="mono hidden text-[10px] text-[var(--text-muted)] md:inline">subagents</span>
              </div>

              <div class="grid gap-3 md:grid-cols-3">
                <button
                  v-for="node in execNodes"
                  :key="node.id"
                  type="button"
                  class="group relative flex min-w-0 flex-col rounded-xl border p-3.5 text-left transition-all"
                  :class="
                    selectedNode === node.id
                      ? 'border-[var(--text-primary)] bg-[var(--bg-elevated)] shadow-sm ring-1 ring-[var(--text-primary)]/15'
                      : 'border-[var(--border-default)] bg-[var(--bg-primary)]/90 hover:border-[var(--border-strong)]'
                  "
                  @click="selectedNode = node.id"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
                      <component :is="node.icon" class="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span class="mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)]">
                      {{ t(`stage.graph.nodes.${node.id}.en`) }}
                    </span>
                  </div>
                  <div class="mt-2.5 text-sm font-semibold">{{ t(`stage.graph.nodes.${node.id}.title`) }}</div>
                  <div
                    class="mt-1 flex items-center gap-1.5 text-xs font-medium"
                    :style="{
                      color:
                        graphPhase === 'approved'
                          ? 'var(--accent-success)'
                          : node.id === 'review' && graphPhase === 'normal'
                            ? 'var(--accent-warning)'
                            : 'var(--text-secondary)',
                    }"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :style="{
                        backgroundColor:
                          graphPhase === 'approved'
                            ? 'var(--accent-success)'
                            : node.id === 'review' && graphPhase === 'normal'
                              ? 'var(--accent-warning)'
                              : 'var(--text-muted)',
                      }"
                    />
                    {{ nodeStateText(node.id) }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Selected Node Inspector -->
            <div class="mt-3 grid gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 p-4 sm:grid-cols-[1.2fr_1fr] sm:items-center">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="mono rounded border border-[var(--border-default)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-primary)]">
                    {{ t(`stage.graph.nodes.${selectedNode}.en`) }}
                  </span>
                  <span class="text-sm font-semibold">{{ t(`stage.graph.nodes.${selectedNode}.title`) }}</span>
                </div>
                <p class="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {{ t(`stage.graph.nodes.${selectedNode}.detail`) }}
                </p>
              </div>
              <ul class="min-w-0 space-y-1.5 border-t border-[var(--border-muted)] pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
                <li v-for="item in nodeItems(selectedNode)" :key="item" class="mono flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <CheckCircle2 class="h-3.5 w-3.5 shrink-0 text-[var(--accent-success)]" aria-hidden="true" />
                  <span class="truncate">{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- PANEL 2: Spatial Canvas · UI3 -->
        <div
          v-show="activeTab === 'spatial'"
          id="hero-stage-panel-spatial"
          role="tabpanel"
          aria-labelledby="hero-stage-tab-spatial"
          class="relative overflow-hidden p-4 sm:p-6"
        >
          <div class="spatial-dots pointer-events-none absolute inset-0" aria-hidden="true" />

          <div class="relative z-10">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold">{{ t('stage.spatial.canvasTitle') }}</span>
                <span class="mono rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                  {{ t('stage.spatial.badge') }}
                </span>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                @click="spatialZoomMacro = !spatialZoomMacro"
              >
                <Minimize2 v-if="spatialZoomMacro" class="h-3.5 w-3.5" aria-hidden="true" />
                <Maximize2 v-else class="h-3.5 w-3.5" aria-hidden="true" />
                {{ spatialZoomMacro ? t('stage.spatial.zoomFit') : t('stage.spatial.zoomMacro') }}
              </button>
            </div>

            <!-- Spatial Board Cards -->
            <div
              class="spring-transition relative grid gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/65 p-4 backdrop-blur-sm md:grid-cols-12"
              :class="spatialZoomMacro ? 'scale-[0.97] opacity-95' : 'scale-100'"
            >
              <!-- Main Design / Canvas Node -->
              <div class="min-w-0 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 shadow-xs md:col-span-7">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold">{{ t('stage.spatial.figmaTitle') }}</span>
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--accent-info)]">
                    <MousePointerClick class="h-3.5 w-3.5" aria-hidden="true" />
                    {{ t('stage.spatial.figmaTag') }}
                  </span>
                </div>
                <div class="mt-3 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-secondary)] p-4">
                  <div class="flex items-center gap-3">
                    <div class="h-14 w-16 shrink-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)]" />
                    <div class="min-w-0 flex-1 space-y-2">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="inline-flex items-center rounded-md border-2 border-[var(--accent-info)] bg-[var(--bg-primary)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-primary)]">
                          Application
                        </span>
                        <span class="mono rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--primary-foreground)] shadow-sm">
                          {{ t('stage.spatial.figmaCursor') }}
                        </span>
                      </div>
                      <div class="h-2.5 w-3/4 rounded bg-[var(--border-default)]" />
                      <div class="h-2.5 w-1/2 rounded bg-[var(--border-muted)]" />
                    </div>
                  </div>
                </div>
                <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                  <span class="inline-flex items-center gap-1.5">
                    <GitBranch class="h-3 w-3 text-[var(--text-primary)]" aria-hidden="true" />
                    <span class="mono">{{ t('stage.spatial.vcsBranch') }}</span>
                  </span>
                  <span class="mono">{{ t('stage.spatial.testCli') }}</span>
                </div>
              </div>

              <!-- Plan Ledger & Test Matrix -->
              <div class="flex min-w-0 flex-col gap-3 md:col-span-5">
                <div class="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3.5 shadow-xs">
                  <div class="text-xs font-semibold">{{ t('stage.spatial.tasksTitle') }}</div>
                  <ul class="mt-2 space-y-1.5 text-xs text-[var(--text-secondary)]">
                    <li class="flex items-center gap-2">
                      <CheckCircle2 class="h-3.5 w-3.5 shrink-0 text-[var(--accent-success)]" aria-hidden="true" />
                      <span class="truncate">{{ t('stage.spatial.task1') }}</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <CheckCircle2 class="h-3.5 w-3.5 shrink-0 text-[var(--accent-success)]" aria-hidden="true" />
                      <span class="truncate">{{ t('stage.spatial.task2') }}</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="h-2 w-2 shrink-0 rounded-full bg-[var(--accent-info)]" />
                      <span class="truncate font-medium text-[var(--text-primary)]">{{ t('stage.spatial.task3') }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Interactive Approval Card inside Canvas -->
                <div
                  class="rounded-xl border p-3.5 shadow-xs transition-colors"
                  :class="
                    spatialApproval === 'pending'
                      ? 'border-[var(--accent-warning)]/60 bg-[var(--bg-elevated)]'
                      : spatialApproval === 'approved'
                        ? 'border-[var(--accent-success)]/50 bg-[var(--bg-elevated)]'
                        : 'border-[var(--accent-danger)]/50 bg-[var(--bg-elevated)]'
                  "
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold">{{ t('stage.spatial.approvalTitle') }}</span>
                    <ShieldCheck class="h-3.5 w-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
                  </div>
                  <div class="mono mt-1.5 truncate rounded bg-[var(--bg-secondary)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
                    {{ t('stage.spatial.approvalCmd') }}
                  </div>
                  <div v-if="spatialApproval === 'pending'" class="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      class="btn-primary rounded-full px-3 py-1 text-[11px] font-medium hover:opacity-90"
                      @click="spatialApproval = 'approved'"
                    >
                      {{ t('stage.spatial.approve') }}
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      @click="spatialApproval = 'rejected'"
                    >
                      {{ t('stage.spatial.reject') }}
                    </button>
                  </div>
                  <div v-else class="mt-2 flex items-center justify-between text-[11px]">
                    <span
                      class="inline-flex items-center gap-1 font-medium"
                      :style="{ color: spatialApproval === 'approved' ? 'var(--accent-success)' : 'var(--accent-danger)' }"
                    >
                      <CheckCircle2 v-if="spatialApproval === 'approved'" class="h-3.5 w-3.5" aria-hidden="true" />
                      <XCircle v-else class="h-3.5 w-3.5" aria-hidden="true" />
                      {{ spatialApproval === 'approved' ? t('stage.spatial.approvedText') : t('stage.spatial.rejectedText') }}
                    </span>
                    <button type="button" class="text-[var(--text-muted)] underline" @click="spatialApproval = 'pending'">
                      {{ t('stage.graph.resetBtn') }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Companion Capsule Bar -->
              <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/95 px-3.5 py-2 md:col-span-12">
                <div class="flex items-center gap-2">
                  <span class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                    <Sparkles class="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span class="text-xs font-medium">{{ t('stage.spatial.companionLabel') }}</span>
                  <span class="text-[11px] text-[var(--text-muted)]">· {{ t('stage.spatial.companionHint') }}</span>
                </div>
                <span class="mono text-[11px] text-[var(--text-muted)]">
                  {{ t('stage.spatial.testBrowser') }} · {{ t('stage.spatial.testSsh') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL 3: Codex-style Turn Thread & Context Treemap -->
        <div
          v-show="activeTab === 'thread'"
          id="hero-stage-panel-thread"
          role="tabpanel"
          aria-labelledby="hero-stage-tab-thread"
          class="p-4 sm:p-6"
        >
          <div class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <!-- Turn Conversation + Deliverable -->
            <div class="min-w-0 space-y-3">
              <div class="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3.5">
                <p class="text-sm font-medium">{{ t('stage.thread.userPrompt') }}</p>
                <div class="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-primary)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                  <Paperclip class="h-3 w-3 shrink-0 text-[var(--text-primary)]" aria-hidden="true" />
                  <span class="mono truncate">{{ t('stage.thread.attachmentName') }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 px-1 text-xs text-[var(--text-muted)]">
                <span class="h-2 w-2 rounded-full bg-[var(--accent-success)]" />
                <span class="mono">{{ t('stage.thread.turnMeta') }}</span>
              </div>

              <div class="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 shadow-xs">
                <div class="flex items-center justify-between border-b border-[var(--border-muted)] pb-2.5">
                  <span class="text-xs font-semibold">{{ t('stage.thread.deliverableTitle') }}</span>
                  <CheckCircle2 class="h-4 w-4 text-[var(--accent-success)]" aria-hidden="true" />
                </div>
                <dl class="mt-3 space-y-2.5 text-xs">
                  <div v-for="row in deliverableRows" :key="row.k" class="grid grid-cols-[84px_1fr] gap-2">
                    <dt class="text-[var(--text-muted)]">{{ row.k }}</dt>
                    <dd class="mono break-words text-[var(--text-primary)]">{{ row.v }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Context Treemap & Trajectory Tree -->
            <div class="min-w-0 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
              <div class="text-xs font-semibold">{{ t('stage.thread.traceTitle') }}</div>
              <div class="mt-3 grid grid-cols-12 gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-2">
                <div class="col-span-5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                  <div class="text-[11px] font-medium text-[var(--text-primary)]">{{ t('stage.thread.treemapFindings') }}</div>
                  <div class="mono mt-1 text-sm font-semibold">1.6k</div>
                </div>
                <div class="col-span-4 rounded-lg bg-[var(--bg-tertiary)] p-3">
                  <div class="text-[11px] font-medium text-[var(--text-secondary)]">{{ t('stage.thread.treemapDiff') }}</div>
                  <div class="mono mt-1 text-sm font-semibold">1.1k</div>
                </div>
                <div class="col-span-3 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-secondary)] p-3">
                  <div class="text-[11px] font-medium text-[var(--text-muted)]">{{ t('stage.thread.treemapPlan') }}</div>
                  <div class="mono mt-1 text-sm font-semibold">0.8k</div>
                </div>
                <div class="col-span-12 flex items-center justify-between rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
                  <span>{{ t('stage.thread.treemapCold') }}</span>
                  <span class="mono">14.2k → 0.7k</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL 4: 30s Brand Film -->
        <div
          v-show="activeTab === 'film'"
          id="hero-stage-panel-film"
          role="tabpanel"
          aria-labelledby="hero-stage-tab-film"
          class="bg-[#09090b] p-3 sm:p-4"
        >
          <div class="relative overflow-hidden rounded-xl border border-white/10">
            <video
              class="aspect-video w-full"
              src="/media/tinadec-office-16x9.mp4"
              poster="/media/poster.webp"
              controls
              playsinline
              preload="none"
            />
            <div class="flex items-center justify-between bg-[#111113] px-4 py-2 text-xs text-white/75">
              <span class="inline-flex items-center gap-1.5">
                <Play class="h-3.5 w-3.5 text-white" aria-hidden="true" />
                {{ t('stage.film.title') }}
              </span>
              <span class="hidden text-white/55 sm:inline">{{ t('stage.film.caption') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
