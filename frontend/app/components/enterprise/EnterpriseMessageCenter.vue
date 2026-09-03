<template>
  <div class="flex min-h-0 flex-col gap-4 pb-2 xl:h-[calc(100vh-7.5rem)]">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-950">Tin nhắn</h1>
        <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Quản lý và trao đổi trực tiếp với ứng viên.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filter in conversationFilters"
            :key="filter.value"
            type="button"
            :aria-pressed="activeFilter === filter.value"
            :class="[
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              activeFilter === filter.value
                ? 'border-sky-500 bg-white text-sky-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700'
            ]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{{ filter.count }}</span>
          </button>
        </div>

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          :disabled="loading"
          @click="refreshConversations"
        >
          <Icon name="uil:sync" :class="['h-5 w-5', loading ? 'animate-spin' : '']" />
          Làm mới
        </button>
      </div>
    </section>

    <section class="grid min-h-[680px] flex-1 gap-4 overflow-hidden xl:min-h-0 xl:grid-cols-[minmax(280px,30fr)_minmax(420px,45fr)_minmax(240px,25fr)]">
      <aside class="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
        <div class="border-b border-slate-100 bg-white p-4">
          <label class="flex h-12 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
            <Icon name="uil:search" class="h-5 w-5 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm theo tên, vị trí, nội dung..."
              class="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
            >
          </label>
        </div>

        <div class="grid grid-cols-3 border-b border-slate-100 bg-white px-3">
          <button
            v-for="filter in sidebarFilters"
            :key="filter.value"
            type="button"
            :class="[
              'relative h-12 text-sm font-black transition',
              activeFilter === filter.value ? 'text-sky-700' : 'text-slate-500 hover:text-slate-800'
            ]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span
              v-if="activeFilter === filter.value"
              class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-sky-600"
            />
          </button>
        </div>

        <div v-if="loading" class="space-y-3 p-4">
          <div v-for="item in 7" :key="item" class="h-20 animate-pulse rounded-2xl bg-slate-100" />
        </div>

        <div v-else-if="conversationError" class="m-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {{ conversationError }}
        </div>

        <div v-else-if="filteredConversations.length === 0" class="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Icon name="uil:comment-message" class="h-7 w-7" />
          </span>
          <h2 class="mt-4 text-lg font-black text-slate-950">Chưa có hội thoại</h2>
          <p class="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Khi có trao đổi từ hồ sơ ứng tuyển, hội thoại sẽ xuất hiện tại đây.
          </p>
        </div>

        <div v-else class="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
          <button
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            type="button"
            :class="[
              'flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              isSelected(conversation)
                ? 'bg-sky-50'
                : 'bg-white hover:bg-slate-50'
            ]"
            @click="selectConversation(conversation, true)"
          >
            <span class="relative shrink-0">
              <img
                v-if="conversation.participant?.avatar"
                :src="assetUrl(conversation.participant.avatar)"
                :alt="participantName(conversation)"
                class="h-[68px] w-[68px] rounded-full object-cover ring-1 ring-slate-200"
              >
              <span
                v-else
                class="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-slate-950 text-base font-black text-white"
              >
                {{ initials(participantName(conversation)) }}
              </span>
              <span
                v-if="Number(conversation.unread_count || 0) > 0"
                class="absolute -bottom-0.5 -left-0.5 h-5 w-5 rounded-full bg-emerald-500 ring-[3px] ring-white"
                aria-label="Có tin nhắn chưa đọc"
              />
              <span
                v-if="Number(conversation.unread_count || 0) > 0"
                class="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-sky-600 px-1 text-sm font-black text-white ring-[3px] ring-white"
                :aria-label="`${Number(conversation.unread_count || 0)} tin nhắn chưa đọc`"
              >
                {{ Number(conversation.unread_count || 0) > 99 ? '99+' : Number(conversation.unread_count || 0) }}
              </span>
            </span>

            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between gap-2">
                <span class="truncate text-sm font-black text-slate-950">{{ participantName(conversation) }}</span>
                <span class="shrink-0 text-xs font-bold text-slate-500">{{ messageTime(conversation.last_message_at || conversation.last_message?.created_at) }}</span>
              </span>
              <span class="mt-1 block truncate text-xs font-bold text-slate-700">{{ conversation.job?.title || 'Tin tuyển dụng' }}</span>
              <span class="mt-1 flex items-center gap-2">
                <span class="truncate text-xs font-semibold text-slate-500">
                  {{ lastMessagePreview(conversation) }}
                </span>
              </span>
            </span>
          </button>
        </div>
      </aside>

      <section class="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
        <div v-if="selectedConversation" class="flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4">
          <div class="flex min-w-0 items-center gap-3">
            <img
              v-if="selectedConversation.participant?.avatar"
              :src="assetUrl(selectedConversation.participant.avatar)"
              :alt="participantName(selectedConversation)"
              class="h-14 w-14 rounded-full object-cover ring-1 ring-slate-200"
            >
            <span
              v-else
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-50 text-lg font-black text-sky-700 ring-1 ring-sky-100"
            >
              {{ initials(participantName(selectedConversation)) }}
            </span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-lg font-black text-slate-950">{{ participantName(selectedConversation) }}</h2>
                <Icon name="uil:star" class="h-4 w-4 text-amber-400" />
              </div>
              <p class="truncate text-sm font-bold text-slate-500">
                {{ selectedConversation.job?.title || 'Tin tuyển dụng' }}
              </p>
              <p class="mt-1 flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Mã tin: #JD-{{ selectedConversation.job?.id || selectedConversation.job_application_id }}</span>
                <span :class="['rounded-full px-2 py-0.5 text-[11px] font-black', statusClass(selectedConversation.application_status)]">
                  {{ statusLabel(selectedConversation.application_status) }}
                </span>
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 opacity-60 transition hover:bg-slate-50"
              title="Đang phát triển"
              @click="notifyDevelopment('Lưu hội thoại')"
            >
              <Icon name="uil:bookmark" class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 opacity-60 transition hover:bg-slate-50"
              title="Đang phát triển"
              @click="notifyDevelopment('Tùy chọn hội thoại')"
            >
              <Icon name="uil:ellipsis-h" class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div v-if="selectedConversation" ref="messageViewport" class="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent" @scroll.passive="handleMessageScroll">
          <div v-if="messagesLoading" class="space-y-3">
            <div v-for="item in 5" :key="item" class="h-14 animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div v-else-if="messageError" class="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
            {{ messageError }}
          </div>

          <div v-else-if="messages.length === 0" class="flex min-h-[420px] flex-col items-center justify-center text-center">
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm">
              <Icon name="uil:comment-alt-message" class="h-7 w-7" />
            </span>
            <h3 class="mt-4 text-lg font-black text-slate-950">Bắt đầu cuộc trao đổi</h3>
            <p class="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">
              Gửi tin nhắn đầu tiên để xác nhận thêm thông tin hồ sơ hoặc lịch phỏng vấn.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div v-if="loadingOlder" class="flex justify-center py-2 text-xs font-black text-sky-600">
              Đang tải tin nhắn cũ...
            </div>
            <div v-else-if="!hasMoreMessages" class="flex justify-center py-1 text-xs font-bold text-slate-400">
              Không còn tin nhắn cũ
            </div>
            <div class="flex justify-center">
              <span class="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-black text-slate-500">Hôm nay</span>
            </div>

            <div
              v-for="message in orderedMessages"
              :key="message.id"
              :class="['flex', isOwnMessage(message) ? 'justify-end' : 'justify-start']"
            >
              <div
                :class="[
                  'max-w-[78%] rounded-2xl px-4 py-3 shadow-sm',
                  isOwnMessage(message)
                    ? 'bg-sky-50 text-sky-900'
                    : 'border border-slate-200 bg-white text-slate-700'
                ]"
              >
                <p class="whitespace-pre-wrap text-sm font-semibold leading-6">{{ message.content }}</p>
                <p :class="['mt-2 text-[11px] font-bold', isOwnMessage(message) ? 'text-sky-500' : 'text-slate-400']">
                  {{ messageTime(message.created_at) }}
                  <Icon v-if="isOwnMessage(message)" :name="message.is_read ? 'uil:check-circle' : 'uil:check'" class="ml-1 inline h-3.5 w-3.5" />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-1 flex-col items-center justify-center bg-slate-50/70 px-6 py-16 text-center">
          <span class="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-sky-600 shadow-sm">
            <Icon name="uil:chat-bubble-user" class="h-8 w-8" />
          </span>
          <h2 class="mt-4 text-xl font-black text-slate-950">Chọn một hội thoại</h2>
          <p class="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
            Danh sách bên trái chứa các trao đổi giữa nhà tuyển dụng và ứng viên.
          </p>
        </div>

        <form
          v-if="selectedConversation"
          class="border-t border-slate-100 bg-white p-4"
          @submit.prevent="sendMessage"
        >
          <div
            v-if="!canSendMessages"
            class="mb-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-bold text-amber-700"
          >
            {{ selectedConversation.locked_reason || 'Hội thoại hiện chỉ cho phép xem lịch sử.' }}
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-3 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
            <textarea
              v-model="draftMessage"
              rows="2"
              placeholder="Nhập tin nhắn..."
              class="min-h-[64px] w-full resize-none bg-transparent px-1 py-1 text-sm font-semibold leading-6 text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50"
              :disabled="sending || !canSendMessages"
              @keydown.enter.exact.prevent="sendMessage"
            />

            <div class="mt-2 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 opacity-60 transition hover:bg-slate-50"
                  title="Đang phát triển"
                  @click="notifyDevelopment('Đính kèm tệp')"
                >
                  <Icon name="uil:paperclip" class="h-5 w-5" />
                </button>
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 opacity-60 transition hover:bg-slate-50"
                  title="Đang phát triển"
                  @click="notifyDevelopment('Biểu tượng cảm xúc')"
                >
                  <Icon name="uil:smile" class="h-5 w-5" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-400 opacity-70 transition hover:bg-slate-50"
                  title="Đang phát triển"
                  @click="notifyDevelopment('Mẫu tin nhắn')"
                >
                  <Icon name="uil:comment-alt-message" class="h-4 w-4" />
                  Mẫu tin nhắn
                </button>
              </div>

              <button
                type="submit"
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="sending || !canSendMessages || !draftMessage.trim()"
                aria-label="Gửi tin nhắn"
              >
                <Icon name="uil:message" :class="['h-5 w-5', sending ? 'animate-pulse' : '']" />
              </button>
            </div>
          </div>
          <div class="mt-2 flex items-center justify-between gap-3 text-xs font-bold">
            <span class="text-rose-600">{{ sendError }}</span>
            <span :class="draftMessage.length > 2000 ? 'text-rose-600' : draftMessage.length >= 1900 ? 'text-amber-600' : 'text-slate-400'">{{ draftMessage.length }}/2000 ký tự</span>
          </div>
        </form>
      </section>

      <aside class="quickwork-message-scroll hidden min-h-0 flex-col gap-4 overflow-y-auto pr-1 xl:flex">
        <section class="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
          <h2 class="text-base font-black text-slate-950">Thông tin ứng viên</h2>
          <div v-if="selectedConversation" class="mt-5">
            <div class="flex items-center gap-3">
              <img
                v-if="selectedConversation.participant?.avatar"
                :src="assetUrl(selectedConversation.participant.avatar)"
                :alt="participantName(selectedConversation)"
                class="h-14 w-14 rounded-full object-cover ring-1 ring-slate-200"
              >
              <span
                v-else
                class="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white"
              >
                {{ initials(participantName(selectedConversation)) }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-black text-slate-950">{{ participantName(selectedConversation) }}</p>
                <p class="truncate text-xs font-bold text-slate-500">{{ selectedConversation.job?.title || 'Tin tuyển dụng' }}</p>
              </div>
            </div>

            <button
              type="button"
              class="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100"
              @click="openApplicationProfile"
            >
              <Icon name="uil:clipboard-notes" class="h-5 w-5" />
              Xem hồ sơ ứng viên
            </button>

            <dl class="mt-5 space-y-4 text-sm">
              <div>
                <dt class="font-bold text-slate-500">Trạng thái</dt>
                <dd class="mt-1 font-black text-slate-900">{{ statusLabel(selectedConversation.application_status) }}</dd>
              </div>
              <div>
                <dt class="font-bold text-slate-500">Mã đơn</dt>
                <dd class="mt-1 font-black text-slate-900">#{{ selectedConversation.job_application_id }}</dd>
              </div>
              <div>
                <dt class="font-bold text-slate-500">Tin nhắn gần nhất</dt>
                <dd class="mt-1 font-black text-slate-900">{{ formatDateTime(selectedConversation.last_message_at || selectedConversation.last_message?.created_at) || 'Chưa có' }}</dd>
              </div>
            </dl>
          </div>
          <p v-else class="mt-4 text-sm font-semibold leading-6 text-slate-500">Chọn một hội thoại để xem thông tin ứng viên.</p>
        </section>

        <section class="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
          <h2 class="text-base font-black text-slate-950">Tin tuyển dụng</h2>
          <div v-if="selectedConversation" class="mt-4">
            <p class="text-sm font-black text-slate-950">{{ selectedConversation.job?.title || 'Tin tuyển dụng' }}</p>
            <p class="mt-1 text-xs font-bold text-slate-500">Mã tin: #JD-{{ selectedConversation.job?.id || selectedConversation.job_application_id }}</p>
            <button
              type="button"
              class="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100"
              @click="notifyDevelopment('Xem tin tuyển dụng từ hộp thư')"
            >
              <Icon name="uil:external-link-alt" class="h-4 w-4" />
              Xem tin tuyển dụng
            </button>
          </div>
          <p v-else class="mt-4 text-sm font-semibold leading-6 text-slate-500">Chưa chọn hội thoại.</p>
        </section>

        <section class="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/80">
          <h2 class="text-base font-black text-slate-950">Thao tác nhanh</h2>
          <div class="mt-4 space-y-2">
            <button
              v-for="action in quickActions"
              :key="action.label"
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm font-bold text-slate-400 opacity-70 transition hover:bg-slate-50"
              title="Đang phát triển"
              @click="notifyDevelopment(action.label)"
            >
              <Icon :name="action.icon" class="h-5 w-5" />
              {{ action.label }}
            </button>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { useConversationChat } from '~/composables/useConversationChat'
import type { ConversationListItem, ConversationMessage } from '~/services/conversation.service'
import { useAuthStore } from '~/stores/auth'
import { conversationTimestamp, formatMessageTime, isOwnConversationMessage } from '~/utils/conversation'

const props = defineProps<{
  initialConversationId?: string | number
  embedded?: boolean
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const config = useRuntimeConfig()

type ConversationFilter = 'all' | 'unread' | 'archived'

const {
  conversations,
  selectedConversation,
  messages,
  conversationsLoading: loading,
  messagesLoading,
  loadingOlder,
  backgroundRefreshing,
  sending,
  conversationError,
  messageError,
  sendError,
  hasMoreMessages,
  canSendMessages,
  loadConversations: loadConversationData,
  selectConversation: selectConversationData,
  loadOlderMessages,
  sendMessage: sendConversationMessage,
  startPolling
} = useConversationChat({
  currentUserID: () => authStore.user?.id,
  messageLimit: 30,
  pollInterval: 5000
})

const searchQuery = ref('')
const draftMessage = ref('')
const activeFilter = ref<ConversationFilter>('all')
const messageViewport = ref<HTMLElement | null>(null)

const currentUserID = computed(() => Number(authStore.user?.id || 0))
const routeConversationID = computed(() => {
  const source = props.embedded ? route.query.conversation : route.params.id
  return Array.isArray(source) ? source[0] : source
})

const sortedConversations = computed(() => [...conversations.value].sort((a, b) => {
  return conversationTimestamp(b) - conversationTimestamp(a)
}))

const visibleConversations = computed(() => sortedConversations.value.filter((conversation) => {
  if (activeFilter.value === 'unread') return Number(conversation.unread_count || 0) > 0
  if (activeFilter.value === 'archived') return Boolean(conversation.is_closed)
  return true
}))

const filteredConversations = computed(() => {
  const query = normalizeSearch(searchQuery.value)
  const source = visibleConversations.value
  if (!query) return source

  return source.filter((conversation) => {
    const text = normalizeSearch([
      participantName(conversation),
      conversation.job?.title,
      conversation.last_message?.content,
      conversation.job_application_id
    ].join(' '))
    return text.includes(query)
  })
})

const orderedMessages = computed(() => [...messages.value].sort((a, b) => {
  return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
}))

const unreadCount = computed(() => conversations.value.reduce((total, conversation) => total + Number(conversation.unread_count || 0), 0))
const archivedCount = computed(() => conversations.value.filter((conversation) => conversation.is_closed).length)

const conversationFilters = computed(() => [
  { label: 'Tất cả', value: 'all' as ConversationFilter, count: conversations.value.length },
  { label: 'Chưa đọc', value: 'unread' as ConversationFilter, count: unreadCount.value }
])

const sidebarFilters = computed(() => [
  ...conversationFilters.value,
  { label: 'Đã lưu trữ', value: 'archived' as ConversationFilter, count: archivedCount.value }
])

const quickActions = [
  { label: 'Gửi lịch phỏng vấn', icon: 'uil:calendar-alt' },
  { label: 'Đánh dấu quan trọng', icon: 'uil:star' },
  { label: 'Lưu trữ hội thoại', icon: 'uil:archive' },
  { label: 'Báo cáo ứng viên', icon: 'uil:flag' }
]

async function refreshConversations() {
  await loadConversations({ preserveSelection: true })
}

async function loadConversations(options: { silent?: boolean, preserveSelection?: boolean } = {}) {
  await loadConversationData({
    silent: options.silent,
    preserveSelection: options.preserveSelection,
    targetID: props.initialConversationId || routeConversationID.value || undefined
  })
  await nextTick()
  if (!options.silent) scrollToBottom()
}

async function selectConversation(conversation: ConversationListItem, updatePath: boolean) {
  draftMessage.value = ''
  if (updatePath && String(routeConversationID.value || '') !== String(conversation.id)) {
    if (props.embedded) {
      await router.replace({
        path: '/enterprise',
        query: {
          ...route.query,
          view: 'messages',
          conversation: String(conversation.id)
        }
      })
    } else {
      await router.replace(`/enterprise/messages/${conversation.id}`)
    }
  }
  await selectConversationData(conversation)
  await nextTick()
  scrollToBottom()
}

async function sendMessage() {
  const sent = await sendConversationMessage(draftMessage.value)
  if (sent) {
    draftMessage.value = ''
    await nextTick()
    scrollToBottom()
  } else if (sendError.value) {
    toast.error('Gửi tin nhắn thất bại', sendError.value)
  }
}

async function handleMessageScroll(event: Event) {
  const element = event.currentTarget as HTMLElement
  if (element.scrollTop > 24 || !hasMoreMessages.value || loadingOlder.value) return
  const previousHeight = element.scrollHeight
  const loaded = await loadOlderMessages()
  if (loaded) {
    await nextTick()
    element.scrollTop = element.scrollHeight - previousHeight
  }
}

function scrollToBottom() {
  if (messageViewport.value) messageViewport.value.scrollTop = messageViewport.value.scrollHeight
}

function participantName(conversation: ConversationListItem) {
  return conversation?.participant?.name || 'Ứng viên'
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'UV'
}

function isSelected(conversation: ConversationListItem) {
  return String(conversation?.id) === String(selectedConversation.value?.id)
}

function isOwnMessage(message: ConversationMessage) {
  return isOwnConversationMessage(message, currentUserID.value)
}

function isOwnLastMessage(conversation: ConversationListItem) {
  return conversation?.last_message && isOwnMessage(conversation.last_message)
}

function lastMessagePreview(conversation: ConversationListItem) {
  const content = conversation?.last_message?.content
  if (!content) return 'Chưa có tin nhắn trong hội thoại này.'
  return `${isOwnLastMessage(conversation) ? 'Bạn: ' : ''}${content}`
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    APPLIED: 'Đang xét duyệt',
    ACCEPTED: 'Đã duyệt',
    REJECTED: 'Đã từ chối'
  }
  return labels[String(status || '').toUpperCase()] || 'Đơn ứng tuyển'
}

function statusClass(status?: string) {
  const classes: Record<string, string> = {
    APPLIED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
  }
  return classes[String(status || '').toUpperCase()] || 'bg-slate-100 text-slate-600'
}

function messageTime(value?: string) {
  return formatMessageTime(value)
}

function formatDateTime(value?: string) {
  return formatMessageTime(value, true)
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
}

function assetUrl(value?: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '')
  return `${backendOrigin}${value.startsWith('/') ? '' : '/'}${value}`
}

function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được hoàn thiện ở phiên bản tiếp theo.`)
}

function openApplicationProfile() {
  if (!selectedConversation.value) return
  router.push('/enterprise/applications')
}

watch(() => props.initialConversationId, async (value) => {
  if (!value || conversations.value.length === 0) return
  if (String(selectedConversation.value?.id || '') === String(value)) return
  const target = conversations.value.find((conversation) => String(conversation.id) === String(value))
  if (target) await selectConversation(target, false)
})

watch(routeConversationID, async (value) => {
  if (!value || conversations.value.length === 0) return
  if (String(selectedConversation.value?.id || '') === String(value)) return
  const target = conversations.value.find((conversation) => String(conversation.id) === String(value))
  if (target) await selectConversation(target, false)
})

onMounted(() => {
  loadConversations()
  startPolling()
})
</script>
