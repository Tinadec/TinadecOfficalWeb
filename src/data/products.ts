import type { Component } from 'vue'
import { AppWindow, Cpu, GraduationCap, Layers, Route, TerminalSquare, Wrench } from '@lucide/vue'

export type ProductKey = 'office' | 'core' | 'tools' | 'gateway' | 'tinaclass' | 'band'
export type ProductCategory = 'platform' | 'workbench'

export interface ProductMeta {
  key: ProductKey
  slug: string
  category: ProductCategory
  icon: Component
  i18nKey: string
  repoUrl: string
  releaseUrl?: string
  installCmd: string
  platforms: string[]
}

export const COMMUNITY_LINKS = {
  githubOrg: 'https://github.com/Tinadec',
  officeRepo: 'https://github.com/Tinadec/TinadecOffice',
  officeReleases: 'https://github.com/Tinadec/TinadecOffice/releases',
  coreRepo: 'https://github.com/Tinadec/TinadecCore',
  tinaclassRepo: 'https://github.com/Tinadec/TinaClass',
  bandRepo: 'https://github.com/wwiinnddyy/TinadecBand',
  discord: 'https://discord.gg/EcKYQfbG72',
  feishu: 'https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=7a3k9813-07f8-4e13-b00c-d9d1c07d539b',
  x: 'https://x.com/tinadecoffice',
  qqGroup: '370780878',
} as const

export const PRODUCTS: ProductMeta[] = [
  {
    key: 'office',
    slug: 'tinadec-office',
    category: 'platform',
    icon: AppWindow,
    i18nKey: 'products.items.office',
    repoUrl: COMMUNITY_LINKS.officeRepo,
    releaseUrl: COMMUNITY_LINKS.officeReleases,
    installCmd: 'bun install && bun run dev',
    platforms: ['Windows', 'macOS', 'Linux'],
  },
  {
    key: 'core',
    slug: 'tinadec-core',
    category: 'platform',
    icon: Cpu,
    i18nKey: 'products.items.core',
    repoUrl: COMMUNITY_LINKS.coreRepo,
    installCmd: 'dotnet add package TinadecCore.Runtime',
    platforms: ['.NET 10', 'SQLite', 'PostgreSQL'],
  },
  {
    key: 'tools',
    slug: 'tinadec-tools',
    category: 'platform',
    icon: Wrench,
    i18nKey: 'products.items.tools',
    repoUrl: `${COMMUNITY_LINKS.officeRepo}/tree/main/TinadecTools`,
    installCmd: 'dotnet build TinadecTools/TinadecTools.csproj',
    platforms: ['Windows Sandbox', 'Bubblewrap', 'MCP'],
  },
  {
    key: 'gateway',
    slug: 'tinadec-gateway',
    category: 'platform',
    icon: Route,
    i18nKey: 'products.items.gateway',
    repoUrl: `${COMMUNITY_LINKS.officeRepo}/tree/main/TinadecGateway`,
    installCmd: 'bun run --cwd TinadecGateway dev',
    platforms: ['Elysia', 'Bun', 'OpenAPI'],
  },
  {
    key: 'tinaclass',
    slug: 'tina-class',
    category: 'workbench',
    icon: GraduationCap,
    i18nKey: 'products.items.tinaclass',
    repoUrl: COMMUNITY_LINKS.tinaclassRepo,
    installCmd: 'dotnet run --project src/TinaClass.App',
    platforms: ['Windows', 'macOS', 'Linux'],
  },
  {
    key: 'band',
    slug: 'tinadec-band',
    category: 'workbench',
    icon: TerminalSquare,
    i18nKey: 'products.items.band',
    repoUrl: COMMUNITY_LINKS.bandRepo,
    installCmd: 'dotnet build TinadecBand.slnx',
    platforms: ['Windows x64'],
  },
]

export const LAYER_ICON = Layers

export function productBySlug(slug: string): ProductMeta | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function productPath(meta: ProductMeta): string {
  return `/products/${meta.slug}/`
}

export function adjacentProducts(meta: ProductMeta): { prev?: ProductMeta; next?: ProductMeta } {
  const index = PRODUCTS.indexOf(meta)
  return {
    prev: index > 0 ? PRODUCTS[index - 1] : undefined,
    next: index >= 0 && index < PRODUCTS.length - 1 ? PRODUCTS[index + 1] : undefined,
  }
}
