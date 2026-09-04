<template>
  <div class="space-y-6 pb-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-700">
          <Icon name="uil:bell" class="h-4 w-4" />
          Trung tâm thông báo
        </span>
        <h1 class="mt-3 text-2xl font-black text-slate-950">Thông báo</h1>
        <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Theo dõi yêu cầu KYB, ứng viên, lịch phỏng vấn và tin nhắn mới từ hệ thống QuickWork.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
          @click="fetchNotifications"
        >
          <Icon name="uil:sync" class="h-5 w-5" />
          Làm mới
        </button>
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="unreadCount === 0 || isMarkingAll"
          @click="markAllRead"
        >
          <Icon :name="isMarkingAll ? 'svg-spinners:180-ring' : 'uil:check-circle'" :class="['h-5 w-5', isMarkingAll ? 'animate-spin' : '']" />
          Đánh dấu đã đọc
        </button>
      </div>
    </section>

    <section
      v-if="needsKYBAction"
      class="rounded-[26px] border border-amber-100 bg-amber-50 p-5 shadow-sm shadow-amber-100/60"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-4">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
            <Icon name="uil:shield-exclamation" class="h-6 w-6" />
          </span>
          <div>
            <h2 class="text-base font-black text-amber-950">{{ kybBannerTitle }}</h2>
            <p class="mt-1 text-sm font-semibold leading-6 text-amber-800">
              Kiểm tra thông báo từ admin và bổ sung giấy phép kinh doanh trong trang cài đặt để được xét duyệt.
            </p>
          </div>
        </div>
        <NuxtLink
          to="/enterprise/settings"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-amber-800 shadow-sm transition hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-100"
        >
          <Icon name="uil:file-upload-alt" class="h-5 w-5" />
          Nộp GPKD
        </NuxtLink>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70"
      >
        <div class="flex items-center gap-4">
          <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', card.iconClass]">
            <Icon :name="card.icon" class="h-6 w-6" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-slate-500">{{ card.label }}</p>
            <p class="mt-1 text-2xl font-black text-slate-950">{{ card.value }}</p>
            <p class="mt-1 truncate text-xs font-black text-slate-500">{{ card.helper }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
      <div class="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-lg font-black text-slate-950">Danh sách thông báo</h2>
          <p class="mt-1 text-sm font-semibold text-slate-500">Dữ liệu hiển thị trực tiếp từ hệ thống thông báo.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            :class="[
              'inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              activeFilter === filter.value
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                : 'bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
            ]"
            @click="setFilter(filter.value)"
          >
            <Icon :name="filter.icon" class="h-4 w-4" />
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="space-y-3 p-6">
        <div v-for="index in 5" :key="index" class="h-20 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div v-else-if="notifications.length === 0" class="p-10 text-center">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
          <Icon name="uil:bell-slash" class="h-8 w-8" />
        </span>
        <h3 class="mt-4 text-xl font-black text-slate-950">Chưa có thông báo</h3>
        <p class="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
          Khi admin yêu cầu KYB, ứng viên gửi hồ sơ hoặc có tin nhắn mới, thông báo sẽ xuất hiện ở đây.
        </p>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <button
          v-for="item in notifications"
          :key="item.id"
          type="button"
          class="flex w-full items-start gap-4 px-6 py-4 text-left transition hover:bg-sky-50/50 focus:outline-none focus-visible:bg-sky-50"
          @click="openNotification(item)"
        >
          <span :class="['mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', getNotificationIconClass(item.type)]">
            <Icon :name="getNotificationIcon(item.type)" class="h-5 w-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-black text-slate-950">{{ item.title || 'Thông báo QuickWork' }}</span>
              <span
                v-if="!item.is_read"
                class="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black uppercase text-sky-700"
              >
                Mới
              </span>
            </span>
            <span class="mt-1 line-clamp-2 block text-sm font-semibold leading-6 text-slate-500">{{ item.content }}</span>
            <span class="mt-2 block text-xs font-bold text-slate-400">{{ formatDateTime(item.created_at) }}</span>
          </span>
          <Icon name="uil:angle-right" class="mt-4 h-5 w-5 shrink-0 text-slate-300" />
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NotificationService } from '~/services/notification.service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

type NotificationItem = {
  id: number
  type: string
  title: string
  content: string
  action_url?: string
  is_read: boolean
  created_at?: string
}

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const notifications = ref<NotificationItem[]>([])
const isLoading = ref(false)
const isMarkingAll = ref(false)
const unreadCount = ref(0)
const totalCount = ref(0)
const activeFilter = ref('ALL')

const filters = [
  { value: 'ALL', label: 'Tất cả', icon: 'uil:list-ul' },
  { value: 'UNREAD', label: 'Chưa đọc', icon: 'uil:envelope-exclamation' },
  { value: 'KYB', label: 'KYB', icon: 'uil:shield-check' },
  { value: 'MESSAGE', label: 'Tin nhắn', icon: 'uil:comment-alt-message' }
]

const needsKYBAction = computed(() => authStore.enterpriseKybRequired && !authStore.enterpriseApproved)

const kybBannerTitle = computed(() => {
  if (authStore.enterpriseKybStatus === 'REJECTED') return 'Hồ sơ KYB cần bổ sung'
  return 'Hồ sơ doanh nghiệp đang chờ xác minh'
})

const summaryCards = computed(() => [
  { label: 'Tổng thông báo', value: totalCount.value, helper: 'Trong tài khoản này', icon: 'uil:bell', iconClass: 'bg-sky-50 text-sky-600' },
  { label: 'Chưa đọc', value: unreadCount.value, helper: 'Cần xem', icon: 'uil:envelope-exclamation', iconClass: 'bg-amber-50 text-amber-600' },
  { label: 'KYB', value: countByType('KYB'), helper: 'Xác minh doanh nghiệp', icon: 'uil:shield-check', iconClass: 'bg-cyan-50 text-cyan-700' },
  { label: 'Tin nhắn', value: countByType('MESSAGE'), helper: 'Trao đổi ứng tuyển', icon: 'uil:comment-alt-message', iconClass: 'bg-violet-50 text-violet-600' }
])

function currentQuery() {
  const params: Record<string, any> = { page: 1, page_size: 50 }
  if (activeFilter.value === 'UNREAD') params.is_read = false
  if (activeFilter.value === 'KYB' || activeFilter.value === 'MESSAGE') params.type = activeFilter.value
  return params
}

async function fetchNotifications() {
  isLoading.value = true
  try {
    const [listResponse, unreadResponse]: any[] = await Promise.all([
      NotificationService.list(currentQuery()),
      NotificationService.unreadCount()
    ])
    notifications.value = listResponse?.data?.items || []
    totalCount.value = Number(listResponse?.data?.pagination?.total || notifications.value.length || 0)
    unreadCount.value = Number(unreadResponse?.data?.unread_count || 0)
  } catch (error: any) {
    toast.error('Không thể tải thông báo', error?.data?.message || error?.message || 'Vui lòng thử lại.')
    notifications.value = []
  } finally {
    isLoading.value = false
  }
}

async function markAllRead() {
  isMarkingAll.value = true
  try {
    await NotificationService.markAllAsRead()
    await fetchNotifications()
    toast.success('Đã đọc thông báo', 'Tất cả thông báo đã được đánh dấu đã đọc.')
  } catch (error: any) {
    toast.error('Không thể cập nhật', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    isMarkingAll.value = false
  }
}

async function openNotification(item: NotificationItem) {
  try {
    if (!item.is_read) {
      await NotificationService.markAsRead(item.id)
      item.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch {
    // The navigation is still useful even if marking read fails.
  }

  const target = normalizeActionURL(item.action_url)
  if (target) {
    await router.push(target)
  }
}

function setFilter(value: string) {
  activeFilter.value = value
  fetchNotifications()
}

function countByType(type: string) {
  return notifications.value.filter((item) => item.type === type).length
}

function normalizeActionURL(value?: string) {
  if (!value) return ''
  if (value.startsWith('/enterprise/messages/')) return value
  if (value.startsWith('/enterprise/') || value.startsWith('/admin/') || value.startsWith('/student/')) return value
  if (value.startsWith('/messages/')) return `/enterprise${value}`
  return value
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

function formatDateTime(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(fetchNotifications)
</script>
