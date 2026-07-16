# QuickWork Homepage UI Code

Updated: 2026-07-14

This document contains the current public homepage UI source after the component refactor. API contracts, auth logic, and backend routes are intentionally omitted.

## `frontend/app/pages/index.vue`

`$lang
<template>
  <HomeLandingPage />
</template>

<script setup lang="ts">
import HomeLandingPage from '~/components/HomeLandingPage.vue'

definePageMeta({
  layout: false
})
</script>
```

## `frontend/app/components/FooterBrandMark.vue`

`$lang
<template>
  <NuxtLink
    to="/"
    :class="[
      'inline-flex items-center rounded-2xl bg-white shadow-sm ring-1 ring-white/10 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40',
      compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
    ]"
    aria-label="QuickWork - vá» trang chá»§"
  >
    <img
      src="/images/brand/quickwork-wordmark-transparent.png"
      alt="QuickWork"
      :class="compact ? 'h-8 w-auto object-contain' : 'h-10 w-auto object-contain'"
    >
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false
})
</script>
```

## `frontend/app/components/HomeLandingPage.vue`

`$lang
<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-950">
    <HomeHeader @notify="notifyDevelopment" />

    <main>
      <HomeHero
        v-model:search="homeSearch"
        :job-type-options="jobTypeOptions"
        :trending-keywords="trendingKeywords"
        :total-jobs="jobs.length"
        :company-count="companyCount"
        @submit="scrollToJobs"
        @keyword="handleKeyword"
      />

      <HomeQuickStats :stats="quickStats" />

      <HomeFeaturedJobs
        :jobs="bestJobs"
        :categories="jobCategories"
        :active-category="activeCategory"
        :loading="isJobsLoading"
        @category="handleCategory"
        @reset="handleReset"
        @save="handleSaveJob"
        @detail="handleJobDetail"
      />

      <HomeCategories
        :categories="categoryStats"
        :loading="isJobsLoading"
        @select="handleCategory"
      />

      <HomeEmployerCta
        :companies="featuredCompanies"
        @secondary="notifyDevelopment('Giáº£i phÃ¡p tuyá»ƒn dá»¥ng')"
      />

      <HomeCareerCta />
    </main>

    <HomeFooter @notify="notifyDevelopment" />
  </div>
</template>

<script setup lang="ts">
import type { DisplayJob } from '~/utils/jobDisplay'
import HomeCareerCta from '~/components/home/HomeCareerCta.vue'
import HomeCategories from '~/components/home/HomeCategories.vue'
import HomeEmployerCta from '~/components/home/HomeEmployerCta.vue'
import HomeFeaturedJobs from '~/components/home/HomeFeaturedJobs.vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeHeader from '~/components/home/HomeHeader.vue'
import HomeHero from '~/components/home/HomeHero.vue'
import HomeQuickStats from '~/components/home/HomeQuickStats.vue'
import { useHomeJobs } from '~/composables/useHomeJobs'

const {
  activeCategory,
  bestJobs,
  categoryStats,
  companyCount,
  featuredCompanies,
  homeSearch,
  isJobsLoading,
  jobCategories,
  jobTypeOptions,
  jobs,
  quickStats,
  resetSearch,
  setCategory,
  setHeroKeyword,
  trendingKeywords,
  notifyDevelopment
} = useHomeJobs()

function scrollToJobs() {
  document.getElementById('featured-jobs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleKeyword(keyword: string) {
  setHeroKeyword(keyword)
  scrollToJobs()
}

function handleCategory(category: string) {
  setCategory(category)
  scrollToJobs()
}

function handleReset() {
  resetSearch()
  scrollToJobs()
}

function handleSaveJob(job: DisplayJob) {
  notifyDevelopment(`LÆ°u viá»‡c ${job.title}`)
}

function handleJobDetail(job: DisplayJob) {
  notifyDevelopment(`Chi tiáº¿t viá»‡c ${job.title}`)
}
</script>
```

## `frontend/app/components/HomeJobCard.vue`

`$lang
<template>
  <article
    class="group flex min-h-[292px] cursor-pointer flex-col rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/45 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
    role="button"
    tabindex="0"
    :aria-label="`Xem chi tiáº¿t viá»‡c ${job.title}`"
    @click="emitDetail"
    @keydown.enter="emitDetail"
    @keydown.space.prevent="emitDetail"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 items-center gap-3">
        <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm', job.logoClass]">
          {{ job.logo }}
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-slate-950">{{ job.company }}</p>
          <p class="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{{ job.badge }}</p>
        </div>
      </div>
      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
        :aria-label="`LÆ°u viá»‡c ${job.title}`"
        @click.stop="$emit('save', job)"
      >
        <Icon name="uil:bookmark" class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <h3 class="mt-5 line-clamp-2 min-h-[56px] text-xl font-extrabold leading-7 text-slate-950">
      {{ job.title }}
    </h3>
    <p class="mt-3 text-lg font-extrabold text-emerald-700">{{ job.salary }}</p>

    <div class="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
      <span class="inline-flex items-center gap-1.5">
        <Icon name="uil:map-marker" class="h-4 w-4 text-slate-400" aria-hidden="true" />
        {{ job.location }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <Icon name="uil:briefcase-alt" class="h-4 w-4 text-slate-400" aria-hidden="true" />
        {{ job.type }}
      </span>
    </div>

    <div v-if="visibleSkills.length" class="mt-5 flex flex-wrap gap-2">
      <span v-for="skill in visibleSkills" :key="skill" class="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
        {{ skill }}
      </span>
    </div>

    <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
      <span class="text-sm font-bold text-slate-500">{{ job.slots }} vá»‹ trÃ­</span>
      <span class="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
        Xem chi tiáº¿t
        <Icon name="uil:arrow-right" class="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DisplayJob } from '~/utils/jobDisplay'

const props = defineProps<{
  job: DisplayJob
}>()

const emit = defineEmits<{
  save: [job: DisplayJob]
  detail: [job: DisplayJob]
}>()

const visibleSkills = computed(() => props.job.skills.slice(0, 2))

function emitDetail() {
  emit('detail', props.job)
}
</script>
```

## `frontend/app/components/HomeCategoryCard.vue`

`$lang
<template>
  <button
    type="button"
    class="group min-h-[132px] rounded-[22px] border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/45 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-200/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
    :aria-label="`Xem viá»‡c lÃ m ngÃ nh ${title}`"
    @click="$emit('select', title)"
  >
    <span class="flex items-start justify-between gap-4">
      <span :class="['flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105', iconClass]">
        <Icon :name="icon" class="h-7 w-7" aria-hidden="true" />
      </span>
      <span v-if="isHighDemand" class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        Nhu cáº§u cao
      </span>
    </span>

    <span class="mt-5 block text-lg font-extrabold text-slate-950">{{ title }}</span>
    <span class="mt-2 block text-sm font-semibold text-slate-500">{{ countLabel }}</span>
    <span class="mt-4 block h-2 overflow-hidden rounded-full bg-slate-100">
      <span class="block h-full rounded-full bg-emerald-500" :style="{ width: `${percent}%` }" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  count: number
  slots?: number
  percent?: number
  icon: string
  iconClass: string
}>(), {
  slots: 0,
  percent: 16
})

defineEmits<{
  select: [title: string]
}>()

const countLabel = computed(() => {
  const count = `${props.count.toLocaleString('vi-VN')} viá»‡c lÃ m`
  if (!props.slots) return count
  return `${count} Â· ${props.slots.toLocaleString('vi-VN')} vá»‹ trÃ­`
})

const isHighDemand = computed(() => props.percent >= 70)
</script>
```

## `frontend/app/components/home/HomeHeader.vue`

`$lang
<template>
  <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex h-[74px] max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
      <AuthBrandMark />

      <nav class="hidden items-center gap-7 lg:flex" aria-label="Äiá»u hÆ°á»›ng chÃ­nh">
        <template v-for="item in navItems" :key="item.label">
          <a
            v-if="item.href"
            :href="item.href"
            class="text-sm font-bold text-slate-800 transition hover:text-emerald-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-emerald-100"
          >
            {{ item.label }}
          </a>
          <button
            v-else
            type="button"
            class="text-sm font-bold text-slate-800 transition hover:text-emerald-700 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-emerald-100"
            @click="$emit('notify', item.label)"
          >
            {{ item.label }}
          </button>
        </template>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <button
          type="button"
          class="inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          @click="$emit('notify', 'Viá»‡c Ä‘Ã£ lÆ°u')"
        >
          <Icon name="uil:heart" class="h-5 w-5" aria-hidden="true" />
          ÄÃ£ lÆ°u
        </button>
        <NuxtLink
          to="/login"
          class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
        >
          ÄÄƒng nháº­p
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
        >
          ÄÄƒng kÃ½
        </NuxtLink>
      </div>

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-800 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 lg:hidden"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="home-mobile-menu"
        aria-label="Má»Ÿ menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Icon :name="isMobileMenuOpen ? 'uil:times' : 'uil:bars'" class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>

    <div
      v-if="isMobileMenuOpen"
      id="home-mobile-menu"
      class="border-t border-slate-200 bg-white px-4 py-5 shadow-xl shadow-slate-200/40 lg:hidden"
    >
      <nav class="mx-auto grid max-w-[1240px] gap-2" aria-label="Äiá»u hÆ°á»›ng di Ä‘á»™ng">
        <template v-for="item in navItems" :key="item.label">
          <a
            v-if="item.href"
            :href="item.href"
            class="rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </a>
          <button
            v-else
            type="button"
            class="rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
            @click="handleMobileNotify(item.label)"
          >
            {{ item.label }}
          </button>
        </template>
      </nav>

      <div class="mx-auto mt-4 grid max-w-[1240px] gap-3 sm:grid-cols-3">
        <button
          type="button"
          class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          @click="handleMobileNotify('Viá»‡c Ä‘Ã£ lÆ°u')"
        >
          <Icon name="uil:heart" class="h-5 w-5" aria-hidden="true" />
          ÄÃ£ lÆ°u
        </button>
        <NuxtLink to="/login" class="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 text-sm font-bold text-slate-900">
          ÄÄƒng nháº­p
        </NuxtLink>
        <NuxtLink to="/register" class="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
          ÄÄƒng kÃ½
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthBrandMark from '~/components/AuthBrandMark.vue'

const emit = defineEmits<{
  notify: [feature: string]
}>()

const isMobileMenuOpen = ref(false)

const navItems = [
  { label: 'Viá»‡c lÃ m', href: '#featured-jobs' },
  { label: 'CÃ´ng ty', href: '#employer' },
  { label: 'Má»©c lÆ°Æ¡ng', href: '#featured-jobs' },
  { label: 'CÃ´ng cá»¥ nghá» nghiá»‡p', href: '#career-tools' },
  { label: 'Blog' }
]

function handleMobileNotify(feature: string) {
  isMobileMenuOpen.value = false
  emit('notify', feature)
}
</script>
```

## `frontend/app/components/home/HomeHero.vue`

`$lang
<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/80">
    <div class="absolute left-[8%] top-24 hidden h-28 w-28 rounded-full border border-emerald-100 bg-emerald-50/70 lg:block" aria-hidden="true" />
    <div class="absolute right-[8%] top-20 hidden h-48 w-48 rounded-full bg-blue-100/45 lg:block" aria-hidden="true" />

    <div class="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.03fr)_minmax(420px,0.97fr)] lg:px-8 lg:py-20">
      <div class="relative z-10 min-w-0">
        <p class="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
          <Icon name="uil:shield-check" class="h-4 w-4" aria-hidden="true" />
          Ná»n táº£ng tuyá»ƒn dá»¥ng Ä‘Ã¡ng tin cáº­y
        </p>

        <h1 class="mt-7 max-w-[700px] text-[42px] font-extrabold leading-[1.08] text-slate-950 sm:text-[52px] lg:text-[56px]">
          TÃ¬m cÃ´ng viá»‡c phÃ¹ há»£p,
          <span class="text-emerald-600">phÃ¡t triá»ƒn</span>
          sá»± nghiá»‡p cá»§a báº¡n
        </h1>

        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          QuickWork káº¿t ná»‘i báº¡n vá»›i cÃ¡c cÆ¡ há»™i viá»‡c lÃ m Ä‘ang cÃ³ trong há»‡ thá»‘ng, tá»« nhá»¯ng doanh nghiá»‡p Ä‘Ã£ Ä‘Äƒng tuyá»ƒn trÃªn ná»n táº£ng.
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
          <span class="text-sm font-bold text-slate-700">Tá»« khÃ³a phá»• biáº¿n:</span>
          <button
            v-for="keyword in trendingKeywords"
            :key="keyword"
            type="button"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
            @click="$emit('keyword', keyword)"
          >
            {{ keyword }}
          </button>
        </div>
      </div>

      <div class="relative z-0 min-w-0">
        <div class="absolute -left-8 top-10 h-24 w-24 rounded-full bg-emerald-100/70" aria-hidden="true" />
        <div class="absolute -right-4 bottom-12 h-20 w-20 rounded-full bg-blue-100/80" aria-hidden="true" />
        <div class="relative overflow-hidden rounded-[32px] border border-white bg-white shadow-2xl shadow-slate-200/70">
          <img
            src="/images/quickwork-hero-panel-team.png"
            alt="á»¨ng viÃªn tráº» trao Ä‘á»•i cÃ´ng viá»‡c trong khÃ´ng gian vÄƒn phÃ²ng sÃ¡ng"
            class="aspect-[5/4] w-full object-cover"
            width="720"
            height="576"
            fetchpriority="high"
          >
          <div class="absolute inset-0 bg-gradient-to-tr from-emerald-950/10 via-transparent to-blue-50/25" aria-hidden="true" />
        </div>

        <div class="absolute -left-5 bottom-8 hidden rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/70 sm:block">
          <p class="text-xs font-bold text-slate-500">Viá»‡c lÃ m Ä‘ang tuyá»ƒn</p>
          <p class="mt-1 text-2xl font-extrabold text-slate-950">{{ totalJobs.toLocaleString('vi-VN') }}</p>
        </div>

        <div class="absolute -right-5 top-14 hidden rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/70 sm:block">
          <p class="text-xs font-bold text-slate-500">Doanh nghiá»‡p</p>
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
```

## `frontend/app/components/home/HomeSearchBar.vue`

`$lang
<template>
  <form
    class="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/70"
    role="search"
    aria-label="TÃ¬m kiáº¿m viá»‡c lÃ m"
    @submit.prevent="$emit('submit')"
  >
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100">
        <span class="sr-only">Vá»‹ trÃ­, ká»¹ nÄƒng hoáº·c cÃ´ng ty</span>
        <Icon name="uil:search" class="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        <input
          :value="modelValue.keyword"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Vá»‹ trÃ­, ká»¹ nÄƒng, cÃ´ng ty"
          autocomplete="off"
          @input="handleInput('keyword', $event)"
        >
      </label>

      <label class="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100">
        <span class="sr-only">Äá»‹a Ä‘iá»ƒm</span>
        <Icon name="uil:map-marker" class="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        <input
          :value="modelValue.location"
          type="search"
          class="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Äá»‹a Ä‘iá»ƒm"
          autocomplete="off"
          @input="handleInput('location', $event)"
        >
      </label>

      <label class="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-100">
        <span class="sr-only">Loáº¡i hÃ¬nh cÃ´ng viá»‡c</span>
        <Icon name="uil:briefcase-alt" class="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        <select
          :value="modelValue.type"
          class="min-w-0 flex-1 appearance-none bg-transparent text-[15px] font-bold text-slate-900 outline-none"
          aria-label="Loáº¡i hÃ¬nh cÃ´ng viá»‡c"
          @change="handleInput('type', $event)"
        >
          <option v-for="option in jobTypeOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <Icon name="uil:angle-down" class="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
      </label>

      <button
        type="submit"
        class="inline-flex min-h-[56px] min-w-[120px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-emerald-600 px-7 text-[15px] font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
      >
        <Icon name="uil:search" class="h-5 w-5" aria-hidden="true" />
        TÃ¬m kiáº¿m
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { HomeSearchState } from '~/composables/useHomeJobs'

const props = defineProps<{
  modelValue: HomeSearchState
  jobTypeOptions: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HomeSearchState]
  submit: []
}>()

function handleInput(key: keyof HomeSearchState, event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: target.value
  })
}
</script>
```

## `frontend/app/components/home/HomeQuickStats.vue`

`$lang
<template>
  <section class="bg-white">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="-mt-8 grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/55 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="stat in stats"
          :key="stat.label"
          class="grid min-h-[132px] grid-cols-[56px_1fr] items-center gap-5 border-b border-slate-200 p-6 last:border-b-0 sm:[&:nth-child(2n+1)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
        >
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Icon :name="stat.icon" class="h-7 w-7" aria-hidden="true" />
          </span>
          <span class="min-w-0">
            <span class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span class="text-3xl font-extrabold leading-none text-slate-950">{{ stat.value }}</span>
              <span class="text-sm font-extrabold leading-tight text-slate-900">{{ stat.label }}</span>
            </span>
            <span class="mt-2 block text-sm leading-6 text-slate-500">{{ stat.helper }}</span>
          </span>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomeQuickStat } from '~/composables/useHomeJobs'

defineProps<{
  stats: HomeQuickStat[]
}>()
</script>
```

## `frontend/app/components/home/HomeFeaturedJobs.vue`

`$lang
<template>
  <section id="featured-jobs" class="bg-white py-20 sm:py-24">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-bold uppercase text-emerald-700">CÆ¡ há»™i phÃ¹ há»£p</p>
          <h2 class="mt-3 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
            Viá»‡c lÃ m tá»‘t nháº¥t hiá»‡n nay
          </h2>
          <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            CÃ¡c tin Ä‘Æ°á»£c sáº¯p xáº¿p theo sá»‘ vá»‹ trÃ­, má»©c lÆ°Æ¡ng vÃ  Ä‘á»™ má»›i tá»« dá»¯ liá»‡u tuyá»ƒn dá»¥ng tháº­t trong há»‡ thá»‘ng.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-emerald-100"
          @click="$emit('reset')"
        >
          Xem táº¥t cáº£
          <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div v-if="categories.length" class="mt-8 flex gap-3 overflow-x-auto pb-2">
        <button
          v-for="category in visibleCategories"
          :key="category"
          type="button"
          :aria-pressed="activeCategory === category"
          :class="[
            'shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100',
            activeCategory === category
              ? 'border-slate-950 bg-slate-950 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
          ]"
          @click="$emit('category', category)"
        >
          {{ category }}
        </button>
      </div>

      <div v-if="loading" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="item in 6" :key="item" class="h-[292px] animate-pulse rounded-[22px] border border-slate-200 bg-slate-50" />
      </div>

      <div v-else-if="jobs.length" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <HomeJobCard
          v-for="job in jobs"
          :key="job.id"
          :job="job"
          @save="$emit('save', job)"
          @detail="$emit('detail', job)"
        />
      </div>

      <div v-else class="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <Icon name="uil:search" class="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <h3 class="mt-4 text-xl font-extrabold text-slate-950">ChÆ°a tÃ¬m tháº¥y viá»‡c lÃ m phÃ¹ há»£p</h3>
        <p class="mt-2 text-base text-slate-600">Thá»­ Ä‘á»•i tá»« khÃ³a, Ä‘á»‹a Ä‘iá»ƒm hoáº·c nhÃ³m ngÃ nh Ä‘á»ƒ xem thÃªm cÆ¡ há»™i Ä‘ang cÃ³.</p>
        <button
          type="button"
          class="mt-6 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          @click="$emit('reset')"
        >
          XÃ³a bá»™ lá»c
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DisplayJob } from '~/utils/jobDisplay'
import HomeJobCard from '~/components/HomeJobCard.vue'

const props = defineProps<{
  jobs: DisplayJob[]
  categories: string[]
  activeCategory: string
  loading: boolean
}>()

defineEmits<{
  category: [category: string]
  detail: [job: DisplayJob]
  reset: []
  save: [job: DisplayJob]
}>()

const visibleCategories = computed(() => props.categories.slice(0, 6))
</script>
```

## `frontend/app/components/home/HomeCategories.vue`

`$lang
<template>
  <section class="bg-slate-50 py-20 sm:py-24">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-bold uppercase text-emerald-700">NgÃ nh nghá»</p>
          <h2 class="mt-3 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
            Top ngÃ nh nghá» ná»•i báº­t
          </h2>
          <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            NhÃ³m ngÃ nh Ä‘Æ°á»£c tá»•ng há»£p tá»« ká»¹ nÄƒng vÃ  ná»™i dung tin tuyá»ƒn dá»¥ng Ä‘ang hiá»ƒn thá»‹.
          </p>
        </div>

        <a
          href="#featured-jobs"
          class="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-emerald-100"
        >
          Xem viá»‡c lÃ m theo ngÃ nh
          <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
        </a>
      </div>

      <div v-if="loading" class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="item in 8" :key="item" class="h-[132px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />
      </div>

      <div v-else-if="categories.length" class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <HomeCategoryCard
          v-for="category in categories"
          :key="category.title"
          :title="category.title"
          :count="category.count"
          :slots="category.slots"
          :percent="category.percent"
          :icon="category.icon"
          :icon-class="category.iconClass"
          @select="$emit('select', category.title)"
        />
      </div>

      <div v-else class="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
        <Icon name="uil:apps" class="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <p class="mt-4 text-base font-semibold text-slate-600">ChÆ°a cÃ³ dá»¯ liá»‡u ngÃ nh nghá» Ä‘á»ƒ hiá»ƒn thá»‹.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomeCategorySummary } from '~/composables/useHomeJobs'
import HomeCategoryCard from '~/components/HomeCategoryCard.vue'

defineProps<{
  categories: HomeCategorySummary[]
  loading: boolean
}>()

defineEmits<{
  select: [category: string]
}>()
</script>
```

## `frontend/app/components/home/HomeEmployerCta.vue`

`$lang
<template>
  <section id="employer" class="bg-white py-20 sm:py-24">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="grid overflow-hidden rounded-[32px] bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="p-8 sm:p-10 lg:p-12">
          <p class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            <Icon name="uil:building" class="h-4 w-4" aria-hidden="true" />
            DÃ nh cho nhÃ  tuyá»ƒn dá»¥ng
          </p>
          <h2 class="mt-6 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Báº¡n Ä‘ang cáº§n tuyá»ƒn nhÃ¢n sá»± phÃ¹ há»£p?
          </h2>
          <p class="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            ÄÄƒng tin tuyá»ƒn dá»¥ng, quáº£n lÃ½ cÆ¡ há»™i Ä‘ang má»Ÿ vÃ  tiáº¿p cáº­n á»©ng viÃªn tráº» trÃªn QuickWork báº±ng dá»¯ liá»‡u hiá»‡n cÃ³ cá»§a há»‡ thá»‘ng.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              to="/register?role=enterprise"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-bold text-white transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/40"
            >
              ÄÄƒng tin tuyá»ƒn dá»¥ng
              <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
            </NuxtLink>
            <button
              type="button"
              class="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 px-5 text-sm font-bold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              @click="$emit('secondary')"
            >
              TÃ¬m hiá»ƒu giáº£i phÃ¡p
            </button>
          </div>
        </div>

        <div class="border-t border-white/10 bg-white/[0.04] p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
          <p class="text-sm font-bold uppercase text-emerald-300">Doanh nghiá»‡p Ä‘ang tuyá»ƒn</p>
          <div v-if="companies.length" class="mt-5 grid gap-3">
            <article
              v-for="company in companies"
              :key="company.name"
              class="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4"
            >
              <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white', company.logoClass]">
                {{ company.logo }}
              </span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-bold text-white">{{ company.name }}</span>
                <span class="mt-1 block text-sm text-slate-300">{{ company.openJobs }} viá»‡c Ä‘ang má»Ÿ</span>
              </span>
            </article>
          </div>
          <div v-else class="mt-5 rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-sm leading-6 text-slate-300">
            Danh sÃ¡ch doanh nghiá»‡p sáº½ hiá»ƒn thá»‹ khi há»‡ thá»‘ng cÃ³ tin tuyá»ƒn dá»¥ng cÃ´ng khai.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomeCompanySummary } from '~/composables/useHomeJobs'

defineProps<{
  companies: HomeCompanySummary[]
}>()

defineEmits<{
  secondary: []
}>()
</script>
```

## `frontend/app/components/home/HomeCareerCta.vue`

`$lang
<template>
  <section id="career-tools" class="bg-slate-50 py-20 sm:py-24">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8 lg:p-10">
        <div class="mx-auto max-w-3xl text-center">
          <p class="text-sm font-bold uppercase text-emerald-700">Báº¯t Ä‘áº§u vá»›i QuickWork</p>
          <h2 class="mt-3 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
            Báº¡n muá»‘n Ä‘Äƒng nháº­p vá»›i vai trÃ² nÃ o?
          </h2>
          <p class="mt-3 text-base leading-7 text-slate-600">
            Chá»n luá»“ng phÃ¹ há»£p Ä‘á»ƒ tÃ¬m viá»‡c hoáº·c báº¯t Ä‘áº§u tuyá»ƒn dá»¥ng. Trang chá»§ cÃ´ng khai chá»‰ hiá»ƒn thá»‹ hai lá»±a chá»n chÃ­nh.
          </p>
        </div>

        <div class="mt-8 grid gap-5 md:grid-cols-2">
          <NuxtLink
            to="/register?role=student"
            class="group rounded-[24px] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          >
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Icon name="uil:graduation-cap" class="h-8 w-8" aria-hidden="true" />
            </span>
            <span class="mt-5 block text-xl font-extrabold text-slate-950">TÃ´i Ä‘ang tÃ¬m viá»‡c</span>
            <span class="mt-2 block text-base leading-7 text-slate-600">Táº¡o há»“ sÆ¡, khÃ¡m phÃ¡ viá»‡c lÃ m vÃ  lÆ°u cÃ¡c cÆ¡ há»™i phÃ¹ há»£p.</span>
            <span class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
              Táº¡o há»“ sÆ¡ á»©ng viÃªn
              <Icon name="uil:arrow-right" class="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </NuxtLink>

          <NuxtLink
            to="/register?role=enterprise"
            class="group rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white transition hover:-translate-y-1 hover:bg-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          >
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
              <Icon name="uil:building" class="h-8 w-8" aria-hidden="true" />
            </span>
            <span class="mt-5 block text-xl font-extrabold">TÃ´i muá»‘n tuyá»ƒn dá»¥ng</span>
            <span class="mt-2 block text-base leading-7 text-slate-300">ÄÄƒng tin, quáº£n lÃ½ tuyá»ƒn dá»¥ng vÃ  theo dÃµi cÃ¡c vá»‹ trÃ­ Ä‘ang má»Ÿ.</span>
            <span class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-300">
              ÄÄƒng kÃ½ nhÃ  tuyá»ƒn dá»¥ng
              <Icon name="uil:arrow-right" class="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `frontend/app/components/home/HomeFooter.vue`

`$lang
<template>
  <footer class="bg-slate-950 text-white">
    <div class="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1.8fr] lg:px-8">
      <div>
        <FooterBrandMark />
        <p class="mt-3 text-sm font-semibold text-slate-400">Find work. Grow fast.</p>
        <p class="mt-5 max-w-md text-sm leading-7 text-slate-300">
          Ná»n táº£ng tuyá»ƒn dá»¥ng dÃ nh cho á»©ng viÃªn tráº», sinh viÃªn vÃ  doanh nghiá»‡p cáº§n káº¿t ná»‘i nhanh vá»›i cÆ¡ há»™i phÃ¹ há»£p.
        </p>
      </div>

      <div class="grid gap-8 sm:grid-cols-3">
        <div>
          <h3 class="text-sm font-bold text-white">á»¨ng viÃªn</h3>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            <a href="#featured-jobs" class="hover:text-emerald-300">TÃ¬m viá»‡c</a>
            <button type="button" class="text-left hover:text-emerald-300" @click="$emit('notify', 'Viá»‡c Ä‘Ã£ lÆ°u')">Viá»‡c Ä‘Ã£ lÆ°u</button>
            <NuxtLink to="/register?role=student" class="hover:text-emerald-300">Táº¡o há»“ sÆ¡</NuxtLink>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">NhÃ  tuyá»ƒn dá»¥ng</h3>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            <NuxtLink to="/register?role=enterprise" class="hover:text-emerald-300">ÄÄƒng tin</NuxtLink>
            <a href="#employer" class="hover:text-emerald-300">Giáº£i phÃ¡p tuyá»ƒn dá»¥ng</a>
            <button type="button" class="text-left hover:text-emerald-300" @click="$emit('notify', 'Báº£ng giÃ¡')">Báº£ng giÃ¡</button>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">QuickWork</h3>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            <button type="button" class="text-left hover:text-emerald-300" @click="$emit('notify', 'Blog')">Blog</button>
            <button type="button" class="text-left hover:text-emerald-300" @click="$emit('notify', 'Äiá»u khoáº£n')">Äiá»u khoáº£n</button>
            <button type="button" class="text-left hover:text-emerald-300" @click="$emit('notify', 'Báº£o máº­t')">Báº£o máº­t</button>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Â© 2026 QuickWork. All rights reserved.</p>
        <p>Dá»¯ liá»‡u viá»‡c lÃ m hiá»ƒn thá»‹ theo há»‡ thá»‘ng hiá»‡n cÃ³.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import FooterBrandMark from '~/components/FooterBrandMark.vue'

defineEmits<{
  notify: [feature: string]
}>()
</script>
```

## `frontend/app/composables/useHomeJobs.ts`

`$lang
import { computed, onMounted, ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { JobService } from '~/services/job.service'
import { type ApiJob, type DisplayJob, mapJobForDisplay, salaryRank } from '~/utils/jobDisplay'

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

const ALL_CATEGORY = 'Táº¥t cáº£'
const ALL_JOB_TYPES = 'Táº¥t cáº£ loáº¡i hÃ¬nh'

export function useHomeJobs() {
  const toast = useToast()
  const jobs = ref<DisplayJob[]>([])
  const isJobsLoading = ref(true)
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
    const keyword = homeSearch.value.keyword.trim().toLowerCase()
    const location = homeSearch.value.location.trim().toLowerCase()
    const selectedType = homeSearch.value.type

    return jobs.value.filter((job) => {
      const matchesCategory = activeCategory.value === ALL_CATEGORY || job.category === activeCategory.value || job.type === activeCategory.value
      const matchesKeyword = !keyword || [
        job.title,
        job.company,
        job.description,
        job.location,
        job.type,
        job.level,
        job.category,
        job.salary,
        ...job.skills
      ].join(' ').toLowerCase().includes(keyword)
      const matchesLocation = !location || job.location.toLowerCase().includes(location)
      const matchesType = selectedType === ALL_JOB_TYPES || job.type === selectedType

      return matchesCategory && matchesKeyword && matchesLocation && matchesType
    })
  })

  const bestJobs = computed(() => [...filteredJobs.value]
    .sort((a, b) => getJobScore(b) - getJobScore(a))
    .slice(0, 6))

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
        logoClass: companyJobs[0]?.logoClass || 'bg-emerald-600',
        openJobs: companyJobs.length,
        description: `Äang tuyá»ƒn ${companyJobs.map((job) => job.title).slice(0, 2).join(', ')}${companyJobs.length > 2 ? '...' : '.'}`
      }))
      .sort((a, b) => b.openJobs - a.openJobs)
      .slice(0, 4)
  })

  const quickStats = computed<HomeQuickStat[]>(() => [
    {
      label: 'Viá»‡c lÃ m Ä‘ang tuyá»ƒn',
      value: formatCount(jobs.value.length),
      helper: 'CÆ¡ há»™i Ä‘ang cÃ³ trong há»‡ thá»‘ng',
      icon: 'uil:briefcase-alt'
    },
    {
      label: 'Doanh nghiá»‡p',
      value: formatCount(companyCount.value),
      helper: 'NhÃ  tuyá»ƒn dá»¥ng Ä‘ang Ä‘Äƒng tin',
      icon: 'uil:building'
    },
    {
      label: 'Vá»‹ trÃ­ Ä‘ang má»Ÿ',
      value: formatCount(totalSlots.value),
      helper: 'Tá»•ng chá»‰ tiÃªu tuyá»ƒn dá»¥ng',
      icon: 'uil:users-alt'
    },
    {
      label: 'Äá»‹a Ä‘iá»ƒm',
      value: formatCount(locationCount.value),
      helper: 'Khu vá»±c cÃ³ viá»‡c lÃ m',
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
    toast.info('TÃ­nh nÄƒng Ä‘ang phÃ¡t triá»ƒn', `${feature} sáº½ Ä‘Æ°á»£c káº¿t ná»‘i khi backend sáºµn sÃ ng.`)
  }

  async function loadPublicJobs() {
    try {
      isJobsLoading.value = true
      const response: any = await JobService.getAllJobs()
      const rawJobs: ApiJob[] = response?.success && Array.isArray(response.data) ? response.data : []
      jobs.value = rawJobs.map(mapJobForDisplay)
    } catch (error: any) {
      jobs.value = []
      toast.error('KhÃ´ng thá»ƒ táº£i viá»‡c lÃ m', error?.data?.message || error?.message || 'Vui lÃ²ng thá»­ láº¡i sau.')
    } finally {
      isJobsLoading.value = false
    }
  }

  onMounted(loadPublicJobs)

  return {
    activeCategory,
    bestJobs,
    categoryStats,
    companyCount,
    featuredCompanies,
    homeSearch,
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
  if (normalized.includes('thiáº¿t káº¿')) return 'uil:palette'
  if (normalized.includes('tÃ i chÃ­nh') || normalized.includes('káº¿ toÃ¡n')) return 'uil:calculator'
  if (normalized.includes('nhÃ¢n sá»±')) return 'uil:users-alt'
  return 'uil:laptop'
}

function getCategoryIconClass(index: number) {
  const classes = [
    'bg-emerald-50 text-emerald-700',
    'bg-blue-50 text-blue-700',
    'bg-slate-100 text-slate-800',
    'bg-sky-50 text-sky-700'
  ]

  return classes[index % classes.length] ?? classes[0] ?? 'bg-emerald-50 text-emerald-700'
}
```

