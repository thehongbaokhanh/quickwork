<template>
  <div class="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
    <div class="flex flex-1 h-screen overflow-hidden">
      <!-- Sidebar Desktop -->
      <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col relative z-20">
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-slate-100">
          <div class="flex items-center gap-2 font-bold text-lg text-slate-900">
            <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Icon name="uil:rocket" class="w-5 h-5" />
            </div>
            <span>QuickWork</span>
          </div>
        </div>

        <!-- Menu -->
        <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <NuxtLink v-for="item in menuItems" :key="item.path" :to="item.path" active-class="bg-blue-50 text-blue-700 font-medium" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Icon :name="item.icon" class="w-5 h-5" />
            <span class="text-sm">{{ item.name }}</span>
          </NuxtLink>
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-100">
          <button @click="handleLogout" class="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-medium">
            <Icon name="uil:sign-out-alt" class="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative z-10">
        <!-- Top Navbar -->
        <header class="bg-white/80 backdrop-blur-md h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div class="flex items-center gap-4">
            <button class="md:hidden text-slate-500 hover:text-slate-700">
              <Icon name="uil:bars" class="w-6 h-6" />
            </button>
            <div class="hidden md:flex items-center text-sm text-slate-500">
              <span class="hover:text-slate-900 cursor-pointer transition-colors">Admin</span>
              <Icon name="uil:angle-right-b" class="w-4 h-4 mx-1" />
              <span class="font-medium text-slate-900">{{ currentRouteName }}</span>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Search -->
            <div class="relative hidden sm:block">
              <Icon name="uil:search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm..." class="w-64 pl-9 pr-4 py-1.5 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm transition-all outline-none" />
            </div>

            <!-- Notifications -->
            <button class="relative text-slate-500 hover:text-slate-700 transition-colors">
              <Icon name="uil:bell" class="w-6 h-6" />
              <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <!-- User Dropdown -->
            <div class="relative group cursor-pointer pl-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {{ userInitial }}
                </div>
                <Icon name="uil:angle-down" class="w-4 h-4 text-slate-400" />
              </div>
              <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
                <div class="p-3 border-b border-slate-100">
                  <p class="text-sm font-medium text-slate-900">{{ authStore.user?.email || 'Admin User' }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ authStore.userRole }}</p>
                </div>
                <div class="p-1">
                  <NuxtLink to="/admin/settings" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
                    <Icon name="uil:setting" /> Cài đặt
                  </NuxtLink>
                  <button @click="handleLogout" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left">
                    <Icon name="uil:sign-out-alt" /> Đăng xuất
                  </button>
                </div>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const authStore = useAuthStore()
const route = useRoute()
const toast = useToast()

const handleLogout = async () => {
  await authStore.logout()
  toast.info('Đăng xuất thành công', 'Hẹn gặp lại!')
}

const userInitial = computed(() => {
  const email = authStore.user?.email || 'A'
  return email.charAt(0).toUpperCase()
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