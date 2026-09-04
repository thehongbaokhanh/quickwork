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
        :category-filter-request="categoryFilterRequest"
        :loading="isJobsLoading"
        :personalized="isPersonalizedRecommendations"
        :ai-used="recommendationAIUsed"
        :profile-completeness="recommendationProfileCompleteness"
        :selected-job="selectedJob"
        :is-applied-job="isAppliedJob"
        :is-applying-job="isApplyingJob"
        :is-favorite-job="isFavoriteJob"
        :is-favorite-loading="isFavoriteLoading"
        @apply="handleApplyJob"
        @close-detail="handleCloseJobDetail"
        @reset="handleReset"
        @save="handleSaveJob"
        @detail="handleJobDetail"
      />

      <HomeCareerAI v-if="authStore.isAuthenticated && authStore.userRole === 'STUDENT'" />

      <HomeCategories
        :categories="categoryStats"
        :loading="isJobsLoading"
        @select="handleCategory"
      />

      <HomeEmployerCta
        :companies="featuredCompanies"
        @secondary="notifyDevelopment('Giải pháp tuyển dụng')"
      />

      <HomeCareerCta v-if="!authStore.isAuthenticated" />
    </main>

    <HomeFooter @notify="notifyDevelopment" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DisplayJob } from '~/utils/jobDisplay'
import HomeCareerCta from '~/components/home/HomeCareerCta.vue'
import HomeCareerAI from '~/components/home/HomeCareerAI.vue'
import HomeCategories from '~/components/home/HomeCategories.vue'
import HomeEmployerCta from '~/components/home/HomeEmployerCta.vue'
import HomeFeaturedJobs from '~/components/home/HomeFeaturedJobs.vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeHeader from '~/components/home/HomeHeader.vue'
import HomeHero from '~/components/home/HomeHero.vue'
import HomeQuickStats from '~/components/home/HomeQuickStats.vue'
import { useHomeJobs } from '~/composables/useHomeJobs'
import { useAuthStore } from '~/stores/auth'

const {
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
  isPersonalizedRecommendations,
  jobCategories,
  jobTypeOptions,
  jobs,
  quickStats,
  recommendationAIUsed,
  recommendationProfileCompleteness,
  resetSearch,
  setHeroKeyword,
  applyToJob,
  toggleFavoriteJob,
  trendingKeywords,
  notifyDevelopment
} = useHomeJobs()

const authStore = useAuthStore()
const selectedJob = ref<DisplayJob | null>(null)
const categoryFilterRequest = ref<{ category: string; requestId: number } | null>(null)
let categoryFilterRequestId = 0

function scrollToJobs() {
  document.getElementById('featured-jobs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleKeyword(keyword: string) {
  setHeroKeyword(keyword)
  scrollToJobs()
}

function handleCategory(category: unknown) {
  const selectedCategory = typeof category === 'string' ? category.trim() : ''
  if (!selectedCategory) {
    scrollToJobs()
    return
  }

  categoryFilterRequestId += 1
  categoryFilterRequest.value = {
    category: selectedCategory,
    requestId: categoryFilterRequestId
  }
  scrollToJobs()
}

function handleReset() {
  resetSearch()
  selectedJob.value = null
  scrollToJobs()
}

async function handleSaveJob(job: DisplayJob) {
  await toggleFavoriteJob(job)
}

function handleJobDetail(job: DisplayJob, source: 'hover' | 'click' = 'click') {
  selectedJob.value = job
  if (source !== 'hover') {
    scrollToJobs()
  }
}

function handleCloseJobDetail() {
  selectedJob.value = null
}

async function handleApplyJob(job: DisplayJob) {
  await applyToJob(job)
}

watch(bestJobs, (jobs) => {
  if (selectedJob.value && !jobs.some((job) => job.id === selectedJob.value?.id)) {
    selectedJob.value = null
  }
})
</script>
