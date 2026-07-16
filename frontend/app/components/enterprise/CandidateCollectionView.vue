<template>
  <div class="space-y-6 pb-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <span :class="['inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide', accentPillClass]">
          <Icon :name="accentIcon" class="h-4 w-4" />
          {{ eyebrow }}
        </span>
        <h1 class="mt-3 text-2xl font-black text-slate-950">{{ title }}</h1>
        <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          {{ description }}
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          :disabled="loading"
          @click="fetchApplications"
        >
          <Icon name="uil:sync" :class="['h-5 w-5', loading ? 'animate-spin' : '']" />
          Tải lại dữ liệu
        </button>
        <NuxtLink
          to="/enterprise/applications"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
        >
          <Icon name="uil:users-alt" class="h-5 w-5" />
          Danh sách ứng viên
        </NuxtLink>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <p class="text-sm font-bold text-slate-500">{{ card.label }}</p>
            <p class="mt-1 text-2xl font-black text-slate-950">{{ card.value }}</p>
            <p class="mt-1 text-xs font-black text-slate-500">{{ card.meta }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
      <div class="border-b border-slate-100 p-4">
        <div class="relative z-20 grid gap-3 xl:grid-cols-[minmax(280px,1fr)_minmax(220px,280px)_220px_auto]">
          <label class="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100">
            <Icon name="uil:search" class="h-5 w-5 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm ứng viên theo tên, email, SĐT..."
              class="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
            >
          </label>

          <ScrollSelect
            v-model="activeJob"
            :options="jobFilterOptions"
            icon="uil:briefcase-alt"
            ariaLabel="Lọc theo vị trí"
          />

          <ScrollSelect
            v-model="activeDateFilter"
            :options="dateFilterSelectOptions"
            icon="uil:calendar-alt"
            ariaLabel="Lọc theo ngày ứng tuyển"
          />

          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-50 px-4 text-sm font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="clearFilters"
          >
            <Icon name="uil:filter-slash" class="h-5 w-5" />
            Bộ lọc
          </button>
        </div>
      </div>

      <div v-if="loading" class="space-y-3 p-5">
        <div v-for="item in 6" :key="item" class="h-16 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <div v-else-if="errorMessage" class="m-5 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-bold text-rose-700">
        {{ errorMessage }}
      </div>

      <div v-else-if="filteredApplications.length === 0" class="p-12 text-center">
        <span :class="['mx-auto flex h-16 w-16 items-center justify-center rounded-3xl', emptyIconClass]">
          <Icon :name="emptyIcon" class="h-8 w-8" />
        </span>
        <h2 class="mt-4 text-xl font-black text-slate-950">{{ emptyTitle }}</h2>
        <p class="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
          {{ emptyDescription }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-[1120px] divide-y divide-slate-100">
          <thead class="bg-slate-50/80">
            <tr>
              <th class="w-[300px] px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Ứng viên</th>
              <th class="w-[300px] px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Vị trí ứng tuyển</th>
              <th class="w-[170px] whitespace-nowrap px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Ngày ứng tuyển</th>
              <th class="w-[150px] whitespace-nowrap px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">Trạng thái</th>
              <th class="w-[230px] px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">Ghi chú</th>
              <th class="w-[150px] whitespace-nowrap px-4 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr
              v-for="application in paginatedApplications"
              :key="application.id"
              class="transition hover:bg-sky-50/40"
            >
              <td class="px-4 py-4 align-middle">
                <div class="flex min-w-[260px] items-center gap-3">
                  <img
                    v-if="getAvatarUrl(application)"
                    :src="getAvatarUrl(application)"
                    :alt="getStudentName(application)"
                    class="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
                  >
                  <span
                    v-else
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-sky-700 ring-1 ring-sky-200"
                  >
                    {{ getInitials(application) }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-black text-slate-950">{{ getStudentName(application) }}</p>
                    <p class="truncate text-xs font-semibold text-slate-500">{{ application.student?.email || 'Chưa có email' }}</p>
                    <p class="truncate text-xs font-semibold text-slate-500">{{ getStudentPhone(application) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 align-middle">
                <div class="min-w-[250px]">
                  <p class="line-clamp-1 text-sm font-black text-slate-950">{{ application.job?.title || 'Tin tuyển dụng' }}</p>
                  <p class="mt-1 text-xs font-semibold text-slate-500">Mã: #{{ getJobCode(application) }}</p>
                  <p class="text-xs font-semibold text-slate-500">{{ getApplicationSource(application) }}</p>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 align-middle">
                <p class="text-sm font-bold text-slate-700">{{ formatDate(application.created_at) }}</p>
                <p class="mt-1 text-xs font-semibold text-slate-500">{{ formatTime(application.created_at) }}</p>
              </td>
              <td class="px-4 py-4 text-center align-middle">
                <span :class="['inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black', getStatusClass(application.status)]">
                  <Icon :name="getStatusIcon(application.status)" class="h-4 w-4" />
                  {{ getStatusLabel(application.status) }}
                </span>
              </td>
              <td class="px-4 py-4 align-middle">
                <p class="line-clamp-2 text-sm font-semibold leading-5 text-slate-500">
                  {{ application.employer_note || savedText(application) || 'Chưa có ghi chú' }}
                </p>
              </td>
              <td class="px-4 py-4 text-right align-middle">
                <button
                  type="button"
                  class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl bg-sky-50 px-3 text-xs font-black text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  @click="openProfileModal(application)"
                >
                  Xem hồ sơ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!loading && filteredApplications.length > 0"
        class="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-sm font-bold text-slate-500">Số lượng ứng viên trong 1 trang:</span>
          <ScrollSelect
            v-model="pageSize"
            class="w-36"
            :options="pageSizeOptions"
            size="sm"
            ariaLabel="Số lượng ứng viên trong 1 trang"
          />
          <span class="text-sm font-semibold text-slate-400">
            {{ filteredApplications.length }} ứng viên phù hợp
          </span>
        </div>

        <div class="flex items-center justify-center gap-2">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === 1"
            aria-label="Trang trước"
            @click="goToPage(currentPage - 1)"
          >
            <Icon name="uil:angle-left" class="h-5 w-5" />
          </button>
          <template v-for="(page, pageIndex) in visiblePages" :key="`${page}-${pageIndex}`">
            <span v-if="page === '...'" class="px-2 text-sm font-black text-slate-400">...</span>
            <button
              v-else
              type="button"
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition',
                currentPage === page
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                  : 'border border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
              ]"
              :aria-label="`Đi tới trang ${page}`"
              @click="goToPage(Number(page))"
            >
              {{ page }}
            </button>
          </template>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="currentPage === totalPages"
            aria-label="Trang sau"
            @click="goToPage(currentPage + 1)"
          >
            <Icon name="uil:angle-right" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="profileModalOpen && selectedApplication"
          class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md"
          @click.self="closeProfileModal"
        >
          <article class="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-950/20">
            <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div class="flex items-center gap-4">
                <img
                  v-if="getAvatarUrl(selectedApplication)"
                  :src="getAvatarUrl(selectedApplication)"
                  :alt="getStudentName(selectedApplication)"
                  class="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                >
                <span
                  v-else
                  class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-xl font-black text-sky-700 ring-1 ring-sky-200"
                >
                  {{ getInitials(selectedApplication) }}
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-500">{{ selectedApplication.job?.title || 'Tin tuyển dụng' }}</p>
                  <h2 class="mt-1 text-2xl font-black text-slate-950">{{ getStudentName(selectedApplication) }}</h2>
                  <p class="mt-1 text-sm font-semibold text-slate-500">{{ selectedApplication.student?.email || 'Chưa có email' }}</p>
                </div>
              </div>

              <button
                type="button"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                aria-label="Đóng hồ sơ ứng viên"
                @click="closeProfileModal"
              >
                <Icon name="uil:multiply" class="h-6 w-6" />
              </button>
            </header>

            <div class="quickwork-candidate-modal-scroll overflow-y-auto px-6 py-6">
              <div class="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 class="flex items-center gap-2 text-base font-black text-slate-950">
                    <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Icon name="uil:user" class="h-5 w-5" />
                    </span>
                    Thông tin ứng viên
                  </h3>
                  <div class="mt-5 grid gap-3 sm:grid-cols-2">
                    <div
                      v-for="item in detailItems(selectedApplication)"
                      :key="item.label"
                      class="rounded-2xl bg-slate-50 p-4"
                    >
                      <p class="text-xs font-black uppercase tracking-wide text-slate-400">{{ item.label }}</p>
                      <p class="mt-1 break-words text-sm font-bold text-slate-800">{{ item.value }}</p>
                    </div>
                  </div>
                </section>

                <section class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 class="flex items-center gap-2 text-base font-black text-slate-950">
                    <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                      <Icon name="uil:file-alt" class="h-5 w-5" />
                    </span>
                    Hồ sơ & kỹ năng
                  </h3>

                  <div class="mt-5 space-y-5">
                    <div>
                      <p class="text-xs font-black uppercase tracking-wide text-slate-400">Kỹ năng liên quan</p>
                      <div v-if="getSkills(selectedApplication).length" class="mt-3 flex flex-wrap gap-2">
                        <span
                          v-for="skill in getSkills(selectedApplication)"
                          :key="skill"
                          class="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-100"
                        >
                          {{ skill }}
                        </span>
                      </div>
                      <p v-else class="mt-3 text-sm font-semibold text-slate-500">Ứng viên chưa cập nhật kỹ năng.</p>
                    </div>

                    <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <p class="text-xs font-black uppercase tracking-wide text-slate-400">Ghi chú nhà tuyển dụng</p>
                      <p class="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {{ selectedApplication.employer_note || 'Chưa có ghi chú cho ứng viên này.' }}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <footer class="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm font-semibold text-slate-500">
                Dữ liệu được đồng bộ từ đơn ứng tuyển trong hệ thống.
              </p>
              <div class="flex flex-col gap-3 sm:flex-row">
                <a
                  v-if="getCvUrl(selectedApplication)"
                  :href="getCvUrl(selectedApplication)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                >
                  <Icon name="uil:file-download-alt" class="h-5 w-5" />
                  Xem CV
                </a>
                <button
                  type="button"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                  @click="closeProfileModal"
                >
                  Đóng
                </button>
              </div>
            </footer>
          </article>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'
import { JobService } from '~/services/job.service'

type ApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED'
type CandidateMode = 'saved' | 'rejected'
type DateFilter = 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS'

const props = withDefaults(defineProps<{
  mode: CandidateMode
  title: string
  description: string
  eyebrow: string
  emptyTitle: string
  emptyDescription: string
  accentIcon?: string
  emptyIcon?: string
  accentPillClass?: string
  emptyIconClass?: string
}>(), {
  accentIcon: 'uil:users-alt',
  emptyIcon: 'uil:user-search',
  accentPillClass: 'bg-sky-50 text-sky-700',
  emptyIconClass: 'bg-sky-50 text-sky-600'
})

const config = useRuntimeConfig()
const applications = ref<any[]>([])
const selectedApplication = ref<any | null>(null)
const profileModalOpen = ref(false)
const searchQuery = ref('')
const activeJob = ref('ALL')
const activeDateFilter = ref<DateFilter>('ALL')
const loading = ref(true)
const errorMessage = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const pageSizeOptions = [
  { value: 10, label: '10 / trang' },
  { value: 20, label: '20 / trang' },
  { value: 50, label: '50 / trang' }
]

const dateFilterSelectOptions = [
  { value: 'ALL', label: 'Ngày ứng tuyển' },
  { value: 'TODAY', label: 'Hôm nay' },
  { value: '7_DAYS', label: '7 ngày gần nhất' },
  { value: '30_DAYS', label: '30 ngày gần nhất' }
]

const baseApplications = computed(() => {
  if (props.mode === 'rejected') {
    return applications.value.filter((application) => normalizeStatus(application.status) === 'REJECTED')
  }
  return applications.value.filter(isSavedCandidate)
})

const jobFilterOptions = computed(() => {
  const options = new Map<string, string>([['ALL', 'Tất cả vị trí']])
  baseApplications.value.forEach((application) => {
    const title = application?.job?.title
    if (!title) return
    options.set(getJobOptionValue(application), title)
  })
  return Array.from(options.entries()).map(([value, label]) => ({ value, label }))
})

const filteredApplications = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return baseApplications.value.filter((application) => {
    const matchesJob = activeJob.value === 'ALL' || getJobOptionValue(application) === activeJob.value
    const matchesDate = matchesDateFilter(application.created_at)
    const searchable = [
      getStudentName(application),
      application.student?.email,
      getStudentPhone(application),
      application.job?.title,
      application.job?.location,
      application.job?.salary,
      application.employer_note,
      ...getSkills(application)
    ].filter(Boolean).join(' ').toLowerCase()

    return matchesJob && matchesDate && (!query || searchable.includes(query))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / Number(pageSize.value))))

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value)
  return filteredApplications.value.slice(start, start + Number(pageSize.value))
})

const visiblePages = computed(() => {
  const pages: Array<number | string> = []
  const total = totalPages.value
  const current = currentPage.value

  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return pages
})

const summaryCards = computed(() => {
  const total = applications.value.length
  const scoped = baseApplications.value.length
  const jobCount = new Set(baseApplications.value.map((application) => getJobOptionValue(application))).size
  const withCv = baseApplications.value.filter((application) => Boolean(getCvUrl(application))).length
  const withNote = baseApplications.value.filter((application) => Boolean(application?.employer_note)).length

  if (props.mode === 'rejected') {
    return [
      { label: 'Bị từ chối', value: scoped, meta: formatPercent(scoped, total), icon: 'uil:times-circle', iconClass: 'bg-rose-50 text-rose-600' },
      { label: 'Tổng ứng viên', value: total, meta: 'Từ dữ liệu hệ thống', icon: 'uil:users-alt', iconClass: 'bg-sky-50 text-sky-600' },
      { label: 'Vị trí liên quan', value: jobCount, meta: 'Tin có ứng viên bị từ chối', icon: 'uil:briefcase-alt', iconClass: 'bg-amber-50 text-amber-600' },
      { label: 'Có ghi chú', value: withNote, meta: 'Phản hồi đã lưu', icon: 'uil:comment-notes', iconClass: 'bg-violet-50 text-violet-600' }
    ]
  }

  return [
    { label: 'Ứng viên đã lưu', value: scoped, meta: 'Từ dữ liệu đã đánh dấu', icon: 'uil:bookmark', iconClass: 'bg-sky-50 text-sky-600' },
    { label: 'Tổng ứng viên', value: total, meta: 'Từ dữ liệu hệ thống', icon: 'uil:users-alt', iconClass: 'bg-slate-100 text-slate-600' },
    { label: 'Vị trí liên quan', value: jobCount, meta: 'Tin có ứng viên đã lưu', icon: 'uil:briefcase-alt', iconClass: 'bg-emerald-50 text-emerald-600' },
    { label: 'Có CV', value: withCv, meta: 'Ứng viên có hồ sơ đính kèm', icon: 'uil:file-check-alt', iconClass: 'bg-violet-50 text-violet-600' }
  ]
})

function normalizeStatus(status?: string): ApplicationStatus {
  const value = (status || 'APPLIED').toUpperCase()
  return ['ACCEPTED', 'REJECTED'].includes(value) ? value as ApplicationStatus : 'APPLIED'
}

function isSavedCandidate(application: any) {
  const flags = [
    application?.is_saved,
    application?.saved,
    application?.bookmarked,
    application?.is_bookmarked,
    application?.is_favorite,
    application?.favorite,
    application?.candidate_saved,
    application?.student_saved,
    application?.employer_saved,
    application?.enterprise_saved,
    application?.saved_at,
    application?.savedAt
  ]

  return flags.some(Boolean) ||
    (Array.isArray(application?.saves) && application.saves.length > 0) ||
    (Array.isArray(application?.saved_by_enterprises) && application.saved_by_enterprises.length > 0)
}

function savedText(application: any) {
  if (!isSavedCandidate(application)) return ''
  const savedAt = application?.saved_at || application?.savedAt
  return savedAt ? `Đã lưu vào ${formatDate(savedAt)}` : 'Ứng viên đã được đánh dấu lưu'
}

function formatPercent(value: number, total: number) {
  if (!total) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

function getStatusLabel(status?: string) {
  const labels: Record<ApplicationStatus, string> = {
    APPLIED: 'Chờ duyệt',
    ACCEPTED: 'Đã duyệt',
    REJECTED: 'Bị từ chối'
  }
  return labels[normalizeStatus(status)]
}

function getStatusClass(status?: string) {
  const classes: Record<ApplicationStatus, string> = {
    APPLIED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
  }
  return classes[normalizeStatus(status)]
}

function getStatusIcon(status?: string) {
  const icons: Record<ApplicationStatus, string> = {
    APPLIED: 'uil:clock',
    ACCEPTED: 'uil:check-circle',
    REJECTED: 'uil:times-circle'
  }
  return icons[normalizeStatus(status)]
}

function getStudentName(application: any) {
  return application?.student?.student_profile?.name || application?.student?.name || application?.student?.email?.split('@')[0] || 'Ứng viên'
}

function getStudentPhone(application: any) {
  return application?.student?.student_profile?.phone || application?.student?.phone || 'Chưa có SĐT'
}

function getInitials(application: any) {
  return getStudentName(application)
    .split(/\s+/)
    .map((part: string) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getSkills(application: any) {
  const skills = application?.student?.student_profile?.skills
  if (!Array.isArray(skills)) return []
  return skills.map((skill: any) => skill?.name || skill?.title || skill).filter(Boolean)
}

function getBackendAssetUrl(value?: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '')
  return `${backendOrigin}${value.startsWith('/') ? '' : '/'}${value}`
}

function getCvUrl(application: any) {
  return getBackendAssetUrl(application?.student?.student_profile?.cv_url)
}

function getAvatarUrl(application: any) {
  return getBackendAssetUrl(application?.student?.student_profile?.avatar_url || application?.student?.avatar_url)
}

function getJobCode(application: any) {
  return application?.job?.id || application?.job_id || application?.id || 'N/A'
}

function getJobOptionValue(application: any) {
  return String(application?.job?.id || application?.job?.title || 'unknown')
}

function getApplicationSource(application: any) {
  return application?.source || application?.application_source || 'QuickWork'
}

function detailItems(application: any) {
  return [
    { label: 'Email', value: application?.student?.email || 'Chưa cập nhật' },
    { label: 'Số điện thoại', value: getStudentPhone(application) },
    { label: 'Ngày ứng tuyển', value: formatDateTime(application?.created_at) },
    { label: 'Trạng thái', value: getStatusLabel(application?.status) },
    { label: 'Nguồn ứng tuyển', value: getApplicationSource(application) },
    { label: 'Vị trí ứng tuyển', value: application?.job?.title || 'Chưa cập nhật' }
  ]
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

function formatTime(value?: string) {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function matchesDateFilter(value?: string) {
  if (activeDateFilter.value === 'ALL') return true
  if (!value) return false

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const timestamp = date.getTime()

  if (activeDateFilter.value === 'TODAY') return timestamp >= startOfToday
  const days = activeDateFilter.value === '7_DAYS' ? 7 : 30
  return timestamp >= now.getTime() - days * 24 * 60 * 60 * 1000
}

function openProfileModal(application: any) {
  selectedApplication.value = application
  profileModalOpen.value = true
}

function closeProfileModal() {
  profileModalOpen.value = false
}

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function clearFilters() {
  searchQuery.value = ''
  activeJob.value = 'ALL'
  activeDateFilter.value = 'ALL'
}

async function fetchApplications() {
  try {
    loading.value = true
    errorMessage.value = ''
    const response: any = await JobService.getEnterpriseApplications()
    applications.value = response?.success && Array.isArray(response.data) ? response.data : []
  } catch (error: any) {
    applications.value = []
    selectedApplication.value = null
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải dữ liệu ứng viên.'
  } finally {
    loading.value = false
  }
}

watch([searchQuery, activeJob, activeDateFilter, pageSize], () => {
  currentPage.value = 1
})

watch(filteredApplications, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.quickwork-candidate-modal-scroll {
  scrollbar-color: #bae6fd #f8fafc;
  scrollbar-width: thin;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar {
  width: 8px;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border: 2px solid #f8fafc;
  border-radius: 999px;
}

.quickwork-candidate-modal-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
