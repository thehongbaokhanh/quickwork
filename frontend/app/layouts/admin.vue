<template>
  <div class="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
    <div class="flex flex-1 h-screen overflow-hidden">
      <!-- Sidebar Desktop -->
      <aside class="w-64 bg-slate-950 border-r border-slate-900 hidden md:flex flex-col relative z-20 text-white">
        <!-- Logo -->
        <div class="h-16 flex items-center px-5 border-b border-white/10">
          <div class="flex min-w-0 items-center gap-3 font-bold text-lg">
            <img src="/images/brand/quickwork-icon-dark-transparent.png" alt="QuickWork" class="h-9 w-9 shrink-0 rounded-lg object-contain">
            <span class="truncate">Quick<span class="text-emerald-400">Work</span></span>
          </div>
        </div>

        <!-- Menu -->
        <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path" active-class="bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-950/20" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Icon :name="item.icon" class="w-5 h-5" />
            <span class="text-sm">{{ item.name }}</span>
          </NuxtLink>
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-white/10">
          <button @click="handleLogout" class="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold">
            <Icon name="uil:sign-out-alt" class="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 bg-slate-100 relative z-10">
        <!-- Top Navbar -->
        <header class="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div class="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div class="flex min-w-0 items-center gap-4">
              <button
                class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
                aria-label="Mở menu"
              >
                <Icon name="uil:bars" class="h-5 w-5" />
              </button>

              <NuxtLink to="/admin/dashboard" class="flex min-w-0 items-center gap-3">
                <img src="/images/brand/quickwork-icon-dark-transparent.png" alt="QuickWork" class="h-10 w-10 shrink-0 rounded-lg object-contain shadow-sm">
                <span class="min-w-0">
                  <span class="block text-sm font-black leading-tight text-slate-950">
                    Quick<span class="text-emerald-600">Work</span>
                  </span>
                  <span class="block max-w-40 truncate text-[11px] font-semibold leading-tight text-slate-500">
                    Quản trị hệ thống
                  </span>
                </span>
              </NuxtLink>

              <div class="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 lg:flex">
                <Icon name="uil:apps" class="h-4 w-4 text-emerald-600" />
                <span>{{ currentRouteName }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 sm:gap-3">
              <div class="relative">
                <button
                  class="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Thông báo"
                  @click.stop="toggleNotifications"
                >
                  <Icon name="uil:bell" class="h-5 w-5" />
                  <span class="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-emerald-500"></span>
                </button>

                <div
                  v-if="showNotifications"
                  class="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-xl"
                  @click.stop
                >
                  <div class="border-b border-slate-100 px-4 py-3">
                    <p class="font-bold text-slate-950">Thông báo quản trị</p>
                    <p class="mt-0.5 text-xs text-slate-500">Các cảnh báo hệ thống sẽ hiển thị tại đây.</p>
                  </div>
                  <div class="px-4 py-5 text-sm text-slate-500">
                    Tính năng thông báo chi tiết đang phát triển.
                  </div>
                </div>
              </div>

              <div class="relative">
                <button
                  class="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-100"
                  @click.stop="toggleUserMenu"
                >
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">
                    {{ adminInitials }}
                  </span>
                  <span class="hidden min-w-0 text-left sm:block">
                    <span class="block max-w-36 truncate text-xs font-bold text-slate-800">{{ adminName }}</span>
                    <span class="block max-w-36 truncate text-[11px] text-slate-500">{{ userEmail || 'Tài khoản quản trị' }}</span>
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
                      <p class="truncate font-bold text-slate-950">{{ adminName }}</p>
                      <p class="mt-0.5 truncate text-xs text-slate-500">{{ userEmail || 'Chưa có email trong phiên đăng nhập' }}</p>
                    </div>
                    <div class="py-1">
                      <NuxtLink
                        to="/admin/settings"
                        class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50"
                        @click="closeDropdowns"
                      >
                        <Icon name="uil:setting" class="h-4.5 w-4.5 text-slate-400" />
                        <span>Cài đặt</span>
                      </NuxtLink>
                      <NuxtLink
                        to="/admin/dashboard"
                        class="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50"
                        @click="closeDropdowns"
                      >
                        <Icon name="uil:apps" class="h-4.5 w-4.5 text-slate-400" />
                        <span>Dashboard</span>
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

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const authStore = useAuthStore()
const route = useRoute()
const toast = useToast()
const showUserMenu = ref(false)
const showNotifications = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  toast.info('Đăng xuất thành công', 'Hẹn gặp lại!')
}

const adminName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Admin')
const userEmail = computed(() => authStore.user?.email || '')
const adminInitials = computed(() => {
  const source = adminName.value.trim() || 'AD'
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

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'uil:apps' },
  { name: 'Người dùng', path: '/admin/users', icon: 'uil:users-alt' },
  { name: 'Học viên', path: '/admin/students', icon: 'uil:graduation-cap' },
  { name: 'Doanh nghiệp', path: '/admin/enterprises', icon: 'uil:building' },
  { name: 'Việc làm', path: '/admin/jobs', icon: 'uil:briefcase-alt' },
  { name: 'Ứng tuyển', path: '/admin/applications', icon: 'uil:file-alt' },
  { name: 'Danh mục', path: '/admin/categories', icon: 'uil:tag-alt' },
  { name: 'Báo cáo', path: '/admin/reports', icon: 'uil:chart-line' },
  { name: 'Cài đặt', path: '/admin/settings', icon: 'uil:setting' }
]

const currentRouteName = computed(() => {
  const item = menuItems.find(m => route.path.startsWith(m.path))
  return item ? item.name : 'Trang quản trị'
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
