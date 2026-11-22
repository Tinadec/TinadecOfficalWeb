import { ref } from 'vue'

export const filmDialogOpen = ref(false)

export function openFilmDialog() {
  filmDialogOpen.value = true
}

export function closeFilmDialog() {
  filmDialogOpen.value = false
}
