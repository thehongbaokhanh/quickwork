<template>
  <div v-if="isPublicStudentBoard" class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
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

  <div v-else class="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="flex h-[78px] items-center justify-between gap-5 px-5 lg:px-8">
        <div class="flex min-w-0 items-center gap-4">
          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 lg:hidden"
            aria-label="Mở menu sinh viên"
            @click.stop="isSidebarOpen = true"
          >
            <Icon name="uil:bars" class="h-5 w-5" aria-hidden="true" />
          </button>

          <NuxtLink
            to="/"
            class="inline-flex min-w-0 items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            aria-label="QuickWork - về trang chủ"
          >
            <img
              src="/images/brand/quickwork-icon-dark-transparent.png"
              alt="QuickWork"
              class="h-12 w-12 shrink-0 rounded-2xl object-contain shadow-sm"
            >
            <span class="hidden min-w-0 sm:block">
              <span class="block text-2xl font-black leading-none tracking-normal text-slate-950">
                Quick<span class="text-sky-600">Work</span>
              </span>
              <span class="mt-1 block text-[11px] font-semibold leading-none text-slate-400">
                Find work. Do more. Grow fast.
              </span>
            </span>
          </NuxtLink>
        </div>

        <nav class="hidden items-center gap-8 text-sm font-extrabold text-slate-900 xl:flex" aria-label="Điều hướng sinh viên">
          <template v-for="item in headerNavItems" :key="item.label">
            <div
              v-if="item.careerMenu"
              class="relative"
              @mouseenter="showCareerMenu = true"
              @mouseleave="showCareerMenu = false"
              @focusin="showCareerMenu = true"
              @focusout="handleCareerFocusOut"
            >
              <button
                type="button"
                :class="headerNavItemClass(item)"
                :aria-expanded="showCareerMenu"
                aria-controls="student-career-tools-menu"
                @click.stop="showCareerMenu = !showCareerMenu"
              >
                {{ item.label }}
                <Icon name="uil:angle-down" :class="['ml-1 h-4 w-4 transition-transform', showCareerMenu ? 'rotate-180' : '']" aria-hidden="true" />
              </button>

              <transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <CareerToolsDropdown
                  v-if="showCareerMenu"
                  menu-id="student-career-tools-menu"
                  @close="closeDropdowns"
                  @develop="handleCareerDevelopment"
                />
              </transition>
            </div>

            <NuxtLink
              v-else-if="item.to"
              :to="item.to"
              :aria-current="isHeaderNavItemActive(item) ? 'page' : undefined"
              :class="headerNavItemClass(item)"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <div class="flex shrink-0 items-center gap-3">
          <div class="relative">
            <button
              type="button"
              class="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              :aria-expanded="showNotifications"
              aria-controls="student-notification-menu"
              aria-label="Thông báo"
              @click.stop="toggleNotifications"
            >
              <Icon name="uil:bell" class="h-5 w-5" aria-hidden="true" />
              <span
                v-if="notificationUnreadCount > 0"
                class="absolute -right-0.5 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white ring-2 ring-white"
              >
                {{ notificationUnreadCount > 9 ? '9+' : notificationUnreadCount }}
              </span>
            </button>

            <div
              v-if="showNotifications"
              id="student-notification-menu"
              class="absolute right-0 z-50 mt-3"
              @click.stop
            >
              <UiNotificationDropdown
                title="Thông báo"
                :unread-count="notificationUnreadCount"
                :loading="notificationLoading"
                :items="headerNotifications"
                empty-text="Chưa có thông báo nào."
                storage-key="student-layout-header"
                group-job-notifications
                :get-icon="getNotificationIcon"
                :get-icon-class="getNotificationIconClass"
                @mark-all-read="markNotificationsRead"
                @open="openNotification"
                @close="closeDropdowns"
              />
            </div>
          </div>

          <button
            type="button"
            class="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            aria-label="Tin nhắn"
            @click="openMessages"
          >
            <Icon name="uil:comment-alt-dots" class="h-5 w-5" aria-hidden="true" />
            <span
              v-if="messageUnreadCount > 0"
              class="absolute -right-0.5 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[11px] font-black text-white ring-2 ring-white"
            >
              {{ messageUnreadCount > 9 ? '9+' : messageUnreadCount }}
            </span>
          </button>

          <div class="relative">
            <button
              type="button"
              class="inline-flex items-center gap-3 rounded-full bg-white p-1.5 pr-3 text-left text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
              :aria-expanded="showUserMenu"
              aria-controls="student-user-menu"
              aria-label="Mở menu tài khoản"
              @click.stop="toggleUserMenu"
            >
              <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
                <img v-if="userAvatar" :src="userAvatar" :alt="`Ảnh đại diện của ${userName}`" class="h-full w-full object-cover">
                <Icon v-else name="uil:user" class="h-7 w-7" aria-hidden="true" />
              </span>
              <span class="hidden min-w-0 lg:block">
                <span class="block max-w-40 truncate text-sm font-black text-slate-950">{{ userName }}</span>
                <span class="block text-xs font-semibold text-slate-500">Sinh viên</span>
              </span>
              <Icon
                name="uil:angle-down"
                :class="['h-4 w-4 text-slate-500 transition-transform duration-200', showUserMenu ? 'rotate-180' : '']"
                aria-hidden="true"
              />
            </button>

            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="translate-y-1 opacity-0"
            >
              <div
                v-if="showUserMenu"
                id="student-user-menu"
                class="absolute right-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-slate-200 bg-white text-sm text-slate-700 shadow-2xl shadow-slate-200/80"
                @click.stop
              >
                <div class="border-b border-slate-100 p-5">
                  <p class="truncate text-lg font-black text-slate-950">{{ userName }}</p>
                  <p class="mt-1 truncate text-sm font-semibold text-slate-500">{{ userEmail }}</p>
                </div>
                <div class="max-h-[min(28rem,calc(100vh-12rem))] overflow-y-auto p-3">
                  <button
                    v-for="item in quickAccountItems"
                    :key="item.label"
                    type="button"
                    class="flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    @click="openAccountItem(item)"
                  >
                    <Icon :name="item.icon" class="h-5 w-5 text-sky-600" aria-hidden="true" />
                    <span>{{ item.label }}</span>
                  </button>
                </div>
                <div class="bg-slate-50 p-4">
                  <button
                    type="button"
                    class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    @click="handleLogout"
                  >
                    <Icon name="uil:sign-out-alt" class="h-5 w-5" aria-hidden="true" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="isSidebarOpen"
      class="fixed inset-x-0 bottom-0 top-[78px] z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
      @click="isSidebarOpen = false"
    />

    <aside
      :class="[
        'fixed bottom-0 left-0 top-[78px] z-40 flex w-[280px] flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/60 transition-all duration-300 lg:translate-x-0',
        isSidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
      aria-label="Điều hướng khu vực sinh viên"
      @click.stop
    >
      <button
        type="button"
        :class="[
          'absolute -right-4 top-5 hidden h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-700 shadow-lg shadow-sky-100 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 lg:inline-flex',
          isSidebarCollapsed ? 'rotate-180' : ''
        ]"
        :aria-label="isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'"
        @click="isSidebarCollapsed = !isSidebarCollapsed"
      >
        <Icon name="uil:angle-left" class="h-5 w-5" aria-hidden="true" />
      </button>

      <div class="student-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <section v-for="group in sidebarGroups" :key="group.id" class="pb-5">
          <div :class="['mb-3 flex items-center', isSidebarCollapsed ? 'justify-center' : 'gap-3']">
            <span v-if="!isSidebarCollapsed" class="text-[11px] font-black uppercase tracking-wide text-slate-400">
              {{ group.label }}
            </span>
            <span class="h-px flex-1 bg-slate-200" />
          </div>

          <div class="space-y-2">
            <template v-for="item in group.items" :key="item.label">
              <NuxtLink
                v-if="item.to"
                :to="item.to"
                :class="sidebarItemClass(item)"
                :aria-label="item.label"
                @click="isSidebarOpen = false"
              >
                <Icon :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                <span v-if="!isSidebarCollapsed" class="truncate">{{ item.label }}</span>
                <span
                  v-if="!isSidebarCollapsed && item.badge"
                  class="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-600"
                >
                  {{ item.badge }}
                </span>
              </NuxtLink>

              <button
                v-else
                type="button"
                :class="sidebarItemClass(item)"
                :aria-label="item.label"
                @click="notifyDevelopment(item.label)"
              >
                <Icon :name="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                <span v-if="!isSidebarCollapsed" class="truncate">{{ item.label }}</span>
                <span
                  v-if="!isSidebarCollapsed && item.badge"
                  class="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-600"
                >
                  {{ item.badge }}
                </span>
              </button>
            </template>
          </div>
        </section>
      </div>

      <div class="border-t border-slate-200 p-4">
        <div v-if="!isSidebarCollapsed" class="mb-4 rounded-[22px] border border-sky-100 bg-sky-50/80 p-4">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
              <Icon name="uil:file-check-alt" class="h-5 w-5" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-black text-slate-950">Hoàn thiện hồ sơ</p>
              <p class="mt-1 text-xs font-semibold text-slate-500">Tăng cơ hội được chú ý</p>
            </div>
          </div>
          <div class="mt-4 h-2 rounded-full bg-white">
            <div class="h-full w-[65%] rounded-full bg-sky-500" />
          </div>
          <button
            type="button"
            class="mt-4 inline-flex items-center gap-2 text-sm font-black text-sky-700 hover:text-sky-800"
            @click="navigateTo('/profile')"
          >
            Hoàn thiện ngay
            <Icon name="uil:arrow-right" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          :class="[
            'inline-flex h-12 items-center gap-3 rounded-2xl px-4 text-left font-black text-rose-500 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100',
            isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full'
          ]"
          aria-label="Đăng xuất"
          @click="handleLogout"
        >
          <Icon name="uil:sign-out-alt" class="h-5 w-5 shrink-0" aria-hidden="true" />
          <span v-if="!isSidebarCollapsed">Đăng xuất</span>
        </button>
      </div>
    </aside>

    <main
      :class="[
        'pt-[78px] transition-all duration-300',
        isSidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[280px]'
      ]"
    >
      <div class="min-h-[calc(100vh-78px)] px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeHeader from '~/components/home/HomeHeader.vue'
import CareerToolsDropdown from '~/components/home/CareerToolsDropdown.vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { ConversationService } from '~/services/conversation.service'
import { NotificationService } from '~/services/notification.service'

type SidebarItem = {
  label: string
  icon: string
  to?: string
  badge?: number
}

type SidebarGroup = {
  id: string
  label: string
  items: SidebarItem[]
}

type HeaderNavItem = {
  label: string
  to?: string
  careerMenu?: boolean
  matchPaths?: string[]
}

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const isSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showCareerMenu = ref(false)
const headerNotifications = ref<any[]>([])
const notificationUnreadCount = ref(0)
const notificationLoading = ref(false)
const messageUnreadCount = ref(0)

const isPublicStudentBoard = computed(() => route.path === '/student')
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Học viên')
const userEmail = computed(() => authStore.user?.email || 'student@quickwork.vn')
const userInitials = computed(() => userName.value.slice(0, 2).toUpperCase())
const userAvatar = computed(() => {
  const user: any = authStore.user || {}
  return String(user.student_profile?.avatar || user.studentProfile?.avatar || user.avatar || '').trim()
})

const headerNavItems: HeaderNavItem[] = [
  { label: 'Việc làm', to: '/student', matchPaths: ['/student', '/jobs'] },
  { label: 'Công ty', to: '/#employer', matchPaths: ['/companies'] },
  { label: 'Mức lương', to: '/#featured-jobs' },
  { label: 'Công cụ nghề nghiệp', careerMenu: true, matchPaths: ['/profile'] },
  { label: 'Blog', to: '/blog', matchPaths: ['/blog'] }
]

function isHeaderNavItemActive(item: HeaderNavItem) {
  return Boolean(item.matchPaths?.some(path => route.path === path || (path !== '/student' && route.path.startsWith(`${path}/`))))
}

function headerNavItemClass(item: HeaderNavItem) {
  return [
    'relative inline-flex min-h-10 items-center rounded-xl px-1 py-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
    isHeaderNavItemActive(item)
      ? 'text-sky-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-sky-600'
      : 'text-slate-900 hover:text-sky-600'
  ]
}

const sidebarGroups = computed<SidebarGroup[]>(() => [
  {
    id: 'overview',
    label: 'Tổng quan',
    items: [
      { label: 'Trang chủ', to: '/', icon: 'uil:create-dashboard' }
    ]
  },
  {
    id: 'job-management',
    label: 'Quản lý tìm việc',
    items: [
      { label: 'Tin nhắn', to: '/student/messages', icon: 'uil:comment-alt-message', badge: messageUnreadCount.value },
      { label: 'Ứng tuyển của tôi', to: '/student/applications', icon: 'uil:clipboard-notes' }
    ]
  },
  {
    id: 'student-management',
    label: 'Quản lý sinh viên',
    items: [
      { label: 'Hồ sơ cá nhân', to: '/profile', icon: 'uil:user-square' }
    ]
  },
  {
    id: 'security',
    label: 'Cá nhân & Bảo mật',
    items: [
      { label: 'Cài đặt', to: '/settings', icon: 'uil:setting' }
    ]
  }
])

const quickAccountItems = [
  { label: 'Hồ sơ cá nhân', to: '/profile', icon: 'uil:user-square' },
  { label: 'Cài đặt', to: '/settings', icon: 'uil:setting' },
  { label: 'Việc làm phù hợp', to: '/student', icon: 'uil:bolt-alt' }
]

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

function sidebarItemClass(item: SidebarItem) {
  const active = isSidebarItemActive(item)
  return [
    'group flex min-h-12 w-full items-center rounded-2xl text-left text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
    isSidebarCollapsed.value ? 'justify-center px-0' : 'gap-3 px-4',
    active
      ? 'bg-sky-600 text-white shadow-lg shadow-sky-200'
      : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
  ]
}

function isSidebarItemActive(item: SidebarItem) {
  if (!item.to) return false
  if (item.to === '/') return route.path === '/'
  if (item.to === '/student') return route.path === '/student'
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

const notifyDevelopment = (feature: string) => {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`)
}

function openAccountItem(item: { label: string; to?: string }) {
  closeDropdowns()
  if (item.to) {
    navigateTo(item.to)
    return
  }
  notifyDevelopment(item.label)
}

function openMessages() {
  closeDropdowns()
  if (!authStore.isAuthenticated) {
    navigateTo({ path: '/auth/login', query: { redirect: '/student/messages' } })
    return
  }
  if (authStore.userRole === 'ENTERPRISE') {
    navigateTo('/enterprise?view=messages')
    return
  }
  if (authStore.userRole === 'STUDENT') {
    navigateTo('/student/messages')
    return
  }
  notifyDevelopment('Tin nhắn')
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
  showCareerMenu.value = false
  if (showNotifications.value) {
    loadHeaderNotifications()
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
  showCareerMenu.value = false
}

const closeDropdowns = () => {
  showUserMenu.value = false
  showNotifications.value = false
  showCareerMenu.value = false
}

function handleCareerDevelopment(feature: string) {
  closeDropdowns()
  notifyDevelopment(feature)
}

function handleCareerFocusOut(event: FocusEvent) {
  const container = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !container.contains(nextTarget)) showCareerMenu.value = false
}

async function loadHeaderNotifications() {
  if (!authStore.isAuthenticated) return
  notificationLoading.value = true
  try {
    const [listResponse, unreadResponse]: any[] = await Promise.all([
      NotificationService.list({ page: 1, page_size: 100 }),
      NotificationService.unreadCount()
    ])
    headerNotifications.value = listResponse?.data?.items || []
    notificationUnreadCount.value = Number(unreadResponse?.data?.unread_count || 0)
  } catch {
    headerNotifications.value = []
    notificationUnreadCount.value = 0
  } finally {
    notificationLoading.value = false
  }
}

async function loadMessageUnreadCount() {
  if (!authStore.isAuthenticated || authStore.userRole !== 'STUDENT') {
    messageUnreadCount.value = 0
    return
  }

  try {
    const response: any = await ConversationService.unreadCount()
    messageUnreadCount.value = Number(response?.data?.unread_count || response?.data?.count || 0)
  } catch {
    messageUnreadCount.value = 0
  }
}

async function markNotificationsRead() {
  try {
    await NotificationService.markAllAsRead()
    await loadHeaderNotifications()
  } catch {
    // Keep the menu usable even if the API rejects the read-state update.
  }
}

async function openNotification(item: any) {
  try {
    const unreadIDs = Array.isArray(item.unread_ids)
      ? item.unread_ids
      : (item.is_read ? [] : [item.id])
    if (unreadIDs.length > 0) {
      await Promise.all(unreadIDs.map((id: string | number) => NotificationService.markAsRead(id)))
      const readIDSet = new Set(unreadIDs.map(String))
      headerNotifications.value.forEach((notification) => {
        if (readIDSet.has(String(notification.id))) notification.is_read = true
      })
      notificationUnreadCount.value = Math.max(0, notificationUnreadCount.value - unreadIDs.length)
    }
  } catch {
    // Navigation is still useful even if read-state update fails.
  }

  const target = normalizeNotificationActionURL(item.action_url)
  closeDropdowns()
  if (target) {
    await navigateTo(target)
  }
}

function normalizeNotificationActionURL(value?: string) {
  if (!value) return ''
  if (value.startsWith('/messages/')) {
    const conversationID = value.replace('/messages/', '').split('/')[0]
    return conversationID ? `/student/messages?conversation=${conversationID}` : '/student/messages'
  }
  if (value.startsWith('/student/messages/')) {
    const conversationID = value.replace('/student/messages/', '').split('/')[0]
    return conversationID ? `/student/messages?conversation=${conversationID}` : '/student/messages'
  }
  if (value === '/student/messages') return '/student/messages'
  if (value === '/student' || value.startsWith('/student/') || value === '/profile' || value === '/settings') return value
  if (value.startsWith('/enterprise/messages/')) {
    const conversationID = value.replace('/enterprise/messages/', '').split('/')[0]
    return conversationID ? `/student/messages?conversation=${conversationID}` : '/student/messages'
  }
  return ''
}

function getNotificationIcon(type?: string) {
  if (type === 'MESSAGE') return 'uil:comment-alt-message'
  if (type === 'INTERVIEW') return 'uil:calendar-alt'
  if (type === 'APPLICATION') return 'uil:user-plus'
  if (type === 'JOB') return 'uil:briefcase-alt'
  return 'uil:bell'
}

function getNotificationIconClass(type?: string) {
  if (type === 'MESSAGE') return 'bg-sky-50 text-sky-700'
  if (type === 'INTERVIEW') return 'bg-amber-50 text-amber-700'
  if (type === 'APPLICATION') return 'bg-emerald-50 text-emerald-700'
  if (type === 'JOB') return 'bg-cyan-50 text-cyan-700'
  return 'bg-slate-50 text-slate-600'
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdowns()
    isSidebarOpen.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    closeDropdowns()
    isSidebarOpen.value = false
  }
)

onMounted(() => {
  window.addEventListener('click', closeDropdowns)
  window.addEventListener('keydown', handleKeyDown)
  loadHeaderNotifications()
  loadMessageUnreadCount()
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
  window.removeEventListener('keydown', handleKeyDown)
})

const handleLogout = () => {
  closeDropdowns()
  isSidebarOpen.value = false
  authStore.logout()
}
</script>

<style scoped>
.student-sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: #bae6fd transparent;
}

.student-sidebar-scroll::-webkit-scrollbar {
  width: 8px;
}

.student-sidebar-scroll::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.student-sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.student-sidebar-scroll::-webkit-scrollbar-thumb {
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #bae6fd;
}
</style>
