import { computed, onMounted, ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'
import { StudentService } from '~/services/student.service'
import { useAuthStore } from '~/stores/auth'
import { type ApiJob, type DisplayJob, mapJobForDisplay, salaryRank } from '~/utils/jobDisplay'
import { buildSearchText, normalizeSearchText } from '~/utils/searchText'

export type HomeSearchState = {
  keyword: string
  location: string
  type: string
}

export type HomeQuickStat = {
  label: string
  value: string
  helper: string
  icon: string
}

export type HomeCategorySummary = {
  title: string
  count: number
  slots: number
  percent: number
  icon: string
  iconClass: string
}

export type HomeCompanySummary = {
  name: string
  logo: string
  logoClass: string
  openJobs: number
  description: string
}

const ALL_CATEGORY = 'Tất cả'
const ALL_JOB_TYPES = 'Tất cả loại hình'

export function useHomeJobs() {
  const toast = useToast()
  const authStore = useAuthStore()
  const route = useRoute()
  const jobs = ref<DisplayJob[]>([])
  const isJobsLoading = ref(true)
  const appliedJobIds = ref<Set<number>>(new Set())
  const favoriteJobIds = ref<Set<number>>(new Set())
  const applyingJobIds = ref<Set<number>>(new Set())
  const favoriteLoadingJobIds = ref<Set<number>>(new Set())
  const activeCategory = ref(ALL_CATEGORY)
  const homeSearch = ref<HomeSearchState>({
    keyword: '',
    location: '',
    type: ALL_JOB_TYPES
  })

  const companyCount = computed(() => uniqueValues(jobs.value.map((job) => job.company)).length)
  const totalSlots = computed(() => jobs.value.reduce((total, job) => total + job.slots, 0))
  const locationCount = computed(() => uniqueValues(jobs.value.map((job) => job.location)).length)

  const jobTypeOptions = computed(() => [
    ALL_JOB_TYPES,
    ...uniqueValues(jobs.value.map((job) => job.type)).slice(0, 5)
  ])

  const trendingKeywords = computed(() => uniqueValues(
    jobs.value.flatMap((job) => [job.category, job.type, ...job.skills.slice(0, 2)])
  ).slice(0, 6))

  const jobCategories = computed(() => [
    ALL_CATEGORY,
    ...categoryStats.value.map((category) => category.title).slice(0, 5)
  ])

  const filteredJobs = computed(() => {
    const keyword = normalizeSearchText(homeSearch.value.keyword)
    const location = normalizeSearchText(homeSearch.value.location)
    const selectedType = homeSearch.value.type

    return jobs.value.filter((job) => {
      const searchableJob = buildSearchText([
        job.title,
        job.company,
        job.description,
        job.location,
        job.type,
        job.level,
        job.category,
        job.salary,
        ...job.skills
      ])
      const matchesKeyword = !keyword || searchableJob.includes(keyword)
      const matchesLocation = !location || normalizeSearchText(job.location).includes(location)
      const matchesType = selectedType === ALL_JOB_TYPES || job.type === selectedType

      return matchesKeyword && matchesLocation && matchesType
    })
  })

  const bestJobs = computed(() => [...filteredJobs.value]
    .sort((a, b) => getJobScore(b) - getJobScore(a)))

  const categoryStats = computed<HomeCategorySummary[]>(() => {
    const groups = new Map<string, DisplayJob[]>()

    for (const job of jobs.value) {
      groups.set(job.category, [...(groups.get(job.category) || []), job])
    }

    const maxSlots = Math.max(
      ...Array.from(groups.values()).map((group) => group.reduce((total, job) => total + job.slots, 0)),
      1
    )

    return Array.from(groups.entries())
      .map(([title, group], index) => {
        const slots = group.reduce((total, job) => total + job.slots, 0)

        return {
          title,
          count: group.length,
          slots,
          percent: Math.max(14, Math.round((slots / maxSlots) * 100)),
          icon: getCategoryIcon(title),
          iconClass: getCategoryIconClass(index)
        }
      })
      .sort((a, b) => b.slots - a.slots || b.count - a.count)
      .slice(0, 8)
  })

  const featuredCompanies = computed<HomeCompanySummary[]>(() => {
    const companies = new Map<string, DisplayJob[]>()

    for (const job of jobs.value) {
      companies.set(job.company, [...(companies.get(job.company) || []), job])
    }

    return Array.from(companies.entries())
      .map(([name, companyJobs]) => ({
        name,
        logo: companyJobs[0]?.logo || 'QW',
        logoClass: companyJobs[0]?.logoClass || 'bg-sky-600',
        openJobs: companyJobs.length,
        description: `Đang tuyển ${companyJobs.map((job) => job.title).slice(0, 2).join(', ')}${companyJobs.length > 2 ? '...' : '.'}`
      }))
      .sort((a, b) => b.openJobs - a.openJobs)
      .slice(0, 4)
  })

  const quickStats = computed<HomeQuickStat[]>(() => [
    {
      label: 'Việc làm đang tuyển',
      value: formatCount(jobs.value.length),
      helper: 'Cơ hội đang có trong hệ thống',
      icon: 'uil:briefcase-alt'
    },
    {
      label: 'Doanh nghiệp',
      value: formatCount(companyCount.value),
      helper: 'Nhà tuyển dụng đang đăng tin',
      icon: 'uil:building'
    },
    {
      label: 'Vị trí đang mở',
      value: formatCount(totalSlots.value),
      helper: 'Tổng chỉ tiêu tuyển dụng',
      icon: 'uil:users-alt'
    },
    {
      label: 'Địa điểm',
      value: formatCount(locationCount.value),
      helper: 'Khu vực có việc làm',
      icon: 'uil:map-marker'
    }
  ])

  function setHeroKeyword(tag: string) {
    homeSearch.value = {
      ...homeSearch.value,
      keyword: tag
    }
  }

  function setCategory(category: string) {
    activeCategory.value = category
  }

  function resetSearch() {
    activeCategory.value = ALL_CATEGORY
    homeSearch.value = {
      keyword: '',
      location: '',
      type: ALL_JOB_TYPES
    }
  }

  function notifyDevelopment(feature: string) {
    toast.info('Tính năng đang phát triển', `${feature} sẽ được kết nối khi backend sẵn sàng.`)
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

  async function loadPublicJobs() {
    try {
      isJobsLoading.value = true
      const response: any = await JobService.getAllJobs()
      const rawJobs: ApiJob[] = response?.success && Array.isArray(response.data) ? response.data : []
      jobs.value = rawJobs.map(mapJobForDisplay)
    } catch (error: any) {
      jobs.value = []
      toast.error('Không thể tải việc làm', error?.data?.message || error?.message || 'Vui lòng thử lại sau.')
    } finally {
      isJobsLoading.value = false
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

  return {
    activeCategory,
    applyToJob,
    bestJobs,
    categoryStats,
    companyCount,
    featuredCompanies,
    homeSearch,
    isAppliedJob,
    isApplyingJob,
    isFavoriteJob,
    isFavoriteLoading,
    isJobsLoading,
    jobCategories,
    jobTypeOptions,
    jobs,
    locationCount,
    quickStats,
    resetSearch,
    setCategory,
    setHeroKeyword,
    totalSlots,
    toggleFavoriteJob,
    trendingKeywords,
    notifyDevelopment
  }
}

function formatCount(value: number) {
  return value.toLocaleString('vi-VN')
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function getJobScore(job: DisplayJob) {
  const recencyScore = job.createdAt > 0 ? job.createdAt / 100000000000 : 0
  return job.slots * 14 + salaryRank(job.salaryRange) * 10 + recencyScore
}

function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase()
  if (normalized.includes('marketing')) return 'uil:megaphone'
  if (normalized.includes('kinh doanh')) return 'uil:chart-growth'
  if (normalized.includes('thiết kế')) return 'uil:palette'
  if (normalized.includes('tài chính') || normalized.includes('kế toán')) return 'uil:calculator'
  if (normalized.includes('nhân sự')) return 'uil:users-alt'
  return 'uil:laptop'
}

function getCategoryIconClass(index: number) {
  const classes = [
    'bg-sky-50 text-sky-700',
    'bg-blue-50 text-blue-700',
    'bg-slate-100 text-slate-800',
    'bg-sky-50 text-sky-700'
  ]

  return classes[index % classes.length] ?? classes[0] ?? 'bg-sky-50 text-sky-700'
}
