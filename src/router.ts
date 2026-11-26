import { createRouter, createWebHistory } from 'vue-router'
import { applyDocumentTitle } from '@/documentTitle'

const router = createRouter({
  // BASE_URL mirrors the build-time base, so the router strips the hosting
  // subpath (e.g. "/TinadecOfficalWeb/") before matching routes.
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80 }
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
    { path: '/products/', name: 'products', component: () => import('@/pages/ProductsPage.vue') },
    { path: '/products/:slug/', name: 'product-detail', component: () => import('@/pages/ProductDetailPage.vue') },
    { path: '/architecture/', name: 'architecture', component: () => import('@/pages/ArchitecturePage.vue') },
    { path: '/download/', name: 'download', component: () => import('@/pages/DownloadPage.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/ProductDetailPage.vue') },
  ],
})

router.afterEach((to) => applyDocumentTitle(to))

export default router
