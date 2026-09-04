<template>
  <div class="min-h-screen bg-[#f8fbff] p-3 font-sans text-slate-950 sm:p-4">
    <div class="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1540px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 sm:min-h-[calc(100vh-2rem)]">
      <header class="flex min-h-20 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-8 lg:px-10">
        <AuthBrandMark />

        <nav class="hidden items-center gap-8 text-sm font-semibold text-slate-800 lg:flex" aria-label="Điều hướng xác thực">
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="rounded-md outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex shrink-0 items-center gap-2">
          <NuxtLink
            to="/login"
            :aria-current="active === 'login' ? 'page' : undefined"
            :class="[
              'hidden rounded-lg px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex',
              active === 'login' ? 'bg-sky-50 text-sky-700' : 'text-slate-800 hover:text-sky-700'
            ]"
          >
            Đăng nhập
          </NuxtLink>
          <NuxtLink
            to="/register"
            :aria-current="active === 'register' ? 'page' : undefined"
            :class="[
              'hidden rounded-lg px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex',
              active === 'register' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'border border-slate-200 text-slate-800 hover:border-sky-200 hover:text-sky-700'
            ]"
          >
            Đăng ký
          </NuxtLink>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:border-sky-200 hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            <Icon name="uil:estate" class="h-4 w-4" aria-hidden="true" />
            <span class="hidden sm:inline">Về trang chủ</span>
          </NuxtLink>
        </div>
      </header>

      <div
        :class="[
          'relative grid flex-1 overflow-hidden lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]',
          reverse ? 'lg:grid-cols-[minmax(420px,1.08fr)_minmax(0,0.92fr)]' : ''
        ]"
      >
        <section
          :class="[
            'relative order-2 overflow-hidden px-5 py-10 sm:px-8 lg:px-10 lg:py-12',
            reverse ? 'lg:order-2' : 'lg:order-1',
            heroVariant === 'register' ? 'bg-[#f0f9ff]' : 'bg-[#f8fbff]'
          ]"
          aria-labelledby="auth-hero-title"
        >
          <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_72%_72%,rgba(14,165,233,0.15),transparent_30%)]" />
          <div class="pointer-events-none absolute left-6 top-8 grid grid-cols-6 gap-3 opacity-40">
            <span v-for="dot in 36" :key="dot" class="h-1 w-1 rounded-full bg-sky-500/70" />
          </div>
          <slot name="hero" />
        </section>

        <main
          :class="[
            'relative order-1 flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12',
            reverse ? 'lg:order-1' : 'lg:order-2'
          ]"
        >
          <slot />
        </main>
      </div>

      <footer class="flex flex-col gap-4 bg-slate-950 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div class="flex items-center gap-3">
          <FooterBrandMark compact />
          <span class="text-xs font-medium text-slate-400">Find work. Do more. Grow fast.</span>
        </div>
        <p class="text-xs font-medium text-slate-400">© 2026 QuickWork. All rights reserved.</p>
        <nav class="flex items-center gap-6 text-xs font-bold text-slate-300" aria-label="Liên kết pháp lý">
          <NuxtLink to="#" class="outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10">Điều khoản</NuxtLink>
          <NuxtLink to="#" class="outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10">Bảo mật</NuxtLink>
          <NuxtLink to="#" class="outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-white/10">Hỗ trợ</NuxtLink>
        </nav>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthBrandMark from '~/components/AuthBrandMark.vue'
import FooterBrandMark from '~/components/FooterBrandMark.vue'

withDefaults(defineProps<{
  active: 'login' | 'register'
  heroVariant?: 'login' | 'register'
  reverse?: boolean
}>(), {
  heroVariant: 'login',
  reverse: false
})

const navItems = [
  { label: 'Việc làm', to: '/student' },
  { label: 'Công ty', to: '/' },
  { label: 'Mức lương', to: '/' },
  { label: 'Blog', to: '/' },
  { label: 'Khám phá', to: '/' }
]
</script>
