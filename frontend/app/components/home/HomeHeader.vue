<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex h-[74px] w-full max-w-[1680px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10 2xl:px-12">
      <AuthBrandMark />

      <nav class="hidden items-center gap-7 xl:flex" aria-label="Điều hướng chính">
        <template v-for="item in navItems" :key="item.label">
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="text-sm font-bold text-slate-800 transition hover:text-sky-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            {{ item.label }}
          </NuxtLink>
          <button
            v-else
            type="button"
            class="text-sm font-bold text-slate-800 transition hover:text-sky-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="$emit('notify', item.label)"
          >
            {{ item.label }}
          </button>
        </template>
      </nav>

      <div v-if="isAuthenticated" class="hidden shrink-0 items-center gap-3 lg:flex">
        <button
          type="button"
          class="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          aria-label="Thông báo"
          @click="$emit('notify', 'Thông báo')"
        >
          <Icon name="uil:bell" class="h-6 w-6" aria-hidden="true" />
          <span class="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          aria-label="Tin nhắn"
          @click="$emit('notify', 'Tin nhắn')"
        >
          <Icon name="uil:comment-alt-dots" class="h-6 w-6" aria-hidden="true" />
        </button>

        <div class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 p-1.5 pr-2 text-slate-900 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            :aria-expanded="isUserMenuOpen"
            aria-controls="home-user-menu"
            aria-label="Mở menu tài khoản"
            @click.stop="toggleUserMenu"
          >
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
              <Icon name="uil:user" class="h-7 w-7" aria-hidden="true" />
            </span>
            <Icon
              name="uil:angle-down"
              :class="['h-4 w-4 text-slate-500 transition-transform duration-200', isUserMenuOpen ? 'rotate-180' : '']"
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
              v-if="isUserMenuOpen"
              id="home-user-menu"
              class="absolute right-0 mt-3 w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-slate-200 bg-white text-sm text-slate-700 shadow-2xl shadow-slate-200/80"
              @click.stop
            >
              <div class="flex max-h-[calc(100vh-96px)] flex-col">
                <div class="flex shrink-0 gap-4 border-b border-slate-100 p-5">
                  <span class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    <Icon name="uil:user" class="h-14 w-14" aria-hidden="true" />
                  </span>
                  <div class="min-w-0 pt-1">
                    <p class="truncate text-lg font-extrabold text-slate-900">{{ userName }}</p>
                    <p class="mt-1 text-sm font-semibold text-slate-500">{{ roleLabel }}</p>
                    <p class="mt-2 truncate text-sm font-semibold text-slate-600">ID {{ userId }} | {{ userEmail }}</p>
                  </div>
                </div>

                <div class="min-h-0 flex-1 overflow-y-auto p-3">
                  <section v-for="group in accountGroups" :key="group.id" class="rounded-2xl">
                    <button
                      type="button"
                      class="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left font-extrabold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                      :aria-expanded="group.items?.length ? isGroupOpen(group.id) : undefined"
                      :aria-controls="group.items?.length ? `account-group-${group.id}` : undefined"
                      @click="toggleAccountGroup(group)"
                    >
                      <span class="inline-flex min-w-0 items-center gap-3">
                        <Icon :name="group.icon" class="h-6 w-6 shrink-0 text-slate-500" aria-hidden="true" />
                        <span class="truncate">{{ group.title }}</span>
                      </span>
                      <Icon
                        v-if="group.items?.length"
                        name="uil:angle-down"
                        :class="[
                          'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                          isGroupOpen(group.id) ? 'rotate-180' : ''
                        ]"
                        aria-hidden="true"
                      />
                    </button>

                    <transition
                      enter-active-class="transition duration-150 ease-out"
                      enter-from-class="-translate-y-1 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-100 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="-translate-y-1 opacity-0"
                    >
                      <div
                        v-if="group.items?.length && isGroupOpen(group.id)"
                        :id="`account-group-${group.id}`"
                        class="mb-3 ml-12 mr-3 overflow-hidden rounded-2xl bg-white"
                      >
                        <button
                          v-for="item in group.items"
                          :key="item"
                          type="button"
                          class="flex min-h-11 w-full items-center px-3 text-left text-sm font-bold text-slate-700 transition hover:bg-sky-50/80 hover:text-slate-950 focus:outline-none focus-visible:bg-sky-50 focus-visible:text-slate-950 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100"
                          @click="handleAccountItem(item)"
                        >
                          {{ item }}
                        </button>
                      </div>
                    </transition>
                  </section>
                </div>

                <div class="shrink-0 bg-slate-50 p-4">
                  <button
                    type="button"
                    class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white font-bold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                    @click="handleLogout"
                  >
                    <Icon name="uil:sign-out-alt" class="h-5 w-5" aria-hidden="true" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="ml-2 border-l border-slate-200 pl-5">
          <p class="text-sm font-semibold text-slate-500">Bạn là nhà tuyển dụng?</p>
          <NuxtLink
            v-if="canOpenEmployerArea"
            to="/enterprise"
            class="mt-1 inline-flex items-center gap-1 text-base font-extrabold text-slate-800 transition hover:text-sky-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            Đăng tuyển ngay
            <Icon name="uil:angle-double-right" class="h-5 w-5" aria-hidden="true" />
          </NuxtLink>
          <button
            v-else
            type="button"
            class="mt-1 inline-flex items-center gap-1 text-base font-extrabold text-slate-800 transition hover:text-sky-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="$emit('notify', 'Đăng tuyển ngay')"
          >
            Đăng tuyển ngay
            <Icon name="uil:angle-double-right" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div v-else class="hidden shrink-0 items-center gap-3 lg:flex">
        <NuxtLink
          to="/login"
          class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-900 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        >
          Đăng nhập
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
        >
          Đăng ký
        </NuxtLink>
      </div>

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 lg:hidden"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="home-mobile-menu"
        aria-label="Mở menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Icon :name="isMobileMenuOpen ? 'uil:times' : 'uil:bars'" class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>

    <div
      v-if="isMobileMenuOpen"
      id="home-mobile-menu"
      class="border-t border-slate-200 bg-white px-4 py-5 shadow-xl shadow-slate-200/40 lg:hidden"
    >
      <nav class="mx-auto grid max-w-[1240px] gap-2" aria-label="Điều hướng di động">
        <template v-for="item in navItems" :key="item.label">
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
          <button
            v-else
            type="button"
            class="rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="handleMobileNotify(item.label)"
          >
            {{ item.label }}
          </button>
        </template>
      </nav>

      <div v-if="isAuthenticated" class="mx-auto mt-4 grid max-w-[1240px] gap-3">
        <div class="max-h-[70vh] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-base font-extrabold text-slate-900">{{ userName }}</p>
          <p class="mt-1 truncate text-sm font-semibold text-slate-500">{{ userEmail }}</p>

          <div class="mt-4 grid gap-1">
            <section v-for="group in accountGroups" :key="group.id" class="rounded-2xl bg-white">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-extrabold text-slate-800"
                :aria-expanded="group.items?.length ? isGroupOpen(group.id) : undefined"
                :aria-controls="group.items?.length ? `mobile-account-group-${group.id}` : undefined"
                @click="toggleAccountGroup(group)"
              >
                <span class="inline-flex min-w-0 items-center gap-3">
                  <Icon :name="group.icon" class="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                  <span class="truncate">{{ group.title }}</span>
                </span>
                <Icon
                  v-if="group.items?.length"
                  name="uil:angle-down"
                  :class="[
                    'h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                    isGroupOpen(group.id) ? 'rotate-180' : ''
                  ]"
                  aria-hidden="true"
                />
              </button>

              <div
                v-if="group.items?.length && isGroupOpen(group.id)"
                :id="`mobile-account-group-${group.id}`"
                class="mb-3 ml-12 mr-4 overflow-hidden rounded-2xl bg-white"
              >
                <button
                  v-for="item in group.items"
                  :key="item"
                  type="button"
                  class="flex min-h-11 w-full items-center px-3 text-left text-sm font-bold text-slate-700 transition hover:bg-sky-50/80 hover:text-slate-950 focus:outline-none focus-visible:bg-sky-50 focus-visible:text-slate-950 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100"
                  @click="handleMobileNotify(item)"
                >
                  {{ item }}
                </button>
              </div>
            </section>
          </div>

          <button type="button" class="mt-3 h-12 w-full rounded-2xl bg-white text-sm font-bold text-slate-800" @click="handleLogout">
            Đăng xuất
          </button>
        </div>
        <NuxtLink
          v-if="canOpenEmployerArea"
          to="/enterprise"
          class="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white"
          @click="isMobileMenuOpen = false"
        >
          Đăng tuyển ngay
        </NuxtLink>
        <button v-else type="button" class="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white" @click="handleMobileNotify('Đăng tuyển ngay')">
          Đăng tuyển ngay
        </button>
      </div>

      <div v-else class="mx-auto mt-4 grid max-w-[1240px] gap-3 sm:grid-cols-2">
        <NuxtLink to="/login" class="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-900">
          Đăng nhập
        </NuxtLink>
        <NuxtLink to="/register" class="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 text-sm font-bold text-white">
          Đăng ký
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AuthBrandMark from '~/components/AuthBrandMark.vue'
import { useAuthStore } from '~/stores/auth'

type AccountGroup = {
  id: string
  title: string
  icon: string
  items?: string[]
}

const emit = defineEmits<{
  notify: [feature: string]
}>()

const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const navItems = [
  { label: 'Việc làm', to: '/student' },
  { label: 'Công ty', to: '/#employer' },
  { label: 'Mức lương', to: '/#featured-jobs' },
  { label: 'Công cụ nghề nghiệp', to: '/#career-tools' },
  { label: 'Blog' }
]

const accountGroups: AccountGroup[] = [
  {
    id: 'job-management',
    title: 'Quản lý tìm việc',
    icon: 'uil:briefcase-alt',
    items: ['Việc làm đã lưu', 'Việc làm đã ứng tuyển', 'Việc làm phù hợp với bạn']
  },
  {
    id: 'cv-management',
    title: 'Quản lý CV',
    icon: 'uil:file-alt',
    items: ['CV của tôi']
  },
  {
    id: 'security',
    title: 'Cá nhân & Bảo mật',
    icon: 'uil:user-check',
    items: ['Cài đặt thông tin cá nhân', 'Cài đặt mật khẩu', 'Đổi mật khẩu']
  }
]

const expandedAccountGroups = ref<string[]>(
  accountGroups.filter((group) => group.items?.length).map((group) => group.id)
)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Tài khoản QuickWork')
const userEmail = computed(() => authStore.user?.email || 'Chưa cập nhật email')
const userId = computed(() => authStore.user?.id || 'N/A')
const roleLabel = computed(() => {
  if (authStore.userRole === 'ADMIN') return 'Tài khoản quản trị'
  if (authStore.userRole === 'ENTERPRISE') return 'Tài khoản nhà tuyển dụng'
  return 'Tài khoản đã xác thực'
})
const canOpenEmployerArea = computed(() => authStore.userRole === 'ENTERPRISE' && authStore.enterpriseApproved)

function isGroupOpen(groupId: string) {
  return expandedAccountGroups.value.includes(groupId)
}

function toggleAccountGroup(group: AccountGroup) {
  if (!group.items?.length) {
    emit('notify', group.title)
    return
  }

  if (isGroupOpen(group.id)) {
    expandedAccountGroups.value = expandedAccountGroups.value.filter((id) => id !== group.id)
    return
  }

  expandedAccountGroups.value = [...expandedAccountGroups.value, group.id]
}

function handleAccountItem(feature: string) {
  emit('notify', feature)
}

function handleMobileNotify(feature: string) {
  isMobileMenuOpen.value = false
  emit('notify', feature)
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeMenus() {
  isUserMenuOpen.value = false
}

function handleWindowClick() {
  closeMenus()
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenus()
    isMobileMenuOpen.value = false
  }
}

function handleLogout() {
  closeMenus()
  isMobileMenuOpen.value = false
  authStore.logout()
}

onMounted(() => {
  window.addEventListener('click', handleWindowClick)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('click', handleWindowClick)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
