import type { RouteLocationNormalized } from 'vue-router'
import i18n from '@/i18n'
import { productBySlug } from '@/data/products'

export function applyDocumentTitle(route: RouteLocationNormalized) {
  const { t } = i18n.global
  const slug = typeof route.params.slug === 'string' ? route.params.slug : ''
  const product = slug ? productBySlug(slug) : undefined

  if (product) {
    document.title = `${t(`${product.i18nKey}.name`)} · Tinadec`
    return
  }

  if (route.name === 'not-found' || route.name === 'product-detail') {
    document.title = `${t('productsPage.notFoundTitle')} · Tinadec`
    return
  }

  const pageTitleMap: Record<string, string> = {
    products: t('nav.products'),
    architecture: t('nav.architecture'),
    download: t('nav.download'),
  }

  const page = typeof route.name === 'string' ? pageTitleMap[route.name] : undefined
  document.title = page ? `${page} · Tinadec` : t('meta.homeTitle')
}
