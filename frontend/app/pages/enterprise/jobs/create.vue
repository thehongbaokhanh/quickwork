<template>
  <div class="max-w-3xl mx-auto space-y-8 py-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <NuxtLink 
        to="/enterprise/jobs" 
        class="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all shadow-sm flex items-center justify-center active:scale-95"
      >
        <Icon name="uil:arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-xl md:text-2xl font-black text-slate-900">Đăng tin tuyển dụng mới</h1>
        <p class="text-xs text-slate-400 font-semibold mt-1">Điền thông tin chi tiết về cơ hội việc làm để thu hút ứng viên chất lượng.</p>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-4 py-3 text-sm font-semibold">
      {{ errorMessage }}
    </div>

    <!-- Form Container -->
    <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6">
      <form @submit.prevent class="space-y-6">
        <!-- Grid fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tiêu đề công việc <span class="text-rose-500">*</span></label>
            <input 
              v-model="form.title" 
              type="text" 
              required
              placeholder="Nhập tiêu đề công việc"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mức lương <span class="text-rose-500">*</span></label>
            <input 
              v-model="form.salary" 
              type="text" 
              required
              placeholder="Nhập mức lương"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Số lượng tuyển dụng <span class="text-rose-500">*</span></label>
            <input 
              v-model.number="form.slots" 
              type="number" 
              min="1"
              required
              placeholder="Nhập số lượng"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Địa điểm làm việc</label>
            <input 
              v-model="form.location" 
              type="text" 
              placeholder="Nhập địa điểm làm việc"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Yêu cầu công việc</label>
            <input 
              v-model="form.requirements" 
              type="text" 
              placeholder="Nhập yêu cầu công việc"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mô tả chi tiết công việc <span class="text-rose-500">*</span></label>
          <textarea 
            v-model="form.description" 
            rows="5"
            required
            placeholder="Nhiệm vụ, dự án sẽ tham gia, quyền lợi được hưởng..."
            class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 transition-all placeholder:text-slate-400"
          ></textarea>
        </div>

        <!-- Submit buttons -->
        <div class="pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button 
            type="button"
            :disabled="submitting"
            @click="submitJob('DRAFT')"
            class="w-full sm:w-auto px-6 py-3 border border-slate-200 text-slate-600 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Icon name="uil:save" class="w-4 h-4" />
            Lưu nháp
          </button>
          <button 
            type="button"
            :disabled="submitting"
            @click="submitJob('PENDING')"
            class="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Icon v-if="submitting" name="svg-spinners:180-ring" class="w-4 h-4 animate-spin" />
            <Icon v-else name="uil:message" class="w-4 h-4" />
            Gửi duyệt tin
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { JobService } from '~/services/job.service'

definePageMeta({
  layout: 'enterprise',
  middleware: ['auth']
})

const router = useRouter()
const submitting = ref(false)
const errorMessage = ref('')

const form = ref({
  title: '',
  salary: '',
  description: '',
  requirements: '',
  location: '',
  slots: 1,
  status: 'DRAFT'
})

const submitJob = async (status: 'DRAFT' | 'PENDING') => {
  if (!form.value.title || !form.value.salary || !form.value.description || !form.value.slots) {
    alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*).')
    return
  }

  try {
    submitting.value = true
    errorMessage.value = ''
    const payload = {
      title: form.value.title.trim(),
      salary: form.value.salary.trim(),
      description: form.value.description.trim(),
      requirements: form.value.requirements.trim(),
      location: form.value.location.trim(),
      slots: Number(form.value.slots),
      status
    }
    const response: any = await JobService.createEnterpriseJob(payload)
    if (!response?.success) {
      throw new Error(response?.message || 'Không thể lưu tin tuyển dụng.')
    }
    alert(status === 'DRAFT' ? 'Đã lưu nháp tin tuyển dụng thành công!' : 'Đã gửi duyệt tin tuyển dụng thành công!')
    router.push('/enterprise/jobs')
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo tin tuyển dụng.'
  } finally {
    submitting.value = false
  }
}
</script>
