<template>
  <div class="company-page min-h-screen font-sans">
    <HomeHeader @notify="notifyDevelopment" />

    <main>
      <div v-if="loading" class="company-container company-loading" role="status" aria-live="polite" aria-busy="true">
        <span class="sr-only">Đang tải thông tin công ty…</span>
        <div class="h-64 animate-pulse rounded-2xl bg-slate-200" />
        <div class="mt-5 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div class="h-80 animate-pulse rounded-2xl bg-white" />
          <div class="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>

      <section v-else-if="errorMessage" class="company-error company-container">
        <span class="section-icon"><Icon name="uil:building" class="h-8 w-8" aria-hidden="true" /></span>
        <h1>Không thể mở trang công ty</h1>
        <p>{{ errorMessage }}</p>
        <NuxtLink :to="messageReturnTo" class="company-button company-button--primary">
          <Icon name="uil:arrow-left" class="h-5 w-5" aria-hidden="true" />
          Quay lại tin nhắn
        </NuxtLink>
      </section>

      <template v-else-if="profile">
        <section class="company-hero" aria-labelledby="company-name">
          <img v-if="coverUrl" :src="coverUrl" alt="" class="company-hero__cover" @error="coverFailed = true">
          <div class="company-hero__pattern" aria-hidden="true" />
          <div class="company-container company-hero__inner">
            <div class="company-hero__identity">
              <NuxtLink :to="messageReturnTo" class="company-breadcrumb">
                <Icon name="uil:arrow-left" class="h-4 w-4" aria-hidden="true" />
                Tin nhắn
                <span aria-hidden="true">/</span>
                <span>Thông tin công ty</span>
              </NuxtLink>

              <div class="company-identity">
                <div class="company-logo">
                  <HomeCompanyLogo :logo-url="profile.logo_url" :company-name="profile.company_name" :initials="initials" />
                </div>
                <div class="min-w-0">
                  <div class="company-name-row">
                    <h1 id="company-name">{{ profile.company_name }}</h1>
                    <span v-if="profile.verified" class="company-verified" title="Doanh nghiệp đã được QuickWork xác minh">
                      <Icon name="uil:check-circle" class="h-5 w-5" aria-hidden="true" />
                      <span class="sr-only">Đã xác minh</span>
                    </span>
                  </div>
                  <p class="company-intro">{{ companySummary }}</p>
                  <ul class="company-facts" aria-label="Thông tin doanh nghiệp">
                    <li v-for="fact in heroFacts" :key="fact.icon">
                      <Icon :name="fact.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{{ fact.label }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="company-hero__actions">
                <button type="button" class="company-button company-button--primary" @click="scrollToJobs">
                  <Icon name="uil:briefcase-alt" class="h-5 w-5" aria-hidden="true" />
                  Xem việc đang tuyển
                </button>
                <NuxtLink :to="messageReturnTo" class="company-button company-button--outline">
                  <Icon name="uil:comment-alt-message" class="h-5 w-5" aria-hidden="true" />
                  Trở lại hội thoại
                </NuxtLink>
              </div>
            </div>

            <section class="company-stats" aria-labelledby="company-stats-title">
              <h2 id="company-stats-title">Cơ hội tại {{ profile.company_name }}</h2>
              <div class="company-stats__grid">
                <div>
                  <span class="stat-icon stat-icon--blue"><Icon name="uil:briefcase-alt" class="h-6 w-6" aria-hidden="true" /></span>
                  <strong>{{ stats.open_job_count }}</strong>
                  <span>việc đang tuyển</span>
                </div>
                <div>
                  <span class="stat-icon stat-icon--green"><Icon name="uil:users-alt" class="h-6 w-6" aria-hidden="true" /></span>
                  <strong>{{ stats.total_openings }}</strong>
                  <span>vị trí còn mở</span>
                </div>
              </div>
              <div class="company-stats__footer">
                <span><Icon name="uil:check-circle" class="h-4 w-4" aria-hidden="true" /> Tin tuyển dụng đã duyệt</span>
                <span v-if="profile.work_model"><Icon name="uil:laptop" class="h-4 w-4" aria-hidden="true" /> {{ profile.work_model }}</span>
              </div>
            </section>
          </div>
        </section>

        <div class="company-container company-layout">
          <div class="company-main">
            <nav class="company-tabs" aria-label="Nội dung trang công ty">
              <a
                v-for="item in sectionLinks"
                :key="item.id"
                :href="'#' + item.id"
                :class="{ 'is-active': activeSection === item.id }"
                :aria-current="activeSection === item.id ? 'location' : undefined"
                @click="activeSection = item.id"
              >
                {{ item.label }}
                <span v-if="item.id === 'jobs'" class="tab-count">{{ jobs.length }}</span>
              </a>
            </nav>

            <section id="overview" class="company-panel company-anchor">
              <div class="section-heading">
                <span class="section-icon"><Icon name="uil:building" class="h-6 w-6" aria-hidden="true" /></span>
                <h2>Giới thiệu công ty</h2>
              </div>
              <p class="company-description">{{ profile.description?.trim() || 'Doanh nghiệp chưa cập nhật phần giới thiệu chi tiết. Bạn có thể xem thông tin công ty và các vị trí đang tuyển bên dưới.' }}</p>
            </section>

            <section id="company-facts" class="company-panel company-anchor">
              <div class="section-heading">
                <span class="section-icon"><Icon name="uil:info-circle" class="h-6 w-6" aria-hidden="true" /></span>
                <h2>Tìm hiểu về công ty</h2>
              </div>
              <div class="company-highlights">
                <article v-for="item in highlights" :key="item.title" class="company-highlight">
                  <span :class="['highlight-icon', item.tone]"><Icon :name="item.icon" class="h-5 w-5" aria-hidden="true" /></span>
                  <div class="min-w-0">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.value }}</p>
                  </div>
                </article>
              </div>
            </section>

            <section id="jobs" class="company-panel company-anchor">
              <div class="section-heading section-heading--spread">
                <div class="section-heading">
                  <span class="section-icon"><Icon name="uil:briefcase-alt" class="h-6 w-6" aria-hidden="true" /></span>
                  <h2>Việc làm đang tuyển <span class="section-count">({{ jobs.length }})</span></h2>
                </div>
                <span v-if="jobs.length" class="company-live-label"><span aria-hidden="true" /> Đang tuyển dụng</span>
              </div>

              <div v-if="jobs.length" id="company-job-list" class="company-jobs">
                <article v-for="job in visibleJobs" :key="job.id" class="company-job">
                  <div class="company-job__top">
                    <span class="job-icon"><Icon name="uil:bag" class="h-5 w-5" aria-hidden="true" /></span>
                    <span class="job-openings">{{ job.slots }} vị trí</span>
                  </div>
                  <h3><NuxtLink :to="'/jobs/' + job.id" :title="job.title">{{ job.title }}</NuxtLink></h3>
                  <div class="job-details">
                    <span><Icon name="uil:map-marker" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ job.location || 'Địa điểm thỏa thuận' }}</span>
                    <span class="job-salary"><Icon name="uil:money-bill" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ job.salary || 'Lương thỏa thuận' }}</span>
                  </div>
                  <p v-if="job.description" class="job-description">{{ job.description }}</p>
                  <div v-if="job.skills.length" class="job-skills">
                    <span v-for="skill in job.skills.slice(0, 3)" :key="skill.id || skill.name">{{ skill.name }}</span>
                    <span v-if="job.skills.length > 3" :title="job.skills.slice(3).map(skill => skill.name).join(', ')">+{{ job.skills.length - 3 }}</span>
                  </div>
                  <div class="company-job__footer">
                    <span>{{ profile.company_name }}</span>
                    <NuxtLink :to="'/jobs/' + job.id" class="job-link" :aria-label="'Xem chi tiết ' + job.title">
                      Xem chi tiết <Icon name="uil:arrow-right" class="h-4 w-4" aria-hidden="true" />
                    </NuxtLink>
                  </div>
                </article>
              </div>
              <div v-else class="company-empty">
                <Icon name="uil:briefcase-alt" class="h-8 w-8" aria-hidden="true" />
                <h3>Chưa có vị trí đang tuyển</h3>
                <p>Bạn vẫn có thể trở lại hội thoại để trao đổi về hồ sơ đã ứng tuyển.</p>
                <NuxtLink :to="messageReturnTo" class="company-text-link">Trở lại hội thoại <Icon name="uil:arrow-right" class="h-4 w-4" aria-hidden="true" /></NuxtLink>
              </div>

              <button v-if="jobs.length > JOB_PREVIEW_LIMIT" type="button" class="company-show-jobs" :aria-expanded="showAllJobs" aria-controls="company-job-list" @click="showAllJobs = !showAllJobs">
                {{ showAllJobs ? 'Thu gọn danh sách' : 'Xem tất cả ' + jobs.length + ' việc đang tuyển' }}
                <Icon :name="showAllJobs ? 'uil:angle-up' : 'uil:arrow-right'" class="h-5 w-5" aria-hidden="true" />
              </button>
            </section>
          </div>

          <aside class="company-sidebar" aria-label="Thông tin bổ sung về công ty">
            <section class="company-panel">
              <div class="section-heading">
                <span class="section-icon"><Icon name="uil:info-circle" class="h-5 w-5" aria-hidden="true" /></span>
                <h2>Tóm tắt nhanh</h2>
              </div>
              <dl class="company-summary">
                <div v-for="item in summaryRows" :key="item.label">
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
            </section>

            <section v-if="companySkills.length" class="company-panel">
              <div class="section-heading">
                <span class="section-icon"><Icon name="uil:brackets-curly" class="h-5 w-5" aria-hidden="true" /></span>
                <h2>Kỹ năng thường tuyển</h2>
              </div>
              <p class="section-caption">Tổng hợp từ các vị trí đang tuyển dụng.</p>
              <div class="company-skills">
                <span v-for="skill in companySkills" :key="skill">{{ skill }}</span>
              </div>
            </section>

            <section v-if="coverUrl" class="company-panel">
              <div class="section-heading">
                <span class="section-icon"><Icon name="uil:image" class="h-5 w-5" aria-hidden="true" /></span>
                <h2>Hình ảnh công ty</h2>
              </div>
              <img :src="coverUrl" :alt="'Ảnh bìa do ' + profile.company_name + ' cung cấp'" class="company-photo" loading="lazy" @error="coverFailed = true">
              <p class="section-caption">Ảnh bìa được doanh nghiệp cập nhật.</p>
            </section>

            <section class="company-panel company-note">
              <div class="section-heading">
                <span class="section-icon"><Icon name="uil:lightbulb-alt" class="h-5 w-5" aria-hidden="true" /></span>
                <h2>Lưu ý cho sinh viên</h2>
              </div>
              <p>Thông tin được lấy từ hồ sơ doanh nghiệp và các tin tuyển dụng đã duyệt. Hãy xem kỹ mô tả công việc trước khi trao đổi hoặc ứng tuyển.</p>
            </section>
          </aside>
        </div>
      </template>
    </main>

    <HomeFooter @notify="notifyDevelopment" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HomeCompanyLogo from '~/components/home/CompanyLogo.vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeHeader from '~/components/home/HomeHeader.vue'
import { useToast } from '~/composables/useToast'
import { CompanyService } from '~/services/company.service'

type CompanySkill = { id?: number, name: string, category?: string }
type CompanyJob = { id: number, title: string, description?: string, requirements?: string, salary?: string, location?: string, slots: number, application_count?: number, favorite_count?: number, skills: CompanySkill[], created_at?: string }
type CompanyProfile = { user_id: number, company_name: string, logo_url?: string, cover_image_url?: string, industry?: string, company_size?: string, work_model?: string, recruitment_level?: string, description?: string, address?: string, country?: string, city?: string, district?: string, ward?: string, verified: boolean, created_at?: string }
type CompanyStats = { open_job_count: number, total_openings: number }

definePageMeta({ layout: false, middleware: ['auth', 'student'] })

const route = useRoute()
const toast = useToast()
const config = useRuntimeConfig()
const loading = ref(true)
const errorMessage = ref('')
const profile = ref<CompanyProfile | null>(null)
const jobs = ref<CompanyJob[]>([])
const stats = ref<CompanyStats>({ open_job_count: 0, total_openings: 0 })
const coverFailed = ref(false)
const JOB_PREVIEW_LIMIT = 4
const showAllJobs = ref(false)
const visibleJobs = computed(() => showAllJobs.value ? jobs.value : jobs.value.slice(0, JOB_PREVIEW_LIMIT))
const activeSection = ref('overview')
let sectionObserver: IntersectionObserver | undefined

const companyID = computed(() => String(Array.isArray(route.params.id) ? route.params.id[0] || '' : route.params.id || ''))
const messageReturnTo = computed(() => {
  const value = Array.isArray(route.query.conversation) ? route.query.conversation[0] : route.query.conversation
  return /^\d+$/.test(String(value || ''))
    ? { path: '/student/messages', query: { conversation: String(value) } }
    : '/student/messages'
})
const initials = computed(() => String(profile.value?.company_name || 'QW').split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase())
const coverUrl = computed(() => coverFailed.value ? '' : resolveAssetUrl(profile.value?.cover_image_url))
const companySummary = computed(() => profile.value?.description?.trim().split(/\r?\n/)[0] || `${profile.value?.company_name || 'Doanh nghiệp'} đang tuyển dụng trên QuickWork.`)
const locationLabel = computed(() => uniqueText([profile.value?.ward, profile.value?.district, profile.value?.city, profile.value?.country]).join(', ') || profile.value?.address || 'Chưa cập nhật')
const heroFacts = computed(() => [
  { icon: 'uil:building', label: profile.value?.industry || 'Lĩnh vực chưa cập nhật' },
  { icon: 'uil:map-marker', label: profile.value?.city || locationLabel.value },
  { icon: 'uil:users-alt', label: profile.value?.company_size || 'Quy mô chưa cập nhật' }
])
const highlights = computed(() => [
  { icon: 'uil:laptop', title: 'Mô hình làm việc', value: profile.value?.work_model || 'Doanh nghiệp chưa cập nhật', tone: 'bg-sky-100 text-sky-700' },
  { icon: 'uil:suitcase-alt', title: 'Cấp tuyển dụng', value: profile.value?.recruitment_level || 'Chưa cập nhật', tone: 'bg-violet-100 text-violet-700' },
  { icon: 'uil:map-marker', title: 'Khu vực hoạt động', value: profile.value?.city || locationLabel.value, tone: 'bg-emerald-100 text-emerald-700' },
  { icon: 'uil:check-circle', title: 'Trạng thái hồ sơ', value: profile.value?.verified ? 'Đã được QuickWork xác minh' : 'Chưa xác minh', tone: 'bg-amber-100 text-amber-700' }
])
const summaryRows = computed(() => [
  { label: 'Lĩnh vực', value: profile.value?.industry || 'Chưa cập nhật' },
  { label: 'Quy mô', value: profile.value?.company_size || 'Chưa cập nhật' },
  { label: 'Mô hình', value: profile.value?.work_model || 'Chưa cập nhật' },
  { label: 'Địa chỉ', value: profile.value?.address || locationLabel.value }
])
const companySkills = computed(() => Array.from(new Set(jobs.value.flatMap(job => job.skills || []).map(skill => skill.name?.trim()).filter(Boolean))).slice(0, 12))
const sectionLinks = [
  { label: 'Tổng quan', id: 'overview' },
  { label: 'Thông tin công ty', id: 'company-facts' },
  { label: 'Việc đang tuyển', id: 'jobs' }
]

useHead(() => ({ title: profile.value?.company_name ? `Công ty ${profile.value.company_name}` : 'Thông tin công ty' }))

async function loadCompany() {
  const id = companyID.value
  if (!/^\d+$/.test(id)) {
    loading.value = false
    errorMessage.value = 'Mã doanh nghiệp không hợp lệ.'
    return
  }
  loading.value = true
  errorMessage.value = ''
  coverFailed.value = false
  showAllJobs.value = false
  activeSection.value = 'overview'
  sectionObserver?.disconnect()
  try {
    const response: any = await CompanyService.getStudentCompanyProfile(id)
    if (!response?.success || !response.data?.profile) throw new Error(response?.message || 'Không thể tải thông tin công ty.')
    profile.value = response.data.profile
    jobs.value = Array.isArray(response.data.jobs)
      ? response.data.jobs.map((job: CompanyJob) => ({ ...job, skills: Array.isArray(job.skills) ? job.skills : [] }))
      : []
    stats.value = response.data.stats || { open_job_count: jobs.value.length, total_openings: jobs.value.reduce((total, job) => total + Number(job.slots || 0), 0) }
  } catch (error: any) {
    profile.value = null
    jobs.value = []
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải thông tin công ty.'
  } finally {
    loading.value = false
    await nextTick()
    observeSections()
  }
}

function resolveAssetUrl(value?: string) {
  const source = String(value || '').trim()
  if (!source) return ''
  if (/^(?:https?:)?\/\//i.test(source) || source.startsWith('data:') || source.startsWith('blob:')) return source
  const backendOrigin = String(config.public.apiBase || '').replace(/\/api\/v1\/?$/, '')
  return `${backendOrigin}${source.startsWith('/') ? '' : '/'}${source}`
}

function uniqueText(values: Array<string | undefined>) {
  const seen = new Set<string>()
  return values.map(value => String(value || '').trim()).filter((value) => {
    const key = value.toLocaleLowerCase('vi-VN')
    if (!value || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function scrollToJobs() {
  activeSection.value = 'jobs'
  document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function observeSections() {
  sectionObserver?.disconnect()
  if (!profile.value || typeof IntersectionObserver === 'undefined') return
  sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]) activeSection.value = visible[0].target.id
  }, { rootMargin: '-120px 0px -55% 0px' })
  sectionLinks.forEach(({ id }) => {
    const section = document.getElementById(id)
    if (section) sectionObserver?.observe(section)
  })
}
function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được bổ sung trong phiên bản tiếp theo.`)
}

onMounted(loadCompany)
watch(companyID, loadCompany)
onBeforeUnmount(() => sectionObserver?.disconnect())
</script>

<style scoped>
.company-page {
  --company-blue: #087bfa;
  --company-ink: #14213b;
  --company-muted: #64748b;
  --company-border: #e4ebf4;
  color: var(--company-ink);
  background: #f6f8fc;
}
.company-container { width: 100%; max-width: 1440px; margin-inline: auto; padding-inline: 24px; }
.company-loading { padding-block: 40px; }
.company-page :is(a, button):focus-visible { outline: 3px solid #38bdf8; outline-offset: 4px; }
.company-hero { position: relative; isolation: isolate; overflow: hidden; color: white; background: #061934; }
.company-hero::after {
  position: absolute; z-index: -1; inset: 0; content: '';
  background: radial-gradient(ellipse at 2% 60%, #0b77ac5c, transparent 40%), radial-gradient(ellipse at 98% 85%, #106bdd80, transparent 46%), linear-gradient(110deg, #04152ceb, #071d46d9);
}
.company-hero__cover { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .35; }
.company-hero__pattern {
  position: absolute; right: 0; top: 16px; width: 150px; height: 135px; opacity: .18;
  background-image: radial-gradient(#b7dfff 1px, transparent 1px); background-size: 10px 10px; pointer-events: none;
}
.company-hero__inner { position: relative; display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(340px, 1fr); align-items: center; gap: 52px; padding-block: 26px 50px; }
.company-hero__identity { min-width: 0; }
.company-breadcrumb { display: inline-flex; align-items: center; gap: 10px; padding: 6px 12px; border: 1px solid #8dceff38; border-radius: 999px; color: #d7e8ff; font-size: 11px; font-weight: 600; transition: background .2s; }
.company-breadcrumb:hover { background: #ffffff14; }
.company-breadcrumb > span:last-child { text-transform: uppercase; letter-spacing: .06em; }
.company-identity { display: flex; align-items: flex-start; gap: 22px; margin-top: 19px; }
.company-logo { display: flex; flex: 0 0 104px; width: 104px; height: 104px; align-items: center; justify-content: center; overflow: hidden; border: 2px solid #d6e9ffbb; border-radius: 17px; background: white; color: #132747; font-size: 28px; font-weight: 800; box-shadow: 0 8px 24px #010f2633; }
.company-name-row { display: flex; align-items: center; gap: 12px; }
.company-name-row h1 { margin: -4px 0 0; overflow-wrap: anywhere; font-size: clamp(26px, 2.5vw, 38px); line-height: 1.2; font-weight: 800; letter-spacing: -.025em; color: white; }
.company-verified { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; width: 29px; height: 29px; border-radius: 9px; background: var(--company-blue); color: white; box-shadow: 0 0 0 4px #2286ff1a; }
.company-intro { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 10px 0 0; color: #dde8f8; font-size: 13px; line-height: 1.75; font-weight: 400; overflow-wrap: anywhere; }
.company-facts { display: flex; flex-wrap: wrap; gap: 10px 20px; list-style: none; padding: 0; margin: 14px 0 0; color: #ccdbef; font-size: 12px; line-height: 1.6; }
.company-facts li { display: flex; align-items: flex-start; gap: 7px; min-width: 0; }
.company-facts li > .iconify { margin-top: 2px; }
.company-facts li > span { overflow-wrap: anywhere; }
.company-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.company-button { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; gap: 9px; padding: 10px 19px; border: 1px solid transparent; border-radius: 9px; font-size: 13px; font-weight: 700; line-height: 1.4; transition: background .2s, border-color .2s, box-shadow .2s; }
.company-button--primary { color: white; background: linear-gradient(120deg, #0095ff, #0673ee); box-shadow: 0 4px 12px #006bda20; }
.company-button--primary:hover { background: #006adc; box-shadow: 0 5px 18px #168cff40; }
.company-button--outline { border-color: #d8e9ffa3; color: white; background: #ffffff05; }
.company-button--outline:hover { border-color: white; background: #ffffff14; }
.company-stats { min-width: 0; padding: 22px; border: 1px solid #dce8ff; border-radius: 14px; background: #fff; color: var(--company-ink); box-shadow: 0 16px 44px #000d281a; }
.company-stats h2 { margin: 0 0 18px; font-size: 13px; font-weight: 700; color: #52617b; overflow-wrap: anywhere; }
.company-stats__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.company-stats__grid > div { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 0 12px; text-align: center; }
.company-stats__grid > div + div { border-left: 1px solid var(--company-border); }
.stat-icon { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; margin-bottom: 2px; border-radius: 12px; }
.stat-icon--blue { color: #087bfa; background: #eef6ff; }
.stat-icon--green { color: #09a478; background: #ecfaf3; }
.company-stats__grid strong { font-size: 30px; line-height: 1.2; font-weight: 800; letter-spacing: -.03em; }
.company-stats__grid > div > span:last-child { font-size: 12px; color: var(--company-muted); }
.company-stats__footer { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 21px; padding-top: 14px; border-top: 1px solid var(--company-border); }
.company-stats__footer > span { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 6px; background: #f3f7fc; color: #48617f; font-size: 10px; font-weight: 600; }
.company-stats__footer .iconify { flex-shrink: 0; color: var(--company-blue); }
.company-layout { position: relative; display: grid; grid-template-columns: minmax(0, 2.06fr) minmax(300px, 1fr); align-items: start; gap: 20px; margin-top: -22px; padding-bottom: 48px; }
.company-main, .company-sidebar { min-width: 0; display: grid; gap: 14px; }
.company-tabs { display: flex; align-items: stretch; overflow-x: auto; gap: 6px; min-width: 0; min-height: 51px; padding: 0 14px; border: 1px solid var(--company-border); border-radius: 10px; background: #fff; box-shadow: 0 3px 10px #203f6910; scrollbar-width: thin; scrollbar-color: #badfff transparent; }
.company-tabs::-webkit-scrollbar { height: 4px; }
.company-tabs::-webkit-scrollbar-thumb { background: #badfff; border-radius: 10px; }
.company-tabs a { position: relative; display: inline-flex; flex-shrink: 0; align-items: center; gap: 7px; padding: 14px 17px; color: #4a5870; font-size: 12px; font-weight: 600; transition: color .2s; }
.company-tabs a:hover, .company-tabs a.is-active { color: var(--company-blue); }
.company-tabs a.is-active::after { position: absolute; right: 16px; bottom: 0; left: 16px; height: 3px; border-radius: 3px 3px 0 0; background: var(--company-blue); content: ''; }
.company-tabs a:focus-visible { outline-offset: -4px; border-radius: 6px; }
.tab-count { padding: 1px 6px; border-radius: 5px; background: #edf5ff; color: #1171d3; font-size: 10px; }
.company-panel { min-width: 0; padding: 20px; border: 1px solid var(--company-border); border-radius: 12px; background: white; box-shadow: 0 2px 5px #21365303; }
.company-anchor { scroll-margin-top: 114px; }
.section-heading { display: flex; min-width: 0; align-items: center; gap: 10px; }
.section-heading--spread { justify-content: space-between; flex-wrap: wrap; gap: 10px 14px; }
.section-heading h2 { margin: 0; font-size: 16px; line-height: 1.4; font-weight: 800; color: #14213b; overflow-wrap: anywhere; }
.section-icon { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; color: var(--company-blue); }
.company-description { margin: 14px 0 0; white-space: pre-line; overflow-wrap: anywhere; font-size: 13px; line-height: 1.85; font-weight: 400; color: #53637b; }
.company-highlights { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
.company-highlight { display: flex; align-items: flex-start; gap: 11px; min-width: 0; padding: 14px 12px; border: 1px solid #e7edf6; border-radius: 10px; background: linear-gradient(130deg, #fff, #fafcff); }
.highlight-icon { display: inline-flex; width: 38px; height: 38px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 12px; }
.company-highlight h3 { margin: 0; font-size: 12px; line-height: 1.5; font-weight: 700; }
.company-highlight p { margin: 4px 0 0; color: var(--company-muted); font-size: 11px; line-height: 1.65; overflow-wrap: anywhere; }
.section-count { color: #64748b; font-size: 13px; font-weight: 600; }
.company-live-label { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; color: #078b64; font-size: 10px; font-weight: 600; }
.company-live-label > span { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
.company-jobs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 17px; }
.company-job { display: flex; min-width: 0; flex-direction: column; padding: 16px; border: 1px solid #e0e9f5; border-radius: 11px; background: #fff; transition: border-color .2s, box-shadow .2s; }
.company-job:hover, .company-job:focus-within { border-color: #99caff; box-shadow: 0 5px 20px #096ddd0b; }
.company-job__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.job-icon { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 9px; color: #127beb; background: #eef6ff; }
.job-openings { border-radius: 5px; padding: 4px 7px; color: #078d68; background: #ecfaf3; font-size: 10px; font-weight: 600; }
.company-job h3 { margin: 11px 0 9px; font-size: 15px; line-height: 1.5; font-weight: 800; color: #1158a7; }
.company-job h3 a { overflow-wrap: anywhere; }
.company-job h3 a:hover { color: #0081ef; text-decoration: underline; text-underline-offset: 3px; }
.job-details { display: grid; gap: 7px; color: #65768e; font-size: 11px; line-height: 1.6; }
.job-details > span { display: flex; align-items: flex-start; gap: 6px; overflow-wrap: anywhere; }
.job-details .iconify { margin-top: 1px; }
.job-details .job-salary { color: #0d805b; font-weight: 600; }
.job-description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 11px 0 0; color: #68768b; font-size: 12px; line-height: 1.75; overflow-wrap: anywhere; }
.job-skills { display: flex; flex-wrap: wrap; gap: 5px; margin-block: 12px; }
.job-skills span { max-width: 100%; padding: 3px 7px; border-radius: 5px; background: #f2f6fb; font-size: 10px; font-weight: 600; color: #59708d; overflow-wrap: anywhere; }
.company-job__footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; padding-top: 14px; }
.company-job__footer > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: #7c8ca3; }
.job-link { display: inline-flex; align-items: center; justify-content: center; gap: 5px; flex-shrink: 0; min-height: 33px; padding: 7px 10px; border-radius: 6px; background: #edf6ff; color: #086cca; font-size: 11px; font-weight: 700; transition: color .2s, background .2s; }
.job-link:hover { color: white; background: var(--company-blue); }
.company-show-jobs { display: flex; width: 100%; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; padding: 10px 16px; border: 1px solid #dcecff; border-radius: 8px; background: #f7fbff; color: #0875db; font-size: 12px; font-weight: 700; transition: background .2s; }
.company-show-jobs:hover { background: #eaf4ff; }
.company-sidebar .company-panel { padding: 18px; }
.company-sidebar .section-heading h2 { font-size: 14px; }
.company-summary { margin: 12px 0 0; }
.company-summary > div { display: grid; grid-template-columns: minmax(80px, .65fr) minmax(0, 1fr); align-items: start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #edf1f7; font-size: 12px; line-height: 1.6; }
.company-summary > div:last-child { padding-bottom: 0; border: 0; }
.company-summary dt { color: var(--company-muted); font-weight: 400; }
.company-summary dd { margin: 0; text-align: right; font-weight: 500; color: #3e526f; overflow-wrap: anywhere; }
.section-caption { margin: 10px 0 0; font-size: 11px; line-height: 1.7; color: #7b889c; }
.company-skills { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin-top: 12px; }
.company-skills > span { display: flex; align-items: center; justify-content: center; padding: 6px; border: 1px solid #e0edfd; border-radius: 7px; background: #f7fbff; color: #0766c2; text-align: center; font-size: 11px; line-height: 1.5; font-weight: 500; overflow-wrap: anywhere; }
.company-photo { display: block; width: 100%; aspect-ratio: 16 / 9; margin-top: 14px; border-radius: 8px; background: #f1f5f9; object-fit: cover; }
.company-note { border-color: #eee9da; background: linear-gradient(135deg, #fffdf5, white); }
.company-note .section-icon { color: #df9b04; }
.company-note p { margin: 10px 0 0; color: #787468; font-size: 12px; line-height: 1.8; }
.company-empty { padding: 30px 14px; margin-top: 16px; border: 1px dashed #dbe5f1; border-radius: 10px; background: #fafcff; text-align: center; color: #9aabc2; }
.company-empty h3 { margin: 12px 0 0; font-size: 14px; font-weight: 700; color: #4a5c74; }
.company-empty p { max-width: 340px; margin: 7px auto 14px; font-size: 12px; line-height: 1.8; color: var(--company-muted); }
.company-text-link { display: inline-flex; align-items: center; gap: 6px; color: #0875db; font-size: 12px; font-weight: 700; }
.company-text-link:hover { text-decoration: underline; }
.company-error { max-width: 640px; padding-block: 90px; text-align: center; }
.company-error h1 { margin-top: 18px; font-size: 24px; font-weight: 800; }
.company-error p { margin-block: 12px 24px; color: var(--company-muted); font-size: 14px; line-height: 1.8; }
@media (min-width: 1320px) {
  .company-highlights { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .company-highlight { flex-direction: column; }
}
@media (max-width: 1099px) {
  .company-hero__inner { grid-template-columns: minmax(0, 1fr) 310px; gap: 26px; }
  .company-logo { flex-basis: 84px; width: 84px; height: 84px; }
  .company-identity { gap: 16px; }
  .company-layout { grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr); gap: 16px; }
  .company-panel { padding: 17px; }
  .company-tabs { gap: 0; padding-inline: 4px; }
  .company-tabs a { padding-inline: 12px; }
  .company-jobs { grid-template-columns: minmax(0, 1fr); }
  .company-skills { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 767px) {
  .company-container { padding-inline: 16px; }
  .company-hero__inner { grid-template-columns: minmax(0, 1fr); gap: 24px; padding-block: 22px 42px; }
  .company-name-row h1 { font-size: 27px; }
  .company-logo { flex-basis: 72px; width: 72px; height: 72px; border-radius: 14px; font-size: 23px; }
  .company-intro { font-size: 12px; }
  .company-facts { gap: 8px 14px; font-size: 11px; }
  .company-hero__actions { gap: 8px; }
  .company-button { padding-inline: 13px; font-size: 12px; }
  .company-stats { padding: 16px; }
  .company-stats h2 { margin-bottom: 12px; }
  .company-stats__grid > div { display: grid; grid-template-columns: 36px auto; align-items: center; justify-content: center; gap: 2px 10px; text-align: left; }
  .stat-icon { grid-row: span 2; width: 36px; height: 36px; margin-bottom: 0; }
  .company-stats__grid strong { font-size: 25px; }
  .company-stats__grid > div > span:last-child { font-size: 10px; }
  .company-stats__footer { margin-top: 14px; padding-top: 12px; }
  .company-layout { grid-template-columns: minmax(0, 1fr); }
  .company-tabs { min-height: 49px; }
  .company-tabs a { padding-inline: 13px; font-size: 11px; }
  .company-sidebar { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
  .company-jobs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 539px) {
  .company-container { padding-inline: 14px; }
  .company-name-row { gap: 8px; }
  .company-name-row h1 { font-size: 23px; }
  .company-verified { width: 25px; height: 25px; border-radius: 7px; }
  .company-jobs, .company-sidebar { grid-template-columns: minmax(0, 1fr); }
  .company-panel { padding: 16px; }
  .company-highlight { flex-direction: column; padding: 12px; }
  .company-skills { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .company-button { flex: 1 1 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .company-page *, .company-page *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
</style>
