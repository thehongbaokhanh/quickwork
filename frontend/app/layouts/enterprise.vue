<template>
  <div class="min-h-screen bg-[#f5f7fb] font-sans text-slate-900 antialiased">
    <header class="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <button
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Mở menu"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            <Icon name="uil:bars" class="h-5 w-5" />
          </button>

          <NuxtLink to="/enterprise" class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
              <Icon name="uil:briefcase" class="h-5 w-5" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-black leading-tight text-slate-950">
                Quick<span class="text-indigo-600">Work</span>
              </span>
              <span class="block text-[11px] font-semibold leading-tight text-slate-500">
                Nhà tuyển dụng
              </span>
            </span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="relative">
            <button
              class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Thông báo"
              @click.stop="toggleNotifications"
            >
              <Icon name="uil:bell" class="h-5 w-5" />
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-xl"
              @click.stop
            >
              <div class="border-b border-slate-100 px-4 py-3">
                <p class="font-bold text-slate-950">Thông báo tuyển dụng</p>
                <p class="mt-0.5 text-xs text-slate-500">Chưa có nguồn dữ liệu thông báo được tích hợp.</p>
              </div>
              <div class="px-4 py-5 text-sm text-slate-500">
                Khi hệ thống có dữ liệu ứng tuyển thật, thông báo sẽ hiển thị tại đây.
              </div>
            </div>
          </div>

          <div class="relative">
            <button
              class="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-100"
              @click.stop="toggleUserMenu"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                {{ companyInitials }}
              </span>
              <span class="hidden min-w-0 text-left sm:block">
                <span class="block max-w-36 truncate text-xs font-bold text-slate-800">{{ companyName }}</span>
                <span class="block max-w-36 truncate text-[11px] text-slate-500">{{ userEmail || 'Tài khoản doanh nghiệp' }}</span>
              </span>
              <Icon name="uil:angle-down" class="hidden h-4 w-4 text-slate-400 sm:block" />
            </button>

            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="scale-95 opacity-0"
              enter-to-class="scale-100 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="scale-100 opacity-100"
              leave-to-class="scale-95 opacity-0"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-xl"
                @click.stop
              >
                <div class="border-b border-slate-100 px-4 py-3">
                  <p class="truncate font-bold text-slate-950">{{ companyName }}</p>
                  <p class="mt-0.5 truncate text-xs text-slate-500">{{ userEmail || 'Chưa có email trong phiên đăng nhập' }}</p>
                </div>
                <div class="py-1">
                  <NuxtLink
                    to="/enterprise/jobs"
                    class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50"
                    @click="closeDropdowns"
                  >
                    <Icon name="uil:file-alt" class="h-4.5 w-4.5 text-slate-400" />
                    <span>Danh sách tin tuyển dụng</span>
                  </NuxtLink>
                  <NuxtLink
                    to="/enterprise/jobs/create"
                    class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50"
                    @click="closeDropdowns"
                  >
                    <Icon name="uil:plus-circle" class="h-4.5 w-4.5 text-slate-400" />
                    <span>Tạo tin mới</span>
                  </NuxtLink>
                </div>
                <button
                  class="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left font-bold text-rose-600 transition hover:bg-rose-50"
                  @click="handleLogout"
                >
                  <Icon name="uil:sign-out-alt" class="h-4.5 w-4.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <div class="relative flex min-h-[calc(100vh-4rem)]">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        @click="isSidebarOpen = false"
      />

      <aside
        :class="[
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white pt-16 transition-transform duration-200 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:pt-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="flex h-full flex-col justify-between overflow-y-auto px-4 py-6">
          <nav class="space-y-1.5 text-sm font-semibold">
            <NuxtLink
              v-for="item in primaryNavItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              active-class="border-indigo-100 bg-indigo-50 text-indigo-700"
              @click="isSidebarOpen = false"
            >
              <Icon :name="item.icon" class="h-5 w-5" />
              <span>{{ item.name }}</span>
            </NuxtLink>

            <button
              v-for="item in disabledNavItems"
              :key="item.name"
              class="flex w-full cursor-not-allowed items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-slate-400"
              type="button"
              disabled
            >
              <Icon :name="item.icon" class="h-5 w-5" />
              <span>{{ item.name }}</span>
              <span class="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                Sắp có
              </span>
            </button>
          </nav>

          <div class="border-t border-slate-100 pt-5">
            <div class="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-indigo-700 shadow-sm">
                {{ companyInitials }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-slate-900">{{ companyName }}</p>
                <p class="truncate text-xs text-slate-500">{{ userRoleLabel }}</p>
              </div>
            </div>

            <button
              class="mt-3 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
              @click="handleLogout"
            >
              <Icon name="uil:sign-out-alt" class="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto w-full max-w-7xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)

const primaryNavItems = [
  { name: 'Tổng quan', to: '/enterprise', icon: 'uil:apps' },
  { name: 'Tin tuyển dụng', to: '/enterprise/jobs', icon: 'uil:file-alt' },
  { name: 'Tạo tin mới', to: '/enterprise/jobs/create', icon: 'uil:plus-circle' }
]

const disabledNavItems = [
  { name: 'Ứng viên', icon: 'uil:users-alt' },
  { name: 'Hồ sơ công ty', icon: 'uil:building' },
  { name: 'Cài đặt', icon: 'uil:setting' }
]

const companyName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Doanh nghiệp')
const userEmail = computed(() => authStore.user?.email || '')
const userRoleLabel = computed(() => (authStore.userRole === 'ENTERPRISE' ? 'Tài khoản nhà tuyển dụng' : 'Phiên đăng nhập'))
const companyInitials = computed(() => {
  const source = companyName.value.trim() || 'DN'
  return source
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const closeDropdowns = () => {
  showUserMenu.value = false
  showNotifications.value = false
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdowns()
  }
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('click', closeDropdowns)
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('click', closeDropdowns)
    window.removeEventListener('keydown', handleKeyDown)
  }
})

const handleLogout = () => {
  authStore.logout()
}
</script>
