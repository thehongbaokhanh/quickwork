<template>
  <section class="mx-auto max-w-[1480px]">
    <header>
      <h1 class="text-2xl font-black text-slate-950 sm:text-3xl">Ứng tuyển của tôi</h1>
      <p class="mt-1.5 text-sm font-semibold text-slate-500 sm:text-base">Theo dõi trạng thái hồ sơ, lịch phỏng vấn và phản hồi từ nhà tuyển dụng.</p>
    </header>

    <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <button v-for="summary in summaryCards" :key="summary.key" type="button"
        :class="['flex min-h-24 items-center gap-4 rounded-2xl border bg-white px-4 text-left shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100', activeFilter === summary.filter ? 'border-sky-400 shadow-lg shadow-sky-100/70' : 'border-slate-200 hover:border-sky-200']"
        @click="activeFilter = summary.filter">
        <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', summary.iconClass]"><Icon :name="summary.icon" class="h-6 w-6" /></span>
        <span><span class="block text-xs font-black text-slate-500">{{ summary.label }}</span><span class="mt-1 block text-2xl font-black leading-none text-slate-950">{{ summary.count }}</span></span>
      </button>
    </div>

    <div class="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:flex-row xl:items-center">
      <label class="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-sky-200 xl:w-[340px] xl:flex-none">
        <Icon name="uil:search" class="h-5 w-5 shrink-0 text-slate-400" />
        <input v-model="searchQuery" type="search" class="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400" placeholder="Tìm kiếm công việc, công ty...">
      </label>
      <div class="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 xl:justify-center xl:pb-0">
        <button v-for="filter in statusFilters" :key="filter.value" type="button"
          :class="['h-10 shrink-0 rounded-full px-4 text-xs font-black transition', activeFilter === filter.value ? 'bg-sky-600 text-white shadow-md shadow-sky-100' : 'border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700']"
          @click="activeFilter = filter.value">{{ filter.label }}</button>
      </div>
      <ScrollSelect
        v-model="timeFilter"
        class="w-full shrink-0 xl:w-52"
        :options="timeFilterOptions"
        icon="uil:calendar-alt"
        ariaLabel="Lọc đơn theo thời gian"
      />
    </div>

    <div v-if="loading" class="mt-4 grid gap-4 xl:grid-cols-[minmax(330px,0.8fr)_minmax(0,1.6fr)]">
      <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><div v-for="item in 5" :key="item" class="h-24 animate-pulse rounded-2xl bg-slate-100" /></div>
      <div class="min-h-[560px] animate-pulse rounded-2xl border border-slate-200 bg-white p-6"><div class="h-16 rounded-2xl bg-slate-100" /><div class="mt-8 h-24 rounded-2xl bg-slate-100" /><div class="mt-6 h-44 rounded-2xl bg-slate-100" /></div>
    </div>

    <div v-else-if="errorMessage" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
      <Icon name="uil:exclamation-triangle" class="mx-auto h-8 w-8 text-rose-500" /><h2 class="mt-3 text-lg font-black">Không thể tải danh sách ứng tuyển</h2><p class="mt-2 text-sm font-semibold text-slate-600">{{ errorMessage }}</p>
      <button type="button" class="mt-5 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-black text-white" @click="loadApplications">Thử lại</button>
    </div>

    <div v-else-if="!applications.length" class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <Icon name="uil:clipboard-notes" class="mx-auto h-10 w-10 text-sky-600" /><h2 class="mt-4 text-xl font-black">Bạn chưa có đơn ứng tuyển</h2><p class="mt-2 text-sm font-semibold text-slate-500">Khám phá việc làm phù hợp và gửi hồ sơ để bắt đầu theo dõi tiến trình.</p>
      <NuxtLink to="/student" class="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-black text-white">Khám phá việc làm <Icon name="uil:arrow-right" class="h-4 w-4" /></NuxtLink>
    </div>

    <div v-else-if="!filteredApplications.length" class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <Icon name="uil:search" class="mx-auto h-9 w-9 text-slate-400" /><h2 class="mt-3 text-lg font-black">Không tìm thấy đơn phù hợp</h2><p class="mt-2 text-sm font-semibold text-slate-500">Thử đổi từ khóa, trạng thái hoặc khoảng thời gian.</p>
      <button type="button" class="mt-4 text-sm font-black text-sky-700" @click="resetFilters">Xóa bộ lọc</button>
    </div>

    <div v-else class="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(340px,0.82fr)_minmax(0,1.65fr)]">
      <aside class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="divide-y divide-slate-100">
          <button v-for="application in paginatedApplications" :key="application.id" type="button"
            :class="['flex w-full gap-3 p-4 text-left transition focus:outline-none', selectedApplication?.id === application.id ? 'bg-sky-50/80 ring-1 ring-inset ring-sky-300' : 'hover:bg-slate-50']"
            @click="selectedApplication = application">
            <span :class="['flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black text-white', logoTone(application)]">
              <HomeCompanyLogo :logo-url="application.job?.enterprise_profile?.logo_url" :company-name="companyName(application)" :initials="companyInitials(application)" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-start justify-between gap-2"><span class="min-w-0"><span class="block truncate text-sm font-black text-slate-950">{{ application.job?.title || 'Tin tuyển dụng' }}</span><span class="mt-1 block truncate text-xs font-bold text-slate-500">{{ companyName(application) }}</span></span><span :class="['shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black', stageMeta(application).pill]">{{ stageMeta(application).label }}</span></span>
              <span class="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-500"><span class="truncate">{{ application.job?.location || 'Chưa cập nhật' }}</span><span>•</span><span>{{ application.job?.salary || 'Thỏa thuận' }}</span><span>•</span><span>{{ formatDate(application.created_at) }}</span></span>
            </span>
            <Icon name="uil:angle-right" class="mt-8 h-4 w-4 shrink-0 text-slate-400" />
          </button>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <p class="text-xs font-bold text-slate-500">Hiển thị {{ pageStart + 1 }}–{{ pageEnd }} / {{ filteredApplications.length }} đơn</p>
          <div class="flex items-center gap-1">
            <button type="button" class="h-8 w-8 rounded-lg text-slate-500 disabled:opacity-30" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"><Icon name="uil:angle-left" class="h-4 w-4" /></button>
            <button v-for="page in visiblePages" :key="page" type="button" :class="['h-8 min-w-8 rounded-lg px-2 text-xs font-black', page === currentPage ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100']" @click="changePage(page)">{{ page }}</button>
            <button type="button" class="h-8 w-8 rounded-lg text-slate-500 disabled:opacity-30" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)"><Icon name="uil:angle-right" class="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      <article v-if="selectedApplication" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex min-w-0 gap-4">
            <span :class="['flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-base font-black text-white', logoTone(selectedApplication)]"><HomeCompanyLogo :logo-url="selectedApplication.job?.enterprise_profile?.logo_url" :company-name="companyName(selectedApplication)" :initials="companyInitials(selectedApplication)" /></span>
            <div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><h2 class="truncate text-xl font-black text-slate-950">{{ selectedApplication.job?.title || 'Tin tuyển dụng' }}</h2><span :class="['rounded-full px-2.5 py-1 text-[11px] font-black', stageMeta(selectedApplication).pill]">{{ stageMeta(selectedApplication).label }}</span></div><p class="mt-1 text-sm font-bold text-slate-500">{{ companyName(selectedApplication) }}</p><div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500"><span><Icon name="uil:map-marker" class="mr-1 inline h-4 w-4" />{{ selectedApplication.job?.location || 'Chưa cập nhật' }}</span><span><Icon name="uil:money-bill" class="mr-1 inline h-4 w-4" />{{ selectedApplication.job?.salary || 'Thỏa thuận' }}</span><span><Icon name="uil:clock" class="mr-1 inline h-4 w-4" />{{ formatDate(selectedApplication.created_at) }}</span></div></div>
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            <button type="button" class="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700 hover:bg-sky-50 disabled:opacity-60" :disabled="openingApplicationId !== null" @click="openApplicationChat(selectedApplication)"><Icon :name="openingApplicationId === selectedApplication.id ? 'svg-spinners:180-ring' : 'uil:comment-alt-message'" class="h-4 w-4" />Nhắn tin</button>
            <NuxtLink v-if="selectedApplication.job?.id" :to="`/jobs/${selectedApplication.job.id}`" class="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-xs font-black text-white">Xem chi tiết việc làm <Icon name="uil:external-link-alt" class="h-4 w-4" /></NuxtLink>
          </div>
        </div>

        <div class="p-5">
          <div class="relative grid gap-4 md:grid-cols-4">
            <span class="absolute left-[12.5%] right-[12.5%] top-4 hidden h-0.5 bg-slate-200 md:block" />
            <div v-for="step in timelineSteps" :key="step.label" class="relative text-center md:px-2"><span :class="['relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white', timelineStateClass(step.state)]"><Icon :name="step.icon" class="h-4 w-4" /></span><p class="mt-2 text-xs font-black text-slate-800">{{ step.label }}</p><p class="mt-1 text-[11px] font-semibold text-slate-500">{{ step.date || 'Chưa cập nhật' }}</p></div>
          </div>

          <section v-if="isUpcomingInterview(selectedApplication)" class="mt-6 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600"><Icon name="uil:calendar-alt" class="h-5 w-5" /></span><div><h3 class="text-sm font-black">Lịch phỏng vấn sắp tới</h3><p class="text-xs font-semibold text-slate-500">Kiểm tra thời gian và hình thức tham gia.</p></div></div>
            <div class="mt-4 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-3"><div><p class="detail-label">Thời gian</p><p class="detail-value">{{ formatDateTime(selectedApplication.interview_at) }}</p></div><div><p class="detail-label">Hình thức</p><p class="detail-value">{{ interviewMethodLabel(selectedApplication.interview_method) }}</p></div><div><p class="detail-label">Địa điểm / liên kết</p><p class="detail-value break-words">{{ selectedApplication.interview_location || 'Nhà tuyển dụng sẽ cập nhật' }}</p></div></div>
          </section>
          <section v-else-if="selectedApplication.interview_result === 'HIRED'" class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><Icon name="uil:gift" class="mr-2 inline h-5 w-5" />Chúc mừng! Bạn đã nhận được offer. Hãy kiểm tra ghi chú và tin nhắn để biết bước tiếp theo.</section>
          <section v-else-if="isRejected(selectedApplication)" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800"><Icon name="uil:times-circle" class="mr-2 inline h-5 w-5" />Đơn ứng tuyển đã kết thúc. Bạn có thể xem phản hồi bên dưới.</section>

          <div class="mt-6 grid gap-4 lg:grid-cols-2">
            <section class="rounded-2xl border border-slate-200 p-4">
              <h3 class="flex items-center gap-2 text-sm font-black"><Icon name="uil:file-check-alt" class="h-5 w-5 text-sky-600" />Thông tin hồ sơ đã gửi</h3>
              <dl class="mt-4 space-y-3 text-sm"><div class="flex justify-between"><dt class="text-slate-500">Mã đơn</dt><dd class="font-black">#{{ selectedApplication.id }}</dd></div><div class="flex justify-between"><dt class="text-slate-500">Ngày nộp</dt><dd class="font-black">{{ formatDate(selectedApplication.created_at) }}</dd></div><div v-if="hasEmployerResponse(selectedApplication)" class="flex justify-between"><dt class="text-slate-500">Cập nhật</dt><dd class="font-black">{{ formatDate(selectedApplication.updated_at) }}</dd></div></dl>
              <div v-if="selectedApplication.job?.skills?.length" class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><span v-for="skill in selectedApplication.job.skills" :key="skill.id || skill.name" class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">{{ skill.name }}</span></div>
            </section>
            <section class="rounded-2xl border border-slate-200 p-4">
              <h3 class="flex items-center gap-2 text-sm font-black"><Icon name="uil:comment-alt-notes" class="h-5 w-5 text-amber-600" />Phản hồi từ nhà tuyển dụng</h3>
              <div v-if="applicationNotes.length" class="mt-4 space-y-3"><div v-for="note in applicationNotes" :key="note.label" class="rounded-xl bg-slate-50 p-3"><p class="detail-label">{{ note.label }}</p><p class="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{{ note.content }}</p></div></div>
              <div v-else class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm font-semibold text-slate-500">Chưa có ghi chú mới từ nhà tuyển dụng.</div>
            </section>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import HomeCompanyLogo from '~/components/home/CompanyLogo.vue'
import ScrollSelect from '~/components/ui/ScrollSelect.vue'
import { StudentService } from '~/services/student.service'
import { ConversationService } from '~/services/conversation.service'
import { buildSearchText, normalizeSearchText } from '~/utils/searchText'

definePageMeta({ layout: 'student', middleware: ['auth', 'student'] })

type ApplicationStage = 'ALL' | 'PENDING' | 'REVIEWED' | 'INTERVIEW' | 'OFFER' | 'REJECTED'
type TimeFilter = 'ALL' | '30_DAYS' | '90_DAYS' | 'THIS_YEAR'
type TimelineState = 'done' | 'current' | 'pending' | 'rejected'
type Skill = { id?: number; name: string }
type AppliedJob = {
  id: number
  title: string
  salary?: string
  location?: string
  skills?: Skill[]
  enterprise_profile?: { company_name?: string; logo_url?: string }
}
type JobApplication = {
  id: number
  status: 'APPLIED' | 'ACCEPTED' | 'REJECTED'
  employer_note?: string
  reviewed_at?: string
  interview_at?: string
  interview_method?: string
  interview_location?: string
  interview_note?: string
  interview_result?: 'HIRED' | 'REJECTED' | 'NO_SHOW' | ''
  interview_result_note?: string
  interview_result_at?: string
  created_at: string
  updated_at: string
  job?: AppliedJob
}

const PAGE_SIZE = 5
const toast = useToast()
const applications = ref<JobApplication[]>([])
const selectedApplication = ref<JobApplication | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')
const activeFilter = ref<ApplicationStage>('ALL')
const timeFilter = ref<TimeFilter>('ALL')
const currentPage = ref(1)
const openingApplicationId = ref<number | null>(null)

const statusFilters: Array<{ value: ApplicationStage; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ phản hồi' },
  { value: 'REVIEWED', label: 'Đã tiếp nhận' },
  { value: 'INTERVIEW', label: 'Phỏng vấn' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Từ chối' }
]
const timeFilterOptions: Array<{ value: TimeFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả thời gian' },
  { value: '30_DAYS', label: '30 ngày gần đây' },
  { value: '90_DAYS', label: '90 ngày gần đây' },
  { value: 'THIS_YEAR', label: 'Trong năm nay' }
]

const summaryCards = computed(() => [
  { key: 'total', label: 'Tổng đơn', count: applications.value.length, filter: 'ALL' as ApplicationStage, icon: 'uil:clipboard-notes', iconClass: 'bg-sky-100 text-sky-700' },
  { key: 'pending', label: 'Chờ phản hồi', count: countStage('PENDING'), filter: 'PENDING' as ApplicationStage, icon: 'uil:clock', iconClass: 'bg-amber-100 text-amber-600' },
  { key: 'interview', label: 'Phỏng vấn', count: countStage('INTERVIEW'), filter: 'INTERVIEW' as ApplicationStage, icon: 'uil:calendar-alt', iconClass: 'bg-violet-100 text-violet-600' },
  { key: 'offer', label: 'Đã nhận offer', count: countStage('OFFER'), filter: 'OFFER' as ApplicationStage, icon: 'uil:gift', iconClass: 'bg-emerald-100 text-emerald-600' },
  { key: 'rejected', label: 'Bị từ chối', count: countStage('REJECTED'), filter: 'REJECTED' as ApplicationStage, icon: 'uil:times-circle', iconClass: 'bg-rose-100 text-rose-600' }
])

const filteredApplications = computed(() => {
  const query = normalizeSearchText(searchQuery.value)
  const now = Date.now()
  const year = new Date().getFullYear()
  return applications.value.filter((application) => {
    const stage = applicationStage(application)
    if (activeFilter.value !== 'ALL' && stage !== activeFilter.value) return false
    const createdAt = new Date(application.created_at)
    if (!Number.isNaN(createdAt.getTime())) {
      if (timeFilter.value === '30_DAYS' && now - createdAt.getTime() > 30 * 86400000) return false
      if (timeFilter.value === '90_DAYS' && now - createdAt.getTime() > 90 * 86400000) return false
      if (timeFilter.value === 'THIS_YEAR' && createdAt.getFullYear() !== year) return false
    }
    const searchable = buildSearchText([application.job?.title, companyName(application), application.job?.location, application.job?.salary, stageMeta(application).label])
    return !query || searchable.includes(query)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / PAGE_SIZE)))
const pageStart = computed(() => (currentPage.value - 1) * PAGE_SIZE)
const pageEnd = computed(() => Math.min(pageStart.value + PAGE_SIZE, filteredApplications.value.length))
const paginatedApplications = computed(() => filteredApplications.value.slice(pageStart.value, pageEnd.value))
const visiblePages = computed(() => {
  const start = Math.max(1, Math.min(currentPage.value - 2, totalPages.value - 4))
  const end = Math.min(totalPages.value, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

const timelineSteps = computed<Array<{ label: string; date: string; icon: string; state: TimelineState }>>(() => {
  const application = selectedApplication.value
  if (!application) return []
  const stage = applicationStage(application)
  const rejected = stage === 'REJECTED'
  const reviewed = application.status !== 'APPLIED' || Boolean(application.reviewed_at)
  const interviewed = Boolean(application.interview_at)
  const finished = stage === 'OFFER' || rejected
  return [
    { label: 'Đã nộp hồ sơ', date: formatDate(application.created_at), icon: 'uil:check', state: 'done' },
    { label: 'Nhà tuyển dụng phản hồi', date: formatDate(application.reviewed_at), icon: 'uil:user-check', state: reviewed ? 'done' : 'current' },
    { label: 'Phỏng vấn', date: formatDate(application.interview_at), icon: 'uil:calendar-alt', state: interviewed ? (finished ? 'done' : 'current') : 'pending' },
    { label: 'Kết quả', date: formatDate(application.interview_result_at || (rejected ? application.reviewed_at : '')), icon: rejected ? 'uil:times' : 'uil:flag-alt', state: finished ? (rejected ? 'rejected' : 'done') : 'pending' }
  ]
})

const applicationNotes = computed(() => {
  const application = selectedApplication.value
  if (!application) return []
  return [
    { label: 'Ghi chú xét duyệt', content: application.employer_note?.trim() || '' },
    { label: 'Ghi chú phỏng vấn', content: application.interview_note?.trim() || '' },
    { label: 'Ghi chú kết quả', content: application.interview_result_note?.trim() || '' }
  ].filter((note) => note.content)
})

function applicationStage(application: JobApplication): ApplicationStage {
  if (application.interview_result === 'HIRED') return 'OFFER'
  if (application.status === 'REJECTED' || application.interview_result === 'REJECTED' || application.interview_result === 'NO_SHOW') return 'REJECTED'
  if (application.interview_at) return 'INTERVIEW'
  if (application.status === 'ACCEPTED') return 'REVIEWED'
  return 'PENDING'
}

function countStage(stage: ApplicationStage) {
  return applications.value.filter((application) => applicationStage(application) === stage).length
}

function stageMeta(application: JobApplication) {
  const meta: Record<ApplicationStage, { label: string; pill: string }> = {
    ALL: { label: 'Tất cả', pill: 'bg-slate-100 text-slate-600' },
    PENDING: { label: 'Chờ phản hồi', pill: 'bg-amber-100 text-amber-700' },
    REVIEWED: { label: 'Đã tiếp nhận', pill: 'bg-sky-100 text-sky-700' },
    INTERVIEW: { label: 'Phỏng vấn', pill: 'bg-violet-100 text-violet-700' },
    OFFER: { label: 'Đã nhận offer', pill: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Bị từ chối', pill: 'bg-rose-100 text-rose-700' }
  }
  return meta[applicationStage(application)]
}

function companyName(application: JobApplication) {
  return application.job?.enterprise_profile?.company_name?.trim() || 'Nhà tuyển dụng'
}
function companyInitials(application: JobApplication) {
  return companyName(application).split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'QW'
}
function logoTone(application: JobApplication) {
  const tones = ['bg-sky-600', 'bg-indigo-600', 'bg-teal-600', 'bg-violet-600', 'bg-cyan-600']
  return tones[Number(application.job?.id || application.id) % tones.length]
}
function formatDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN')
}
function formatDateTime(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function interviewMethodLabel(value?: string) {
  const labels: Record<string, string> = { ONLINE: 'Trực tuyến', OFFLINE: 'Trực tiếp', PHONE: 'Điện thoại', HYBRID: 'Kết hợp' }
  return labels[String(value || '').toUpperCase()] || value || 'Chưa cập nhật'
}
function isUpcomingInterview(application: JobApplication) {
  return Boolean(application.interview_at && !application.interview_result)
}
function isRejected(application: JobApplication) {
  return applicationStage(application) === 'REJECTED'
}
function hasEmployerResponse(application: JobApplication) {
  return application.status !== 'APPLIED'
    || Boolean(application.reviewed_at || application.employer_note || application.interview_at || application.interview_result)
}
function timelineStateClass(state: TimelineState) {
  if (state === 'done') return 'bg-emerald-500 text-white'
  if (state === 'current') return 'bg-violet-100 text-violet-700 ring-violet-50'
  if (state === 'rejected') return 'bg-rose-500 text-white ring-rose-50'
  return 'bg-slate-200 text-slate-500'
}
function resetFilters() {
  searchQuery.value = ''
  activeFilter.value = 'ALL'
  timeFilter.value = 'ALL'
}
function changePage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
  selectedApplication.value = paginatedApplications.value[0] || null
}

async function loadApplications() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response: any = await StudentService.getAppliedJobs()
    if (!response?.success || !Array.isArray(response.data)) throw new Error(response?.message || 'Dữ liệu ứng tuyển không hợp lệ.')
    applications.value = response.data
    selectedApplication.value = applications.value[0] || null
  } catch (error: any) {
    applications.value = []
    selectedApplication.value = null
    errorMessage.value = error?.data?.message || error?.message || 'Vui lòng thử lại sau.'
  } finally {
    loading.value = false
  }
}

async function openApplicationChat(application: JobApplication) {
  if (!application.id || openingApplicationId.value !== null) return
  try {
    openingApplicationId.value = application.id
    const response = await ConversationService.openByApplication(application.id)
    if (!response?.success || !response.data?.id) throw new Error(response?.message || 'Không thể mở hội thoại.')
    await navigateTo({ path: '/student/messages', query: { conversation: String(response.data.id) } })
  } catch (error: any) {
    toast.error('Không thể mở hội thoại', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    openingApplicationId.value = null
  }
}

watch([searchQuery, activeFilter, timeFilter], () => { currentPage.value = 1 })
watch(filteredApplications, (items) => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  if (!items.some((application) => application.id === selectedApplication.value?.id)) selectedApplication.value = items[0] || null
})
watch(paginatedApplications, (items) => {
  if (items.length && !items.some((application) => application.id === selectedApplication.value?.id)) selectedApplication.value = items[0]
})
onMounted(loadApplications)
</script>

<style scoped>
.detail-label { @apply text-[10px] font-black uppercase tracking-wide text-slate-400; }
.detail-value { @apply mt-1 text-sm font-black text-slate-800; }
</style>
