
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AppFooter: typeof import("../../app/components/AppFooter.vue")['default']
  AppFooterVue: typeof import("../../app/components/AppFooter.vue")['default']
  AppHeader: typeof import("../../app/components/AppHeader.vue")['default']
  AppHeaderVue: typeof import("../../app/components/AppHeader.vue")['default']
  AppSidebar: typeof import("../../app/components/AppSidebar.vue")['default']
  AppSidebarVue: typeof import("../../app/components/AppSidebar.vue")['default']
  ConfirmDialog: typeof import("../../app/components/ConfirmDialog.vue")['default']
  ConfirmDialogVue: typeof import("../../app/components/ConfirmDialog.vue")['default']
  EmptyState: typeof import("../../app/components/EmptyState.vue")['default']
  EmptyStateVue: typeof import("../../app/components/EmptyState.vue")['default']
  LoadingSpinner: typeof import("../../app/components/LoadingSpinner.vue")['default']
  LoadingSpinnerVue: typeof import("../../app/components/LoadingSpinner.vue")['default']
  Pagination: typeof import("../../app/components/Pagination.vue")['default']
  PaginationVue: typeof import("../../app/components/Pagination.vue")['default']
  SearchBox: typeof import("../../app/components/SearchBox.vue")['default']
  SearchBoxVue: typeof import("../../app/components/SearchBox.vue")['default']
  UiButton: typeof import("../../app/components/ui/Button.vue")['default']
  UiButtonVue: typeof import("../../app/components/ui/Button.vue")['default']
  UiInput: typeof import("../../app/components/ui/Input.vue")['default']
  UiInputVue: typeof import("../../app/components/ui/Input.vue")['default']
  UiModal: typeof import("../../app/components/ui/Modal.vue")['default']
  UiModalVue: typeof import("../../app/components/ui/Modal.vue")['default']
  UiSelect: typeof import("../../app/components/ui/Select.vue")['default']
  UiSelectVue: typeof import("../../app/components/ui/Select.vue")['default']
  UiSkeleton: typeof import("../../app/components/ui/Skeleton.vue")['default']
  UiSkeletonVue: typeof import("../../app/components/ui/Skeleton.vue")['default']
  UiTextarea: typeof import("../../app/components/ui/Textarea.vue")['default']
  UiTextareaVue: typeof import("../../app/components/ui/Textarea.vue")['default']
  UiToast: typeof import("../../app/components/ui/Toast.vue")['default']
  UiToastVue: typeof import("../../app/components/ui/Toast.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  Icon: typeof import("../../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAppFooter: LazyComponent<typeof import("../../app/components/AppFooter.vue")['default']>
  LazyAppFooterVue: LazyComponent<typeof import("../../app/components/AppFooter.vue")['default']>
  LazyAppHeader: LazyComponent<typeof import("../../app/components/AppHeader.vue")['default']>
  LazyAppHeaderVue: LazyComponent<typeof import("../../app/components/AppHeader.vue")['default']>
  LazyAppSidebar: LazyComponent<typeof import("../../app/components/AppSidebar.vue")['default']>
  LazyAppSidebarVue: LazyComponent<typeof import("../../app/components/AppSidebar.vue")['default']>
  LazyConfirmDialog: LazyComponent<typeof import("../../app/components/ConfirmDialog.vue")['default']>
  LazyConfirmDialogVue: LazyComponent<typeof import("../../app/components/ConfirmDialog.vue")['default']>
  LazyEmptyState: LazyComponent<typeof import("../../app/components/EmptyState.vue")['default']>
  LazyEmptyStateVue: LazyComponent<typeof import("../../app/components/EmptyState.vue")['default']>
  LazyLoadingSpinner: LazyComponent<typeof import("../../app/components/LoadingSpinner.vue")['default']>
  LazyLoadingSpinnerVue: LazyComponent<typeof import("../../app/components/LoadingSpinner.vue")['default']>
  LazyPagination: LazyComponent<typeof import("../../app/components/Pagination.vue")['default']>
  LazyPaginationVue: LazyComponent<typeof import("../../app/components/Pagination.vue")['default']>
  LazySearchBox: LazyComponent<typeof import("../../app/components/SearchBox.vue")['default']>
  LazySearchBoxVue: LazyComponent<typeof import("../../app/components/SearchBox.vue")['default']>
  LazyUiButton: LazyComponent<typeof import("../../app/components/ui/Button.vue")['default']>
  LazyUiButtonVue: LazyComponent<typeof import("../../app/components/ui/Button.vue")['default']>
  LazyUiInput: LazyComponent<typeof import("../../app/components/ui/Input.vue")['default']>
  LazyUiInputVue: LazyComponent<typeof import("../../app/components/ui/Input.vue")['default']>
  LazyUiModal: LazyComponent<typeof import("../../app/components/ui/Modal.vue")['default']>
  LazyUiModalVue: LazyComponent<typeof import("../../app/components/ui/Modal.vue")['default']>
  LazyUiSelect: LazyComponent<typeof import("../../app/components/ui/Select.vue")['default']>
  LazyUiSelectVue: LazyComponent<typeof import("../../app/components/ui/Select.vue")['default']>
  LazyUiSkeleton: LazyComponent<typeof import("../../app/components/ui/Skeleton.vue")['default']>
  LazyUiSkeletonVue: LazyComponent<typeof import("../../app/components/ui/Skeleton.vue")['default']>
  LazyUiTextarea: LazyComponent<typeof import("../../app/components/ui/Textarea.vue")['default']>
  LazyUiTextareaVue: LazyComponent<typeof import("../../app/components/ui/Textarea.vue")['default']>
  LazyUiToast: LazyComponent<typeof import("../../app/components/ui/Toast.vue")['default']>
  LazyUiToastVue: LazyComponent<typeof import("../../app/components/ui/Toast.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyIcon: LazyComponent<typeof import("../../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
