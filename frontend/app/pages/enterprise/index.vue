<template>
  <div class="space-y-5">
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="grid gap-5 bg-slate-950 px-5 py-6 text-white lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-6">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-md bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
              <Icon name="uil:database" class="h-4 w-4" />
              Dữ liệu hệ thống
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-xs font-bold text-slate-100 ring-1 ring-white/10">
              <Icon name="uil:briefcase" class="h-4 w-4" />
              {{ totalJobs }} tin tuyển dụng
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-xs font-bold text-slate-100 ring-1 ring-white/10">
              <Icon name="uil:calendar-alt" class="h-4 w-4" />
              {{ latestJobDateLabel }}
            </span>
          </div>

          <h1 class="mt-4 text-2xl font-black leading-tight tracking-normal sm:text-3xl">
            Trung tâm tuyển dụng của {{ userName }}
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Theo dõi trạng thái tin tuyển dụng, xử lý tin đang chờ duyệt và tạo tin mới từ dữ liệu thật của tài khoản doanh nghiệp hiện tại.
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <NuxtLink
            to="/enterprise/jobs"
            class="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <Icon name="uil:list-ul" class="h-5 w-5" />
            Xem danh sách
          </NuxtLink>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-emerald-300 disabled:opacity-60"
            type="button"
            @click="openCreateJobModal"
          >
            <Icon name="uil:plus-circle" class="h-5 w-5" />
            Đăng tin mới
          </button>
        </div>
      </div>

    </section>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <button
        v-for="stat in statusCards"
        :key="stat.key"
        :class="[
          'rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
          activeStatus === stat.key ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
        ]"
        type="button"
        @click="activeStatus = stat.key"
      >
        <div class="flex items-center justify-between gap-3">
          <span :class="['flex h-10 w-10 items-center justify-center rounded-md', stat.iconClass]">
            <Icon :name="stat.icon" class="h-5 w-5" />
          </span>
          <span class="text-2xl font-black text-slate-950">{{ stat.value }}</span>
        </div>
        <p class="mt-3 text-sm font-black text-slate-900">{{ stat.label }}</p>
        <p class="mt-1 min-h-8 text-xs leading-4 text-slate-500">{{ stat.description }}</p>
      </button>
    </section>

    <div
      v-if="errorMessage"
      class="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
    >
      <Icon name="uil:exclamation-triangle" class="mt-0.5 h-5 w-5 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="space-y-4 border-b border-slate-100 px-5 py-4 lg:px-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-base font-black text-slate-950">Tin tuyển dụng từ hệ thống</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">Danh sách được tải trực tiếp từ API của tài khoản nhà tuyển dụng.</p>
            </div>

            <div class="flex w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 lg:w-80">
              <Icon name="uil:search" class="mr-2 h-4 w-4 text-slate-400" />
              <input
                v-model="searchQuery"
                class="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Tìm theo tiêu đề, địa điểm, trạng thái"
                type="text"
              />
            </div>
          </div>

          <div class="flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              :class="[
                'inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold transition',
                activeStatus === filter.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              ]"
              type="button"
              @click="activeStatus = filter.value"
            >
              <span>{{ filter.label }}</span>
              <span
                :class="[
                  'rounded px-1.5 py-0.5 text-[10px]',
                  activeStatus === filter.value ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                ]"
              >
                {{ filter.count }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="space-y-3 px-5 py-6">
          <div v-for="index in 5" :key="index" class="grid gap-3 rounded-md border border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_120px_120px]">
            <div class="space-y-2">
              <div class="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              <div class="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </div>
            <div class="h-4 animate-pulse rounded bg-slate-100" />
            <div class="h-4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div v-else-if="filteredJobs.length === 0" class="px-5 py-16 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <Icon name="uil:document-info" class="h-7 w-7" />
          </div>
          <h3 class="mt-4 text-sm font-black text-slate-950">{{ emptyTitle }}</h3>
          <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {{ emptyMessage }}
          </p>
          <button
            v-if="!searchQuery && activeStatus === 'ALL'"
            class="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            type="button"
            @click="openCreateJobModal"
          >
            <Icon name="uil:plus-circle" class="h-5 w-5" />
            Tạo tin đầu tiên
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[920px] text-left text-sm">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th class="px-5 py-3">STT</th>
                <th class="px-5 py-3">Tin tuyển dụng</th>
                <th class="px-5 py-3">Địa điểm</th>
                <th class="px-5 py-3">Số lượng</th>
                <th class="px-5 py-3">Mức lương</th>
                <th class="px-5 py-3">Trạng thái</th>
                <th class="px-5 py-3">Ngày tạo</th>
                <th class="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(job, index) in filteredJobs" :key="job.id" class="transition hover:bg-slate-50/80">
                <td class="px-5 py-4 font-black text-slate-400">{{ index + 1 }}</td>
                <td class="px-5 py-4">
                  <p class="max-w-xs truncate font-black text-slate-950">{{ job.title || 'Chưa có tiêu đề' }}</p>
                  <p class="mt-1 max-w-xs truncate text-xs font-semibold text-slate-500">{{ job.requirements || 'Chưa cập nhật yêu cầu' }}</p>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-600">{{ job.location || 'Chưa cập nhật' }}</td>
                <td class="px-5 py-4 font-semibold text-slate-600">{{ formatSlots(job.slots) }}</td>
                <td class="px-5 py-4 font-semibold text-slate-600">{{ job.salary || 'Chưa cập nhật' }}</td>
                <td class="px-5 py-4">
                  <span :class="['inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black uppercase', getStatusClass(job.status)]">
                    {{ getStatusLabel(job.status) }}
                  </span>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-500">{{ formatDate(job.created_at) }}</td>
                <td class="px-5 py-4 text-right">
                  <button
                    v-if="normalizeStatus(job.status) !== 'CLOSED'"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"
                    title="Đóng tin"
                    type="button"
                    @click="closeJob(job.id)"
                  >
                    <Icon name="uil:ban" class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="space-y-5">
        <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-black text-slate-950">Hiệu suất hiển thị</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">Tin đã duyệt trên tổng tin tuyển dụng.</p>
            </div>
            <Icon name="uil:analytics" class="h-5 w-5 text-slate-400" />
          </div>

          <div class="mt-5 rounded-lg bg-slate-950 p-4 text-white">
            <div class="flex items-end justify-between gap-3">
              <div>
                <p class="text-xs font-bold uppercase text-slate-400">Tỷ lệ hiển thị</p>
                <p class="mt-1 text-3xl font-black">{{ approvalRate }}%</p>
              </div>
              <span class="rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">
                {{ countByStatus.APPROVED || 0 }}/{{ totalJobs }}
              </span>
            </div>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div class="h-full rounded-full bg-emerald-400" :style="{ width: `${approvalRate}%` }" />
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-3">
              <p class="text-xs font-bold text-slate-500">Đã duyệt</p>
              <p class="mt-1 text-lg font-black text-slate-950">{{ countByStatus.APPROVED || 0 }}</p>
            </div>
            <div class="rounded-md border border-slate-100 bg-slate-50 px-3 py-3">
              <p class="text-xs font-bold text-slate-500">Tổng tin</p>
              <p class="mt-1 text-lg font-black text-slate-950">{{ totalJobs }}</p>
            </div>
          </div>

          <button
            v-if="rejectedJobs.length > 0"
            class="mt-4 flex w-full items-center justify-between gap-3 rounded-md border border-rose-100 bg-rose-50 px-3 py-2.5 text-left text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            type="button"
            @click="activeStatus = 'REJECTED'"
          >
            <span>{{ rejectedJobs.length }} tin cần chỉnh sửa</span>
            <Icon name="uil:arrow-right" class="h-4 w-4" />
          </button>
        </section>

        <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-black text-slate-950">Chờ admin duyệt</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">Các tin đang ở trạng thái PENDING.</p>
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
              v-for="(job, index) in pendingJobs.slice(0, 4)"
              :key="job.id"
              class="flex items-start gap-3 rounded-md border border-amber-100 bg-amber-50/60 px-4 py-3"
            >
              <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-black text-amber-700">
                {{ index + 1 }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-black text-slate-950">{{ job.title || 'Chưa có tiêu đề' }}</p>
                <p class="mt-1 text-xs font-semibold text-amber-700">{{ formatDate(job.created_at) }}</p>
              </div>
            </article>
          </div>
        </section>

        <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-black text-slate-950">Hoạt động gần đây</h2>
              <p class="mt-1 text-xs font-medium text-slate-500">Sắp xếp theo ngày tạo trong hệ thống.</p>
            </div>
            <Icon name="uil:history" class="h-5 w-5 text-slate-400" />
          </div>

          <div v-if="isLoading" class="mt-5 space-y-3">
            <div v-for="index in 4" :key="index" class="flex items-start gap-3">
              <div class="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-slate-200" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-4 animate-pulse rounded bg-slate-100" />
                <div class="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </div>
          <div v-else-if="recentJobs.length === 0" class="mt-5 rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Chưa có dữ liệu tin tuyển dụng.
          </div>
          <div v-else class="mt-5 space-y-3">
            <article
              v-for="(job, index) in recentJobs.slice(0, 5)"
              :key="job.id"
              class="flex items-start gap-3"
            >
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
                {{ index + 1 }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-slate-900">{{ job.title || 'Chưa có tiêu đề' }}</p>
                <p class="mt-0.5 text-xs font-medium text-slate-500">
                  {{ getStatusLabel(job.status) }} · {{ formatDate(job.created_at) }}
                </p>
              </div>
            </article>
          </div>
        </section>
      </aside>
    </section>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div v-if="createModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 class="text-base font-black text-slate-950">Đăng tin tuyển dụng mới</h3>
              <p class="mt-1 text-xs font-medium text-slate-500">Tin mới sẽ được gửi sang trạng thái chờ duyệt.</p>
            </div>
            <button class="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" type="button" @click="createModalOpen = false">
              <Icon name="uil:multiply" class="h-5 w-5" />
            </button>
          </div>

          <form class="space-y-4 px-5 py-5 text-sm" @submit.prevent="submitCreateJob">
            <div>
              <label class="mb-1.5 block font-bold text-slate-700">Tiêu đề tin tuyển dụng</label>
              <input
                v-model="newJobForm.title"
                class="w-full rounded-md border border-slate-200 px-3 py-2.5 font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                placeholder="Nhập tiêu đề tin"
                required
                type="text"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label class="mb-1.5 block font-bold text-slate-700">Địa điểm làm việc</label>
                <input
                  v-model="newJobForm.location"
                  class="w-full rounded-md border border-slate-200 px-3 py-2.5 font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  placeholder="Nhập địa điểm"
                  required
                  type="text"
                />
              </div>
              <div>
                <label class="mb-1.5 block font-bold text-slate-700">Mức lương</label>
                <input
                  v-model="newJobForm.salary"
                  class="w-full rounded-md border border-slate-200 px-3 py-2.5 font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  placeholder="Nhập mức lương"
                  required
                  type="text"
                />
              </div>
              <div>
                <label class="mb-1.5 block font-bold text-slate-700">Số lượng tuyển</label>
                <input
                  v-model.number="newJobForm.slots"
                  class="w-full rounded-md border border-slate-200 px-3 py-2.5 font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                  min="1"
                  required
                  type="number"
                />
              </div>
            </div>

            <div>
              <label class="mb-1.5 block font-bold text-slate-700">Yêu cầu công việc</label>
              <textarea
                v-model="newJobForm.requirements"
                class="min-h-24 w-full rounded-md border border-slate-200 px-3 py-2.5 font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                placeholder="Nhập yêu cầu công việc"
                required
                rows="3"
              />
            </div>

            <div>
              <label class="mb-1.5 block font-bold text-slate-700">Mô tả công việc</label>
              <textarea
                v-model="newJobForm.description"
                class="min-h-28 w-full rounded-md border border-slate-200 px-3 py-2.5 font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                placeholder="Nhập mô tả nhiệm vụ, quyền lợi và ghi chú"
                required
                rows="4"
              />
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                class="rounded-md border border-slate-200 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50"
                type="button"
                @click="createModalOpen = false"
              >
                Hủy
              </button>
              <button
                class="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                :disabled="submitting"
                type="submit"
              >
                <Icon v-if="submitting" name="svg-spinners:180-ring" class="h-4 w-4" />
                {{ submitting ? 'Đang lưu...' : 'Gửi duyệt' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { JobService } from '~/services/job.service'

type StatusKey = 'ALL' | 'APPROVED' | 'PENDING' | 'DRAFT' | 'REJECTED' | 'CLOSED'
type BreakdownStatusKey = Exclude<StatusKey, 'ALL'>

definePageMeta({
  layout: 'enterprise',
  middleware: ['auth']
})

const authStore = useAuthStore()

const isLoading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const activeStatus = ref('ALL')
const createModalOpen = ref(false)
const errorMessage = ref('')
const jobs = ref<any[]>([])

const userName = computed(() => authStore.user?.name?.trim() || authStore.user?.email?.split('@')[0] || 'Doanh nghiệp')

const newJobForm = ref({
  title: '',
  location: '',
  salary: '',
  requirements: '',
  description: '',
  slots: 1
})

const statusLabels: Record<BreakdownStatusKey, string> = {
  DRAFT: 'Bản nháp',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  CLOSED: 'Đã đóng'
}

const statusMeta: Record<StatusKey, { label: string; description: string; icon: string; iconClass: string }> = {
  ALL: {
    label: 'Tổng tin',
    description: 'Tất cả tin của tài khoản này',
    icon: 'uil:briefcase-alt',
    iconClass: 'bg-slate-100 text-slate-700'
  },
  APPROVED: {
    label: 'Đã duyệt',
    description: 'Tin đang được hiển thị',
    icon: 'uil:check-circle',
    iconClass: 'bg-emerald-50 text-emerald-700'
  },
  PENDING: {
    label: 'Chờ duyệt',
    description: 'Đang chờ admin xử lý',
    icon: 'uil:clock',
    iconClass: 'bg-amber-50 text-amber-700'
  },
  DRAFT: {
    label: 'Bản nháp',
    description: 'Chưa gửi duyệt',
    icon: 'uil:edit-alt',
    iconClass: 'bg-sky-50 text-sky-700'
  },
  REJECTED: {
    label: 'Bị từ chối',
    description: 'Cần xem lại nội dung',
    icon: 'uil:times-circle',
    iconClass: 'bg-rose-50 text-rose-700'
  },
  CLOSED: {
    label: 'Đã đóng',
    description: 'Tin đã ngừng tuyển',
    icon: 'uil:archive',
    iconClass: 'bg-slate-100 text-slate-600'
  }
}

const statusOrder: StatusKey[] = ['ALL', 'APPROVED', 'PENDING', 'DRAFT', 'REJECTED', 'CLOSED']

const totalJobs = computed(() => jobs.value.length)

const countByStatus = computed<Record<string, number>>(() => {
  return jobs.value.reduce((counts, job) => {
    const status = normalizeStatus(job.status)
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {} as Record<string, number>)
})

const statusCards = computed(() => {
  return statusOrder.map((key) => ({
    key,
    value: key === 'ALL' ? totalJobs.value : countByStatus.value[key] || 0,
    ...statusMeta[key]
  }))
})

const statusFilters = computed(() => {
  return statusCards.value.map((card) => ({
    value: card.key,
    label: card.label,
    count: card.value
  }))
})

const sortedJobs = computed(() => {
  return [...jobs.value].sort((a, b) => getDateTime(b.created_at) - getDateTime(a.created_at))
})

const filteredJobs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return sortedJobs.value.filter((job) => {
    const status = normalizeStatus(job.status)
    const matchesStatus = activeStatus.value === 'ALL' || status === activeStatus.value
    const searchable = [
      job.title,
      job.location,
      job.salary,
      job.requirements,
      job.description,
      getStatusLabel(status)
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return matchesStatus && (!query || searchable.includes(query))
  })
})

const pendingJobs = computed(() => sortedJobs.value.filter((job) => normalizeStatus(job.status) === 'PENDING'))
const rejectedJobs = computed(() => sortedJobs.value.filter((job) => normalizeStatus(job.status) === 'REJECTED'))
const recentJobs = computed(() => sortedJobs.value.slice(0, 5))

const approvalRate = computed(() => {
  if (totalJobs.value === 0) return 0
  return Math.round(((countByStatus.value.APPROVED || 0) / totalJobs.value) * 100)
})

const latestJobDateLabel = computed(() => {
  if (sortedJobs.value.length === 0) return 'Chưa có dữ liệu'
  return `Mới nhất ${formatDate(sortedJobs.value[0]?.created_at)}`
})

const emptyTitle = computed(() => {
  if (searchQuery.value) return 'Không tìm thấy tin phù hợp'
  if (activeStatus.value !== 'ALL') return `Không có tin ở trạng thái ${getStatusLabel(activeStatus.value)}`
  return 'Chưa có tin tuyển dụng'
})

const emptyMessage = computed(() => {
  if (searchQuery.value || activeStatus.value !== 'ALL') {
    return 'Thử đổi từ khóa tìm kiếm hoặc chọn trạng thái khác để xem dữ liệu đang có trong hệ thống.'
  }
  return 'Tạo tin tuyển dụng đầu tiên để gửi admin duyệt và bắt đầu hiển thị trên hệ thống.'
})

const statusClasses: Record<string, string> = {
  DRAFT: 'border-sky-100 bg-sky-50 text-sky-700',
  PENDING: 'border-amber-100 bg-amber-50 text-amber-700',
  APPROVED: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-100 bg-rose-50 text-rose-700',
  CLOSED: 'border-slate-200 bg-slate-100 text-slate-600'
}

function normalizeStatus(status?: string) {
  return (status || '').toUpperCase()
}

function isKnownStatus(status: string): status is BreakdownStatusKey {
  return status in statusLabels
}

function getStatusLabel(status?: string) {
  const normalized = normalizeStatus(status)
  return isKnownStatus(normalized) ? statusLabels[normalized] : normalized || 'Chưa có trạng thái'
}

function getStatusClass(status?: string) {
  return statusClasses[normalizeStatus(status)] || 'border-slate-200 bg-slate-50 text-slate-600'
}

function getDateTime(value?: string) {
  if (!value) return 0
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function formatDate(value?: string) {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật'
  return date.toLocaleDateString('vi-VN')
}

function formatSlots(value?: number | string) {
  const slots = Number(value)
  if (!Number.isFinite(slots) || slots <= 0) return 'Chưa cập nhật'
  return `${slots} vị trí`
}

function resetCreateForm() {
  newJobForm.value = {
    title: '',
    location: '',
    salary: '',
    requirements: '',
    description: '',
    slots: 1
  }
}

async function fetchJobs() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    const response: any = await JobService.getEnterpriseJobs()
    jobs.value = response?.success && Array.isArray(response.data) ? response.data : []
  } catch (error: any) {
    jobs.value = []
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách tin tuyển dụng.'
  } finally {
    isLoading.value = false
  }
}

function openCreateJobModal() {
  resetCreateForm()
  errorMessage.value = ''
  createModalOpen.value = true
}

async function submitCreateJob() {
  try {
    submitting.value = true
    errorMessage.value = ''
    const payload = {
      title: newJobForm.value.title.trim(),
      location: newJobForm.value.location.trim(),
      salary: newJobForm.value.salary.trim(),
      requirements: newJobForm.value.requirements.trim(),
      description: newJobForm.value.description.trim(),
      slots: Number(newJobForm.value.slots),
      status: 'PENDING'
    }
    const response: any = await JobService.createEnterpriseJob(payload)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể lưu tin tuyển dụng.')
    }
    createModalOpen.value = false
    activeStatus.value = 'PENDING'
    await fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo tin tuyển dụng.'
  } finally {
    submitting.value = false
  }
}

async function closeJob(id: number) {
  if (!confirm('Bạn có chắc chắn muốn đóng tin tuyển dụng này?')) return

  try {
    errorMessage.value = ''
    const response: any = await JobService.deleteEnterpriseJob(id)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể đóng tin tuyển dụng.')
    }
    await fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể đóng tin tuyển dụng.'
  }
}

onMounted(() => {
  fetchJobs()
})
</script>
