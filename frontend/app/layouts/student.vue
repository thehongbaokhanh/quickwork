<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
    <HomeHeader @notify="notifyDevelopment" />

    <header v-if="false" class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div class="flex min-w-0 items-center gap-8">
          <NuxtLink to="/student" class="flex shrink-0 items-center">
            <img src="/images/brand/quickwork-wordmark-transparent.png" alt="QuickWork" class="h-10 w-auto object-contain">
          </NuxtLink>

          <nav class="hidden items-center gap-1 md:flex">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              :class="[
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors',
                item.active ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              ]"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="relative">
            <button
              type="button"
              class="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
              aria-label="Thông báo"
              @click.stop="toggleNotifications"
            >
              <Icon name="uil:bell" class="h-5 w-5" />
              <span class="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white"></span>
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white py-2 text-sm shadow-xl"
              @click.stop
            >
              <div class="flex items-center justify-between border-b border-slate-100 px-4 pb-2">
                <span class="font-black text-slate-950">Thông báo tuyển dụng</span>
                <button
                  type="button"
                  class="text-xs font-black text-sky-700 hover:text-sky-800"
                  @click="notifyDevelopment('Đánh dấu đã đọc')"
                >
                  Đã đọc
                </button>
              </div>
              <div class="divide-y divide-slate-100">
                <div v-for="notice in notifications" :key="notice.title" class="flex gap-3 px-4 py-3 hover:bg-slate-50">
                  <span :class="['mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', notice.iconClass]">
                    <Icon :name="notice.icon" class="h-4 w-4" />
                  </span>
                  <div>
                    <p class="font-bold leading-5 text-slate-800">{{ notice.title }}</p>
                    <p class="mt-1 text-xs text-slate-500">{{ notice.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
              @click.stop="toggleUserMenu"
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-sm font-black text-white">
                {{ userInitials }}
              </span>
              <span class="hidden max-w-[140px] truncate text-sm font-black text-slate-800 sm:inline">{{ userName }}</span>
              <Icon name="uil:angle-down" class="hidden h-4 w-4 text-slate-400 sm:inline" />
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
                class="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 text-sm font-bold text-slate-700 shadow-xl"
                @click.stop
              >
                <div class="border-b border-slate-100 px-4 pb-3">
                  <p class="truncate font-black text-slate-950">{{ userName }}</p>
                  <p class="mt-0.5 truncate text-xs font-semibold text-slate-500">{{ userEmail }}</p>
                </div>
                <div class="py-1">
                  <NuxtLink to="/profile" class="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-slate-50">
                    <Icon name="uil:user" class="h-4 w-4 text-slate-400" />
                    Hồ sơ cá nhân
                  </NuxtLink>
                  <NuxtLink to="/settings" class="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-slate-50">
                    <Icon name="uil:setting" class="h-4 w-4 text-slate-400" />
                    Cài đặt tài khoản
                  </NuxtLink>
                </div>
                <div class="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2.5 px-4 py-2 text-left font-black text-red-600 transition-colors hover:bg-red-50"
                    @click="handleLogout"
                  >
                    <Icon name="uil:sign-out-alt" class="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <HomeFooter @notify="notifyDevelopment" />

    <footer v-if="false" class="border-t border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 QuickWork. Nền tảng việc làm sinh viên.</p>
        <div class="flex gap-4">
          <button type="button" class="hover:text-sky-700" @click="notifyDevelopment('Trung tâm hỗ trợ')">Hỗ trợ</button>
          <button type="button" class="hover:text-sky-700" @click="notifyDevelopment('Điều khoản sử dụng')">Điều khoản</button>
          <button type="button" class="hover:text-sky-700" @click="notifyDevelopment('Bảo mật')">Bảo mật</button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeHeader from '~/components/home/HomeHeader.vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const showUserMenu = ref(false)
const showNotifications = ref(false)

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Học viên')
const userEmail = computed(() => authStore.user?.email || 'student@quickwork.vn')
const userInitials = computed(() => userName.value.slice(0, 2).toUpperCase())

const navItems = computed(() => [
  { label: 'Việc phù hợp', to: '/student', icon: 'uil:briefcase-alt', active: route.path === '/student' },
  { label: 'Hồ sơ', to: '/profile', icon: 'uil:file-alt', active: route.path === '/profile' },
  { label: 'Cài đặt', to: '/settings', icon: 'uil:setting', active: route.path === '/settings' }
])

const notifications = [
  {
    title: 'FPT Software vừa mở vị trí Software Engineer Intern.',
    time: '2 giờ trước',
    icon: 'uil:briefcase-alt',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    title: 'Hồ sơ của bạn đạt 75%, thêm portfolio để nổi bật hơn.',
    time: 'Hôm nay',
    icon: 'uil:file-check-alt',
    iconClass: 'bg-teal-50 text-teal-700'
  }
]

const notifyDevelopment = (feature: string) => {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`)
}

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
  window.addEventListener('click', closeDropdowns)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
  window.removeEventListener('keydown', handleKeyDown)
})

const handleLogout = () => {
  authStore.logout()
}
</script>
