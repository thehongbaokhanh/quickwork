<template>
  <div class="space-y-8 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl md:text-2xl font-black text-slate-900">Danh sách tin tuyển dụng</h1>
        <p class="text-xs text-slate-400 font-semibold mt-1">Quản lý và cập nhật các tin tuyển dụng của doanh nghiệp của bạn.</p>
      </div>
      <div>
        <NuxtLink 
          to="/enterprise/jobs/create"
          class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-98"
        >
          <Icon name="uil:plus-circle" class="w-4 h-4" />
          <span>Tạo tin tuyển dụng</span>
        </NuxtLink>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-4 py-3 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <!-- Filter Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lọc trạng thái:</span>
        <div class="flex items-center gap-1.5 flex-wrap">
          <button 
            v-for="status in statusOptions" 
            :key="status.value"
            @click="changeStatusFilter(status.value)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeFilter === status.value 
                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            ]"
          >
            {{ status.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-3">
      <Icon name="svg-spinners:180-ring" class="w-8 h-8 text-emerald-600 animate-spin" />
      <span class="text-xs font-bold text-slate-400">Đang tải danh sách tin...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="jobs.length === 0" class="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center max-w-md mx-auto space-y-4">
      <div class="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
        <Icon name="uil:folder-question" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-slate-800 text-sm">Chưa có tin tuyển dụng</h3>
        <p class="text-slate-400 text-xs font-medium">Bạn chưa đăng tin nào với bộ lọc này.</p>
      </div>
      <NuxtLink 
        to="/enterprise/jobs/create"
        class="inline-block px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-extrabold text-xs rounded-xl transition-all"
      >
        Tạo tin ngay
      </NuxtLink>
    </div>

    <!-- Jobs Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="(job, index) in jobs" 
        :key="job.id"
        class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/30 transition-all flex flex-col justify-between overflow-hidden"
      >
        <!-- Body -->
        <div class="p-6 space-y-4 flex-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase text-slate-500">
                Tin số {{ index + 1 }}
              </span>
              <span :class="['text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border', getStatusBadge(job.status)]">
                {{ getStatusLabel(job.status) }}
              </span>
            </div>
            <span class="text-[10px] font-bold text-slate-400">
              Số lượng: {{ job.slots }}
            </span>
          </div>

          <div class="space-y-1">
            <h3 class="font-extrabold text-slate-800 text-sm line-clamp-1 hover:text-emerald-600 transition-colors">
              {{ job.title }}
            </h3>
            <p class="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
              {{ job.description || 'Không có mô tả chi tiết.' }}
            </p>
            <div v-if="job.status === 'REJECTED' && job.reject_reason" class="mt-2.5 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-bold leading-normal flex items-start gap-1.5 animate-fadeIn">
              <Icon name="uil:exclamation-octagon" class="w-4 h-4 shrink-0" />
              <span><strong>Lý do từ chối:</strong> {{ job.reject_reason }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 text-[11px] font-semibold text-slate-500">
            <div class="flex items-center gap-1.5">
              <Icon name="uil:money-bill" class="w-4 h-4 text-slate-400" />
              <span>{{ job.salary }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Icon name="uil:map-marker" class="w-4 h-4 text-slate-400" />
              <span class="truncate">{{ job.location || 'Không xác định' }}</span>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span class="text-[10px] text-slate-400 font-bold">
            {{ new Date(job.created_at).toLocaleDateString('vi-VN') }}
          </span>
          <div class="flex items-center gap-2">
            <!-- Edit Button -->
            <button 
              @click="editJob(job)"
              class="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95 flex items-center justify-center"
              title="Sửa tin"
            >
              <Icon name="uil:edit" class="w-4 h-4" />
            </button>
            <!-- Close/Delete Button -->
            <button 
              v-if="job.status !== 'CLOSED'"
              @click="closeJob(job.id)"
              class="p-2 bg-white border border-slate-200 rounded-lg text-slate-450 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 flex items-center justify-center"
              title="Đóng tin"
            >
              <Icon name="uil:times-circle" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Edit Modal -->
    <div v-if="editModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl max-w-md w-full space-y-4">
        <h3 class="font-extrabold text-slate-900 text-sm">Chỉnh sửa tin tuyển dụng</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tiêu đề</label>
            <input 
              v-model="editForm.title" 
              type="text" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mức lương</label>
            <input 
              v-model="editForm.salary" 
              type="text" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Địa điểm</label>
            <input 
              v-model="editForm.location" 
              type="text" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold text-slate-800"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mô tả</label>
            <textarea 
              v-model="editForm.description" 
              rows="3"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold text-slate-800"
            ></textarea>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Số lượng tuyển dụng</label>
            <input 
              v-model.number="editForm.slots" 
              type="number" 
              min="1"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button 
            @click="editModalOpen = false" 
            class="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Hủy
          </button>
          <button 
            @click="saveJobEdit" 
            class="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { JobService } from '~/services/job.service'

definePageMeta({
  layout: 'enterprise',
  middleware: ['company']
})

const jobs = ref<any[]>([])
const loading = ref(true)
const activeFilter = ref('')
const editModalOpen = ref(false)
const editForm = ref<any>({})
const errorMessage = ref('')

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CLOSED', label: 'Đã đóng' }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'bg-slate-50 text-slate-500 border-slate-100'
    case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100/50'
    case 'APPROVED': return 'bg-green-50 text-green-600 border-green-100/50'
    case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100/50'
    case 'CLOSED': return 'bg-slate-100 text-slate-400 border-slate-200'
    default: return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Bản nháp'
    case 'PENDING': return 'Chờ duyệt'
    case 'APPROVED': return 'Đã duyệt'
    case 'REJECTED': return 'Bị từ chối'
    case 'CLOSED': return 'Đã đóng'
    default: return status
  }
}

const fetchJobs = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const response = await JobService.getEnterpriseJobs({ status: activeFilter.value })
    if (response && response.success) {
      jobs.value = Array.isArray(response.data) ? response.data : []
    } else {
      jobs.value = []
      errorMessage.value = response?.message || 'Không thể tải danh sách tin tuyển dụng.'
    }
  } catch (error: any) {
    jobs.value = []
    errorMessage.value = error?.data?.message || error?.message || 'Không thể tải danh sách tin tuyển dụng.'
    console.error('Failed to fetch jobs:', error)
  } finally {
    loading.value = false
  }
}

const changeStatusFilter = (status: string) => {
  activeFilter.value = status
  fetchJobs()
}

const closeJob = async (id: number) => {
  if (!confirm('Bạn có chắc chắn muốn đóng tin tuyển dụng này?')) return

  try {
    errorMessage.value = ''
    const response: any = await JobService.deleteEnterpriseJob(id)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể đóng tin tuyển dụng.')
    }
    alert('Đã đóng tin tuyển dụng thành công!')
    fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể đóng tin tuyển dụng.'
  }
}

const editJob = (job: any) => {
  editForm.value = { ...job }
  editModalOpen.value = true
}

const saveJobEdit = async () => {
  try {
    errorMessage.value = ''
    const response: any = await JobService.updateEnterpriseJob(editForm.value.id, editForm.value)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể cập nhật tin tuyển dụng.')
    }
    alert('Đã cập nhật tin tuyển dụng thành công!')
    editModalOpen.value = false
    fetchJobs()
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Không thể cập nhật tin tuyển dụng.'
  }
}

onMounted(() => {
  fetchJobs()
})
</script>
