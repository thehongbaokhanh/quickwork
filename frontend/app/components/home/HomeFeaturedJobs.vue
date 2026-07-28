<template>
  <section id="featured-jobs" class="bg-slate-50 py-12 sm:py-14">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-4">
            <h2 class="text-3xl font-extrabold leading-tight text-sky-600 sm:text-4xl">
              Việc làm tốt nhất
            </h2>
            <span class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
              <Icon name="uil:bolt-alt" class="h-4 w-4 text-sky-600" aria-hidden="true" />
              Đề xuất bởi QuickWork
            </span>
          </div>
          <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Danh sách được sắp xếp theo độ phù hợp, mức lương, số vị trí và thời gian đăng từ dữ liệu tuyển dụng hiện có.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/student"
            class="inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-800 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            Xem tất cả
            <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
          </NuxtLink>
          <button
            type="button"
            class="hidden h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex"
            :disabled="pageCount <= 1"
            aria-label="Trang việc làm trước"
            @click="previousPage"
          >
            <Icon name="uil:angle-left" class="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="hidden h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 sm:inline-flex"
            :disabled="pageCount <= 1"
            aria-label="Trang việc làm tiếp theo"
            @click="nextPage"
          >
            <Icon name="uil:angle-right" class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center">
        <div ref="filterDropdownRef" class="relative shrink-0">
          <button
            type="button"
            class="flex h-14 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 text-left text-base font-bold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 sm:min-w-[280px]"
            aria-haspopup="menu"
            :aria-expanded="isFilterMenuOpen"
            aria-controls="home-featured-filter-menu"
            @click="toggleFilterMenu"
            @keydown.escape="isFilterMenuOpen = false"
          >
            <span class="inline-flex min-w-0 items-center gap-3">
              <Icon name="uil:filter" class="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <span class="text-slate-400">Lọc theo:</span>
              <span class="truncate text-slate-950">{{ activeFilterOption.label }}</span>
            </span>
            <Icon
              name="uil:angle-down"
              :class="['h-5 w-5 shrink-0 text-slate-500 transition', isFilterMenuOpen ? 'rotate-180' : '']"
              aria-hidden="true"
            />
          </button>

          <div
            v-if="isFilterMenuOpen"
            id="home-featured-filter-menu"
            class="absolute left-0 top-[calc(100%+8px)] z-30 w-full min-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl shadow-slate-200/70"
            role="menu"
          >
            <button
              v-for="option in filterOptions"
              :key="option.key"
              type="button"
              :class="[
                'flex h-12 w-full items-center justify-between gap-3 border-b border-slate-100 px-5 text-left text-base font-bold transition last:border-b-0 focus:outline-none focus-visible:bg-sky-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-100',
                activeFilterKey === option.key
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
              ]"
              role="menuitemradio"
              :aria-checked="activeFilterKey === option.key"
              @click="selectFilterKey(option.key)"
            >
              <span class="inline-flex items-center gap-3">
                <Icon :name="option.icon" class="h-5 w-5 text-sky-600" aria-hidden="true" />
                {{ option.label }}
              </span>
              <Icon v-if="activeFilterKey === option.key" name="uil:check" class="h-5 w-5 text-sky-600" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div class="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1">
          <button
            v-for="option in currentFilterOptions"
            :key="`${activeFilterKey}-${option}`"
            type="button"
            :aria-pressed="activeFilterValue === option"
            :class="[
              'h-12 shrink-0 rounded-full px-5 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100',
              activeFilterValue === option
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                : 'bg-white text-slate-700 shadow-sm shadow-slate-200/70 hover:bg-sky-50 hover:text-sky-700'
            ]"
            @click="selectFilterValue(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <div
        v-if="isFilterHintVisible"
        class="mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-700"
      >
        <Icon name="uil:lightbulb-alt" class="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
        <p class="min-w-0 flex-1">
          Gợi ý: chọn bộ lọc theo {{ activeFilterOption.label.toLowerCase() }} để xem nhóm việc phù hợp hơn.
        </p>
        <button
          type="button"
          class="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          aria-label="An goi y"
          @click="isFilterHintVisible = false"
        >
          <Icon name="uil:times" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div v-if="loading" class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="item in pageSize" :key="item" class="h-[158px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>

      <div
        v-else-if="filteredJobs.length"
        class="relative mt-6"
      >
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="job in pagedJobs"
            :key="job.id"
          >
            <HomeJobCard
              :job="job"
              :active="selectedJob?.id === job.id"
              :is-favorite="isFavoriteJob?.(job) || false"
              :is-favorite-loading="isFavoriteLoading?.(job) || false"
              @save="emit('save', job)"
              @preview="handleTitlePreview"
              @preview-close="handleTitlePreviewClose"
            />
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-2 opacity-0"
        >
          <div
            v-if="selectedJob"
            ref="detailPanelRef"
            class="fixed z-50 mx-auto max-w-[430px]"
            :style="previewPopupStyle"
            role="dialog"
            aria-label="Xem nhanh chi tiết việc làm"
            @mouseenter="handlePreviewEnter"
            @mouseleave="handlePreviewLeave"
            @focusin="handlePreviewEnter"
            @focusout="handlePreviewFocusOut"
          >
            <HomeJobDetailPanel
              :job="selectedJob"
              variant="popup"
              :is-applied="isAppliedJob?.(selectedJob) || false"
              :is-applying="isApplyingJob?.(selectedJob) || false"
              :is-favorite="isFavoriteJob?.(selectedJob) || false"
              :is-favorite-loading="isFavoriteLoading?.(selectedJob) || false"
              @apply="emit('apply', selectedJob)"
              @close="emit('closeDetail')"
              @save="emit('save', selectedJob)"
            />
          </div>
        </Transition>
      </div>

      <div v-else class="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
        <Icon name="uil:search" class="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <h3 class="mt-4 text-xl font-extrabold text-slate-950">Chưa tìm thấy việc làm phù hợp</h3>
        <p class="mt-2 text-base text-slate-600">Thử đổi từ khóa, địa điểm, mức lương hoặc nhóm ngành để xem thêm cơ hội đang có.</p>
        <button
          type="button"
          class="mt-6 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          @click="resetAllFilters"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div v-if="!loading && filteredJobs.length && pageCount > 1" class="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          aria-label="Trang việc làm trước"
          @click="previousPage"
        >
          <Icon name="uil:angle-left" class="h-6 w-6" aria-hidden="true" />
        </button>
        <p class="text-base font-bold text-slate-500">
          <span class="text-sky-600">{{ currentPage }}</span>
          /
          {{ pageCount }} trang
        </p>
        <button
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700 transition hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          aria-label="Trang việc làm tiếp theo"
          @click="nextPage"
        >
          <Icon name="uil:angle-right" class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { DisplayJob } from '~/utils/jobDisplay'
import HomeJobCard from '~/components/HomeJobCard.vue'
import HomeJobDetailPanel from '~/components/home/HomeJobDetailPanel.vue'

type FilterKey = 'location' | 'salary' | 'level' | 'category' | 'type'

interface FilterOption {
  key: FilterKey
  label: string
  icon: string
}

interface PreviewAnchor {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

const allValue = 'Tất cả'
const pageSize = 9
const autoPageDelay = 7000
const previewCloseDelay = 180
const previewPopupWidth = 430
const previewPopupGap = 14
const viewportMargin = 16
const defaultFilterOption: FilterOption = { key: 'location', label: 'Địa điểm', icon: 'uil:map-marker' }
const filterOptions: FilterOption[] = [
  defaultFilterOption,
  { key: 'salary', label: 'Mức lương', icon: 'uil:money-bill' },
  { key: 'level', label: 'Kinh nghiệm', icon: 'uil:user-check' },
  { key: 'category', label: 'Ngành nghề', icon: 'uil:briefcase-alt' },
  { key: 'type', label: 'Loại hình', icon: 'uil:clock' }
]

const props = defineProps<{
  jobs: DisplayJob[]
  categories: string[]
  categoryFilterRequest?: { category: string; requestId: number } | null
  isAppliedJob?: (job: DisplayJob) => boolean
  isApplyingJob?: (job: DisplayJob) => boolean
  isFavoriteJob?: (job: DisplayJob) => boolean
  isFavoriteLoading?: (job: DisplayJob) => boolean
  loading: boolean
  selectedJob?: DisplayJob | null
}>()

const emit = defineEmits<{
  apply: [job: DisplayJob]
  closeDetail: []
  detail: [job: DisplayJob, source?: 'hover' | 'click']
  reset: []
  save: [job: DisplayJob]
}>()

const activeFilterKey = ref<FilterKey>('location')
const activeFilterValue = ref(allValue)
const currentPage = ref(1)
const isFilterMenuOpen = ref(false)
const isFilterHintVisible = ref(true)
const lastInteractionAt = ref(Date.now())
const filterDropdownRef = ref<HTMLElement | null>(null)
const detailPanelRef = ref<HTMLElement | null>(null)
const previewAnchor = ref<PreviewAnchor | null>(null)
const isTitleHovered = ref(false)
const isPreviewHovered = ref(false)
let autoPageTimer: ReturnType<typeof setInterval> | null = null
let previewCloseTimer: ReturnType<typeof setTimeout> | null = null

const activeFilterOption = computed(() => {
  return filterOptions.find((option) => option.key === activeFilterKey.value) || defaultFilterOption
})

const filterValueMap = computed<Record<FilterKey, string[]>>(() => ({
  location: uniqueValues(props.jobs.map((job) => job.location)).filter((value) => value !== 'Chưa cập nhật'),
  salary: uniqueValues(props.jobs.map((job) => job.salaryRange)),
  level: uniqueValues(props.jobs.map((job) => job.level)),
  category: uniqueValues([
    ...props.categories.filter((category) => category !== allValue),
    ...props.jobs.map((job) => job.category)
  ]),
  type: uniqueValues(props.jobs.map((job) => job.type))
}))

const currentFilterOptions = computed(() => {
  const values = filterValueMap.value[activeFilterKey.value]
  const options = [allValue, ...values]
  const selectedValue = activeFilterValue.value
  const visibleOptions = options.slice(0, 12)

  if (selectedValue !== allValue && values.includes(selectedValue) && !visibleOptions.includes(selectedValue)) {
    return [allValue, selectedValue, ...values.filter((value) => value !== selectedValue)].slice(0, 12)
  }

  return visibleOptions
})

const filteredJobs = computed(() => {
  if (activeFilterValue.value === allValue) {
    return props.jobs
  }

  return props.jobs.filter((job) => getJobFilterValue(job, activeFilterKey.value) === activeFilterValue.value)
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / pageSize)))

const pagedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredJobs.value.slice(start, start + pageSize)
})

const isPreviewActive = computed(() => Boolean(props.selectedJob) || isTitleHovered.value || isPreviewHovered.value)

const previewPopupStyle = computed(() => {
  if (!process.client || !previewAnchor.value) {
    return {
      bottom: '1rem',
      left: '1rem',
      right: '1rem'
    }
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  if (viewportWidth < 768) {
    return {
      bottom: '1rem',
      left: '1rem',
      right: '1rem'
    }
  }

  const popupWidth = Math.min(previewPopupWidth, viewportWidth - viewportMargin * 2)
  const anchor = previewAnchor.value
  const openRight = anchor.right + previewPopupGap + popupWidth <= viewportWidth - viewportMargin
  const left = openRight
    ? anchor.right + previewPopupGap
    : Math.max(viewportMargin, anchor.left - previewPopupGap - popupWidth)
  const maxTop = Math.max(viewportMargin, viewportHeight - 560 - viewportMargin)
  const top = Math.min(Math.max(viewportMargin, anchor.top - 8), maxTop)

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${popupWidth}px`
  }
})

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]))
}

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase()
}

function getJobFilterValue(job: DisplayJob, key: FilterKey) {
  if (key === 'location') return job.location
  if (key === 'salary') return job.salaryRange
  if (key === 'level') return job.level
  if (key === 'category') return job.category
  return job.type
}

function markInteraction() {
  lastInteractionAt.value = Date.now()
}

function clearPreviewCloseTimer() {
  if (!previewCloseTimer) return
  clearTimeout(previewCloseTimer)
  previewCloseTimer = null
}

function toggleFilterMenu() {
  markInteraction()
  isFilterMenuOpen.value = !isFilterMenuOpen.value
}

function selectFilterKey(key: FilterKey) {
  markInteraction()
  activeFilterKey.value = key
  activeFilterValue.value = allValue
  currentPage.value = 1
  isFilterMenuOpen.value = false
}

function selectFilterValue(value: string) {
  markInteraction()
  activeFilterValue.value = value
  currentPage.value = 1
}

function applyCategoryFilter(category: unknown) {
  const selectedCategory = typeof category === 'string' ? category.trim() : ''
  if (!selectedCategory || selectedCategory === allValue) return
  const normalizedCategory = normalizeFilterValue(selectedCategory)
  const matchedCategory = filterValueMap.value.category.find((value) => normalizeFilterValue(value) === normalizedCategory)

  markInteraction()
  activeFilterKey.value = 'category'
  activeFilterValue.value = matchedCategory || allValue
  currentPage.value = 1
  isFilterMenuOpen.value = false
}

function goToPage(page: number, userInitiated = true) {
  if (userInitiated) {
    markInteraction()
  }

  if (page < 1) {
    currentPage.value = pageCount.value
    return
  }

  if (page > pageCount.value) {
    currentPage.value = 1
    return
  }

  currentPage.value = page
}

function previousPage() {
  goToPage(currentPage.value - 1)
}

function nextPage() {
  goToPage(currentPage.value + 1)
}

function handleTitlePreview(job: DisplayJob, anchor: PreviewAnchor) {
  markInteraction()
  isTitleHovered.value = true
  previewAnchor.value = anchor
  clearPreviewCloseTimer()
  emit('detail', job, 'hover')
}

function handleTitlePreviewClose() {
  isTitleHovered.value = false
  schedulePreviewClose()
}

function handlePreviewEnter() {
  markInteraction()
  isPreviewHovered.value = true
  clearPreviewCloseTimer()
}

function handlePreviewLeave() {
  isPreviewHovered.value = false
  schedulePreviewClose()
}

function handlePreviewFocusOut(event: FocusEvent) {
  const currentTarget = event.currentTarget
  const relatedTarget = event.relatedTarget
  if (currentTarget instanceof HTMLElement && relatedTarget instanceof Node && currentTarget.contains(relatedTarget)) {
    return
  }

  isPreviewHovered.value = false
  schedulePreviewClose()
}

function schedulePreviewClose() {
  markInteraction()
  clearPreviewCloseTimer()
  previewCloseTimer = setTimeout(() => {
    if (isTitleHovered.value || isPreviewHovered.value) return
    emit('closeDetail')
  }, previewCloseDelay)
}

function handleDocumentClick(event: MouseEvent) {
  if (!(event.target instanceof Node)) return

  if (isFilterMenuOpen.value && !filterDropdownRef.value?.contains(event.target)) {
    isFilterMenuOpen.value = false
  }

  if (!props.selectedJob) return
  if (detailPanelRef.value?.contains(event.target)) return
  emit('closeDetail')
}

function resetAllFilters() {
  markInteraction()
  activeFilterKey.value = 'location'
  activeFilterValue.value = allValue
  currentPage.value = 1
  emit('reset')
}

watch(currentFilterOptions, (options) => {
  if (!options.includes(activeFilterValue.value)) {
    activeFilterValue.value = allValue
  }
})

watch(() => props.categoryFilterRequest?.requestId, () => {
  const request = props.categoryFilterRequest
  if (!request) return
  applyCategoryFilter(request.category)
})

watch(pageCount, (count) => {
  if (currentPage.value > count) {
    currentPage.value = count
  }
})

watch(filteredJobs, () => {
  currentPage.value = Math.min(currentPage.value, pageCount.value)
})

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)

  autoPageTimer = setInterval(() => {
    if (pageCount.value <= 1) return
    if (isPreviewActive.value) return
    if (Date.now() - lastInteractionAt.value < autoPageDelay) return
    goToPage(currentPage.value + 1, false)
  }, autoPageDelay)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  clearPreviewCloseTimer()

  if (autoPageTimer) {
    clearInterval(autoPageTimer)
  }
})
</script>
