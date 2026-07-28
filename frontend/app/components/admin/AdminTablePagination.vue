<template>
  <div
    v-if="total > 0"
    class="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-5"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span class="text-sm font-bold text-slate-500">
        Số lượng {{ itemLabel }} trong 1 trang:
      </span>
      <ScrollSelect
        :model-value="pageSize"
        class="w-36"
        :options="resolvedPageSizeOptions"
        :ariaLabel="`Số lượng ${itemLabel} trong một trang`"
        icon="uil:list-ul"
        size="sm"
        tone="sky"
        @update:model-value="handlePageSizeChange"
      />
      <span class="text-xs font-semibold text-slate-500">
        Hiển thị {{ pageStart }} đến {{ pageEnd }} của {{ total }} {{ itemLabel }}
      </span>
    </div>

    <nav
      v-if="totalPages > 1"
      class="flex items-center justify-end gap-2"
      aria-label="Phân trang bảng quản trị"
    >
      <button
        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        :disabled="safePage === 1"
        aria-label="Trang trước"
        @click="goToPage(safePage - 1)"
      >
        <Icon name="uil:angle-left" class="h-5 w-5" />
      </button>

      <template v-for="(item, index) in visiblePages" :key="`${item}-${index}`">
        <span
          v-if="item === '...'"
          class="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm font-black text-slate-400"
        >
          ...
        </span>
        <button
          v-else
          :class="[
            'inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
            item === safePage
              ? 'border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-100'
              : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
          ]"
          type="button"
          :aria-current="item === safePage ? 'page' : undefined"
          :aria-label="`Trang ${item}`"
          @click="goToPage(Number(item))"
        >
          {{ item }}
        </button>
      </template>

      <button
        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        :disabled="safePage === totalPages"
        aria-label="Trang sau"
        @click="goToPage(safePage + 1)"
      >
        <Icon name="uil:angle-right" class="h-5 w-5" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'

type SelectValue = string | number

const props = withDefaults(defineProps<{
  page: number
  pageSize: number
  total: number
  itemLabel?: string
  pageSizeOptions?: Array<{ value: number; label: string }>
}>(), {
  itemLabel: 'bản ghi',
  pageSizeOptions: () => [
    { value: 5, label: '5 / trang' },
    { value: 10, label: '10 / trang' },
    { value: 20, label: '20 / trang' },
    { value: 50, label: '50 / trang' }
  ]
})

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

const normalizedPageSize = computed(() => {
  const size = Number(props.pageSize)
  return Number.isFinite(size) && size > 0 ? size : 10
})

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / normalizedPageSize.value)))
const safePage = computed(() => Math.min(Math.max(Number(props.page) || 1, 1), totalPages.value))
const pageStart = computed(() => (props.total === 0 ? 0 : (safePage.value - 1) * normalizedPageSize.value + 1))
const pageEnd = computed(() => Math.min(safePage.value * normalizedPageSize.value, props.total))

const resolvedPageSizeOptions = computed(() => props.pageSizeOptions)

const visiblePages = computed(() => {
  const pages: Array<number | string> = []
  const total = totalPages.value
  const current = safePage.value

  if (total <= 6) {
    for (let page = 1; page <= total; page += 1) pages.push(page)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let page = start; page <= end; page += 1) pages.push(page)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
})

function goToPage(page: number) {
  emit('update:page', Math.min(Math.max(page, 1), totalPages.value))
}

function handlePageSizeChange(value: SelectValue) {
  const size = Number(value)
  emit('update:pageSize', Number.isFinite(size) && size > 0 ? size : 10)
  emit('update:page', 1)
}
</script>
