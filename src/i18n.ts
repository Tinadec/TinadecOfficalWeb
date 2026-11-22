import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import en from './locales/en'

function getSavedLocale(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('tinadec-locale')
    if (saved === 'zh-CN' || saved === 'en') return saved
  }
  return 'zh-CN'
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    en,
  },
})

export default i18n
