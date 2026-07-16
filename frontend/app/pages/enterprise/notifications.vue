<template>
  <div class="space-y-6 pb-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-700">
          <Icon name="uil:bell" class="h-4 w-4" />
          Trung tâm thông báo
        </span>
        <h1 class="mt-3 text-2xl font-black text-slate-950">Thông báo</h1>
        <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Nơi tập trung thông báo tuyển dụng, ứng viên và cập nhật hệ thống khi có dữ liệu thật.
        </p>
      </div>

      <NuxtLink
        to="/enterprise/applications"
        class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
      >
        <Icon name="uil:users-alt" class="h-5 w-5" />
        Xem ứng viên
      </NuxtLink>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/70"
      >
        <div class="flex items-center gap-4">
          <span :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', card.iconClass]">
            <Icon :name="card.icon" class="h-6 w-6" />
          </span>
          <div>
            <p class="text-sm font-bold text-slate-500">{{ card.label }}</p>
            <p class="mt-1 text-2xl font-black text-slate-950">0</p>
            <p class="mt-1 text-xs font-black text-slate-500">Chưa có dữ liệu từ hệ thống</p>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100/80">
      <div class="border-b border-slate-100 px-6 py-5">
        <h2 class="text-lg font-black text-slate-950">Danh sách thông báo</h2>
        <p class="mt-1 text-sm font-semibold text-slate-500">Các thông báo sẽ hiển thị theo thời gian thực khi backend cung cấp dữ liệu.</p>
      </div>

      <div class="p-10 text-center">
        <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
          <Icon name="uil:bell-slash" class="h-8 w-8" />
        </span>
        <h3 class="mt-4 text-xl font-black text-slate-950">Chưa có thông báo</h3>
        <p class="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
          Hiện chưa có thông báo tuyển dụng nào được đồng bộ cho tài khoản doanh nghiệp này.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

const summaryCards = [
  { label: 'Thông báo mới', icon: 'uil:bell', iconClass: 'bg-sky-50 text-sky-600' },
  { label: 'Ứng viên', icon: 'uil:users-alt', iconClass: 'bg-emerald-50 text-emerald-600' },
  { label: 'Tin tuyển dụng', icon: 'uil:briefcase-alt', iconClass: 'bg-violet-50 text-violet-600' }
]
</script>
