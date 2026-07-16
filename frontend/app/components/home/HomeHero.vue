<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/80">
    <div class="absolute left-[8%] top-24 hidden h-28 w-28 rounded-full border border-sky-100 bg-sky-50/70 lg:block" aria-hidden="true" />
    <div class="absolute right-[8%] top-20 hidden h-48 w-48 rounded-full bg-blue-100/45 lg:block" aria-hidden="true" />

    <div class="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.03fr)_minmax(420px,0.97fr)] lg:px-8 lg:py-20">
      <div class="relative z-10 min-w-0">
        <p class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">
          <Icon name="uil:shield-check" class="h-4 w-4" aria-hidden="true" />
          Nền tảng tuyển dụng đáng tin cậy
        </p>

        <h1 class="mt-7 max-w-[700px] text-[42px] font-extrabold leading-[1.08] text-slate-950 sm:text-[52px] lg:text-[56px]">
          Tìm công việc phù hợp,
          <span class="text-sky-600">phát triển</span>
          sự nghiệp của bạn
        </h1>

        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          QuickWork kết nối bạn với các cơ hội việc làm đang có trong hệ thống, từ những doanh nghiệp đã đăng tuyển trên nền tảng.
        </p>

        <div class="mt-8">
          <HomeSearchBar
            :model-value="search"
            :job-type-options="jobTypeOptions"
            @update:model-value="$emit('update:search', $event)"
            @submit="$emit('submit')"
          />
        </div>

        <div v-if="trendingKeywords.length" class="mt-6 flex flex-wrap items-center gap-3">
          <span class="text-sm font-bold text-slate-700">Từ khóa phổ biến:</span>
          <button
            v-for="keyword in trendingKeywords"
            :key="keyword"
            type="button"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
            @click="$emit('keyword', keyword)"
          >
            {{ keyword }}
          </button>
        </div>
      </div>

      <div class="relative z-0 min-w-0">
        <div class="absolute -left-8 top-10 h-24 w-24 rounded-full bg-sky-100/70" aria-hidden="true" />
        <div class="absolute -right-4 bottom-12 h-20 w-20 rounded-full bg-blue-100/80" aria-hidden="true" />
        <div class="relative overflow-hidden rounded-[32px] border border-white bg-white shadow-2xl shadow-slate-200/70">
          <img
            src="/images/quickwork-hero-panel-team.png"
            alt="Ứng viên trẻ trao đổi công việc trong không gian văn phòng sáng"
            class="aspect-[5/4] w-full object-cover"
            width="720"
            height="576"
            fetchpriority="high"
          >
          <div class="absolute inset-0 bg-gradient-to-tr from-sky-950/10 via-transparent to-blue-50/25" aria-hidden="true" />
        </div>

        <div class="absolute -left-5 bottom-8 hidden rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/70 sm:block">
          <p class="text-xs font-bold text-slate-500">Việc làm đang tuyển</p>
          <p class="mt-1 text-2xl font-extrabold text-slate-950">{{ totalJobs.toLocaleString('vi-VN') }}</p>
        </div>

        <div class="absolute -right-5 top-14 hidden rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/70 sm:block">
          <p class="text-xs font-bold text-slate-500">Doanh nghiệp</p>
          <p class="mt-1 text-2xl font-extrabold text-slate-950">{{ companyCount.toLocaleString('vi-VN') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomeSearchState } from '~/composables/useHomeJobs'
import HomeSearchBar from '~/components/home/HomeSearchBar.vue'

defineProps<{
  search: HomeSearchState
  jobTypeOptions: string[]
  trendingKeywords: string[]
  totalJobs: number
  companyCount: number
}>()

defineEmits<{
  'update:search': [value: HomeSearchState]
  submit: []
  keyword: [keyword: string]
}>()
</script>
