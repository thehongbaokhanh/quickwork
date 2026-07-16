<template>
  <div class="space-y-6 pb-8">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-sky-700">
          <Icon name="uil:clipboard-notes" class="h-4 w-4" />
          Lịch làm việc
        </span>
        <h1 class="mt-3 text-2xl font-black text-slate-950">Lịch phỏng vấn</h1>
        <p class="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Theo dõi lịch hẹn phỏng vấn khi hệ thống có dữ liệu điều phối từ các đơn ứng tuyển.
        </p>
      </div>

      <NuxtLink
        to="/enterprise/applications"
        class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
      >
        <Icon name="uil:users-alt" class="h-5 w-5" />
        Danh sách ứng viên
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

    <section class="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm shadow-slate-100/80">
      <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
        <Icon name="uil:calendar-slash" class="h-8 w-8" />
      </span>
      <h2 class="mt-4 text-xl font-black text-slate-950">Chưa có lịch phỏng vấn</h2>
      <p class="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-500">
        Trang này đã sẵn sàng để hiển thị lịch phỏng vấn khi dữ liệu lịch hẹn được đồng bộ từ hệ thống ứng tuyển.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

const summaryCards = [
  { label: 'Lịch hôm nay', icon: 'uil:calendar-alt', iconClass: 'bg-sky-50 text-sky-600' },
  { label: 'Chờ xác nhận', icon: 'uil:clock', iconClass: 'bg-amber-50 text-amber-600' },
  { label: 'Đã hoàn tất', icon: 'uil:check-circle', iconClass: 'bg-emerald-50 text-emerald-600' }
]
</script>
