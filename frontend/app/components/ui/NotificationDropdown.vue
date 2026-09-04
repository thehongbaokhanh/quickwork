<template>
  <div
    class="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm shadow-2xl shadow-slate-950/10"
  >
    <div class="border-b border-slate-100 px-4 py-3">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate font-black text-slate-950">{{ title }}</p>
          <p class="mt-0.5 text-xs font-semibold text-slate-500">
            {{ unreadCount }} thông báo chưa đọc.
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-black text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="unreadCount === 0"
          @click="$emit('markAllRead')"
        >
          Đã đọc
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-2 px-4 py-4">
      <div v-for="index in 3" :key="index" class="h-14 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <div v-else-if="items.length === 0" class="px-4 py-5 text-sm font-semibold text-slate-500">
      {{ emptyText }}
    </div>

    <div v-else class="notification-dropdown-scroll max-h-[min(30rem,calc(100vh-12rem))] overflow-y-auto">
      <section>
        <div class="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-2 backdrop-blur">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-400">
            Trong 24 giờ gần nhất
          </p>
        </div>

        <div v-if="recentItems.length === 0" class="px-4 py-4 text-xs font-semibold text-slate-500">
          Chưa có thông báo mới trong hôm nay.
        </div>

        <button
          v-for="item in recentItems"
          :key="`recent-${item.id}`"
          type="button"
          class="relative flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 pr-12 text-left transition hover:bg-sky-50/70 focus:outline-none focus-visible:bg-sky-50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100"
          @click="$emit('open', item)"
        >
          <span :class="['mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', getIconClass(item.type)]">
            <Icon :name="getIcon(item.type)" class="h-4.5 w-4.5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="truncate text-sm font-black text-slate-950">{{ item.title || 'Thông báo' }}</span>
            <span class="mt-0.5 line-clamp-2 block text-xs font-semibold leading-5 text-slate-500">{{ item.content }}</span>
          </span>
          <span
            v-if="item.unread_group_count === 1"
            class="absolute right-4 top-3 h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white"
            aria-label="Một thông báo chưa đọc"
          />
          <span
            v-else-if="item.unread_group_count && item.unread_group_count > 1"
            class="absolute right-3 top-2.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-black text-white ring-2 ring-white"
            :aria-label="`${item.unread_group_count} thông báo chưa đọc`"
          >
            {{ item.unread_group_count > 99 ? '99+' : item.unread_group_count }}
          </span>
        </button>
      </section>

      <section v-if="olderItems.length > 0" class="bg-slate-50/70">
        <div class="border-b border-slate-100 px-4 py-2">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-400">
            Thông báo trước đó
          </p>
        </div>

        <button
          v-for="item in visibleOlderItems"
          :key="`older-${item.id}`"
          type="button"
          class="relative flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 pr-12 text-left transition hover:bg-sky-50/70 focus:outline-none focus-visible:bg-sky-50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky-100"
          @click="$emit('open', item)"
        >
          <span :class="['mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', getIconClass(item.type)]">
            <Icon :name="getIcon(item.type)" class="h-4.5 w-4.5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="truncate text-sm font-black text-slate-950">{{ item.title || 'Thông báo' }}</span>
            <span class="mt-0.5 line-clamp-2 block text-xs font-semibold leading-5 text-slate-500">{{ item.content }}</span>
          </span>
          <span
            v-if="item.unread_group_count === 1"
            class="absolute right-4 top-3 h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white"
            aria-label="Một thông báo chưa đọc"
          />
          <span
            v-else-if="item.unread_group_count && item.unread_group_count > 1"
            class="absolute right-3 top-2.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-black text-white ring-2 ring-white"
            :aria-label="`${item.unread_group_count} thông báo chưa đọc`"
          >
            {{ item.unread_group_count > 99 ? '99+' : item.unread_group_count }}
          </span>
        </button>

        <div v-if="remainingOlderCount > 0" class="px-4 py-3">
          <button
            type="button"
            class="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-black text-sky-700 transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="showMoreOlder"
          >
            <Icon name="uil:angle-down" class="h-4 w-4" aria-hidden="true" />
            Hiển thị thêm {{ Math.min(pageSize, remainingOlderCount) }} thông báo
          </button>
        </div>
      </section>
    </div>

    <div v-if="viewAllTo" class="border-t border-slate-100 p-3">
      <NuxtLink
        :to="viewAllTo"
        class="flex h-10 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        @click="$emit('close')"
      >
        {{ viewAllLabel }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type NotificationItem = {
  id: string | number
  type?: string
  title?: string
  content?: string
  is_read?: boolean
  created_at?: string
  action_url?: string
  source_id?: string | number
  unread_group_count?: number
  grouped_ids?: Array<string | number>
  unread_ids?: Array<string | number>
}

const props = withDefaults(defineProps<{
  title: string
  unreadCount: number
  loading: boolean
  items: NotificationItem[]
  emptyText: string
  viewAllTo?: string
  viewAllLabel?: string
  storageKey?: string
  groupJobNotifications?: boolean
  getIcon?: (type?: string) => string
  getIconClass?: (type?: string) => string
}>(), {
  viewAllTo: '',
  viewAllLabel: 'Xem tất cả thông báo',
  storageKey: '',
  groupJobNotifications: false,
  getIcon: () => 'uil:bell',
  getIconClass: () => 'bg-slate-50 text-slate-600'
})

defineEmits<{
  markAllRead: []
  open: [item: NotificationItem]
  close: []
}>()

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000
const pageSize = 5
const olderVisibleCount = ref(0)
const persistedKey = computed(() => `quickwork:notification-dropdown:${props.storageKey || props.title}`)

const recentItems = computed(() => groupNotifications(props.items.filter(isWithinLastDay)))
const olderItems = computed(() => groupNotifications(props.items.filter((item) => !isWithinLastDay(item))))
const visibleOlderItems = computed(() => olderItems.value.slice(0, olderVisibleCount.value))
const remainingOlderCount = computed(() => Math.max(0, olderItems.value.length - olderVisibleCount.value))

watch(
  () => props.items.map((item) => item.id).join('|'),
  () => {
    restoreOlderVisibleCount()
  },
  { immediate: true }
)

function showMoreOlder() {
  olderVisibleCount.value = Math.min(olderItems.value.length, olderVisibleCount.value + pageSize)
  persistOlderVisibleCount()
}

function isWithinLastDay(item: NotificationItem) {
  const date = new Date(item?.created_at || '')
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() <= ONE_DAY_IN_MS
}

function groupNotifications(items: NotificationItem[]) {
  const grouped = new Map<string, NotificationItem>()
  const result: NotificationItem[] = []

  for (const item of items) {
    const baseItem = toDisplayItem(item)
    const unreadIDs = baseItem.unread_ids || []

    if (props.groupJobNotifications && item.type === 'JOB') {
      const groupKey = 'job:student'
      const existing = grouped.get(groupKey)
      if (!existing) {
        grouped.set(groupKey, baseItem)
        updateJobNotificationGroup(baseItem)
        result.push(baseItem)
        continue
      }

      mergeNotificationGroup(existing, item, unreadIDs)
      updateJobNotificationGroup(existing)
      continue
    }

    if (item.type !== 'MESSAGE') {
      result.push(baseItem)
      continue
    }

    const sender = messageSender(item)
    const fallbackKey = item.source_id ?? item.action_url ?? item.id
    const groupKey = `message:${sender ? normalizeGroupKey(sender) : fallbackKey}`
    const existing = grouped.get(groupKey)

    if (!existing) {
      grouped.set(groupKey, baseItem)
      result.push(baseItem)
      continue
    }

    mergeNotificationGroup(existing, item, unreadIDs)

    if (sender && existing.grouped_ids.length > 1) {
      existing.title = sender
      existing.content = existing.unread_group_count > 0
        ? `${sender} đã gửi cho bạn ${existing.unread_group_count} tin nhắn.`
        : `Bạn đã đọc các tin nhắn từ ${sender} trong 24 giờ qua.`
    }
  }

  return result
}

function mergeNotificationGroup(existing: NotificationItem, item: NotificationItem, unreadIDs: Array<string | number>) {
  existing.grouped_ids = [...(existing.grouped_ids || []), item.id]
  existing.unread_ids = [...(existing.unread_ids || []), ...unreadIDs]
  existing.unread_group_count = existing.unread_ids.length
  existing.is_read = existing.unread_group_count === 0
}

function updateJobNotificationGroup(item: NotificationItem) {
  const total = Math.max(1, item.grouped_ids?.length || 0)
  const unread = item.unread_ids?.length || 0
  item.title = `Thông báo việc làm (${total})`
  item.content = unread > 0
    ? `Bạn có ${unread} thông báo việc làm chưa đọc. Mở danh sách để xem các việc phù hợp.`
    : `${total} thông báo việc làm đã được gộp trong mục này.`
  item.action_url = '/student'
  item.unread_group_count = unread
  item.is_read = unread === 0
}

function toDisplayItem(item: NotificationItem): NotificationItem {
  const unreadIDs = item.is_read ? [] : [item.id]
  return {
    ...item,
    grouped_ids: [item.id],
    unread_ids: unreadIDs,
    unread_group_count: unreadIDs.length
  }
}

function messageSender(item: NotificationItem) {
  const content = String(item.content || '').trim()
  const match = content.match(/^(.+?)\s+đã gửi cho bạn(?:\s+một)?\s+tin nhắn[.!]?$/i)
  return match?.[1]?.trim() || ''
}

function normalizeGroupKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function restoreOlderVisibleCount() {
  const storedCount = readStoredOlderVisibleCount()
  olderVisibleCount.value = Math.min(
    olderItems.value.length,
    Math.max(olderVisibleCount.value, storedCount)
  )
}

function readStoredOlderVisibleCount() {
  if (!process.client || typeof window === 'undefined') return 0
  try {
    const storedValue = window.sessionStorage.getItem(persistedKey.value)
    const count = Number(storedValue)
    return Number.isFinite(count) && count > 0 ? count : 0
  } catch {
    return 0
  }
}

function persistOlderVisibleCount() {
  if (!process.client || typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(persistedKey.value, String(olderVisibleCount.value))
  } catch {
    // Storage can be blocked by the browser; the dropdown still works in memory.
  }
}
</script>

<style scoped>
.notification-dropdown-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(14, 165, 233, 0.58) rgba(226, 232, 240, 0.8);
}

.notification-dropdown-scroll::-webkit-scrollbar {
  width: 0.45rem;
}

.notification-dropdown-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(226, 232, 240, 0.75);
}

.notification-dropdown-scroll::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.95), rgba(37, 99, 235, 0.85)) padding-box;
}
</style>
