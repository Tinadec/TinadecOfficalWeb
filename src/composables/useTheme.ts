import { computed, ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'tinadec-theme'

const mode = ref<ThemeMode>('system')
const systemDark = ref(false)
let initialized = false

function applyDomTheme() {
  if (typeof document === 'undefined') return
  const dark = mode.value === 'dark' || (mode.value === 'system' && systemDark.value)
  document.documentElement.classList.toggle('dark', dark)
}

export function initTheme() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mq.matches
  mq.addEventListener('change', (e) => {
    systemDark.value = e.matches
    applyDomTheme()
  })

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      mode.value = saved
    }
  } catch {
    // Storage disabled; stay in system mode
  }
  applyDomTheme()
}

export function useTheme() {
  initTheme()

  const resolvedTheme = computed<'light' | 'dark'>(() =>
    mode.value === 'dark' || (mode.value === 'system' && systemDark.value) ? 'dark' : 'light',
  )

  function setTheme(next: ThemeMode) {
    mode.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage failures
    }
    applyDomTheme()
  }

  function toggleDarkLight() {
    setTheme(resolvedTheme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    mode,
    resolvedTheme,
    setTheme,
    toggleDarkLight,
  }
}
