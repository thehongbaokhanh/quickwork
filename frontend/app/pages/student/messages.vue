<template>
  <section class="grid min-h-[calc(100vh-126px)] gap-4 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
    <aside class="flex min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:h-[calc(100vh-126px)]">
      <div class="border-b border-slate-100 p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-black tracking-normal text-slate-950">Tin nhắn</h1>
            <p class="mt-1 text-sm font-semibold text-slate-500">Trao đổi trực tiếp với nhà tuyển dụng.</p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            aria-label="Mở hội thoại từ đơn ứng tuyển"
            @click="startChatOpen = true"
          >
            <Icon name="uil:comment-medical" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-2" role="tablist" aria-label="Lọc hội thoại">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="[
              'inline-flex h-10 items-center justify-center gap-2 rounded-2xl text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              activeTab === tab.value ? 'bg-sky-600 text-white shadow-lg shadow-sky-100' : 'bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
            ]"
            role="tab"
            :aria-selected="activeTab === tab.value"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span class="rounded-full bg-white/25 px-1.5 text-xs">{{ tab.count }}</span>
          </button>
        </div>

        <div class="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
          <Icon name="uil:search" class="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="search"
            class="h-12 min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Tìm tin nhắn hoặc tên công ty"
            aria-label="Tìm kiếm hội thoại"
          >
        </div>
      </div>

      <div class="student-message-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <div v-if="isLoading" class="space-y-3">
          <div v-for="index in 5" :key="index" class="h-20 animate-pulse rounded-3xl bg-slate-100" />
        </div>

        <div v-else-if="filteredConversations.length === 0" class="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
          <span class="flex h-16 w-16 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
            <Icon name="uil:comment-alt-lines" class="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 class="mt-4 text-lg font-black text-slate-950">Chưa có hội thoại</h2>
          <p class="mt-2 max-w-xs text-sm font-semibold leading-6 text-slate-500">
            Khi nhà tuyển dụng phản hồi hồ sơ ứng tuyển, hội thoại sẽ xuất hiện tại đây.
          </p>
        </div>

        <div v-else class="space-y-2">
          <button
            v-for="conversation in filteredConversations"
            :key="getConversationID(conversation)"
            type="button"
            :class="[
              'flex w-full items-center gap-3 rounded-3xl p-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              selectedConversationKey === getConversationID(conversation) ? 'bg-sky-50 ring-1 ring-sky-100' : 'hover:bg-slate-50'
            ]"
            @click="selectConversation(conversation)"
          >
            <span class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
              {{ getConversationInitials(conversation) }}
              <span
                v-if="conversationHasUnread(conversation)"
                class="absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-[3px] ring-white"
                aria-label="Có tin nhắn chưa đọc"
              />
              <span
                v-if="conversationHasUnread(conversation)"
                class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[11px] font-black text-white ring-2 ring-white"
              >
                {{ getUnreadCount(conversation) }}
              </span>
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between gap-3">
                <span class="truncate text-sm font-black text-slate-950">{{ getCompanyName(conversation) }}</span>
                <span class="shrink-0 text-xs font-bold text-slate-400">{{ formatConversationTime(getLastMessageTime(conversation)) }}</span>
              </span>
              <span class="mt-1 block truncate text-sm font-bold text-slate-700">{{ getJobTitle(conversation) }}</span>
              <span class="mt-1 flex items-center gap-2">
                <span class="min-w-0 flex-1 truncate text-xs font-semibold text-slate-500">{{ getLastMessageText(conversation) }}</span>
                <Icon v-if="conversation.is_closed" name="uil:lock" class="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Hội thoại bị khóa" />
              </span>
            </span>
          </button>
        </div>
      </div>
    </aside>

    <section class="flex min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:h-[calc(100vh-126px)]">
      <div v-if="selectedConversation" class="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
        <div class="flex min-w-0 items-center gap-4">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
            {{ getConversationInitials(selectedConversation) }}
          </span>
          <div class="min-w-0">
            <h2 class="truncate text-lg font-black text-slate-950">{{ getCompanyName(selectedConversation) }}</h2>
            <p class="mt-1 truncate text-sm font-semibold text-slate-500">{{ getJobTitle(selectedConversation) }}</p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          @click="notifyDevelopment('Xem tin tuyển dụng')"
        >
          Xem tin tuyển dụng
          <Icon name="uil:external-link-alt" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div v-else class="border-b border-slate-100 p-5">
        <h2 class="text-lg font-black text-slate-950">Hội thoại</h2>
        <p class="mt-1 text-sm font-semibold text-slate-500">Chọn một hội thoại để xem nội dung.</p>
      </div>

      <div ref="messageViewport" class="student-message-scroll min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50/80 p-5" @scroll.passive="handleMessageScroll">
        <div v-if="messageLoading" class="space-y-4">
          <div v-for="index in 4" :key="index" :class="['h-20 animate-pulse rounded-3xl bg-slate-100', index % 2 === 0 ? 'ml-auto w-2/3' : 'w-2/3']" />
        </div>

        <div v-else-if="messageError" class="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700">
          {{ messageError }}
        </div>

        <div v-else-if="!selectedConversation" class="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
          <span class="flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <Icon name="uil:chat-bubble-user" class="h-9 w-9" aria-hidden="true" />
          </span>
          <h2 class="mt-5 text-2xl font-black text-slate-950">Chọn một hội thoại</h2>
          <p class="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">
            Danh sách bên trái chứa các trao đổi giữa bạn và nhà tuyển dụng.
          </p>
        </div>

        <div v-else-if="messages.length === 0" class="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
          <span class="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Icon name="uil:comment-alt-slash" class="h-9 w-9" aria-hidden="true" />
          </span>
          <h2 class="mt-5 text-xl font-black text-slate-950">Chưa có tin nhắn</h2>
          <p class="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">
            Bạn có thể gửi tin nhắn đầu tiên trong hội thoại này.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div v-if="loadingOlder" class="flex justify-center py-2 text-xs font-black text-sky-600">
            Đang tải tin nhắn cũ...
          </div>
          <div v-else-if="!hasMoreMessages" class="flex justify-center py-1 text-xs font-bold text-slate-400">
            Không còn tin nhắn cũ
          </div>
          <div
            v-for="message in messages"
            :key="getMessageID(message)"
            :class="['flex gap-3', isOwnMessage(message) ? 'justify-end' : 'justify-start']"
          >
            <span
              v-if="!isOwnMessage(message)"
              class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-black text-white"
            >
              {{ selectedConversation ? getConversationInitials(selectedConversation) : 'QW' }}
            </span>
            <div
              :class="[
                'max-w-[78%] rounded-[22px] px-4 py-3 shadow-sm',
                isOwnMessage(message)
                  ? 'bg-sky-50 text-slate-900 ring-1 ring-sky-100'
                  : 'bg-white text-slate-800 ring-1 ring-slate-200'
              ]"
            >
              <p class="whitespace-pre-line text-sm font-semibold leading-6">{{ message.content }}</p>
              <p :class="['mt-2 text-right text-xs font-bold', isOwnMessage(message) ? 'text-sky-600' : 'text-slate-400']">
                {{ formatMessageTime(message.created_at) }}
                <span v-if="isOwnMessage(message)"> · {{ message.is_read ? 'Đã đọc' : 'Đã gửi' }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <form class="border-t border-slate-100 bg-white p-4" @submit.prevent="sendMessage">
        <div v-if="selectedConversation && !canSendMessages" class="mb-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-bold text-amber-700">
          {{ selectedConversation.locked_reason || 'Hội thoại hiện chỉ cho phép xem lịch sử.' }}
        </div>
        <div class="flex items-end gap-3 rounded-[24px] border border-slate-200 bg-white p-3 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
          <textarea
            v-model="newMessage"
            class="max-h-32 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none placeholder:text-slate-400"
            rows="1"
            :disabled="!selectedConversation || isSending || !canSendMessages"
            placeholder="Nhập tin nhắn..."
            aria-label="Nhập tin nhắn"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <button
            type="submit"
            class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-300"
            :disabled="!selectedConversation || !newMessage.trim() || isSending || !canSendMessages"
            aria-label="Gửi tin nhắn"
          >
            <Icon name="uil:message" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-2 flex items-center justify-between gap-3 text-xs font-bold">
          <span class="text-rose-600">{{ sendError }}</span>
          <span :class="newMessage.length > 2000 ? 'text-rose-600' : newMessage.length >= 1900 ? 'text-amber-600' : 'text-slate-400'">{{ newMessage.length }}/2000</span>
        </div>
      </form>
    </section>

    <aside class="space-y-4 xl:h-[calc(100vh-126px)] xl:overflow-y-auto xl:pr-1">
      <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Icon name="uil:info-circle" class="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 class="text-lg font-black text-slate-950">Thông tin hội thoại</h2>
        </div>

        <div v-if="selectedConversation" class="mt-5 space-y-4">
          <div class="flex items-center gap-3">
            <span class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
              {{ getConversationInitials(selectedConversation) }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-black text-slate-950">{{ getCompanyName(selectedConversation) }}</p>
              <p class="mt-1 text-xs font-semibold text-slate-500">{{ getApplicationStatus(selectedConversation) }}</p>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="openCompanyProfile"
          >
            Xem trang công ty
            <Icon name="uil:external-link-alt" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p v-else class="mt-5 text-sm font-semibold leading-6 text-slate-500">
          Chọn một hội thoại để xem thông tin ứng tuyển tại đây.
        </p>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Icon name="uil:briefcase-alt" class="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 class="text-lg font-black text-slate-950">Tin tuyển dụng liên quan</h2>
        </div>
        <div v-if="selectedConversation" class="mt-5 rounded-3xl bg-slate-50 p-4">
          <p class="text-xs font-black uppercase text-slate-400">Vị trí đang trao đổi</p>
          <p class="mt-2 text-base font-black text-slate-950">{{ getJobTitle(selectedConversation) }}</p>
          <p class="mt-2 text-sm font-semibold text-slate-500">{{ getApplicationCode(selectedConversation) }}</p>
        </div>
        <p v-else class="mt-5 text-sm font-semibold leading-6 text-slate-500">
          Chọn một hội thoại để xem tin tuyển dụng liên quan.
        </p>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Icon name="uil:edit-alt" class="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 class="text-lg font-black text-slate-950">Ghi chú nhanh</h2>
        </div>
        <textarea
          v-model="quickNote"
          class="mt-5 min-h-32 w-full resize-none rounded-3xl border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
          maxlength="200"
          placeholder="Thêm ghi chú về hội thoại..."
          aria-label="Ghi chú nhanh"
        />
        <p class="mt-2 text-right text-xs font-bold text-slate-400">{{ quickNote.length }}/200</p>
      </section>
    </aside>

    <UiModal v-model="startChatOpen" title="Mở hội thoại từ đơn ứng tuyển" size="lg">
      <div v-if="applicationsLoading" class="space-y-3">
        <div v-for="index in 3" :key="index" class="h-20 animate-pulse rounded-2xl bg-slate-100" />
      </div>
      <div v-else-if="appliedApplications.length === 0" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <Icon name="uil:file-question-alt" class="mx-auto h-9 w-9 text-slate-400" />
        <p class="mt-3 text-sm font-black text-slate-800">Bạn chưa có đơn ứng tuyển để bắt đầu hội thoại.</p>
      </div>
      <div v-else class="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        <button
          v-for="application in appliedApplications"
          :key="application.id"
          type="button"
          class="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-wait disabled:opacity-60"
          :disabled="openingApplicationID !== null"
          @click="openApplicationChat(application)"
        >
          <span class="min-w-0">
            <span class="block truncate text-sm font-black text-slate-950">{{ application.job?.title || 'Tin tuyển dụng' }}</span>
            <span class="mt-1 block truncate text-xs font-bold text-slate-500">{{ application.job?.enterprise_profile?.company_name || 'Nhà tuyển dụng' }} · Đơn #{{ application.id }}</span>
          </span>
          <Icon :name="openingApplicationID === Number(application.id) ? 'svg-spinners:180-ring' : 'uil:arrow-right'" class="h-5 w-5 shrink-0 text-sky-600" />
        </button>
      </div>
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import UiModal from '~/components/ui/Modal.vue'
import { useToast } from '~/composables/useToast'
import { useConversationChat } from '~/composables/useConversationChat'
import { ConversationService, type ConversationListItem, type ConversationMessage } from '~/services/conversation.service'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'
import { formatConversationTime, formatMessageTime, isOwnConversationMessage } from '~/utils/conversation'
import { normalizeSearchText } from '~/utils/searchText'

definePageMeta({
  layout: 'student',
  middleware: ['student']
})

type ConversationFilter = 'all' | 'unread' | 'archived'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const {
  conversations,
  selectedConversation,
  selectedConversationID,
  messages,
  conversationsLoading: isLoading,
  messagesLoading: messageLoading,
  loadingOlder,
  sending: isSending,
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

const activeTab = ref<ConversationFilter>('all')
const searchQuery = ref('')
const newMessage = ref('')
const quickNote = ref('')
const messageViewport = ref<HTMLElement | null>(null)
const startChatOpen = ref(false)
const applicationsLoading = ref(false)
const appliedApplications = ref<any[]>([])
const openingApplicationID = ref<number | null>(null)

const selectedConversationKey = computed(() => selectedConversationID.value ? String(selectedConversationID.value) : '')

const tabs = computed(() => [
  { label: 'Tất cả', value: 'all' as ConversationFilter, count: conversations.value.length },
  { label: 'Chưa đọc', value: 'unread' as ConversationFilter, count: conversations.value.filter(conversationHasUnread).length },
  { label: 'Lưu trữ', value: 'archived' as ConversationFilter, count: conversations.value.filter(isArchivedConversation).length }
])

const filteredConversations = computed(() => {
  const query = normalizeSearchText(searchQuery.value)
  return conversations.value.filter((conversation) => {
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'unread' && conversationHasUnread(conversation)) ||
      (activeTab.value === 'archived' && isArchivedConversation(conversation))
    const searchable = normalizeSearchText([
      getCompanyName(conversation),
      getJobTitle(conversation),
      getLastMessageText(conversation),
      getApplicationCode(conversation)
    ].join(' '))
    return matchesTab && (!query || searchable.includes(query))
  })
})

async function loadConversations() {
  const requested = Array.isArray(route.query.conversation) ? route.query.conversation[0] : route.query.conversation
  await loadConversationData({ targetID: requested ? String(requested) : undefined })
  if (conversationError.value) toast.error('Không thể tải hội thoại', conversationError.value)
  await nextTick()
  scrollToBottom()
}

async function loadAppliedApplications() {
  try {
    applicationsLoading.value = true
    const response: any = await StudentService.getAppliedJobs()
    appliedApplications.value = response?.success && Array.isArray(response.data) ? response.data : []
  } catch {
    appliedApplications.value = []
  } finally {
    applicationsLoading.value = false
  }
}

async function openApplicationChat(application: any) {
  const applicationID = Number(application?.id)
  if (!applicationID || openingApplicationID.value !== null) return
  try {
    openingApplicationID.value = applicationID
    const response = await ConversationService.openByApplication(applicationID)
    if (!response?.success || !response.data?.id) throw new Error(response?.message || 'Không thể mở hội thoại.')
    await loadConversationData({ targetID: response.data.id })
    await router.replace({ query: { ...route.query, conversation: String(response.data.id) } })
    startChatOpen.value = false
    await nextTick()
    scrollToBottom()
  } catch (error: any) {
    toast.error('Không thể mở hội thoại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    openingApplicationID.value = null
  }
}

async function selectConversation(conversation: ConversationListItem) {
  await selectConversationData(conversation)
  await router.replace({ query: { ...route.query, conversation: String(conversation.id) } })
  await nextTick()
  scrollToBottom()
}

async function sendMessage() {
  const content = newMessage.value.trim()
  const sent = await sendConversationMessage(content)
  if (sent) {
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } else if (sendError.value) {
    toast.error('Không thể gửi tin nhắn', sendError.value)
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

function getConversationID(conversation: ConversationListItem) {
  return String(conversation.id)
}

function getMessageID(message: ConversationMessage) {
  return String(message.id)
}

function getCompanyName(conversation: ConversationListItem) {
  return conversation.participant?.name || 'Nhà tuyển dụng'
}

function getJobTitle(conversation: ConversationListItem) {
  return conversation.job?.title || 'Tin tuyển dụng'
}

function getApplicationCode(conversation: ConversationListItem) {
  return `Mã đơn #${conversation.job_application_id}`
}

function getApplicationStatus(conversation: ConversationListItem) {
  const status = conversation.application_status
  if (status === 'ACCEPTED') return 'Hồ sơ đã được duyệt'
  if (status === 'REJECTED') return 'Hồ sơ bị từ chối'
  if (status === 'APPLIED') return 'Đang xem xét'
  return 'Trạng thái hồ sơ chưa cập nhật'
}

function getLastMessageText(conversation: ConversationListItem) {
  return conversation.last_message?.content || 'Chưa có tin nhắn mới.'
}

function getLastMessageTime(conversation: ConversationListItem) {
  return conversation.last_message_at || conversation.last_message?.created_at
}

function getConversationInitials(conversation: ConversationListItem) {
  const name = getCompanyName(conversation)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0))
    .join('')
    .toUpperCase()
  return initials || 'QW'
}

function getUnreadCount(conversation: ConversationListItem) {
  return Number(conversation.unread_count || 0)
}

function conversationHasUnread(conversation: ConversationListItem) {
  return getUnreadCount(conversation) > 0
}

function isArchivedConversation(conversation: ConversationListItem) {
  return conversation.is_closed
}

function isOwnMessage(message: ConversationMessage) {
  return isOwnConversationMessage(message, authStore.user?.id)
}

async function openCompanyProfile() {
  const enterpriseID = Number(selectedConversation.value?.participant?.id)
  if (!enterpriseID) {
    toast.warning('Chưa có thông tin công ty', 'Không thể xác định doanh nghiệp của hội thoại này.')
    return
  }
  await router.push({
    path: `/companies/${enterpriseID}`,
    query: { conversation: String(selectedConversation.value?.id || '') }
  })
}

function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`)
}

watch(
  () => route.query.conversation,
  async (conversationID) => {
    if (!conversationID || conversations.value.length === 0) return
    if (String(selectedConversationID.value || '') === String(conversationID)) return
    const conversation = conversations.value.find((item) => getConversationID(item) === String(conversationID))
    if (conversation) {
      await selectConversation(conversation)
    }
  }
)

onMounted(async () => {
  await Promise.all([loadConversations(), loadAppliedApplications()])
  startPolling()
})
</script>

<style scoped>
.student-message-scroll {
  scrollbar-width: thin;
  scrollbar-color: #bae6fd transparent;
}

.student-message-scroll::-webkit-scrollbar {
  width: 8px;
}

.student-message-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.student-message-scroll::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: #bae6fd;
  background-clip: content-box;
}
</style>
