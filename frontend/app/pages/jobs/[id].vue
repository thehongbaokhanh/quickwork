<template>
  <div class="min-h-screen bg-[#fbfcfe] font-sans text-slate-900 antialiased">
    <HomeHeader @notify="notifyDevelopment" />

    <main class="mx-auto w-full max-w-[1440px] px-5 pb-14 pt-8 sm:px-8 lg:px-10 xl:px-12">
      <div class="flex min-h-10 flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 py-2 text-[13px] font-semibold text-slate-600 transition hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          @click="goBack"
        >
          <Icon name="uil:arrow-left" class="h-4 w-4" aria-hidden="true" />
          Quay lại kết quả tìm kiếm
        </button>

        <div v-if="!loading && job && !errorMessage" class="flex flex-nowrap items-center justify-end gap-2">
          <button type="button" :class="['inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-bold transition disabled:opacity-60', isFavorite ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:text-sky-700']" :disabled="favoriteLoading" :aria-pressed="isFavorite" @click="toggleFavorite">
            <Icon :name="favoriteLoading ? 'svg-spinners:180-ring' : 'uil:heart'" class="h-4 w-4" />{{ isFavorite ? 'Đã lưu' : 'Lưu việc làm' }}
          </button>
          <button type="button" :class="['inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-xs font-bold transition disabled:opacity-60', isApplied ? 'bg-sky-50 text-sky-700' : 'bg-sky-600 text-white shadow-lg shadow-sky-100 hover:bg-sky-700']" :disabled="applying || isApplied" @click="applyJob">
            <Icon :name="applying ? 'svg-spinners:180-ring' : isApplied ? 'uil:check-circle' : 'uil:message'" class="h-4 w-4" />{{ isApplied ? 'Đã ứng tuyển' : 'Ứng tuyển ngay' }}
          </button>
          <button type="button" class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:text-sky-700" aria-label="Chia sẻ việc làm" @click="shareJob"><Icon name="uil:share-alt" class="h-4 w-4" /></button>
        </div>
      </div>

      <div v-if="loading" class="mt-6 grid animate-pulse gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div class="space-y-5"><div class="h-48 rounded-2xl bg-white" /><div class="h-96 rounded-2xl bg-white" /></div>
        <div class="h-[520px] rounded-2xl bg-white" />
      </div>

      <section v-else-if="errorMessage || !job" class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Icon name="uil:briefcase-alt" class="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
        <h1 class="mt-4 text-2xl font-black text-slate-950">Không tìm thấy việc làm</h1>
        <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{{ errorMessage || 'Tin tuyển dụng này không còn khả dụng.' }}</p>
        <NuxtLink to="/student" class="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-5 text-sm font-black text-white hover:bg-sky-700">Xem việc làm khác</NuxtLink>
      </section>

      <template v-else>
        <div class="mt-6 grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div class="min-w-0">
            <section class="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span :class="['flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl text-3xl font-black text-white shadow-sm', job.logoClass]"><HomeCompanyLogo :logo-url="job.logoUrl" :company-name="job.company" :initials="job.logo" /></span>
              <div class="min-w-0">
                <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black" :style="{ backgroundColor: jobTypeMeta.border, color: jobTypeMeta.text }">
                  <Icon :name="jobTypeMeta.icon" class="h-3.5 w-3.5" aria-hidden="true" />{{ job.type }}
                </span>
                <h1 class="mt-2 text-[28px] font-black leading-tight text-[#07112f] sm:text-[32px]">{{ job.title }}</h1>
                <div class="mt-2 flex items-center gap-1.5 text-[15px] font-bold text-[#14203d]">
                  <span>{{ job.company }}</span>
                  <span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white" aria-label="Doanh nghiệp đã xác thực">
                    <Icon name="uil:check" class="h-3 w-3" />
                  </span>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-semibold text-slate-600">
                  <span class="inline-flex items-center gap-2"><Icon name="uil:map-marker" class="h-4 w-4" />{{ displayLocation }}</span>
                  <span class="inline-flex items-center gap-2"><Icon name="uil:money-bill" class="h-4 w-4" />{{ job.salary }}</span>
                  <span class="inline-flex items-center gap-2"><Icon name="uil:clock" class="h-4 w-4" />{{ job.posted }}</span>
                </div>
              </div>
            </section>

            <div class="mt-6 flex flex-wrap gap-2">
              <span v-for="meta in heroMeta" :key="meta.label" class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600">
                <Icon :name="meta.icon" class="h-3.5 w-3.5 text-slate-500" />{{ meta.label }}
              </span>
            </div>

            <nav class="mb-5 mt-7 flex flex-wrap gap-x-7 border-b border-slate-200 text-[13px] font-semibold" aria-label="Nội dung chi tiết việc làm">
              <button type="button" :class="detailTabClass('description')" @click="selectDetailView('description')">Mô tả công việc</button>
              <button type="button" :class="detailTabClass('company')" @click="selectDetailView('company')">Thông tin công ty</button>
              <button type="button" :class="detailTabClass('information')" @click="selectDetailView('information')">Thông tin công việc</button>
            </nav>

            <div :class="['grid min-w-0 items-start gap-6', activeDetailView === 'information' ? 'lg:grid-cols-[minmax(0,1fr)_350px]' : 'grid-cols-1']">
              <div class="min-w-0 space-y-4">
                <section id="description" class="scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6">
                  <h2 class="text-base font-black text-[#07112f]">Mô tả công việc</h2>
                  <p class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{{ rawJob?.description || 'Doanh nghiệp chưa cập nhật mô tả công việc.' }}</p>
                </section>
              </div>

              <div v-if="activeDetailView === 'information'" class="space-y-5 xl:-mt-40">
                  <section id="information" class="scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6">
                    <h2 class="text-base font-black text-[#07112f]">Thông tin công việc</h2>
                    <dl class="mt-5 space-y-5">
                      <div v-for="row in informationRows" :key="row.label" class="flex items-start justify-between gap-4">
                        <dt class="inline-flex min-w-0 items-center gap-2 text-[13px] font-medium text-slate-600"><Icon :name="row.icon" class="h-4 w-4 shrink-0 text-slate-500" />{{ row.label }}</dt>
                        <dd class="max-w-[56%] text-right text-[13px] font-bold leading-5 text-[#14203d]">
                          <span class="block">{{ row.value }}</span>
                          <span v-if="row.secondary" class="mt-1 block font-medium text-slate-400">{{ row.secondary }}</span>
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section id="skills" class="scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6">
                    <h2 class="text-base font-black text-[#07112f]">Kỹ năng cần thiết</h2>
                    <div v-if="job.skills.length" class="mt-4 flex flex-wrap gap-2">
                      <span v-for="skill in job.skills" :key="skill" class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{{ skill }}</span>
                    </div>
                    <p v-else class="mt-3 text-sm leading-6 text-slate-500">Doanh nghiệp chưa cập nhật danh sách kỹ năng.</p>
                  </section>
              </div>
            </div>
          </div>

          <aside class="space-y-4">
            <section id="company" class="scroll-mt-28 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div class="relative">
                <img src="/images/quickwork-hero-panel-collaboration.png" alt="Không gian làm việc của doanh nghiệp" class="block h-32 w-full object-cover">
                <span :class="['absolute bottom-0 left-5 flex h-16 w-16 translate-y-1/2 items-center justify-center overflow-hidden rounded-xl border-4 border-white text-lg font-black text-white shadow-md', job.logoClass]"><HomeCompanyLogo :logo-url="job.logoUrl" :company-name="job.company" :initials="job.logo" /></span>
              </div>
              <div class="px-5 pb-5 pt-12">
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-black text-[#07112f]">{{ job.company }}</h2>
                  <span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white" aria-label="Đã xác thực"><Icon name="uil:check" class="h-3 w-3" /></span>
                </div>
                <p class="mt-1 text-[13px] text-slate-500">Nhà tuyển dụng trên QuickWork</p>
                <div class="mt-4 space-y-3 text-[13px] text-slate-600">
                  <p class="flex items-center gap-3"><Icon name="uil:briefcase-alt" class="h-4 w-4 text-slate-400" />{{ job.slots }} vị trí đang tuyển</p>
                  <p v-if="companyPhone" class="flex items-center gap-3"><Icon name="uil:phone" class="h-4 w-4 text-slate-400" />{{ companyPhone }}</p>
                  <p class="flex items-start gap-3"><Icon name="uil:map-marker" class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span class="line-clamp-2">{{ job.location }}</span></p>
                </div>
                <div class="mt-4 border-t border-slate-100 pt-4">
                  <h3 class="text-sm font-black text-[#07112f]">Giới thiệu công ty</h3>
                  <p class="mt-2 text-[13px] leading-6 text-slate-600">{{ job.company }} đang tuyển dụng nhân sự cho vị trí {{ job.title }} trên QuickWork.</p>
                  <button type="button" class="mt-3 inline-flex items-center gap-2 text-[13px] font-bold text-sky-600 hover:text-sky-700" @click="notifyDevelopment('Thông tin doanh nghiệp')">Xem thêm về công ty <Icon name="uil:arrow-right" class="h-4 w-4" /></button>
                </div>
              </div>
            </section>

            <section class="rounded-xl border border-sky-50 bg-sky-50/60 p-5">
              <div class="flex items-start gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sky-600"><Icon name="uil:users-alt" class="h-5 w-5" /></span><div><h2 class="text-sm font-black text-[#07112f]">Tuyển dụng dễ dàng hơn</h2><p class="mt-1 text-xs leading-5 text-slate-600">Ứng tuyển nhanh, nhà tuyển dụng sẽ liên hệ nếu bạn phù hợp.</p></div></div>
            </section>

            <section class="rounded-xl border border-slate-200 bg-white p-5">
              <h2 class="flex items-center gap-2 text-sm font-black text-[#07112f]"><Icon name="uil:shield-check" class="h-4 w-4 text-sky-600" />An toàn khi tìm việc trên QuickWork</h2>
              <ul class="mt-4 space-y-2.5 text-xs font-medium text-slate-600">
                <li class="flex gap-2"><Icon name="uil:check" class="h-4 w-4 shrink-0 text-emerald-500" />Không thu phí ứng tuyển</li>
                <li class="flex gap-2"><Icon name="uil:check" class="h-4 w-4 shrink-0 text-emerald-500" />Thông tin nhà tuyển dụng đã xác thực</li>
                <li class="flex gap-2"><Icon name="uil:check" class="h-4 w-4 shrink-0 text-emerald-500" />Bảo mật thông tin cá nhân</li>
              </ul>
              <button type="button" class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-600" @click="notifyDevelopment('An toàn tìm việc')">Tìm hiểu thêm về an toàn tìm việc <Icon name="uil:arrow-right" class="h-4 w-4" /></button>
            </section>
          </aside>
        </div>
      </template>
    </main>

    <HomeFooter @notify="notifyDevelopment" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeHeader from '~/components/home/HomeHeader.vue'
import HomeCompanyLogo from '~/components/home/CompanyLogo.vue'
import { JobService } from '~/services/job.service'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { type ApiJob, type DisplayJob, formatJobLocation, mapJobForDisplay } from '~/utils/jobDisplay'
import { getJobTypeMeta } from '~/utils/jobTypeMeta'

definePageMeta({
  layout: false
})

type PublicJob = ApiJob & {
  requirements?: string
  status?: string
  enterprise_id?: number
  enterprise_profile?: ApiJob['enterprise_profile'] & {
    phone?: string
    tax_code?: string
  }
}

type DetailView = 'description' | 'company' | 'information'

type InformationRow = {
  icon: string
  label: string
  value: string
  secondary?: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { notifyStudentLoginRequired } = useStudentLoginPrompt()

const rawJob = ref<PublicJob | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const isApplied = ref(false)
const isFavorite = ref(false)
const applying = ref(false)
const favoriteLoading = ref(false)
const activeDetailView = ref<DetailView>('description')

const job = computed<DisplayJob | null>(() => rawJob.value ? mapJobForDisplay(rawJob.value) : null)
const jobTypeMeta = computed(() => getJobTypeMeta(job.value?.type || 'Toàn thời gian'))
const displayLocation = computed(() => formatJobLocation(job.value?.location))
const detailedLocation = computed(() => {
  const location = String(job.value?.location || '').trim()
  return location && location !== displayLocation.value ? location : ''
})
const companyPhone = computed(() => String(rawJob.value?.enterprise_profile?.phone || '').trim())
const routeJobID = computed(() => String(Array.isArray(route.params.id) ? route.params.id[0] || '' : route.params.id || ''))

const heroMeta = computed(() => job.value ? [
  { icon: 'uil:user-check', label: job.value.level },
  { icon: jobTypeMeta.value.icon, label: job.value.type },
  { icon: 'uil:users-alt', label: `${job.value.slots} vị trí` },
  { icon: 'uil:calendar-alt', label: formatDate(rawJob.value?.created_at) }
] : [])

const informationRows = computed<InformationRow[]>(() => job.value ? [
  { icon: 'uil:money-bill', label: 'Mức lương', value: job.value.salary },
  { icon: jobTypeMeta.value.icon, label: 'Hình thức làm việc', value: job.value.type },
  { icon: 'uil:user-check', label: 'Cấp bậc', value: job.value.level },
  { icon: 'uil:apps', label: 'Ngành nghề', value: job.value.category },
  { icon: 'uil:map-marker', label: 'Địa điểm làm việc', value: displayLocation.value, secondary: detailedLocation.value },
  { icon: 'uil:calendar-alt', label: 'Thời gian đăng', value: formatDate(rawJob.value?.created_at) }
] : [])

useHead(() => ({
  title: job.value ? job.value.title : 'Chi tiết việc làm'
}))

async function loadPage() {
  const id = routeJobID.value
  if (!/^\d+$/.test(id)) {
    loading.value = false
    errorMessage.value = 'Mã việc làm không hợp lệ.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  activeDetailView.value = 'description'
  try {
    const response: any = await JobService.getJobDetail(id)
    if (!response?.success || !response.data) throw new Error(response?.message || 'Không thể tải việc làm.')
    rawJob.value = response.data
    await loadStudentActions()
  } catch (error: any) {
    rawJob.value = null
    errorMessage.value = error?.data?.message || error?.message || 'Tin tuyển dụng này không còn khả dụng.'
  } finally {
    loading.value = false
  }
}

function detailTabClass(view: DetailView) {
  return [
    '-mb-px border-b-2 px-1 py-3 transition focus:outline-none focus-visible:rounded focus-visible:ring-4 focus-visible:ring-sky-100',
    activeDetailView.value === view
      ? 'border-sky-600 font-black text-sky-700'
      : 'border-transparent text-slate-500 hover:border-sky-200 hover:text-sky-700'
  ]
}

async function selectDetailView(view: DetailView) {
  const scrollPosition = { left: window.scrollX, top: window.scrollY }
  activeDetailView.value = view
  await nextTick()
  window.scrollTo({ ...scrollPosition, behavior: 'instant' })
}

async function loadStudentActions() {
  isApplied.value = false
  isFavorite.value = false
  if (!authStore.isAuthenticated || authStore.userRole !== 'STUDENT' || !rawJob.value) return
  try {
    const response: any = await StudentService.getJobActions()
    const data = response?.data || {}
    const id = Number(rawJob.value.id)
    isApplied.value = Array.isArray(data.applied_job_ids) && data.applied_job_ids.map(Number).includes(id)
    isFavorite.value = Array.isArray(data.favorite_job_ids) && data.favorite_job_ids.map(Number).includes(id)
  } catch {
    // Keep public detail content available if protected action state cannot be loaded.
  }
}

function requireStudentSession() {
  if (!authStore.isAuthenticated) {
    notifyStudentLoginRequired('Đăng nhập bằng tài khoản sinh viên để lưu hoặc ứng tuyển việc làm này.')
    return false
  }
  if (authStore.userRole !== 'STUDENT') {
    toast.warning('Chỉ dành cho sinh viên', 'Hãy sử dụng tài khoản sinh viên để thực hiện thao tác này.')
    return false
  }
  return true
}

async function applyJob() {
  if (!job.value || isApplied.value || applying.value || !requireStudentSession()) return
  applying.value = true
  try {
    const response: any = await StudentService.applyJob(job.value.id)
    if (!response?.success) throw new Error(response?.message || 'Không thể ứng tuyển việc làm này.')
    isApplied.value = true
    toast.success('Ứng tuyển thành công', 'Hồ sơ của bạn đã được gửi tới nhà tuyển dụng.')
  } catch (error: any) {
    toast.error('Không thể ứng tuyển', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    applying.value = false
  }
}

async function toggleFavorite() {
  if (!job.value || favoriteLoading.value || !requireStudentSession()) return
  favoriteLoading.value = true
  try {
    const response: any = isFavorite.value
      ? await StudentService.removeFavoriteJob(job.value.id)
      : await StudentService.saveFavoriteJob(job.value.id)
    if (!response?.success) throw new Error(response?.message || 'Không thể cập nhật việc làm đã lưu.')
    isFavorite.value = !isFavorite.value
    toast.success(isFavorite.value ? 'Đã lưu việc làm' : 'Đã bỏ lưu', isFavorite.value ? 'Bạn có thể xem lại việc làm này trong danh sách yêu thích.' : 'Việc làm đã được bỏ khỏi danh sách yêu thích.')
  } catch (error: any) {
    toast.error('Không thể cập nhật', error?.data?.message || error?.message || 'Vui lòng thử lại.')
  } finally {
    favoriteLoading.value = false
  }
}

async function shareJob() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép liên kết', 'Bạn có thể gửi liên kết việc làm này cho người khác.')
  } catch {
    toast.info('Liên kết việc làm', window.location.href)
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else navigateTo('/student')
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN')
}

function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`)
}

onMounted(loadPage)
watch(routeJobID, (next, previous) => {
  if (next !== previous) loadPage()
})
</script>
