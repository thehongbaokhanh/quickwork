import type { ComputedRef, MaybeRef } from 'vue'

type ComponentProps<T> = T extends new(...args: any) => { $props: infer P } ? NonNullable<P>
  : T extends (props: infer P, ...args: any) => any ? P
  : {}

declare module 'nuxt/app' {
  interface NuxtLayouts {
    admin: ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/admin.vue").default>
    "admin-vue": ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/admin.vue.js").default>
    auth: ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/auth.vue").default>
    "auth-vue": ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/auth.vue.js").default>
    default: ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/default.vue").default>
    "default-vue": ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/default.vue.js").default>
    enterprise: ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/enterprise.vue").default>
    student: ComponentProps<typeof import("D:/GOLANG/QuickWork/frontend/app/layouts/student.vue").default>
  }
  export type LayoutKey = keyof NuxtLayouts extends never ? string : keyof NuxtLayouts
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false> | {
      [K in LayoutKey]: {
        name?: MaybeRef<K | false> | ComputedRef<K | false>
        props?: NuxtLayouts[K]
      }
    }[LayoutKey]
  }
}