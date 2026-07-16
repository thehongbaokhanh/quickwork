<template>
  <section id="career-tools" class="bg-slate-50 py-20 sm:py-24">
    <div class="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
      <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8 lg:p-10">
        <div class="mx-auto max-w-3xl text-center">
          <p class="text-sm font-bold uppercase text-sky-700">Bắt đầu với QuickWork</p>
          <h2 class="mt-3 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
            Bạn muốn đăng nhập với vai trò nào?
          </h2>
          <p class="mt-3 text-base leading-7 text-slate-600">
            Chọn luồng phù hợp để tìm việc hoặc bắt đầu tuyển dụng. Trang chủ công khai chỉ hiển thị hai lựa chọn chính.
          </p>
        </div>

        <div class="mt-8 grid gap-5 md:grid-cols-2">
          <NuxtLink
            to="/register?role=student"
            class="group rounded-[24px] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <Icon name="uil:graduation-cap" class="h-8 w-8" aria-hidden="true" />
            </span>
            <span class="mt-5 block text-xl font-extrabold text-slate-950">Tôi đang tìm việc</span>
            <span class="mt-2 block text-base leading-7 text-slate-600">Tạo hồ sơ, khám phá việc làm và lưu các cơ hội phù hợp.</span>
            <span class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700">
              Tạo hồ sơ ứng viên
              <Icon name="uil:arrow-right" class="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </NuxtLink>

          <NuxtLink
            to="/register?role=enterprise"
            class="group rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white transition hover:-translate-y-1 hover:bg-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sky-300">
              <Icon name="uil:building" class="h-8 w-8" aria-hidden="true" />
            </span>
            <span class="mt-5 block text-xl font-extrabold">Tôi muốn tuyển dụng</span>
            <span class="mt-2 block text-base leading-7 text-slate-300">Đăng tin, quản lý tuyển dụng và theo dõi các vị trí đang mở.</span>
            <span class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-300">
              Đăng ký nhà tuyển dụng
              <Icon name="uil:arrow-right" class="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
