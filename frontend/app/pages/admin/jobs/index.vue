<template>
  <div class="space-y-5">
    <section class="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm lg:p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-black text-white">
            <Icon name="uil:briefcase-alt" class="h-4 w-4" />
            Duyệt nội dung
          </div>
          <h1 class="mt-4 text-2xl font-black lg:text-3xl">Duyệt tin tuyển dụng</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Kiểm tra các tin đang chờ phê duyệt từ dữ liệu thật trong hệ thống.
          </p>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
          type="button"
          @click="fetchPendingJobs"
        >
          <Icon name="uil:sync" class="h-4 w-4" />
          Tải lại
        </button>
      </div>
    </section>

    <div v-if="errorMessage" class="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-3">
      <Icon name="svg-spinners:180-ring" class="w-8 h-8 text-indigo-600 animate-spin" />
      <span class="text-xs font-bold text-slate-400">Đang tải danh sách chờ duyệt...</span>
    </div>

    <div
      v-else-if="jobs.length === 0"
      class="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div class="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
        <Icon name="uil:check-circle" class="text-emerald-500" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-slate-800 text-sm">Không có tin chờ duyệt</h3>
        <p class="text-slate-400 text-xs font-medium">
          API đã trả về thành công nhưng không có job nào có status PENDING.
        </p>
      </div>
    </div>

    <div v-else class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-xs font-black uppercase text-slate-500">
              <th class="px-6 py-3">STT</th>
              <th class="px-6 py-3">Doanh nghiệp</th>
              <th class="px-6 py-3">Công việc</th>
              <th class="px-6 py-3">Mức lương</th>
              <th class="px-6 py-3">Địa điểm</th>
              <th class="px-6 py-3">Ngày tạo</th>
              <th class="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="(job, index) in jobs" :key="job.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4 font-black text-slate-400">{{ index + 1 }}</td>
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">
                  {{ getCompanyName(job) }}
                </div>
                <div class="text-[10px] text-slate-400 font-semibold mt-0.5">
                  MST: {{ job.enterprise_profile?.tax_code || 'N/A' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-800">{{ job.title }}</div>
                <div class="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                  {{ job.description || 'Không có mô tả.' }}
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ job.salary || 'N/A' }}</td>
              <td class="px-6 py-4 text-slate-500">{{ job.location || 'N/A' }}</td>
              <td class="px-6 py-4 text-slate-500">{{ formatDate(job.created_at) }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  class="qw-chip bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  @click="openReview(job)"
                >
                  Xem duyệt
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="reviewModalOpen" class="qw-detail-backdrop" @click.self="reviewModalOpen = false">
      <section class="qw-detail-panel">
        <header class="qw-detail-header">
          <div class="qw-detail-identity">
            <div class="qw-detail-avatar">
              <Icon name="uil:file-check-alt" class="h-6 w-6" />
            </div>
            <div class="min-w-0">
              <p class="qw-detail-eyebrow">Đánh giá tin tuyển dụng</p>
              <h3 class="qw-detail-title">{{ selectedJob?.title || 'Tin tuyển dụng' }}</h3>
              <p class="qw-detail-subtitle">{{ selectedJob ? getCompanyName(selectedJob) : 'Doanh nghiệp' }}</p>
              <div class="qw-detail-badges">
                <span class="qw-chip bg-amber-50 text-amber-700">Chờ duyệt</span>
                <span class="qw-chip bg-slate-100 text-slate-700">{{ formatDate(selectedJob?.created_at) }}</span>
              </div>
            </div>
          </div>
          <button class="qw-detail-close" type="button" @click="reviewModalOpen = false">
            <Icon name="uil:times" class="h-5 w-5" />
          </button>
        </header>

        <div class="qw-detail-body space-y-4">
          <div class="qw-detail-grid">
            <div class="qw-detail-item">
              <p class="qw-detail-label">Công ty</p>
              <p class="qw-detail-value">{{ selectedJob ? getCompanyName(selectedJob) : 'N/A' }}</p>
            </div>
            <div class="qw-detail-item">
              <p class="qw-detail-label">Mức lương</p>
              <p class="qw-detail-value">{{ selectedJob?.salary || 'N/A' }}</p>
            </div>
            <div class="qw-detail-item">
              <p class="qw-detail-label">Địa điểm</p>
              <p class="qw-detail-value">{{ selectedJob?.location || 'N/A' }}</p>
            </div>
            <div class="qw-detail-item">
              <p class="qw-detail-label">Ngày tạo</p>
              <p class="qw-detail-value">{{ formatDate(selectedJob?.created_at) }}</p>
            </div>
          </div>

          <div class="qw-detail-item">
            <p class="qw-detail-label">Mô tả</p>
            <p class="qw-detail-value line-clamp-5">{{ selectedJob?.description || 'Không có mô tả.' }}</p>
          </div>

          <div class="flex items-center gap-3">
          <button
            :class="[
              'flex-1 rounded-md border px-4 py-3 text-xs font-black transition flex items-center justify-center gap-2',
              decision === 'APPROVED'
                ? 'bg-green-50 text-green-700 border-green-200 shadow-sm shadow-green-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            ]"
            @click="decision = 'APPROVED'"
          >
            <Icon name="uil:check-circle" class="w-4.5 h-4.5" />
            Phê duyệt
          </button>
          <button
            :class="[
              'flex-1 rounded-md border px-4 py-3 text-xs font-black transition flex items-center justify-center gap-2',
              decision === 'REJECTED'
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            ]"
            @click="decision = 'REJECTED'"
          >
            <Icon name="uil:times-circle" class="w-4.5 h-4.5" />
            Từ chối
          </button>
          </div>

          <div v-if="decision === 'REJECTED'" class="space-y-1.5">
          <label class="block text-[11px] font-bold uppercase text-rose-600">
            Lý do từ chối <span class="text-rose-500">*</span>
          </label>
          <textarea
            v-model="rejectReason"
            required
            rows="3"
            placeholder="Nêu rõ lý do từ chối..."
            class="w-full rounded-md border border-rose-200 bg-rose-50/10 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            class="rounded-md border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            @click="reviewModalOpen = false"
          >
            Hủy
          </button>
          <button
            :disabled="reviewing || (decision === 'REJECTED' && !rejectReason)"
            class="rounded-md bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
            @click="submitReview"
          >
            {{ reviewing ? 'Đang lưu...' : 'Xác nhận' }}
          </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AdminService } from '~/services/admin.service'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const jobs = ref<any[]>([])
const loading = ref(true)
const reviewing = ref(false)
const errorMessage = ref('')
const reviewModalOpen = ref(false)
const selectedJob = ref<any>(null)
const decision = ref<'APPROVED' | 'REJECTED'>('APPROVED')
const rejectReason = ref('')

const getCompanyName = (job: any) => {
  return job?.enterprise_profile?.company_name || 'Doanh nghiệp chưa cập nhật tên'
}

const formatDate = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('vi-VN')
}

const fetchPendingJobs = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const res = await AdminService.getPendingJobs({ status: 'PENDING' })
    jobs.value = res?.success && Array.isArray(res.data) ? res.data : []
  } catch (error: any) {
    jobs.value = []
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách job chờ duyệt.'
    console.error('Failed to load pending jobs:', error)
  } finally {
    loading.value = false
  }
}

const openReview = (job: any) => {
  selectedJob.value = job
  decision.value = 'APPROVED'
  rejectReason.value = ''
  reviewModalOpen.value = true
}

const submitReview = async () => {
  if (!selectedJob.value) return
  if (decision.value === 'REJECTED' && !rejectReason.value) {
    alert('Vui lòng nhập lý do từ chối.')
    return
  }

  try {
    reviewing.value = true
    errorMessage.value = ''
    await AdminService.reviewJob(selectedJob.value.id, {
      status: decision.value,
      reject_reason: decision.value === 'REJECTED' ? rejectReason.value : undefined
    })
    reviewModalOpen.value = false
    await fetchPendingJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Có lỗi xảy ra khi duyệt tin.'
  } finally {
    reviewing.value = false
  }
}

onMounted(() => {
  fetchPendingJobs()
})
</script>
