<template>
  <div class="min-h-screen bg-slate-50">
    <section class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-sky-950 text-white">
      <div class="absolute inset-0 opacity-30">
        <div class="absolute -left-16 top-8 h-64 w-64 rounded-full bg-sky-500 blur-3xl"></div>
        <div class="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-teal-400 blur-3xl"></div>
      </div>

      <div class="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div class="flex flex-col justify-center">
          <div class="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-100">
            <Icon name="uil:bolt" class="h-4 w-4" />
            Tất cả việc làm trên QuickWork
          </div>
          <h1 class="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Khám phá toàn bộ việc làm đang tuyển
          </h1>
          <p class="mt-4 max-w-xl text-base leading-8 text-sky-50">
            Danh sách được tải trực tiếp từ hệ thống, chỉ hiển thị các tin tuyển dụng đã được duyệt.
          </p>
        </div>

        <div class="hidden items-center justify-center lg:flex">
          <div class="relative h-56 w-full max-w-sm rounded-xl border border-white/20 bg-white/12 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <div class="space-y-3">
              <div v-for="row in 3" :key="row" class="rounded-lg bg-white p-3 shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 rounded-lg bg-sky-100"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-2.5 w-2/3 rounded bg-sky-200"></div>
                    <div class="h-2 w-1/2 rounded bg-slate-200"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="absolute -bottom-5 -left-5 flex h-16 w-16 rotate-[-8deg] items-center justify-center rounded-xl bg-white text-sky-700 shadow-xl">
              <Icon name="uil:briefcase-alt" class="h-8 w-8" />
            </div>
            <div class="absolute -right-5 top-20 flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-sky-700 bg-white text-sky-700 shadow-xl">
              <Icon name="uil:search" class="h-8 w-8" />
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="grid gap-3 rounded-xl border border-white/20 bg-white p-3 text-slate-900 shadow-2xl shadow-slate-950/25 lg:grid-cols-[1.2fr_0.8fr_220px_130px]">
            <label class="flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-4">
              <Icon name="uil:search" class="h-5 w-5 shrink-0 text-sky-600" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Vị trí, kỹ năng hoặc công ty"
                class="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
              >
            </label>
            <label class="flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-4">
              <Icon name="uil:map-marker" class="h-5 w-5 shrink-0 text-sky-600" />
              <select v-model="activeLocation" class="w-full bg-transparent text-sm font-bold outline-none">
                <option v-for="location in locationOptions" :key="location">{{ location }}</option>
              </select>
            </label>
            <label class="flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-4">
              <Icon name="uil:briefcase-alt" class="h-5 w-5 shrink-0 text-sky-600" />
              <select v-model="activeType" class="w-full bg-transparent text-sm font-bold outline-none">
                <option v-for="type in typeOptions" :key="type">{{ type }}</option>
              </select>
            </label>
            <button
              type="button"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 text-sm font-black text-slate-950 transition-colors hover:bg-sky-400"
              @click="notifyDevelopment('Tìm kiếm việc làm nâng cao')"
            >
              Tìm kiếm
            </button>
          </div>

          <div class="mt-5 flex flex-wrap gap-3 text-sm">
            <button
              v-for="tag in quickTags"
              :key="tag.value"
              type="button"
              :class="[
                'inline-flex items-center gap-2 rounded-full px-4 py-2 font-black transition-colors',
                activeQuickTag === tag.value
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-slate-950/20'
                  : 'bg-white/90 text-slate-950 hover:bg-sky-100'
              ]"
              @click="activeQuickTag = tag.value"
            >
              <Icon :name="tag.icon" class="h-4 w-4" />
              {{ tag.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_300px] lg:px-8">
      <aside class="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-black text-slate-950">Bộ lọc tìm kiếm</h2>
          <button type="button" class="text-xs font-black text-sky-700 hover:text-sky-800" @click="clearFilters">
            Xóa tất cả
          </button>
        </div>

        <div class="mt-5 space-y-6">
          <div v-for="section in filterSections" :key="section.title">
            <h3 class="mb-3 text-sm font-black text-slate-900">{{ section.title }}</h3>
            <div class="space-y-2">
              <label v-for="option in section.options" :key="option.label" class="flex items-center justify-between gap-3 text-sm">
                <span class="flex items-center gap-2 font-semibold text-slate-600">
                  <input
                    v-model="selectedFilters[section.key]"
                    :value="option.label"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  >
                  {{ option.label }}
                </span>
                <span class="text-xs font-bold text-slate-400">{{ option.count }}</span>
              </label>
            </div>
          </div>

          <div>
            <h3 class="mb-3 text-sm font-black text-slate-900">Mức lương</h3>
            <div class="space-y-2">
              <label v-for="option in salaryOptions" :key="option.label" class="flex items-center justify-between gap-3 text-sm">
                <span class="flex items-center gap-2 font-semibold text-slate-600">
                  <input
                    v-model="selectedSalary"
                    :value="option.label"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  >
                  {{ option.label }}
                </span>
                <span class="text-xs font-bold text-slate-400">{{ option.count }}</span>
              </label>
            </div>
            <div class="mt-4">
              <div class="h-1.5 rounded-full bg-sky-100">
                <div class="h-1.5 w-4/5 rounded-full bg-sky-600"></div>
              </div>
              <div class="mt-2 flex justify-between text-xs font-semibold text-slate-400">
                <span>Từ 0 đ</span>
                <span>Trên 50 triệu</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="min-w-0">
        <div class="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-black text-slate-950">{{ filteredJobs.length.toLocaleString('vi-VN') }} việc làm phù hợp</h2>
            <p class="mt-1 text-sm font-semibold text-slate-500">Danh sách được lọc theo từ khóa, địa điểm và loại việc bạn chọn.</p>
          </div>
          <label class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-500">Sắp xếp</span>
            <select v-model="sortMode" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-slate-900">
              <option value="newest">Mới nhất</option>
              <option value="slots">Nhiều vị trí</option>
              <option value="salary">Lương cao</option>
            </select>
          </label>
        </div>

        <div v-if="isLoading" class="space-y-3">
          <div v-for="item in 4" :key="item" class="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"></div>
        </div>

        <div v-else-if="filteredJobs.length === 0" class="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Icon name="uil:search-alt" class="h-7 w-7" />
          </div>
          <h3 class="mt-4 text-lg font-black text-slate-950">Không tìm thấy việc phù hợp</h3>
          <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Thử đổi từ khóa, bỏ bớt bộ lọc hoặc chọn lại địa điểm để xem thêm cơ hội.
          </p>
          <button type="button" class="mt-5 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-sky-400" @click="clearFilters">
            Xóa bộ lọc
          </button>
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="job in filteredJobs"
            :key="job.id"
            class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white', job.logoClass]">
                {{ job.logo }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="text-sm font-bold text-slate-700">{{ job.company }}</p>
                    <h3 class="mt-1 text-lg font-black leading-6 text-sky-700">{{ job.title }}</h3>
                    <p class="mt-2 text-sm leading-6 text-slate-500">{{ job.description }}</p>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <span class="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-black text-sky-700">{{ job.badge }}</span>
                    <button
                      type="button"
                      :class="[
                        'rounded-full p-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60',
                        isFavoriteJob(job)
                          ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100'
                          : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700'
                      ]"
                      :disabled="isFavoriteLoading(job)"
                      :aria-label="isFavoriteJob(job) ? 'Bỏ yêu thích' : 'Lưu việc'"
                      :aria-pressed="isFavoriteJob(job)"
                      @click="toggleFavoriteJob(job)"
                    >
                      <Icon :name="isFavoriteLoading(job) ? 'svg-spinners:180-ring' : 'uil:heart'" class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                  <span class="inline-flex items-center gap-1">
                    <Icon name="uil:map-marker" class="h-4 w-4" />
                    {{ job.location }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <Icon name="uil:clock" class="h-4 w-4" />
                    {{ job.type }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <Icon name="uil:money-bill" class="h-4 w-4" />
                    {{ job.salary }}
                  </span>
                  <span>{{ job.posted }}</span>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span v-for="skill in job.skills" :key="skill" class="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{{ skill }}</span>
                </div>

                <div class="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span class="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-black text-sky-700">{{ job.slots }} vị trí đang tuyển</span>
                  <button
                    type="button"
                    :class="[
                      'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-black transition-colors disabled:cursor-not-allowed',
                      isAppliedJob(job)
                        ? 'border-sky-100 bg-sky-50 text-sky-700'
                        : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-500 hover:text-slate-950'
                    ]"
                    :disabled="isApplyingJob(job) || isAppliedJob(job)"
                    @click="applyToJob(job)"
                  >
                    {{ isAppliedJob(job) ? 'Đã ứng tuyển' : 'Ứng tuyển' }}
                    <Icon :name="isApplyingJob(job) ? 'svg-spinners:180-ring' : isAppliedJob(job) ? 'uil:check-circle' : 'uil:arrow-right'" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <aside class="space-y-5">
        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex gap-4">
            <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Icon name="uil:file-check-alt" class="h-10 w-10" />
            </div>
            <div>
              <h2 class="text-base font-black text-slate-950">Tạo hồ sơ nổi bật</h2>
              <p class="mt-1 text-sm leading-6 text-slate-500">Nhà tuyển dụng sẽ dễ dàng tìm thấy bạn hơn.</p>
            </div>
          </div>
          <button
            type="button"
            class="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-800 hover:border-sky-200 hover:bg-sky-50"
            @click="notifyDevelopment('Tạo hồ sơ sinh viên')"
          >
            Tạo hồ sơ ngay
          </button>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-black text-slate-950">Việc làm gợi ý cho bạn</h2>
            <Icon name="uil:star" class="h-5 w-5 text-sky-600" />
          </div>
          <div class="mt-4 divide-y divide-slate-100">
            <button
              v-for="job in suggestedJobs"
              :key="job.id"
              type="button"
              class="flex w-full gap-3 py-4 text-left"
              @click="notifyDevelopment(`Xem ${job.title}`)"
            >
              <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white', job.logoClass]">{{ job.logo }}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-black text-sky-700">{{ job.title }}</span>
                <span class="mt-1 block truncate text-xs font-semibold text-slate-500">{{ job.company }}</span>
                <span class="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
                  <span>{{ job.location }}</span>
                  <span>{{ job.salary }}</span>
                  <span class="rounded-full bg-sky-50 px-2 text-sky-700">Mới</span>
                </span>
              </span>
            </button>
          </div>
          <button
            type="button"
            class="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-black text-sky-700 hover:text-sky-800"
            @click="notifyDevelopment('Xem tất cả gợi ý')"
          >
            Xem tất cả gợi ý
            <Icon name="uil:arrow-right" class="h-4 w-4" />
          </button>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'
import { type ApiJob, type DisplayJob, mapJobForDisplay, salaryRank } from '~/utils/jobDisplay'

definePageMeta({
  layout: 'student'
})

type FilterKey = 'types' | 'levels'

const toast = useToast()
const authStore = useAuthStore()
const route = useRoute()

const searchQuery = ref('')
const activeLocation = ref('Địa điểm')
const activeType = ref('Tất cả loại hình')
const activeQuickTag = ref('all')
const sortMode = ref('newest')
const isLoading = ref(true)
const jobs = ref<DisplayJob[]>([])
const appliedJobIds = ref<Set<number>>(new Set())
const favoriteJobIds = ref<Set<number>>(new Set())
const applyingJobIds = ref<Set<number>>(new Set())
const favoriteLoadingJobIds = ref<Set<number>>(new Set())
const selectedSalary = ref<string[]>([])
const selectedFilters = reactive<Record<FilterKey, string[]>>({
  types: [],
  levels: []
})

const locationOptions = computed(() => ['Địa điểm', ...uniqueValues(jobs.value.map((job) => job.location))])
const typeOptions = computed(() => ['Tất cả loại hình', ...uniqueValues(jobs.value.map((job) => job.type))])

const quickTags = [
  { label: 'Tất cả', value: 'all', icon: 'uil:apps' },
  { label: 'Remote', value: 'Remote', icon: 'uil:wifi' },
  { label: 'Toàn thời gian', value: 'Toàn thời gian', icon: 'uil:clock' },
  { label: 'Bán thời gian', value: 'Bán thời gian', icon: 'uil:history' },
  { label: 'Thực tập', value: 'Thực tập', icon: 'uil:graduation-cap' },
  { label: 'Mới đăng', value: 'new', icon: 'uil:bolt' },
  { label: 'Lương cao', value: 'highSalary', icon: 'uil:money-bill' }
]

const filterSections = computed<Array<{ title: string; key: FilterKey; options: Array<{ label: string; count: number }> }>>(() => [
  {
    title: 'Loại việc làm',
    key: 'types',
    options: countOptions(jobs.value.map((job) => job.type))
  },
  {
    title: 'Kinh nghiệm',
    key: 'levels',
    options: countOptions(jobs.value.map((job) => job.level))
  }
])

const salaryOptions = computed(() => countOptions(jobs.value.map((job) => job.salaryRange)).sort((a, b) => salaryRank(a.label) - salaryRank(b.label)))

const suggestedJobs = computed(() => [...jobs.value].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3))

const filteredJobs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const filtered = jobs.value.filter((job) => {
    const matchesQuery = !query || [
      job.title,
      job.company,
      job.description,
      job.location,
      job.type,
      job.level,
      job.salary,
      ...job.skills
    ].join(' ').toLowerCase().includes(query)

    const matchesLocation = activeLocation.value === 'Địa điểm' || job.location === activeLocation.value
    const matchesTypeSelect = activeType.value === 'Tất cả loại hình' || job.type === activeType.value
    const matchesQuick =
      activeQuickTag.value === 'all' ||
      activeQuickTag.value === 'new' ||
      (activeQuickTag.value === 'highSalary' && ['20 - 30 triệu', 'Trên 30 triệu'].includes(job.salaryRange)) ||
      job.type === activeQuickTag.value
    const matchesTypes = selectedFilters.types.length === 0 || selectedFilters.types.includes(job.type)
    const matchesLevels = selectedFilters.levels.length === 0 || selectedFilters.levels.includes(job.level)
    const matchesSalary = selectedSalary.value.length === 0 || selectedSalary.value.includes(job.salaryRange)

    return matchesQuery && matchesLocation && matchesTypeSelect && matchesQuick && matchesTypes && matchesLevels && matchesSalary
  })

  return [...filtered].sort((a, b) => {
    if (sortMode.value === 'slots') return b.slots - a.slots
    if (sortMode.value === 'salary') return salaryRank(b.salaryRange) - salaryRank(a.salaryRange)
    return b.createdAt - a.createdAt
  })
})

function clearFilters() {
  searchQuery.value = ''
  activeLocation.value = 'Địa điểm'
  activeType.value = 'Tất cả loại hình'
  activeQuickTag.value = 'all'
  selectedFilters.types = []
  selectedFilters.levels = []
  selectedSalary.value = []
}

function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được kết nối khi backend sẵn sàng.`)
}

function isAppliedJob(job: DisplayJob) {
  return appliedJobIds.value.has(job.id)
}

function isFavoriteJob(job: DisplayJob) {
  return favoriteJobIds.value.has(job.id)
}

function isApplyingJob(job: DisplayJob) {
  return applyingJobIds.value.has(job.id)
}

function isFavoriteLoading(job: DisplayJob) {
  return favoriteLoadingJobIds.value.has(job.id)
}

function updateJobSet(source: { value: Set<number> }, jobId: number, enabled: boolean) {
  const next = new Set(source.value)
  if (enabled) {
    next.add(jobId)
  } else {
    next.delete(jobId)
  }
  source.value = next
}

function requireStudentAction() {
  if (!authStore.isAuthenticated) {
    toast.warning('Bạn cần đăng nhập', 'Đăng nhập bằng tài khoản sinh viên để ứng tuyển hoặc lưu việc.')
    navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return false
  }

  if (!authStore.canAccessStudentArea) {
    toast.warning('Tài khoản không phù hợp', 'Chỉ tài khoản sinh viên mới có thể ứng tuyển hoặc lưu việc.')
    return false
  }

  return true
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function countOptions(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }))
}

async function loadPublicJobs() {
  try {
    isLoading.value = true
    const response: any = await JobService.getAllJobs()
    const rawJobs: ApiJob[] = response?.success && Array.isArray(response.data) ? response.data : []
    jobs.value = rawJobs.map(mapJobForDisplay)
  } catch (error: any) {
    jobs.value = []
    toast.error('Không thể tải việc làm', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
  } finally {
    isLoading.value = false
  }
}

async function loadStudentJobActions() {
  if (!authStore.isAuthenticated || !authStore.canAccessStudentArea) {
    appliedJobIds.value = new Set()
    favoriteJobIds.value = new Set()
    return
  }

  try {
    const response: any = await StudentService.getJobActions()
    const data = response?.data || {}
    appliedJobIds.value = new Set((data.applied_job_ids || []).map(Number))
    favoriteJobIds.value = new Set((data.favorite_job_ids || []).map(Number))
  } catch (error: any) {
    toast.error('Không thể tải trạng thái việc làm', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
  }
}

async function toggleFavoriteJob(job: DisplayJob) {
  if (!requireStudentAction() || isFavoriteLoading(job)) return

  const wasFavorite = isFavoriteJob(job)
  updateJobSet(favoriteLoadingJobIds, job.id, true)
  updateJobSet(favoriteJobIds, job.id, !wasFavorite)

  try {
    if (wasFavorite) {
      await StudentService.removeFavoriteJob(job.id)
      toast.info('Đã bỏ yêu thích', `${job.title} đã được bỏ khỏi danh sách yêu thích.`)
    } else {
      await StudentService.saveFavoriteJob(job.id)
      toast.success('Đã lưu việc làm', `${job.title} đã được thêm vào danh sách yêu thích.`)
    }
  } catch (error: any) {
    updateJobSet(favoriteJobIds, job.id, wasFavorite)
    toast.error('Không thể cập nhật yêu thích', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
  } finally {
    updateJobSet(favoriteLoadingJobIds, job.id, false)
  }
}

async function applyToJob(job: DisplayJob) {
  if (!requireStudentAction()) return

  if (isAppliedJob(job)) {
    toast.info('Bạn đã ứng tuyển', 'Tin này đã nằm trong danh sách ứng tuyển của bạn.')
    return
  }

  if (isApplyingJob(job)) return

  updateJobSet(applyingJobIds, job.id, true)
  try {
    await StudentService.applyJob(job.id)
    updateJobSet(appliedJobIds, job.id, true)
    toast.success('Ứng tuyển thành công', `${job.title} đã được lưu vào danh sách ứng tuyển.`)
  } catch (error: any) {
    toast.error('Không thể ứng tuyển', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
  } finally {
    updateJobSet(applyingJobIds, job.id, false)
  }
}

async function loadPageData() {
  await loadPublicJobs()
  await loadStudentJobActions()
}

onMounted(loadPageData)
</script>
