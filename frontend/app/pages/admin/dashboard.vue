<template>
  <div class="flex flex-col gap-6">
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="grid gap-6 bg-slate-950 px-5 py-6 text-white lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-6">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-md bg-teal-400/15 px-3 py-1 text-xs font-bold text-teal-100 ring-1 ring-teal-300/20">
              <Icon name="uil:shield-check" class="h-4 w-4" />
              Quản trị hệ thống
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-xs font-bold text-slate-100 ring-1 ring-white/10">
              <Icon name="uil:users-alt" class="h-4 w-4" />
              {{ totalUsers }} tài khoản
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-xs font-bold text-slate-100 ring-1 ring-white/10">
              <Icon name="uil:clock" class="h-4 w-4" />
              {{ stats.pending_jobs }} tin chờ duyệt
            </span>
          </div>

          <h1 class="mt-4 text-2xl font-black leading-tight tracking-normal sm:text-3xl">
            Bảng điều khiển quản trị
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Theo dõi người dùng, doanh nghiệp và các tin tuyển dụng cần xử lý từ dữ liệu hệ thống hiện tại.
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <NuxtLink
            to="/admin/jobs"
            class="inline-flex items-center justify-center gap-2 rounded-md bg-teal-400 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-teal-300"
          >
            <Icon name="uil:briefcase-alt" class="h-5 w-5" />
            Duyệt việc làm
          </NuxtLink>
          <NuxtLink
            to="/admin/users"
            class="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <Icon name="uil:users-alt" class="h-5 w-5" />
            Quản lý người dùng
          </NuxtLink>
        </div>
      </div>

      <div class="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="card in dashboardCards"
          :key="card.name"
          class="bg-white px-5 py-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase text-slate-500">{{ card.name }}</p>
              <p class="mt-2 text-2xl font-black text-slate-950">{{ card.value }}</p>
            </div>
            <span :class="['flex h-10 w-10 items-center justify-center rounded-md', card.iconClass]">
              <Icon :name="card.icon" class="h-5 w-5" />
            </span>
          </div>
          <p class="mt-2 text-xs font-medium text-slate-500">{{ card.helper }}</p>
        </div>
      </div>
    </section>

    <div
      v-if="dashboardError"
      class="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
    >
      <Icon name="uil:exclamation-triangle" class="mt-0.5 h-5 w-5 shrink-0" />
      <span>{{ dashboardError }}</span>
    </div>

    <section class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="space-y-5 xl:min-w-0">
        <div class="self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-base font-black text-slate-950">Sức khỏe dữ liệu</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">So sánh các nhóm dữ liệu chính đang có trong hệ thống.</p>
            </div>
            <span class="inline-flex w-fit items-center gap-1.5 rounded-md bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
              <Icon name="uil:analytics" class="h-4 w-4" />
              {{ activeJobRate }}% tin đang hiển thị
            </span>
          </div>

          <div v-if="isLoading" class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="index in 4" :key="index" class="h-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <div v-else class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="item in systemBars"
              :key="item.label"
              class="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
            >
              <div class="flex items-start justify-between gap-2">
                <span :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm', getSystemBarTextClass(item.barClass)]">
                  <Icon :name="getSystemBarIcon(item.label)" class="h-4 w-4" />
                </span>
                <span class="text-base font-black leading-none text-slate-950">{{ item.value }}</span>
              </div>
              <p class="mt-2 truncate text-xs font-black text-slate-700">{{ item.label }}</p>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                <div :class="['h-full rounded-full', item.barClass]" :style="{ width: `${item.percent}%` }" />
              </div>
            </div>
          </div>
        </div>

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="space-y-4 border-b border-slate-100 px-5 py-4 lg:px-6">
          <div>
            <h2 class="text-base font-black text-slate-950">Người dùng gần đây theo loại tài khoản</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">Tách nhanh tài khoản Admin, Sinh viên và Doanh nghiệp từ dữ liệu mới nhất.</p>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              v-for="type in accountTypeCards"
              :key="type.role"
              :class="[
                'flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition',
                activeUserRole === type.role
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              ]"
              type="button"
              @click="activeUserRole = type.role"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span
                  :class="[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    activeUserRole === type.role ? 'bg-white/10 text-white' : type.iconClass
                  ]"
                >
                  <Icon :name="type.icon" class="h-4 w-4" />
                </span>
                <span class="truncate text-xs font-black">{{ type.label }}</span>
              </span>
              <span
                :class="[
                  'rounded px-2 py-0.5 text-xs font-black',
                  activeUserRole === type.role ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ type.count }}
              </span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th class="px-5 py-3">STT</th>
                <th class="px-5 py-3">Tên hiển thị</th>
                <th class="px-5 py-3">Loại tài khoản</th>
                <th class="px-5 py-3">Trạng thái</th>
                <th class="px-5 py-3">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="filteredRecentUsers.length === 0 && !isLoading">
                <td colspan="5" class="px-5 py-10 text-center text-sm font-semibold text-slate-400">
                  Chưa có tài khoản phù hợp trong dữ liệu gần đây.
                </td>
              </tr>
              <tr v-for="(user, index) in sampleRecentUsers" :key="user.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4 font-black text-slate-400">{{ index + 1 }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-black text-slate-600">
                      {{ getUserInitial(user) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-black text-slate-950">{{ getUserDisplayName(user) }}</p>
                      <p class="truncate text-xs font-medium text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip qw-chip--compact', roleColors[user.role] || 'bg-slate-50 text-slate-600']">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip', statusClass(user.status)]">{{ statusLabel(user.status) }}</span>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-500">{{ formatDate(user.created_at) }}</td>
              </tr>
              <tr v-if="isLoading">
                <td colspan="5" class="px-5 py-6">
                  <div class="space-y-3">
                    <div v-for="index in 3" :key="index" class="h-10 animate-pulse rounded-md bg-slate-100" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <div class="space-y-5 xl:min-w-0">
        <aside class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-black text-slate-950">Hàng chờ duyệt</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">Tin tuyển dụng đang cần admin xử lý.</p>
            </div>
            <span class="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-black text-amber-700">{{ pendingJobs.length }}</span>
          </div>

          <div v-if="isLoading" class="mt-5 space-y-3">
            <div v-for="index in 3" :key="index" class="h-16 animate-pulse rounded-md bg-slate-100" />
          </div>
          <div v-else-if="pendingJobs.length === 0" class="mt-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Không có tin nào đang chờ duyệt.
          </div>
          <div v-else class="mt-5 space-y-3">
            <article
              v-for="(job, index) in pendingJobs.slice(0, 3)"
              :key="job.id"
              class="flex items-start gap-3 rounded-md border border-amber-100 bg-amber-50/60 px-4 py-3"
            >
              <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-black text-amber-700">
                {{ index + 1 }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-black text-slate-950">{{ job.title || 'Chưa có tiêu đề' }}</p>
                <p class="mt-1 truncate text-xs font-semibold text-amber-700">{{ getJobCompany(job) }}</p>
                <p class="mt-0.5 text-xs font-medium text-slate-500">{{ formatDate(job.created_at) }}</p>
              </div>
            </article>
          </div>

          <NuxtLink
            to="/admin/jobs"
            class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Icon name="uil:arrow-right" class="h-4 w-4" />
            Mở danh sách việc làm
          </NuxtLink>
        </aside>

      <aside class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-5 py-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-black text-slate-950">Nhịp hoạt động</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">Cập nhật mới từ người dùng và tin chờ duyệt.</p>
            </div>
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-sky-700 shadow-sm ring-1 ring-sky-100">
              <Icon name="uil:bolt-alt" class="h-5 w-5" />
            </span>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-sky-100">
              <p class="text-[11px] font-black uppercase text-slate-400">Tài khoản</p>
              <p class="mt-0.5 text-lg font-black text-slate-950">{{ recentUsers.length }}</p>
            </div>
            <div class="rounded-md bg-white/80 px-3 py-2 ring-1 ring-amber-100">
              <p class="text-[11px] font-black uppercase text-slate-400">Chờ duyệt</p>
              <p class="mt-0.5 text-lg font-black text-amber-700">{{ pendingJobs.length }}</p>
            </div>
          </div>
        </div>

        <div v-if="notifications.length === 0 && !isLoading" class="m-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Chưa có dữ liệu mới từ hệ thống.
        </div>
        <div v-else class="space-y-3 p-5">
          <article
            v-for="(notif, index) in notifications"
            :key="notif.id"
            :class="[
              'rounded-lg border px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
              notif.icon === 'uil:briefcase' ? 'border-amber-100 bg-amber-50/60' : 'border-sky-100 bg-sky-50/60'
            ]"
          >
            <div class="flex items-start gap-3">
              <span
                :class="[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white shadow-sm',
                  notif.icon === 'uil:briefcase' ? 'text-amber-700 ring-1 ring-amber-100' : 'text-sky-700 ring-1 ring-sky-100'
                ]"
              >
                <Icon :name="notif.icon" class="h-4.5 w-4.5" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center justify-between gap-2">
                  <span class="rounded bg-white/80 px-2 py-0.5 text-[10px] font-black text-slate-400">#{{ index + 1 }}</span>
                  <span class="truncate text-[11px] font-bold text-slate-500">{{ notif.time }}</span>
                </div>
                <p class="text-sm font-semibold leading-5 text-slate-700">
                  <span class="font-black text-slate-950">{{ notif.user }}</span> {{ notif.action }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </aside>
      </div>
    </section>

    <section v-if="false" class="order-2 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-base font-black text-slate-950">Sức khỏe dữ liệu</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">So sánh các nhóm dữ liệu chính đang có trong hệ thống.</p>
          </div>
          <span class="inline-flex w-fit items-center gap-1.5 rounded-md bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
            <Icon name="uil:analytics" class="h-4 w-4" />
            {{ activeJobRate }}% tin đang hiển thị
          </span>
        </div>

        <div v-if="isLoading" class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="index in 4" :key="index" class="h-20 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div v-else class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="item in systemBars"
            :key="item.label"
            class="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
          >
            <div class="flex items-start justify-between gap-2">
              <span :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm', getSystemBarTextClass(item.barClass)]">
                <Icon :name="getSystemBarIcon(item.label)" class="h-4 w-4" />
              </span>
              <span class="text-base font-black leading-none text-slate-950">{{ item.value }}</span>
            </div>
            <p class="mt-2 truncate text-xs font-black text-slate-700">{{ item.label }}</p>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
              <div :class="['h-full rounded-full', item.barClass]" :style="{ width: `${item.percent}%` }" />
            </div>
          </div>
        </div>
      </div>

      <aside class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-black text-slate-950">Hàng chờ duyệt</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">Tin tuyển dụng đang cần admin xử lý.</p>
          </div>
          <span class="rounded-md bg-amber-50 px-2.5 py-1 text-sm font-black text-amber-700">{{ pendingJobs.length }}</span>
        </div>

        <div v-if="isLoading" class="mt-5 space-y-3">
          <div v-for="index in 3" :key="index" class="h-16 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div v-else-if="pendingJobs.length === 0" class="mt-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Không có tin nào đang chờ duyệt.
        </div>
        <div v-else class="mt-5 space-y-3">
          <article
            v-for="(job, index) in pendingJobs.slice(0, 3)"
            :key="job.id"
            class="flex items-start gap-3 rounded-md border border-amber-100 bg-amber-50/60 px-4 py-3"
          >
            <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-black text-amber-700">
              {{ index + 1 }}
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-black text-slate-950">{{ job.title || 'Chưa có tiêu đề' }}</p>
              <p class="mt-1 truncate text-xs font-semibold text-amber-700">{{ getJobCompany(job) }}</p>
              <p class="mt-0.5 text-xs font-medium text-slate-500">{{ formatDate(job.created_at) }}</p>
            </div>
          </article>
        </div>

        <NuxtLink
          to="/admin/jobs"
          class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Icon name="uil:arrow-right" class="h-4 w-4" />
          Mở danh sách việc làm
        </NuxtLink>
      </aside>
    </section>

    <section v-if="false" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="space-y-4 border-b border-slate-100 px-5 py-4 lg:px-6">
          <div>
            <h2 class="text-base font-black text-slate-950">Người dùng gần đây theo loại tài khoản</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">Tách nhanh tài khoản Admin, Sinh viên và Doanh nghiệp từ dữ liệu mới nhất.</p>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              v-for="type in accountTypeCards"
              :key="type.role"
              :class="[
                'flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition',
                activeUserRole === type.role
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              ]"
              type="button"
              @click="activeUserRole = type.role"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span
                  :class="[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    activeUserRole === type.role ? 'bg-white/10 text-white' : type.iconClass
                  ]"
                >
                  <Icon :name="type.icon" class="h-4 w-4" />
                </span>
                <span class="truncate text-xs font-black">{{ type.label }}</span>
              </span>
              <span
                :class="[
                  'rounded px-2 py-0.5 text-xs font-black',
                  activeUserRole === type.role ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ type.count }}
              </span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th class="px-5 py-3">STT</th>
                <th class="px-5 py-3">Tên hiển thị</th>
                <th class="px-5 py-3">Loại tài khoản</th>
                <th class="px-5 py-3">Trạng thái</th>
                <th class="px-5 py-3">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="filteredRecentUsers.length === 0 && !isLoading">
                <td colspan="5" class="px-5 py-10 text-center text-sm font-semibold text-slate-400">
                  Chưa có tài khoản phù hợp trong dữ liệu gần đây.
                </td>
              </tr>
              <tr v-for="(user, index) in sampleRecentUsers" :key="user.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4 font-black text-slate-400">{{ index + 1 }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-black text-slate-600">
                      {{ getUserInitial(user) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-black text-slate-950">{{ getUserDisplayName(user) }}</p>
                      <p class="truncate text-xs font-medium text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip qw-chip--compact', roleColors[user.role] || 'bg-slate-50 text-slate-600']">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span :class="['qw-chip', statusClass(user.status)]">{{ statusLabel(user.status) }}</span>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-500">{{ formatDate(user.created_at) }}</td>
              </tr>
              <tr v-if="isLoading">
                <td colspan="5" class="px-5 py-6">
                  <div class="space-y-3">
                    <div v-for="index in 3" :key="index" class="h-10 animate-pulse rounded-md bg-slate-100" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-black text-slate-950">Nhịp hoạt động</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">Tổng hợp từ người dùng mới và tin chờ duyệt.</p>
          </div>
          <Icon name="uil:bell" class="h-5 w-5 text-slate-400" />
        </div>

        <div v-if="notifications.length === 0 && !isLoading" class="mt-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Chưa có dữ liệu mới từ hệ thống.
        </div>
        <div v-else class="mt-5 space-y-4">
          <article v-for="(notif, index) in notifications" :key="notif.id" class="flex items-start gap-3">
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
              {{ index + 1 }}
            </span>
            <div class="min-w-0">
              <p class="text-sm leading-5 text-slate-700">
                <span class="font-black text-slate-950">{{ notif.user }}</span> {{ notif.action }}
              </p>
              <p class="mt-0.5 text-xs font-medium text-slate-500">{{ notif.time }}</p>
            </div>
          </article>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AdminService } from '~/services/admin.service'
import { NotificationService } from '~/services/notification.service'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const stats = ref({
  total_students: 0,
  total_enterprises: 0,
  active_jobs: 0,
  pending_jobs: 0
})
const recentUsers = ref<any[]>([])
const pendingJobs = ref<any[]>([])
const adminEvents = ref<any[]>([])
const dashboardError = ref('')
const isLoading = ref(true)
const activeUserRole = ref('ALL')
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

const totalUsers = computed(() => stats.value.total_students + stats.value.total_enterprises)
const totalTrackedJobs = computed(() => stats.value.active_jobs + stats.value.pending_jobs)
const activeJobRate = computed(() => {
  if (totalTrackedJobs.value === 0) return 0
  return Math.round((stats.value.active_jobs / totalTrackedJobs.value) * 100)
})

const dashboardCards = computed(() => [
  {
    name: 'Học viên',
    value: stats.value.total_students,
    helper: `${getShare(stats.value.total_students, totalUsers.value)}% tổng tài khoản`,
    icon: 'uil:graduation-cap',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    name: 'Doanh nghiệp',
    value: stats.value.total_enterprises,
    helper: `${getShare(stats.value.total_enterprises, totalUsers.value)}% tổng tài khoản`,
    icon: 'uil:building',
    iconClass: 'bg-teal-50 text-teal-700'
  },
  {
    name: 'Đang hiển thị',
    value: stats.value.active_jobs,
    helper: `${activeJobRate.value}% trong nhóm tin theo dõi`,
    icon: 'uil:check-circle',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    name: 'Chờ duyệt',
    value: stats.value.pending_jobs,
    helper: 'Tin cần admin xử lý',
    icon: 'uil:clock',
    iconClass: 'bg-amber-50 text-amber-700'
  }
])

const systemBars = computed(() => {
  const items = [
    { label: 'Học viên', value: stats.value.total_students, dotClass: 'bg-sky-500', barClass: 'bg-sky-500' },
    { label: 'Doanh nghiệp', value: stats.value.total_enterprises, dotClass: 'bg-teal-500', barClass: 'bg-teal-500' },
    { label: 'Tin đang hiển thị', value: stats.value.active_jobs, dotClass: 'bg-sky-500', barClass: 'bg-sky-500' },
    { label: 'Tin chờ duyệt', value: stats.value.pending_jobs, dotClass: 'bg-amber-500', barClass: 'bg-amber-500' }
  ]
  const max = Math.max(...items.map((item) => item.value), 1)

  return items.map((item) => ({
    ...item,
    percent: item.value === 0 ? 0 : Math.max(8, Math.round((item.value / max) * 100))
  }))
})

const getSystemBarTextClass = (barClass: string) => {
  if (barClass.includes('teal')) return 'text-teal-700'
  if (barClass.includes('amber')) return 'text-amber-700'
  return 'text-sky-700'
}

const getSystemBarIcon = (label: string) => {
  if (label.includes('Doanh')) return 'uil:building'
  if (label.includes('Tin') && label.includes('ch')) return 'uil:clock'
  if (label.includes('Tin')) return 'uil:check-circle'
  return 'uil:graduation-cap'
}

const roleColors: Record<string, string> = {
  STUDENT: 'bg-sky-50 text-sky-700',
  ENTERPRISE: 'bg-teal-50 text-teal-700',
  ADMIN: 'bg-rose-50 text-rose-700'
}

const roleLabels: Record<string, string> = {
  STUDENT: 'Học viên',
  ENTERPRISE: 'Doanh nghiệp',
  ADMIN: 'Admin'
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm khóa',
  BANNED: 'Bị cấm'
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-sky-50 text-sky-700',
  INACTIVE: 'bg-amber-50 text-amber-700',
  BANNED: 'bg-rose-50 text-rose-700'
}

const accountTypeCards = computed(() => [
  {
    role: 'ALL',
    label: 'Tất cả',
    count: recentUsers.value.length,
    icon: 'uil:users-alt',
    iconClass: 'bg-slate-100 text-slate-700'
  },
  {
    role: 'ADMIN',
    label: 'Tài khoản Admin',
    count: getRecentUserCountByRole('ADMIN'),
    icon: 'uil:shield-check',
    iconClass: 'bg-rose-50 text-rose-700'
  },
  {
    role: 'STUDENT',
    label: 'Tài khoản Sinh viên',
    count: getRecentUserCountByRole('STUDENT'),
    icon: 'uil:graduation-cap',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  {
    role: 'ENTERPRISE',
    label: 'Tài khoản Doanh nghiệp',
    count: getRecentUserCountByRole('ENTERPRISE'),
    icon: 'uil:building',
    iconClass: 'bg-teal-50 text-teal-700'
  }
])

const filteredRecentUsers = computed(() => {
  if (activeUserRole.value === 'ALL') return recentUsers.value
  return recentUsers.value.filter((user) => user.role === activeUserRole.value)
})

const sampleRecentUsers = computed(() => filteredRecentUsers.value.slice(0, 10))

const getShare = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

const getRecentUserCountByRole = (role: string) => {
  return recentUsers.value.filter((user) => user.role === role).length
}

const getRoleLabel = (role?: string) => {
  return role ? roleLabels[role] || role : 'Chưa phân quyền'
}

const normalizeUserStatus = (status?: string) => {
  return (status || 'ACTIVE').toUpperCase()
}

const statusLabel = (status?: string) => {
  return statusLabels[normalizeUserStatus(status)] || 'Chưa cập nhật'
}

const statusClass = (status?: string) => {
  return statusColors[normalizeUserStatus(status)] || 'bg-slate-50 text-slate-600'
}

const getUserDisplayName = (user: any) => {
  return user?.student_profile?.name ||
    user?.enterprise_profile?.company_name ||
    user?.email?.split('@')[0] ||
    'Người dùng'
}

const getUserInitial = (user: any) => {
  return getUserDisplayName(user).charAt(0).toUpperCase()
}

const getJobCompany = (job: any) => {
  return job?.enterprise_profile?.company_name || 'Doanh nghiệp chưa cập nhật tên'
}

const formatDate = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('vi-VN')
}

const isWithinLastDay = (value?: string) => {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return Date.now() - date.getTime() <= ONE_DAY_IN_MS
}

const getActivityIcon = (type?: string) => {
  if (type === 'JOB') return 'uil:briefcase'
  if (type === 'APPLICATION') return 'uil:user-plus'
  return 'uil:bell'
}

const notifications = computed(() => {
  const eventItems = adminEvents.value.filter((item) => isWithinLastDay(item.created_at)).slice(0, 5).map((item) => ({
    id: `notification-${item.id}`,
    user: item.title || 'Thông báo hệ thống',
    action: item.content || '',
    time: formatDate(item.created_at),
    createdAt: item.created_at,
    icon: getActivityIcon(item.type)
  }))

  const jobItems = pendingJobs.value.filter((job) => isWithinLastDay(job.created_at)).slice(0, 3).map((job) => ({
    id: `job-${job.id}`,
    user: getJobCompany(job),
    action: `đang chờ duyệt tin "${job.title || 'Chưa có tiêu đề'}".`,
    time: formatDate(job.created_at),
    createdAt: job.created_at,
    icon: 'uil:briefcase'
  }))

  const userItems = recentUsers.value.filter((user) => isWithinLastDay(user.created_at)).slice(0, 3).map((user) => ({
    id: `user-${user.id}`,
    user: getUserDisplayName(user),
    action: `vừa tạo tài khoản ${getRoleLabel(user.role)}.`,
    time: formatDate(user.created_at),
    createdAt: user.created_at,
    icon: 'uil:user-plus'
  }))

  return [...eventItems, ...jobItems, ...userItems]
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5)
})

onMounted(async () => {
  try {
    isLoading.value = true
    dashboardError.value = ''
    const [statsRes, usersRes, jobsRes, notificationsRes] = await Promise.all([
      AdminService.getDashboardStats(),
      AdminService.getRecentUsers(10),
      AdminService.getPendingJobs({ status: 'PENDING' }),
      NotificationService.list({ page: 1, page_size: 50 })
    ])

    if (statsRes?.success) {
      stats.value = statsRes.data
    }
    if (usersRes?.success) {
      recentUsers.value = Array.isArray(usersRes.data) ? usersRes.data : []
    }
    if (jobsRes?.success) {
      pendingJobs.value = Array.isArray(jobsRes.data) ? jobsRes.data : []
    }
    if (notificationsRes?.success) {
      adminEvents.value = Array.isArray(notificationsRes.data?.items) ? notificationsRes.data.items : []
    }
  } catch (error: any) {
    dashboardError.value = error?.data?.message || error?.message || 'Không thể tải dữ liệu dashboard.'
    console.error('Failed to load admin dashboard:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
