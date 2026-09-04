export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'vi',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2026-06-24',

  ssr: true,

  // Keep legacy JavaScript build artifacts out of Nuxt's auto-import scan.
  // The TypeScript sources with the same names are the maintained versions.
  ignore: [
    'app/composables/useConversationChat.js',
    'app/composables/useHomeJobs.js',
    'app/composables/useToast.js',
    'app/utils/authRedirect.js',
    'app/utils/conversation.js',
    'app/utils/jobTypeMeta.js',
    'app/utils/searchText.js',
  ],

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/tailwindcss',
  ],

  typescript: {
    strict: true,
    // Run `npm run typecheck` separately. Nuxt's in-process checker can race
    // generated `.nuxt` type/config writes on Windows during dev startup.
    typeCheck: false,
  },

  eslint: {
    // The generated config is created by `nuxt prepare`/build. Re-generating it
    // during every Windows dev refresh can make concurrent Nuxt processes race
    // on `.nuxt/eslint.config.mjs` and fail with UNKNOWN/open errors.
    config: process.env.NODE_ENV !== 'development',
    checker: false,
  },

  runtimeConfig: {
    // Nitro proxies browser /api and /uploads requests to this server-only
    // origin (a private service in production or loopback in the free demo).
    apiProxyTarget:
      process.env.NUXT_API_PROXY_TARGET ||
      'http://localhost:8080',
    // Server-side requests run inside Docker and cannot use the browser-facing
    // relative URL. Keep the backend service address private to Nitro.
    apiBaseInternal:
      process.env.NUXT_API_BASE_INTERNAL ||
      'http://localhost:8080/api/v1',
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        'http://localhost:8080/api/v1',
      geocodingBaseUrl:
        process.env.NUXT_PUBLIC_GEOCODING_BASE_URL ||
        'https://nominatim.openstreetmap.org',
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Segoe UI"', '"Inter"', '"Be Vietnam Pro"', '"Noto Sans"', 'Arial', 'sans-serif'],
          },
        },
      },
    },
  },
})
