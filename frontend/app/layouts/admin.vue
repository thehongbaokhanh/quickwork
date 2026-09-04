<template>
  <div class="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
    <div class="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
        @click="isSidebarOpen = false"
      />
      <!-- Sidebar Desktop -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-900 bg-slate-950 text-white transition-[transform,width] duration-200 md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isSidebarCollapsed ? 'md:w-[72px] sidebar-collapsed' : 'md:w-64'
        ]"
      >
        <!-- Admin workspace identity -->
        <div :class="['relative h-16 flex items-center border-b border-white/10', isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-5']">
          <div :class="['flex min-w-0 items-center', isSidebarCollapsed ? 'justify-center' : 'gap-3']">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300 shadow-sm shadow-sky-950/30">
              <Icon name="uil:shield-check" class="h-6 w-6" aria-hidden="true" />
            </span>
            <span v-if="!isSidebarCollapsed" class="min-w-0">
              <span class="block truncate text-sm font-black uppercase text-white">{{ adminDisplayName }}</span>
              <span class="mt-0.5 block truncate text-[11px] font-semibold text-slate-400">{{ systemName }} Control</span>
            </span>
          </div>
          <button
            type="button"
            class="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-slate-800 shadow-md shadow-slate-950/20 ring-2 ring-slate-100 transition hover:border-sky-500 hover:bg-sky-600 hover:text-white hover:ring-sky-100 md:absolute md:-right-3 md:top-1/2 md:inline-flex md:-translate-y-1/2"
            :aria-label="isSidebarCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'"
            @click="isSidebarCollapsed = !isSidebarCollapsed"
          >
            <Icon :name="isSidebarCollapsed ? 'uil:angle-right-b' : 'uil:angle-left-b'" class="h-4 w-4" />
          </button>
        </div>

        <!-- Menu -->
        <div :class="['flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar', isSidebarCollapsed ? 'px-2' : 'px-3']">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            active-class="bg-sky-500 text-slate-950 font-black shadow-sm shadow-sky-950/20"
            :class="[
              'flex items-center text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
              isSidebarCollapsed ? 'mx-auto h-11 w-11 justify-center rounded-xl p-0' : 'gap-3 rounded-lg px-3 py-2'
            ]"
            :title="isSidebarCollapsed ? item.name : undefined"
            @click="isSidebarOpen = false"
          >
            <Icon :name="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="!isSidebarCollapsed" class="text-sm">{{ item.name }}</span>
          </NuxtLink>
        </div>

        <!-- Sidebar Footer -->
        <div :class="['sidebar-footer border-t border-white/10', isSidebarCollapsed ? 'p-2.5' : 'p-4']">
          <button
            :class="[
              'flex items-center text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white',
              isSidebarCollapsed ? 'mx-auto h-11 w-11 justify-center rounded-xl p-0' : 'w-full gap-3 rounded-lg px-3 py-2'
            ]"
            :title="isSidebarCollapsed ? 'Dang xuat' : undefined"
            @click="handleLogout"
          >
            <Icon name="uil:sign-out-alt" class="w-5 h-5 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col bg-slate-100">
        <!-- Top Navbar -->
        <header class="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div class="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div class="flex min-w-0 items-center gap-4">
              <button
                class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
                @click="isSidebarOpen = true"
                aria-label="Mở menu"
              >
                <Icon name="uil:bars" class="h-5 w-5" />
              </button>

              <NuxtLink to="/admin/dashboard" class="flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <Icon :name="currentRouteIcon" class="h-5 w-5" aria-hidden="true" />
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-black leading-tight text-slate-950">
                    Trung tâm quản trị
                  </span>
                  <span class="block max-w-40 truncate text-[11px] font-semibold leading-tight text-slate-500">
                    {{ currentRouteName }}
                  </span>
                </span>
              </NuxtLink>

              <div class="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 lg:flex">
                <Icon name="uil:shield-check" class="h-4 w-4 text-sky-600" />
                <span>Phiên quản trị</span>
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
                  <span
                    v-if="adminUnreadCount > 0"
                    class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white"
                  >
                    {{ adminUnreadCount > 9 ? '9+' : adminUnreadCount }}
                  </span>
                </button>

                <div
                  v-if="showNotifications"
                  class="absolute right-0 z-50 mt-2"
                  @click.stop
                >
                  <UiNotificationDropdown
                    title="Thông báo quản trị"
                    :unread-count="adminUnreadCount"
                    :loading="adminNotificationLoading"
                    :items="adminNotifications"
                    empty-text="Chưa có thông báo quản trị nào."
                    storage-key="admin-header"
                    :get-icon="getAdminNotificationIcon"
                    :get-icon-class="getAdminNotificationIconClass"
                    @mark-all-read="markAdminNotificationsRead"
                    @open="openAdminNotification"
                  />
                                  </div>
              </div>

              <div class="relative">
                <button
                  class="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-100"
                  @click.stop="toggleUserMenu"
                >
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-xs font-black text-white">
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
        <main class="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
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
import { NotificationService } from '~/services/notification.service'

const authStore = useAuthStore()
const { adminDisplayName, systemName } = usePlatformSettings()
const route = useRoute()
const toast = useToast()
const isSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const adminNotifications = ref<any[]>([])
const adminUnreadCount = ref(0)
const adminNotificationLoading = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  toast.info('Đăng xuất thành công', 'Hẹn gặp lại!')
}

const adminName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || adminDisplayName.value)
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
  if (showNotifications.value) {
    loadAdminNotifications()
  }
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
  loadAdminNotifications()
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
  { name: 'Danh mục', path: '/admin/categories', icon: 'uil:tag-alt' },
  { name: 'Báo cáo', path: '/admin/reports', icon: 'uil:chart-line' },
  { name: 'Cài đặt', path: '/admin/settings', icon: 'uil:setting' }
]

const currentRouteName = computed(() => {
  const item = menuItems.find(m => route.path.startsWith(m.path))
  return item ? item.name : 'Trang quản trị'
})

const currentRouteIcon = computed(() => {
  const item = menuItems.find(m => route.path.startsWith(m.path))
  return item?.icon || 'uil:shield-check'
})

async function loadAdminNotifications() {
  adminNotificationLoading.value = true
  try {
    const [listResponse, unreadResponse]: any[] = await Promise.all([
      NotificationService.list({ page: 1, page_size: 100 }),
      NotificationService.unreadCount()
    ])
    adminNotifications.value = listResponse?.data?.items || []
    adminUnreadCount.value = Number(unreadResponse?.data?.unread_count || 0)
  } catch {
    adminNotifications.value = []
    adminUnreadCount.value = 0
  } finally {
    adminNotificationLoading.value = false
  }
}

async function markAdminNotificationsRead() {
  try {
    await NotificationService.markAllAsRead()
    await loadAdminNotifications()
  } catch (error: any) {
    toast.error('Không thể cập nhật thông báo', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  }
}

async function openAdminNotification(item: any) {
  try {
    const unreadIDs = Array.isArray(item.unread_ids)
      ? item.unread_ids
      : (item.is_read ? [] : [item.id])
    if (unreadIDs.length > 0) {
      await Promise.all(unreadIDs.map((id: string | number) => NotificationService.markAsRead(id)))
      const readIDSet = new Set(unreadIDs.map(String))
      adminNotifications.value.forEach((notification) => {
        if (readIDSet.has(String(notification.id))) notification.is_read = true
      })
      adminUnreadCount.value = Math.max(0, adminUnreadCount.value - unreadIDs.length)
    }
  } catch {
    // Keep the dropdown responsive even if the read-state update fails.
  }

  const target = normalizeAdminActionURL(item.action_url)
  if (target) {
    closeDropdowns()
    await navigateTo(target)
  }
}

function normalizeAdminActionURL(value?: string) {
  if (!value) return ''
  if (value.startsWith('/admin/') || value.startsWith('/enterprise/') || value.startsWith('/student/')) return value
  return ''
}

function getAdminNotificationIcon(type?: string) {
  if (type === 'KYB') return 'uil:shield-check'
  if (type === 'MESSAGE') return 'uil:comment-alt-message'
  if (type === 'JOB') return 'uil:briefcase-alt'
  if (type === 'APPLICATION') return 'uil:user-plus'
  return 'uil:bell'
}

function getAdminNotificationIconClass(type?: string) {
  if (type === 'KYB') return 'bg-cyan-50 text-cyan-700'
  if (type === 'MESSAGE') return 'bg-violet-50 text-violet-700'
  if (type === 'JOB') return 'bg-sky-50 text-sky-700'
  if (type === 'APPLICATION') return 'bg-emerald-50 text-emerald-700'
  return 'bg-slate-50 text-slate-600'
}
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

.sidebar-collapsed .sidebar-footer span {
  display: none;
}
</style>
