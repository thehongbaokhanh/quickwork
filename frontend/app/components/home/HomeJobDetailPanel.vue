<template>
  <aside
    :class="[
      'rounded-[24px] border bg-white shadow-2xl shadow-slate-200/60',
      panelVariant === 'popup' ? 'overflow-hidden' : 'lg:sticky lg:top-24'
    ]"
    :style="{ borderColor: jobTypeMeta.border }"
  >
    <div
      class="home-job-detail-scroll overflow-y-auto p-5"
      :style="{ maxHeight: detailMaxHeight }"
    >
      <div class="flex items-start gap-4">
        <div class="flex min-w-0 items-center gap-4">
          <span :class="['flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-sm', job.logoClass]">
            <HomeCompanyLogo :logo-url="job.logoUrl" :company-name="job.company" :initials="job.logo" />
          </span>
          <div class="min-w-0">
            <span
              class="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold"
              :style="{ backgroundColor: jobTypeMeta.border, color: jobTypeMeta.text }"
            >
              <Icon :name="jobTypeMeta.icon" class="h-3.5 w-3.5" aria-hidden="true" />
              <span class="truncate">{{ job.type }}</span>
            </span>
            <p class="mt-2 truncate text-sm font-bold text-slate-500">{{ job.company }}</p>
            <h3 class="mt-1 line-clamp-2 text-xl font-extrabold leading-7 text-slate-950" :title="job.title">
              {{ job.title }}
            </h3>
          </div>
        </div>
      </div>

      <div
        class="mt-4 rounded-2xl p-4"
        :style="{ backgroundColor: jobTypeMeta.background, color: jobTypeMeta.text }"
      >
        <p class="text-xs font-bold uppercase">Mức lương</p>
        <p class="mt-1 text-2xl font-extrabold">{{ job.salary }}</p>
      </div>

      <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
          <Icon name="uil:map-marker" class="h-4 w-4 text-slate-400" aria-hidden="true" />
          {{ job.location }}
        </span>
        <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
          <Icon :name="jobTypeMeta.icon" class="h-4 w-4 text-slate-400" aria-hidden="true" />
          {{ job.type }}
        </span>
        <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
          <Icon name="uil:user-check" class="h-4 w-4 text-slate-400" aria-hidden="true" />
          {{ job.level }}
        </span>
        <span class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
          <Icon name="uil:clock" class="h-4 w-4 text-slate-400" aria-hidden="true" />
          {{ job.posted }}
        </span>
      </div>

      <section class="mt-5 border-t border-slate-100 pt-5">
        <div class="flex items-center gap-2">
          <span class="h-5 w-1 rounded-full" :style="{ backgroundColor: jobTypeMeta.text }" aria-hidden="true" />
          <h4 class="text-lg font-extrabold text-slate-950">Mô tả công việc</h4>
        </div>
        <p class="mt-3 whitespace-pre-line text-base leading-7 text-slate-600">{{ job.description }}</p>
      </section>

      <section v-if="job.skills.length" class="mt-5 border-t border-slate-100 pt-5">
        <div class="flex items-center gap-2">
          <span class="h-5 w-1 rounded-full bg-sky-500" aria-hidden="true" />
          <h4 class="text-lg font-extrabold text-slate-950">Kỹ năng liên quan</h4>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="skill in job.skills"
            :key="skill"
            class="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
          >
            {{ skill }}
          </span>
        </div>
      </section>

      <div class="sticky bottom-0 -mx-5 mt-5 border-t border-slate-100 bg-white/95 px-5 pt-4 backdrop-blur">
        <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            :class="[
              'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed',
              isApplied
                ? 'bg-sky-50 text-sky-700'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            ]"
            :disabled="isApplying || isApplied"
            @click="$emit('apply')"
          >
            <Icon :name="isApplying ? 'svg-spinners:180-ring' : isApplied ? 'uil:check-circle' : 'uil:message'" class="h-5 w-5" aria-hidden="true" />
            {{ isApplied ? 'Đã ứng tuyển' : 'Ứng tuyển' }}
          </button>
          <button
            type="button"
            :class="[
              'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-extrabold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70',
              isFavorite
                ? 'border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100'
                : 'border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
            ]"
            :disabled="isFavoriteLoading"
            :aria-pressed="isFavorite"
            @click="$emit('save')"
          >
            <Icon :name="isFavoriteLoading ? 'svg-spinners:180-ring' : 'uil:heart'" class="h-5 w-5" aria-hidden="true" />
            {{ isFavorite ? 'Đã lưu' : 'Yêu thích' }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HomeCompanyLogo from '~/components/home/CompanyLogo.vue'
import type { DisplayJob } from '~/utils/jobDisplay'
import { getJobTypeMeta } from '~/utils/jobTypeMeta'

const props = defineProps<{
  job: DisplayJob
  isApplied?: boolean
  isApplying?: boolean
  isFavorite?: boolean
  isFavoriteLoading?: boolean
  variant?: 'side' | 'popup'
}>()

defineEmits<{
  apply: []
  close: []
  save: []
}>()

const jobTypeMeta = computed(() => getJobTypeMeta(props.job.type))
const panelVariant = computed(() => props.variant || 'side')
const detailMaxHeight = computed(() => (panelVariant.value === 'popup' ? 'min(560px, calc(100vh - 8rem))' : 'min(620px, calc(100vh - 7rem))'))
</script>

<style scoped>
.home-job-detail-scroll {
  scrollbar-color: #bae6fd #f8fafc;
  scrollbar-width: thin;
}

.home-job-detail-scroll::-webkit-scrollbar {
  width: 8px;
}

.home-job-detail-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}

.home-job-detail-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.home-job-detail-scroll::-webkit-scrollbar-thumb {
  background: #bae6fd;
  border: 2px solid #f8fafc;
  border-radius: 999px;
}

.home-job-detail-scroll::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}

.home-job-detail-scroll::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
