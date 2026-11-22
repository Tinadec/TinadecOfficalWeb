<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from '@lucide/vue'
import { closeFilmDialog, filmDialogOpen } from '@/composables/useFilmModal'

const { t } = useI18n()
const dialogRef = ref<HTMLDialogElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

watch(filmDialogOpen, async (open) => {
  const el = dialogRef.value
  if (!el) return
  if (open) {
    await nextTick()
    if (!el.open) el.showModal()
    videoRef.value?.play().catch(() => {})
  } else {
    videoRef.value?.pause()
    if (el.open) el.close()
  }
})

function onBackdropClick(e: MouseEvent) {
  if (e.target === dialogRef.value) closeFilmDialog()
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="film-dialog"
    aria-labelledby="film-dialog-title"
    @cancel="closeFilmDialog"
    @close="closeFilmDialog"
    @click="onBackdropClick"
  >
    <div v-if="filmDialogOpen" class="flex flex-col">
      <div class="flex items-center justify-between gap-4 border-b border-[var(--border-default)] px-5 py-3.5">
        <div>
          <h2 id="film-dialog-title" class="text-sm font-semibold">{{ t('stage.film.title') }}</h2>
          <p class="text-xs text-[var(--text-muted)]">{{ t('stage.film.caption') }}</p>
        </div>
        <button
          type="button"
          :aria-label="t('nav.closeMenu')"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          @click="closeFilmDialog"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div class="bg-black p-2 sm:p-3">
        <video
          ref="videoRef"
          class="aspect-video w-full rounded-xl"
          src="/media/tinadec-office-16x9.mp4"
          poster="/media/poster.webp"
          controls
          playsinline
        />
      </div>
    </div>
  </dialog>
</template>
