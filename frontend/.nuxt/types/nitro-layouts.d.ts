export type LayoutKey = "admin" | "admin-vue" | "auth" | "auth-vue" | "default" | "default-vue" | "enterprise" | "enterprise-vue" | "student" | "student-vue"
declare module 'nitropack' {
  interface NitroRouteConfig {
    appLayout?: LayoutKey | false
  }
  interface NitroRouteRules {
    appLayout?: LayoutKey | false
  }
}
declare module 'nitropack/types' {
  interface NitroRouteConfig {
    appLayout?: LayoutKey | false
  }
  interface NitroRouteRules {
    appLayout?: LayoutKey | false
  }
}