<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FrameLines from '@/components/FrameLines.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import FilmDialog from '@/components/FilmDialog.vue'

const { t } = useI18n()
</script>

<template>
  <div class="relative flex min-h-screen flex-col overflow-x-clip bg-[var(--bg-primary)] text-[var(--text-primary)]">
    <a href="#main" class="skip-link">{{ t('nav.skip') }}</a>
    <FrameLines />
    <SiteHeader />
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <router-view />
    </main>
    <SiteFooter />
    <FilmDialog />
  </div>
</template>
