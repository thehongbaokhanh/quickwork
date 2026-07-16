<template>
  <section id="employer" class="bg-white py-20 sm:py-24">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="grid overflow-hidden rounded-[32px] bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="p-8 sm:p-10 lg:p-12">
          <p class="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-300">
            <Icon name="uil:building" class="h-4 w-4" aria-hidden="true" />
            Dành cho nhà tuyển dụng
          </p>
          <h2 class="mt-6 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Bạn đang cần tuyển nhân sự phù hợp?
          </h2>
          <p class="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            Đăng tin tuyển dụng, quản lý cơ hội đang mở và tiếp cận ứng viên trẻ trên QuickWork bằng dữ liệu hiện có của hệ thống.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              to="/register?role=enterprise"
              class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 text-sm font-bold text-white transition hover:bg-sky-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40"
            >
              Đăng tin tuyển dụng
              <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
            </NuxtLink>
            <button
              type="button"
              class="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 px-5 text-sm font-bold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              @click="$emit('secondary')"
            >
              Tìm hiểu giải pháp
            </button>
          </div>
        </div>

        <div class="border-t border-white/10 bg-white/[0.04] p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
          <p class="text-sm font-bold uppercase text-sky-300">Doanh nghiệp đang tuyển</p>
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
                <span class="mt-1 block text-sm text-slate-300">{{ company.openJobs }} việc đang mở</span>
              </span>
            </article>
          </div>
          <div v-else class="mt-5 rounded-2xl border border-white/10 bg-white/[0.07] p-5 text-sm leading-6 text-slate-300">
            Danh sách doanh nghiệp sẽ hiển thị khi hệ thống có tin tuyển dụng công khai.
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
