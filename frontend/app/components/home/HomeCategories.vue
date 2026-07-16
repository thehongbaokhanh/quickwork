<template>
  <section class="bg-slate-50 py-20 sm:py-24">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-bold uppercase text-sky-700">Ngành nghề</p>
          <h2 class="mt-3 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
            Top ngành nghề nổi bật
          </h2>
          <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Nhóm ngành được tổng hợp từ kỹ năng và nội dung tin tuyển dụng đang hiển thị.
          </p>
        </div>

        <NuxtLink
          to="/student"
          class="inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-800 focus:outline-none focus-visible:rounded-lg focus-visible:ring-4 focus-visible:ring-sky-100"
        >
          Xem việc làm theo ngành
          <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
        </NuxtLink>
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
        <p class="mt-4 text-base font-semibold text-slate-600">Chưa có dữ liệu ngành nghề để hiển thị.</p>
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
