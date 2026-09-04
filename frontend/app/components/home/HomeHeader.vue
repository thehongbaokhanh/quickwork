<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="flex h-[74px] w-full items-center justify-between gap-5 px-5 sm:px-8 lg:px-10 xl:grid xl:grid-cols-[minmax(230px,1fr)_auto_minmax(230px,1fr)] 2xl:px-12">
      <AuthBrandMark />

      <nav class="hidden items-center justify-self-center gap-7 xl:flex" aria-label="Điều hướng chính">
        <template v-for="item in navItems" :key="item.label">
          <div
            v-if="item.careerMenu"
            class="relative"
            @mouseenter="isCareerMenuOpen = true"
            @mouseleave="isCareerMenuOpen = false"
            @focusin="isCareerMenuOpen = true"
            @focusout="handleCareerFocusOut"
          >
            <button
              type="button"
              :class="navItemClass(item)"
              :aria-expanded="isCareerMenuOpen"
              aria-controls="career-tools-menu"
              @click.stop="isCareerMenuOpen = !isCareerMenuOpen"
            >
              {{ item.label }}
              <Icon name="uil:angle-down" :class="['ml-1 h-4 w-4 transition-transform', isCareerMenuOpen ? 'rotate-180' : '']" aria-hidden="true" />
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
                v-if="isCareerMenuOpen"
                menu-id="career-tools-menu"
                @close="closeMenus"
                @develop="handleCareerDevelopment"
              />
            </transition>
          </div>
          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            :aria-current="isNavItemActive(item) ? 'page' : undefined"
            :class="navItemClass(item)"
          >
            {{ item.label }}
          </NuxtLink>
          <button
            v-else
            type="button"
            :class="navItemClass(item)"
            @click="$emit('notify', item.label)"
          >
            {{ item.label }}
          </button>
        </template>
      </nav>

      <div v-if="isAuthenticated" class="ml-auto hidden shrink-0 items-center gap-3 xl:flex xl:ml-0 xl:justify-self-end">
        <div class="relative">
        <button
          type="button"
          class="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          aria-label="Thông báo"
          @click.stop="toggleNotifications"
        >
          <Icon name="uil:bell" class="h-6 w-6" aria-hidden="true" />
          <span
            v-if="notificationUnreadCount > 0"
            class="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white"
          >
            {{ notificationUnreadCount > 9 ? '9+' : notificationUnreadCount }}
          </span>
        </button>

          <div
            v-if="isNotificationMenuOpen"
            class="absolute right-0 z-50 mt-3"
            @click.stop
          >
            <UiNotificationDropdown
              title="Thông báo QuickWork"
              :unread-count="notificationUnreadCount"
              :loading="notificationLoading"
                  :items="headerNotifications"
                  empty-text="Chưa có thông báo nào."
                  :view-all-to="notificationCenterTo"
                  storage-key="home-header"
                  :group-job-notifications="authStore.userRole === 'STUDENT'"
                  :get-icon="getNotificationIcon"
                  :get-icon-class="getNotificationIconClass"
              @mark-all-read="markNotificationsRead"
              @open="openNotification"
              @close="closeMenus"
            />
          </div>
        </div>

        <div class="relative">
          <button
            type="button"
            class="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            aria-label="Mở danh sách tin nhắn"
            aria-controls="home-message-menu"
            :aria-expanded="isMessageMenuOpen"
            @click.stop="toggleMessages"
          >
            <Icon name="uil:comment-alt-dots" class="h-6 w-6" aria-hidden="true" />
            <span
              v-if="messageUnreadCount > 0"
              class="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white"
            >
              {{ messageUnreadCount > 9 ? '9+' : messageUnreadCount }}
            </span>
          </button>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-1 opacity-0"
          >
            <section
              v-if="isMessageMenuOpen"
              id="home-message-menu"
              class="absolute right-0 z-50 mt-3 w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/80"
              aria-label="Tin nhắn gần đây"
              @click.stop
            >
              <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 class="text-base font-black text-slate-950">Tin nhắn</h2>
                  <p class="mt-0.5 text-xs font-semibold text-slate-500">{{ messageUnreadCount }} hội thoại chưa đọc</p>
                </div>
                <button type="button" class="text-xs font-black text-sky-700 hover:text-sky-900" @click="openMessages">
                  Xem tất cả
                </button>
              </div>

              <div v-if="messageLoading" class="space-y-3 p-4">
                <div v-for="item in 3" :key="item" class="flex animate-pulse gap-3 rounded-2xl p-2">
                  <span class="h-11 w-11 rounded-full bg-slate-100" />
                  <span class="min-w-0 flex-1 space-y-2 pt-1"><span class="block h-3 w-1/2 rounded bg-slate-100" /><span class="block h-3 w-4/5 rounded bg-slate-100" /></span>
                </div>
              </div>

              <div v-else-if="headerConversations.length === 0" class="px-6 py-10 text-center">
                <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Icon name="uil:comment-alt-dots" class="h-6 w-6" aria-hidden="true" />
                </span>
                <p class="mt-3 text-sm font-black text-slate-800">Chưa có hội thoại</p>
                <p class="mt-1 text-xs font-medium leading-5 text-slate-500">Tin nhắn với nhà tuyển dụng sẽ xuất hiện tại đây.</p>
              </div>

              <div v-else class="message-scrollbar max-h-[280px] overflow-y-auto p-2 pr-1">
                <button
                  v-for="conversation in headerConversations"
                  :key="conversation.id"
                  type="button"
                  class="flex w-full items-start gap-3 rounded-2xl border-b border-slate-100 p-3 text-left transition last:border-b-0 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100"
                  @click="openHeaderConversation(conversation)"
                >
                  <span class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-100 to-blue-200 text-xs font-black text-blue-700">
                    <img v-if="conversation.participant?.avatar" :src="conversation.participant.avatar" :alt="conversation.participant.name" class="h-full w-full object-cover">
                    <span v-else>{{ getConversationInitials(conversation) }}</span>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center justify-between gap-2">
                      <strong class="truncate text-sm font-black text-slate-900">{{ conversation.participant?.name || 'Nhà tuyển dụng' }}</strong>
                      <time class="shrink-0 text-[10px] font-bold text-slate-400">{{ formatHeaderConversationTime(conversation.last_message_at || conversation.last_message?.created_at) }}</time>
                    </span>
                    <span class="mt-0.5 block truncate text-xs font-bold text-sky-700">{{ conversation.job?.title || 'Tin tuyển dụng' }}</span>
                    <span class="mt-1 flex items-center gap-2">
                      <span :class="['min-w-0 flex-1 truncate text-xs', conversation.unread_count > 0 ? 'font-bold text-slate-800' : 'font-medium text-slate-500']">{{ conversation.last_message?.content || 'Chưa có tin nhắn mới.' }}</span>
                      <span v-if="conversation.unread_count > 0" class="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-black text-white">{{ conversation.unread_count > 9 ? '9+' : conversation.unread_count }}</span>
                    </span>
                  </span>
                </button>
              </div>

              <div class="border-t border-slate-100 bg-slate-50 p-3">
                <button type="button" class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100" @click="openMessages">
                  Mở trung tâm tin nhắn
                  <Icon name="uil:arrow-right" class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </section>
          </transition>
        </div>

        <div class="relative">
          <button
            type="button"
            class="inline-flex h-14 min-w-[230px] items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 pr-4 text-slate-900 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            :aria-expanded="isUserMenuOpen"
            aria-controls="home-user-menu"
            aria-label="Mở menu tài khoản"
            @click.stop="toggleUserMenu"
          >
            <span class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
              <img v-if="userAvatar" :src="userAvatar" :alt="`Ảnh đại diện của ${userName}`" class="h-full w-full object-cover">
              <Icon v-else name="uil:user" class="h-7 w-7" aria-hidden="true" />
            </span>
            <span class="min-w-0 flex-1 text-left leading-tight">
              <span class="block max-w-[130px] truncate text-sm font-extrabold text-slate-950">{{ userName }}</span>
              <span class="mt-0.5 block text-xs font-semibold text-slate-500">{{ compactRoleLabel }}</span>
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
                  <span class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-300">
                    <img v-if="userAvatar" :src="userAvatar" :alt="`Ảnh đại diện của ${userName}`" class="h-full w-full object-cover">
                    <Icon v-else name="uil:user" class="h-14 w-14" aria-hidden="true" />
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

      </div>

      <div v-else class="ml-auto hidden shrink-0 items-center gap-3 xl:flex xl:ml-0 xl:justify-self-end">
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
        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 xl:hidden"
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
      class="border-t border-slate-200 bg-white px-4 py-5 shadow-xl shadow-slate-200/40 xl:hidden"
    >
      <nav class="mx-auto grid max-w-[1240px] gap-2" aria-label="Điều hướng di động">
        <template v-for="item in navItems" :key="item.label">
          <div v-if="item.careerMenu" class="rounded-lg border border-slate-100">
            <button
              type="button"
              :class="[navItemClass(item, true), 'flex w-full items-center justify-between']"
              :aria-expanded="isCareerMenuOpen"
              aria-controls="mobile-career-tools-menu"
              @click.stop="isCareerMenuOpen = !isCareerMenuOpen"
            >
              {{ item.label }}
              <Icon name="uil:angle-down" :class="['h-4 w-4 transition-transform', isCareerMenuOpen ? 'rotate-180' : '']" aria-hidden="true" />
            </button>
            <div v-if="isCareerMenuOpen" id="mobile-career-tools-menu" class="border-t border-slate-100 p-2">
              <section v-for="section in careerMenuSections" :key="`mobile-${section.title}`" class="py-2">
                <p class="px-2 text-[10px] font-black uppercase text-slate-400">{{ section.title }}</p>
                <template v-for="careerItem in section.items" :key="careerItem.label">
                  <NuxtLink v-if="careerItem.to" :to="careerItem.to" class="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700" @click="closeMobileNavigation">
                    <Icon :name="careerItem.icon" class="h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
                    <span>{{ careerItem.label }}</span>
                  </NuxtLink>
                  <button v-else type="button" class="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-slate-500 hover:bg-slate-50" @click="handleCareerDevelopment(careerItem.label, true)">
                    <Icon :name="careerItem.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span class="min-w-0 flex-1">{{ careerItem.label }}</span>
                    <small class="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase">Sắp có</small>
                  </button>
                </template>
              </section>
            </div>
          </div>
          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            :aria-current="isNavItemActive(item) ? 'page' : undefined"
            :class="navItemClass(item, true)"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
          <button
            v-else
            type="button"
            :class="navItemClass(item, true)"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import AuthBrandMark from '~/components/AuthBrandMark.vue'
import CareerToolsDropdown from '~/components/home/CareerToolsDropdown.vue'
import { useAuthStore } from '~/stores/auth'
import { NotificationService } from '~/services/notification.service'
import { ConversationService, type ConversationListItem } from '~/services/conversation.service'
import { careerToolSections as careerMenuSections } from '~/data/careerTools'

type AccountGroup = {
  id: string
  title: string
  icon: string
  items?: string[]
}

type HeaderNavItem = {
  label: string
  to?: string
  sectionId?: string
  matchPaths?: string[]
  careerMenu?: boolean
}

const emit = defineEmits<{
  notify: [feature: string]
}>()

const route = useRoute()
const authStore = useAuthStore()
const { notifyStudentLoginRequired } = useStudentLoginPrompt()
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const isNotificationMenuOpen = ref(false)
const isMessageMenuOpen = ref(false)
const isCareerMenuOpen = ref(false)
const headerNotifications = ref<any[]>([])
const notificationUnreadCount = ref(0)
const notificationLoading = ref(false)
const headerConversations = ref<ConversationListItem[]>([])
const messageUnreadCount = ref(0)
const messageLoading = ref(false)
const messagesLoaded = ref(false)
const activeHomeSection = ref('')
let homeSectionObserver: IntersectionObserver | null = null

const navItems: HeaderNavItem[] = [
  { label: 'Việc làm', to: '/student', matchPaths: ['/student', '/jobs'] },
  { label: 'Công ty', to: '/#employer', sectionId: 'employer', matchPaths: ['/companies'] },
  { label: 'Mức lương', to: '/#featured-jobs', sectionId: 'featured-jobs' },
  { label: 'Công cụ nghề nghiệp', sectionId: 'career-tools', matchPaths: ['/profile'], careerMenu: true },
  { label: 'Blog', to: '/blog', matchPaths: ['/blog'] }
]

function isNavItemActive(item: HeaderNavItem) {
  const matchesPath = item.matchPaths?.some(path => route.path === path || route.path.startsWith(`${path}/`))
  if (matchesPath) return true
  return Boolean(item.sectionId && route.path === '/' && activeHomeSection.value === item.sectionId)
}

function navItemClass(item: HeaderNavItem, mobile = false) {
  const active = isNavItemActive(item)

  if (mobile) {
    return [
      'rounded-2xl px-4 py-3 text-left text-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
      active
        ? 'bg-sky-50 font-extrabold text-sky-700 ring-1 ring-inset ring-sky-100'
        : 'font-bold text-slate-800 hover:bg-sky-50 hover:text-sky-700'
    ]
  }

  return [
    'relative inline-flex min-h-10 items-center text-sm transition focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100',
    active
      ? 'font-extrabold text-sky-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-sky-600'
      : 'font-medium text-slate-700 hover:text-sky-700'
  ]
}

function syncActiveHomeSectionFromRoute() {
  if (route.path !== '/') {
    activeHomeSection.value = ''
    return
  }

  const sectionId = route.hash.replace(/^#/, '')
  activeHomeSection.value = navItems.some(item => item.sectionId === sectionId) ? sectionId : ''
}

function observeHomeSections() {
  homeSectionObserver?.disconnect()
  homeSectionObserver = null
  if (!import.meta.client || route.path !== '/') return

  const sectionIds = navItems.flatMap(item => item.sectionId ? [item.sectionId] : [])
  const sections = sectionIds
    .map(sectionId => document.getElementById(sectionId))
    .filter((section): section is HTMLElement => Boolean(section))
  if (sections.length === 0) return

  const visibleSections = new Map<string, number>()
  homeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio)
      else visibleSections.delete(entry.target.id)
    })

    const current = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0]
    if (current) activeHomeSection.value = current[0]
  }, {
    rootMargin: '-80px 0px -50% 0px',
    threshold: [0.05, 0.25, 0.5]
  })

  sections.forEach(section => homeSectionObserver?.observe(section))
}

const accountGroups: AccountGroup[] = [
  {
    id: 'job-management',
    title: 'VIỆC LÀM & TRAO ĐỔI',
    icon: 'uil:briefcase-alt',
    items: ['Việc làm đã lưu', 'Việc làm đã ứng tuyển', 'Việc làm phù hợp với tôi']
  },
  {
    id: 'profile-management',
    title: 'QUẢN LÝ HỒ SƠ CÁ NHÂN',
    icon: 'uil:file-check-alt',
    items: ['Hồ sơ cá nhân']
  },
  {
    id: 'security',
    title: 'CÁ NHÂN & BẢO MẬT',
    icon: 'uil:user-check',
    items: ['Cài đặt tài khoản', 'Bảo mật & thay đổi mật khẩu', 'Tùy chọn tìm việc', 'Quyền riêng tư']
  }
]

const expandedAccountGroups = ref<string[]>([])

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Tài khoản QuickWork')
const userAvatar = computed(() => {
  const user: any = authStore.user || {}
  return String(user.student_profile?.avatar || user.studentProfile?.avatar || user.enterprise_profile?.avatar || user.enterprise_profile?.logo_url || user.enterpriseProfile?.avatar || user.enterpriseProfile?.logo_url || user.avatar || '').trim()
})
const userEmail = computed(() => authStore.user?.email || 'Chưa cập nhật email')
const userId = computed(() => authStore.user?.id || 'N/A')
const roleLabel = computed(() => {
  if (authStore.userRole === 'ADMIN') return 'Tài khoản quản trị'
  if (authStore.userRole === 'ENTERPRISE') return 'Tài khoản nhà tuyển dụng'
  return 'Tài khoản đã xác thực'
})
const compactRoleLabel = computed(() => {
  if (authStore.userRole === 'STUDENT') return 'Sinh viên'
  if (authStore.userRole === 'ENTERPRISE') return 'Nhà tuyển dụng'
  if (authStore.userRole === 'ADMIN') return 'Quản trị viên'
  return 'Tài khoản'
})
const notificationCenterTo = computed(() => (authStore.userRole === 'ENTERPRISE' ? '/enterprise/notifications' : ''))
const accountItemRoutes: Record<string, string> = {
  'Việc làm đã lưu': '/student?view=saved',
  'Việc làm đã ứng tuyển': '/student/applications',
  'Việc làm phù hợp với tôi': '/student',
  'Hồ sơ cá nhân': '/profile',
  'Cài đặt tài khoản': '/settings?section=account',
  'Bảo mật & thay đổi mật khẩu': '/settings?section=security',
  'Tùy chọn tìm việc': '/settings?section=jobs',
  'Quyền riêng tư': '/settings?section=privacy'
}

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
  if (feature === 'Tin nhắn') {
    openMessages()
    return
  }

  const target = accountItemRoutes[feature]
  if (target) {
    closeMenus()
    navigateTo(target)
    return
  }
  emit('notify', feature)
}

function handleMobileNotify(feature: string) {
  isMobileMenuOpen.value = false
  if (feature === 'Tin nhắn') {
    openMessages()
    return
  }

  const target = accountItemRoutes[feature]
  if (target) {
    closeMenus()
    navigateTo(target)
    return
  }
  emit('notify', feature)
}

function handleCareerDevelopment(feature: string, mobile = false) {
  isCareerMenuOpen.value = false
  if (mobile) isMobileMenuOpen.value = false
  emit('notify', feature)
}

function closeMobileNavigation() {
  isCareerMenuOpen.value = false
  isMobileMenuOpen.value = false
}

function handleCareerFocusOut(event: FocusEvent) {
  const container = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !container.contains(nextTarget)) isCareerMenuOpen.value = false
}

function openMessages() {
  closeMenus()
  if (!authStore.isAuthenticated) {
    notifyStudentLoginRequired('Đăng nhập bằng tài khoản sinh viên để xem và gửi tin nhắn.')
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
  emit('notify', 'Tin nhắn')
}

async function toggleMessages() {
  if (!authStore.isAuthenticated) {
    notifyStudentLoginRequired('Đăng nhập bằng tài khoản sinh viên để xem và gửi tin nhắn.')
    return
  }
  if (!['STUDENT', 'ENTERPRISE'].includes(authStore.userRole || '')) {
    emit('notify', 'Tin nhắn')
    return
  }
  isMessageMenuOpen.value = !isMessageMenuOpen.value
  isNotificationMenuOpen.value = false
  isUserMenuOpen.value = false
  if (isMessageMenuOpen.value && !messagesLoaded.value) await loadHeaderConversations()
}

async function loadHeaderConversations() {
  messageLoading.value = true
  try {
    const [listResponse, unreadResponse]: any[] = await Promise.all([
      ConversationService.list({ page: 1, page_size: 6 }),
      ConversationService.unreadCount()
    ])
    headerConversations.value = Array.isArray(listResponse?.data?.items) ? listResponse.data.items : []
    messageUnreadCount.value = Number(unreadResponse?.data?.unread_count || 0)
    messagesLoaded.value = true
  } catch {
    headerConversations.value = []
    messageUnreadCount.value = 0
    messagesLoaded.value = false
  } finally {
    messageLoading.value = false
  }
}

function openHeaderConversation(conversation: ConversationListItem) {
  closeMenus()
  if (authStore.userRole === 'ENTERPRISE') {
    navigateTo(`/enterprise?view=messages&conversation=${conversation.id}`)
    return
  }
  navigateTo(`/student/messages?conversation=${conversation.id}`)
}

function getConversationInitials(conversation: ConversationListItem) {
  return String(conversation.participant?.name || 'QW')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
}

function formatHeaderConversationTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function toggleNotifications() {
  isNotificationMenuOpen.value = !isNotificationMenuOpen.value
  isUserMenuOpen.value = false
  isMessageMenuOpen.value = false
  if (isNotificationMenuOpen.value) {
    loadHeaderNotifications()
  }
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
  isNotificationMenuOpen.value = false
  isMessageMenuOpen.value = false
  if (isUserMenuOpen.value) expandedAccountGroups.value = []
}

function closeMenus() {
  isUserMenuOpen.value = false
  isNotificationMenuOpen.value = false
  isMessageMenuOpen.value = false
  isCareerMenuOpen.value = false
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
  closeMenus()
  if (target) {
    await navigateTo(target)
  }
}

function normalizeNotificationActionURL(value?: string) {
  if (!value) return ''
  if (value.startsWith('/messages/')) {
    const conversationID = value.replace('/messages/', '').split('/')[0]
    if (!conversationID) return ''
    if (authStore.userRole === 'ENTERPRISE') return `/enterprise?view=messages&conversation=${conversationID}`
    if (authStore.userRole === 'STUDENT') return `/student/messages?conversation=${conversationID}`
    return ''
  }
  if (value.startsWith('/student/messages/')) {
    const conversationID = value.replace('/student/messages/', '').split('/')[0]
    return authStore.userRole === 'STUDENT' && conversationID ? `/student/messages?conversation=${conversationID}` : ''
  }
  if (value === '/student/messages') {
    return authStore.userRole === 'STUDENT' ? '/student/messages' : ''
  }
  if (value.startsWith('/enterprise/messages/')) {
    const conversationID = value.replace('/enterprise/messages/', '').split('/')[0]
    return authStore.userRole === 'ENTERPRISE' && conversationID
      ? `/enterprise?view=messages&conversation=${conversationID}`
      : ''
  }
  if (value === '/enterprise/messages') {
    return authStore.userRole === 'ENTERPRISE' ? '/enterprise?view=messages' : ''
  }
  if (value.startsWith('/enterprise/')) return authStore.userRole === 'ENTERPRISE' ? value : ''
  if (value.startsWith('/admin/')) return authStore.userRole === 'ADMIN' ? value : ''
  if (value === '/student' || value.startsWith('/student/') || value === '/profile' || value === '/settings') return value
  return ''
}

function getNotificationIcon(type?: string) {
  if (type === 'KYB') return 'uil:shield-check'
  if (type === 'MESSAGE') return 'uil:comment-alt-message'
  if (type === 'INTERVIEW') return 'uil:calendar-alt'
  if (type === 'APPLICATION') return 'uil:user-plus'
  if (type === 'JOB') return 'uil:briefcase-alt'
  return 'uil:bell'
}

function getNotificationIconClass(type?: string) {
  if (type === 'KYB') return 'bg-cyan-50 text-cyan-700'
  if (type === 'MESSAGE') return 'bg-violet-50 text-violet-700'
  if (type === 'INTERVIEW') return 'bg-amber-50 text-amber-700'
  if (type === 'APPLICATION') return 'bg-emerald-50 text-emerald-700'
  if (type === 'JOB') return 'bg-sky-50 text-sky-700'
  return 'bg-slate-50 text-slate-600'
}

onMounted(() => {
  window.addEventListener('click', handleWindowClick)
  window.addEventListener('keydown', handleKeyDown)
  syncActiveHomeSectionFromRoute()
  void nextTick(observeHomeSections)
  loadHeaderNotifications()
})

watch(() => route.fullPath, async () => {
  syncActiveHomeSectionFromRoute()
  await nextTick()
  observeHomeSections()
})

onUnmounted(() => {
  window.removeEventListener('click', handleWindowClick)
  window.removeEventListener('keydown', handleKeyDown)
  homeSectionObserver?.disconnect()
})
</script>

<style scoped>
.message-scrollbar {
  scrollbar-color: #94a3b8 #f1f5f9;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.message-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.message-scrollbar::-webkit-scrollbar-track {
  margin-block: 8px;
  border-radius: 999px;
  background: #f1f5f9;
}

.message-scrollbar::-webkit-scrollbar-thumb {
  border: 2px solid #f1f5f9;
  border-radius: 999px;
  background: #94a3b8;
}

.message-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.message-scrollbar::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
</style>
