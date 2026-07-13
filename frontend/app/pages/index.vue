<template>
  <div class="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-slate-950">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center">
          <img src="/images/brand/quickwork-wordmark-transparent.png" alt="QuickWork" class="h-10 w-auto object-contain">
        </NuxtLink>

        <div class="hidden items-center gap-8 text-sm font-bold text-slate-700 md:flex">
          <a href="#jobs" class="text-emerald-700">Việc làm</a>
          <a href="#companies" class="transition-colors hover:text-emerald-700">Công ty</a>
          <a href="#salary" class="transition-colors hover:text-emerald-700">Mức lương</a>
          <button type="button" class="transition-colors hover:text-emerald-700" @click="notifyDevelopment('Blog tuyển dụng')">Blog</button>
          <a href="#explore" class="transition-colors hover:text-emerald-700">Khám phá</a>
        </div>

        <div class="hidden items-center gap-3 md:flex">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            @click="notifyDevelopment('Danh sách việc đã lưu')"
          >
            <Icon name="uil:heart" class="h-5 w-5" />
            Đã lưu
          </button>
          <NuxtLink to="/auth/login" class="rounded-lg px-4 py-2 text-sm font-black text-slate-800 transition-colors hover:bg-slate-100">
            Đăng nhập
          </NuxtLink>
          <NuxtLink to="/auth/register" class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 shadow-sm transition-colors hover:bg-emerald-400">
            Đăng ký
          </NuxtLink>
        </div>

        <button type="button" class="rounded-lg p-2 text-slate-700 md:hidden" aria-label="Mở menu" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <Icon name="uil:bars" class="h-6 w-6" />
        </button>
      </nav>

      <div v-if="isMobileMenuOpen" class="border-t border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 md:hidden">
        <div class="space-y-1">
          <a href="#jobs" class="block rounded-lg px-3 py-2 text-emerald-700" @click="isMobileMenuOpen = false">Việc làm</a>
          <a href="#companies" class="block rounded-lg px-3 py-2 hover:bg-slate-50" @click="isMobileMenuOpen = false">Công ty</a>
          <a href="#salary" class="block rounded-lg px-3 py-2 hover:bg-slate-50" @click="isMobileMenuOpen = false">Mức lương</a>
          <a href="#explore" class="block rounded-lg px-3 py-2 hover:bg-slate-50" @click="isMobileMenuOpen = false">Khám phá</a>
          <div class="grid grid-cols-2 gap-3 pt-3">
            <NuxtLink to="/auth/login" class="rounded-lg bg-slate-100 px-3 py-2 text-center font-bold">Đăng nhập</NuxtLink>
            <NuxtLink to="/auth/register" class="rounded-lg bg-emerald-500 px-3 py-2 text-center font-bold text-slate-950">Đăng ký</NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <main>
      <section class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950 pt-28 text-white sm:pt-32">
        <img
          src="/images/quickwork-career-hero.png"
          alt="Sinh viên tham gia ngày hội tuyển dụng"
          class="absolute inset-0 h-full w-full object-cover opacity-25"
        >
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-emerald-950/70"></div>
        <div class="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl"></div>

        <div class="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div class="max-w-4xl">
            <div class="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-100">
              <Icon name="uil:shield-check" class="h-4 w-4" />
              Doanh nghiệp xác thực, việc làm chọn lọc
            </div>

            <h1 class="mt-8 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Tìm công việc phù hợp với kỹ năng của bạn
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">
              Khám phá cơ hội thực tập, part-time và junior job từ các công ty đã xác thực trên QuickWork.
            </p>

            <form
              class="mt-8 grid max-w-5xl gap-3 rounded-xl border border-white/20 bg-white p-3 text-slate-900 shadow-2xl shadow-slate-950/25 lg:grid-cols-[1.35fr_0.75fr_210px_130px]"
              @submit.prevent="notifyDevelopment('Tìm kiếm việc làm')"
            >
              <label class="flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-4">
                <Icon name="uil:search" class="h-5 w-5 shrink-0 text-emerald-600" />
                <input
                  v-model="heroSearch.keyword"
                  type="text"
                  placeholder="Vị trí, kỹ năng, công ty"
                  class="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                >
              </label>
              <label class="flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-4">
                <Icon name="uil:map-marker" class="h-5 w-5 shrink-0 text-emerald-600" />
                <input
                  v-model="heroSearch.location"
                  type="text"
                  placeholder="Địa điểm"
                  class="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                >
              </label>
              <label class="flex h-12 items-center gap-3 rounded-lg border border-slate-200 px-4">
                <Icon name="uil:briefcase-alt" class="h-5 w-5 shrink-0 text-emerald-600" />
                <select v-model="heroSearch.type" class="w-full bg-transparent text-sm font-black outline-none">
                  <option>Tất cả loại hình</option>
                  <option>Toàn thời gian</option>
                  <option>Bán thời gian</option>
                  <option>Thực tập</option>
                  <option>Remote</option>
                </select>
              </label>
              <button
                type="submit"
                class="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-500 px-5 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Tìm kiếm
              </button>
            </form>

            <div class="mt-6 flex flex-wrap gap-3 text-sm">
              <button
                v-for="tag in trendingKeywords"
                :key="tag"
                type="button"
                class="rounded-full bg-white/90 px-4 py-2 font-black text-slate-950 transition-colors hover:bg-emerald-100"
                @click="setHeroKeyword(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="relative -mt-10 bg-transparent px-4 sm:px-6 lg:px-8">
        <div class="mx-auto grid max-w-7xl gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="stat in platformStats" :key="stat.label" class="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <span :class="['flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', stat.iconClass]">
              <Icon :name="stat.icon" class="h-5 w-5" />
            </span>
            <div>
              <p class="text-2xl font-black text-slate-950">{{ stat.value }}</p>
              <p class="text-xs font-black uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="jobs" class="bg-white py-20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Gợi ý hôm nay</p>
              <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Việc làm nổi bật cho sinh viên</h2>
              <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Card việc làm ưu tiên đúng thông tin ứng viên cần: công ty, lương, địa điểm, kỹ năng, độ phù hợp và hành động ứng tuyển.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-800 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              @click="notifyDevelopment('Tải CV để ứng tuyển')"
            >
              <Icon name="uil:file-upload-alt" class="h-5 w-5 text-emerald-600" />
              Tải CV để ứng tuyển
            </button>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <button
              v-for="category in jobCategories"
              :key="category"
              type="button"
              :class="[
                'rounded-full border px-4 py-2 text-sm font-black transition-colors',
                activeCategory === category
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
              ]"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>

          <div class="mt-8 grid gap-5 lg:grid-cols-3">
            <article
              v-for="job in filteredJobs"
              :key="job.id"
              class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex min-w-0 gap-3">
                  <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white', job.logoClass]">
                    {{ job.logo }}
                  </span>
                  <div class="min-w-0">
                    <h3 class="text-base font-black leading-6 text-emerald-700">{{ job.title }}</h3>
                    <p class="mt-1 truncate text-sm font-semibold text-slate-700">{{ job.company }}</p>
                  </div>
                </div>
                <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">{{ job.badge }}</span>
              </div>

              <p class="mt-4 min-h-[72px] text-sm leading-6 text-slate-600">{{ job.description }}</p>

              <div class="mt-5 grid gap-2 text-sm font-bold text-slate-600">
                <div class="flex items-center gap-2">
                  <Icon name="uil:money-bill" class="h-4 w-4 text-emerald-600" />
                  {{ job.salary }}
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="uil:map-marker" class="h-4 w-4 text-emerald-600" />
                  {{ job.location }}
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="uil:clock" class="h-4 w-4 text-emerald-600" />
                  {{ job.type }}
                </div>
              </div>

              <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Đang tuyển</p>
                  <p class="text-lg font-black text-emerald-700">{{ job.slots }} vị trí</p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-400"
                  @click="notifyDevelopment('Ứng tuyển việc làm')"
                >
                  Ứng tuyển
                  <Icon name="uil:arrow-right" class="h-4 w-4" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="explore" class="border-y border-slate-200 bg-slate-50 py-20">
        <div class="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div class="space-y-4">
            <p class="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Khám phá nhanh</p>
            <h2 class="text-3xl font-black tracking-tight text-slate-950">Ngành nghề và kỹ năng đang tuyển</h2>
            <p class="text-sm leading-7 text-slate-600">
              QuickWork đưa nhóm kỹ năng lên sớm để sinh viên dễ tìm đúng cơ hội, giống cách các job board lớn dùng keyword trend.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div v-for="category in skillCategories" :key="category.title" class="rounded-lg border border-slate-200 bg-white p-5">
              <div class="flex items-center justify-between gap-3">
                <span :class="['flex h-11 w-11 items-center justify-center rounded-lg', category.iconClass]">
                  <Icon :name="category.icon" class="h-5 w-5" />
                </span>
                <span class="text-sm font-black text-slate-400">{{ category.count }} việc</span>
              </div>
              <h3 class="mt-4 text-base font-black text-slate-950">{{ category.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ category.description }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span v-for="skill in category.skills" :key="skill" class="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{{ skill }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="companies" class="bg-white py-20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div class="space-y-4">
              <p class="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Doanh nghiệp xác thực</p>
              <h2 class="text-3xl font-black tracking-tight text-slate-950">Tạo niềm tin trước khi sinh viên ứng tuyển</h2>
              <p class="text-sm leading-7 text-slate-600">
                Công ty, số vị trí mở và trạng thái xác thực cần xuất hiện rõ để sinh viên biết đây là cơ hội đáng tin.
              </p>
              <div class="grid gap-3 sm:grid-cols-2">
                <div v-for="point in trustPoints" :key="point.title" class="rounded-lg border border-slate-200 p-4">
                  <Icon :name="point.icon" class="h-6 w-6 text-emerald-600" />
                  <h3 class="mt-3 text-sm font-black text-slate-950">{{ point.title }}</h3>
                  <p class="mt-1 text-xs leading-5 text-slate-500">{{ point.description }}</p>
                </div>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <article v-for="company in featuredCompanies" :key="company.name" class="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div class="flex items-center gap-3">
                  <span :class="['flex h-12 w-12 items-center justify-center rounded-lg text-sm font-black text-white', company.logoClass]">{{ company.logo }}</span>
                  <div>
                    <h3 class="font-black text-slate-950">{{ company.name }}</h3>
                    <p class="text-sm font-bold text-emerald-700">{{ company.openJobs }} việc đang mở</p>
                  </div>
                </div>
                <p class="mt-4 text-sm leading-6 text-slate-600">{{ company.description }}</p>
                <div class="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                  <Icon name="uil:shield-check" class="h-4 w-4 text-emerald-600" />
                  KYB đã xác thực
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="salary" class="bg-slate-950 py-20 text-white">
        <div class="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div class="max-w-2xl space-y-4">
            <p class="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Bắt đầu</p>
            <h2 class="text-3xl font-black tracking-tight sm:text-4xl">Sinh viên tìm việc, doanh nghiệp đăng tuyển trong cùng một hệ thống</h2>
            <p class="text-sm leading-7 text-slate-300">
              Đăng ký để lưu hồ sơ, ứng tuyển nhanh và theo dõi trạng thái tuyển dụng từ các doanh nghiệp đã kiểm duyệt.
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <NuxtLink :to="{ path: '/auth/register', query: { role: 'student' } }" class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-400">
              <Icon name="uil:graduation-cap" class="h-5 w-5" />
              Tôi là sinh viên
            </NuxtLink>
            <NuxtLink :to="{ path: '/auth/register', query: { role: 'enterprise' } }" class="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-white/10">
              <Icon name="uil:building" class="h-5 w-5" />
              Tôi là nhà tuyển dụng
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div class="space-y-3 md:col-span-2">
          <div class="flex items-center">
            <img src="/images/brand/quickwork-logo-dark-banner.png" alt="QuickWork" class="h-14 w-auto rounded-lg object-contain">
          </div>
          <p class="max-w-md text-sm leading-7">
            Nền tảng tuyển dụng dành cho sinh viên, thực tập sinh và doanh nghiệp cần nguồn nhân lực trẻ đã xác thực.
          </p>
        </div>
        <div>
          <h3 class="text-sm font-black text-white">Sản phẩm</h3>
          <div class="mt-3 space-y-2 text-sm">
            <a href="#jobs" class="block hover:text-white">Việc làm</a>
            <a href="#explore" class="block hover:text-white">Ngành nghề</a>
            <a href="#companies" class="block hover:text-white">Công ty</a>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-black text-white">Liên hệ</h3>
          <div class="mt-3 space-y-2 text-sm">
            <p>support@quickwork.vn</p>
            <p>Hà Nội, Việt Nam</p>
            <p>1900 1234</p>
          </div>
        </div>
      </div>
      <div class="mx-auto mt-8 max-w-7xl px-4 text-xs font-semibold text-slate-500 sm:px-6 lg:px-8">
        © 2026 QuickWork. Kết nối cơ hội việc làm chất lượng cho sinh viên Việt Nam.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'
import { type ApiJob, type DisplayJob, mapJobForDisplay } from '~/utils/jobDisplay'

definePageMeta({
  layout: false
})

const toast = useToast()
const isMobileMenuOpen = ref(false)
const activeCategory = ref('Tất cả')
const isJobsLoading = ref(true)
const jobs = ref<DisplayJob[]>([])
const heroSearch = ref({
  keyword: '',
  location: '',
  type: 'Tất cả loại hình'
})

const platformStats = computed(() => [
  { label: 'Việc đang mở', value: formatCount(jobs.value.length), icon: 'uil:briefcase-alt', iconClass: 'bg-emerald-50 text-emerald-700' },
  { label: 'Doanh nghiệp đang tuyển', value: formatCount(uniqueValues(jobs.value.map((job) => job.company)).length), icon: 'uil:building', iconClass: 'bg-emerald-50 text-emerald-700' },
  { label: 'Kỹ năng trong tin', value: formatCount(uniqueValues(jobs.value.flatMap((job) => job.skills)).length), icon: 'uil:graduation-cap', iconClass: 'bg-teal-50 text-teal-700' },
  { label: 'Địa điểm tuyển', value: formatCount(uniqueValues(jobs.value.map((job) => job.location)).length), icon: 'uil:map-marker', iconClass: 'bg-slate-100 text-slate-700' }
])

const trendingKeywords = computed(() => uniqueValues(jobs.value.flatMap((job) => [job.type, job.category, ...job.skills])).slice(0, 6))
const jobCategories = computed(() => ['Tất cả', ...uniqueValues(jobs.value.flatMap((job) => [job.type, job.category])).slice(0, 8)])

const skillCategories = computed(() => {
  const groups = new Map<string, DisplayJob[]>()
  for (const job of jobs.value) {
    groups.set(job.category, [...(groups.get(job.category) || []), job])
  }

  return Array.from(groups.entries()).map(([title, group], index) => ({
    title,
    count: group.length,
    icon: getCategoryIcon(title),
    iconClass: index % 2 === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-teal-50 text-teal-700',
    description: `Có ${group.length.toLocaleString('vi-VN')} tin đang mở từ dữ liệu tuyển dụng đã duyệt.`,
    skills: uniqueValues(group.flatMap((job) => job.skills)).slice(0, 4)
  }))
})

const featuredCompanies = computed(() => {
  const companies = new Map<string, DisplayJob[]>()
  for (const job of jobs.value) {
    companies.set(job.company, [...(companies.get(job.company) || []), job])
  }

  return Array.from(companies.entries()).map(([name, companyJobs], index) => ({
    name,
    logo: companyJobs[0]?.logo || 'QW',
    logoClass: companyJobs[0]?.logoClass || 'bg-emerald-600',
    openJobs: companyJobs.length,
    description: `Đang tuyển ${companyJobs.map((job) => job.title).slice(0, 2).join(', ')}${companyJobs.length > 2 ? '...' : '.'}`
  })).slice(0, 4)
})

const trustPoints = [
  { title: 'Doanh nghiệp có KYB', description: 'Hồ sơ công ty được admin kiểm duyệt trước khi đăng tuyển.', icon: 'uil:shield-check' },
  { title: 'Tin tuyển dụng rõ ràng', description: 'Card việc làm ưu tiên lương, địa điểm, loại hình và kỹ năng.', icon: 'uil:list-ui-alt' },
  { title: 'Ứng tuyển nhanh', description: 'Sinh viên có thể dùng CV đã lưu để gửi hồ sơ trong một bước.', icon: 'uil:bolt' },
  { title: 'Theo dõi trạng thái', description: 'Luồng sinh viên nên thấy việc đã lưu, đã ứng tuyển và lời mời.', icon: 'uil:bell' }
]

const filteredJobs = computed(() => {
  const keyword = heroSearch.value.keyword.trim().toLowerCase()
  const location = heroSearch.value.location.trim().toLowerCase()
  const selectedType = heroSearch.value.type

  return jobs.value.filter((job) => {
    const matchesCategory = activeCategory.value === 'Tất cả' || job.type === activeCategory.value || job.category === activeCategory.value
    const matchesKeyword = !keyword || [job.title, job.company, job.description, job.location, job.type, job.category, job.salary, ...job.skills].join(' ').toLowerCase().includes(keyword)
    const matchesLocation = !location || job.location.toLowerCase().includes(location)
    const matchesType = selectedType === 'Tất cả loại hình' || job.type === selectedType
    return matchesCategory && matchesKeyword && matchesLocation && matchesType
  })
})

function setHeroKeyword(tag: string) {
  heroSearch.value.keyword = tag
}

function notifyDevelopment(feature: string) {
  toast.info('Tính năng đang phát triển', `${feature} sẽ được kết nối khi backend sẵn sàng.`)
}

function formatCount(value: number) {
  return value.toLocaleString('vi-VN')
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function getCategoryIcon(category: string) {
  if (category === 'Marketing') return 'uil:megaphone'
  if (category === 'Kinh doanh') return 'uil:chart-growth'
  if (category === 'Thiết kế') return 'uil:palette'
  return 'uil:brackets-curly'
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

onMounted(loadPublicJobs)
</script>
