<template>
  <div class="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
    <!-- Navbar -->
    <header class="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-4">
        <!-- Sidebar Toggle (Mobile only) -->
        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="p-2 rounded-xl text-slate-500 hover:bg-slate-50 lg:hidden focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Icon name="uil:bars" class="w-5.5 h-5.5" />
        </button>

        <!-- Logo -->
        <NuxtLink to="/enterprise" class="flex items-center gap-2 font-bold hover:opacity-90 transition-opacity">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
            <Icon name="uil:briefcase" class="w-4.5 h-4.5 text-white" />
          </div>
          <span class="tracking-tight text-slate-900 font-extrabold text-base">Quick<span class="text-indigo-600">Work</span></span>
          <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded border border-indigo-150/40 uppercase tracking-wider hidden sm:inline">Nhà Tuyển Dụng</span>
        </NuxtLink>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <div class="relative">
          <button 
            @click.stop="toggleNotifications" 
            class="p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors focus:outline-none"
          >
            <Icon name="uil:bell" class="w-5.5 h-5.5" />
            <span class="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>
          
          <!-- Dropdown -->
          <div v-if="showNotifications" @click.stop class="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 text-xs">
            <div class="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
              <span class="font-bold text-slate-900">Thông báo tuyển dụng</span>
              <span class="text-indigo-600 font-semibold cursor-pointer hover:underline">Xem tất cả</span>
            </div>
            <div class="p-4 text-center text-slate-400">
              Chưa có thông báo ứng tuyển mới.
            </div>
          </div>
        </div>

        <!-- User profile dropdown -->
        <div class="relative">
          <button 
            @click.stop="toggleUserMenu" 
            class="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {{ companyInitials }}
            </div>
            <span class="text-xs font-bold text-slate-700 hidden sm:inline">{{ companyName }}</span>
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
                <p class="font-bold text-slate-900 truncate">{{ companyName }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5 truncate">{{ userEmail }}</p>
              </div>
              <div class="py-1">
                <a href="#" class="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                  <Icon name="uil:building" class="w-4.5 h-4.5 text-slate-400" />
                  <span>Hồ sơ doanh nghiệp</span>
                </a>
                <a href="#" class="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors">
                  <Icon name="uil:setting" class="w-4.5 h-4.5 text-slate-400" />
                  <span>Cài đặt tài khoản</span>
                </a>
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
    </header>

    <div class="flex flex-1 relative">
      <!-- Sidebar Mobile Backdrop -->
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 bg-slate-900/40 z-40 lg:hidden transition-opacity"
      ></div>

      <!-- Sidebar Container -->
      <aside 
        :class="[
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-150 pt-16 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:pt-0 shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="h-full px-4 py-6 flex flex-col justify-between overflow-y-auto">
          <ul class="space-y-1.5 font-semibold text-slate-600 text-xs">
            <li>
              <NuxtLink to="/enterprise" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all bg-indigo-50/50 text-indigo-600 border border-indigo-100/30">
                <Icon name="uil:apps" class="w-5 h-5" />
                <span>Dashboard tổng quan</span>
              </NuxtLink>
            </li>
            <li>
              <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                <Icon name="uil:file-alt" class="w-5 h-5" />
                <span>Quản lý tin tuyển dụng</span>
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                <Icon name="uil:users-alt" class="w-5 h-5" />
                <span>Danh sách ứng viên</span>
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                <Icon name="uil:building" class="w-5 h-5" />
                <span>Hồ sơ Công ty</span>
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                <Icon name="uil:bell" class="w-5 h-5" />
                <span>Thông báo tuyển dụng</span>
              </a>
            </li>
            <li>
              <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all">
                <Icon name="uil:setting" class="w-5 h-5" />
                <span>Cài đặt hệ thống</span>
              </a>
            </li>
          </ul>

          <div class="pt-6 border-t border-slate-100 flex flex-col gap-3">
            <!-- Account Info -->
            <div class="px-2 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                {{ companyInitials }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-800 truncate leading-tight">{{ companyName }}</p>
                <span class="text-[9px] font-bold text-green-600 uppercase tracking-wider">KYB Verified</span>
              </div>
            </div>
            
            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-bold text-xs transition-colors"
            >
              <Icon name="uil:sign-out-alt" class="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Layout Content -->
      <main class="flex-1 min-w-0 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)

const companyName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Doanh nghiệp')
const userEmail = computed(() => authStore.user?.email || 'employer@quickwork.vn')
const companyInitials = computed(() => companyName.value.slice(0, 2).toUpperCase())

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
