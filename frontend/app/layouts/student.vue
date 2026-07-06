<template>
  <div class="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
    <!-- Navbar -->
    <header class="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/student" class="flex items-center gap-2 font-bold hover:opacity-90 transition-opacity">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
              <Icon name="uil:briefcase" class="w-4.5 h-4.5 text-white" />
            </div>
            <span class="tracking-tight text-slate-900 font-extrabold text-base">Quick<span class="text-indigo-600">Work</span></span>
          </NuxtLink>
        </div>

        <!-- Right Side Nav Actions -->
        <div class="flex items-center gap-4">
          <!-- Notification Bell -->
          <div class="relative">
            <button 
              @click.stop="toggleNotifications" 
              class="p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Icon name="uil:bell" class="w-5.5 h-5.5" />
              <span class="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            <!-- Notification Dropdown -->
            <div v-if="showNotifications" @click.stop class="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 text-xs">
              <div class="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                <span class="font-bold text-slate-900">Thông báo mới</span>
                <span class="text-indigo-600 font-semibold cursor-pointer hover:underline">Đánh dấu đã đọc</span>
              </div>
              <div class="max-h-60 overflow-y-auto divide-y divide-slate-50">
                <div class="p-3 hover:bg-slate-50/50 cursor-pointer transition-colors flex items-start gap-2.5">
                  <div class="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></div>
                  <div>
                    <p class="text-slate-700 font-medium leading-normal"><span class="font-bold text-slate-900">FPT Software</span> đã gửi lời mời phỏng vấn cho bạn.</p>
                    <span class="text-[10px] text-slate-400 block mt-1">2 giờ trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="relative">
            <button 
              @click.stop="toggleUserMenu" 
              class="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {{ userInitials }}
              </div>
              <span class="text-xs font-bold text-slate-700 hidden sm:inline">{{ userName }}</span>
              <Icon name="uil:angle-down" class="text-slate-400 w-4 h-4 hidden sm:inline" />
            </button>

            <!-- User Menu Dropdown -->
            <transition 
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-if="showUserMenu" @click.stop class="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 text-xs text-slate-700 font-medium">
                <div class="px-4 py-2 border-b border-slate-50">
                  <p class="font-bold text-slate-900 truncate">{{ userName }}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5 truncate">{{ userEmail }}</p>
                </div>
                <div class="py-1">
                  <NuxtLink to="/profile" class="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                    <Icon name="uil:user" class="w-4.5 h-4.5 text-slate-400" />
                    <span>Thông tin cá nhân</span>
                  </NuxtLink>
                  <NuxtLink to="/settings" class="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                    <Icon name="uil:setting" class="w-4.5 h-4.5 text-slate-400" />
                    <span>Cấu hình tài khoản</span>
                  </NuxtLink>
                </div>
                <hr class="border-slate-100" />
                <div class="py-1">
                  <button 
                    @click="handleLogout" 
                    class="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors text-left font-bold"
                  >
                    <Icon name="uil:sign-out-alt" class="w-4.5 h-4.5 text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const showUserMenu = ref(false)
const showNotifications = ref(false)

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Học viên')
const userEmail = computed(() => authStore.user?.email || 'student@quickwork.vn')
const userInitials = computed(() => userName.value.slice(0, 2).toUpperCase())

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

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
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
