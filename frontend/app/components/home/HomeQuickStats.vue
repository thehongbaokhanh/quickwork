<template>
  <section class="relative z-10 bg-white pt-10 sm:pt-12">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/55 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="stat in stats"
          :key="stat.label"
          class="grid min-h-[148px] grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-b border-slate-200 px-7 py-6 last:border-b-0 sm:[&:nth-child(2n+1)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
        >
          <span class="flex h-14 w-14 shrink-0 items-center justify-center self-center rounded-2xl bg-sky-50 text-sky-700">
            <Icon :name="stat.icon" class="h-7 w-7" aria-hidden="true" />
          </span>
          <span class="flex min-h-[86px] min-w-0 flex-col justify-center">
            <span class="flex min-h-10 items-center gap-3">
              <span class="w-12 shrink-0 text-left text-3xl font-extrabold leading-none tracking-normal text-slate-950 tabular-nums">{{ stat.value }}</span>
              <span class="min-w-0 text-base font-extrabold leading-5 text-slate-900">{{ stat.label }}</span>
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
