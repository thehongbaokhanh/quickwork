<template>
  <div class="space-y-8">
    <!-- Header Welcome & Quick Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl md:text-2xl font-black text-slate-900">Xin chào, {{ userName }} 👋</h1>
        <p class="text-xs text-slate-400 font-semibold mt-1">Chúc bạn một ngày làm việc hiệu quả và tuyển dụng thành công!</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="openCreateJobModal"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-98"
        >
          <Icon name="uil:plus-circle" class="w-4.5 h-4.5" />
          <span>Đăng tin tuyển dụng</span>
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div 
        v-for="stat in stats" 
        :key="stat.title"
        class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
      >
        <span class="text-xs font-semibold text-slate-400">{{ stat.title }}</span>
        <div class="flex items-baseline justify-between mt-3">
          <span class="text-2xl font-black text-slate-800">{{ stat.value }}</span>
          <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded', stat.trendClass]">
            {{ stat.trend }}
          </span>
        </div>
      </div>
    </section>

    <!-- Chart & Quick Actions Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- SVG Trend Chart (Col span 2) -->
      <div class="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-extrabold text-slate-900 text-sm">Thống kê ứng viên</h3>
            <p class="text-[11px] text-slate-400 font-medium">Xu hướng ứng tuyển trong 6 tháng gần nhất</p>
          </div>
          <span class="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">Chi tiết báo cáo</span>
        </div>

        <!-- SVG Line Chart Mockup -->
        <div class="relative h-60 w-full pt-4 flex items-end">
          <svg class="w-full h-full" viewBox="0 0 600 220">
            <!-- Grid lines -->
            <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" stroke-width="1" />
            <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" stroke-width="1" />
            <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" stroke-width="1" />
            <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f5f9" stroke-width="1" />
            <line x1="40" y1="200" x2="580" y2="200" stroke="#cbd5e1" stroke-width="1.5" />

            <!-- Y Axis indicators -->
            <text x="10" y="25" fill="#94a3b8" font-size="10" font-weight="600">80</text>
            <text x="10" y="75" fill="#94a3b8" font-size="10" font-weight="600">50</text>
            <text x="10" y="125" fill="#94a3b8" font-size="10" font-weight="600">30</text>
            <text x="10" y="175" fill="#94a3b8" font-size="10" font-weight="600">10</text>
            <text x="15" y="205" fill="#94a3b8" font-size="10" font-weight="600">0</text>

            <!-- Chart Line -->
            <path 
              d="M 60 160 L 150 140 L 240 90 L 330 110 L 420 50 L 510 30" 
              fill="none" 
              stroke="#4f46e5" 
              stroke-width="3" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />

            <!-- Dots -->
            <circle cx="60" cy="160" r="5" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
            <circle cx="150" cy="140" r="5" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
            <circle cx="240" cy="90" r="5" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
            <circle cx="330" cy="110" r="5" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
            <circle cx="420" cy="50" r="5" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
            <circle cx="510" cy="30" r="5" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />

            <!-- X Axis indicators -->
            <text x="45" y="218" fill="#94a3b8" font-size="10" font-weight="600">Tháng 1</text>
            <text x="135" y="218" fill="#94a3b8" font-size="10" font-weight="600">Tháng 2</text>
            <text x="225" y="218" fill="#94a3b8" font-size="10" font-weight="600">Tháng 3</text>
            <text x="315" y="218" fill="#94a3b8" font-size="10" font-weight="600">Tháng 4</text>
            <text x="405" y="218" fill="#94a3b8" font-size="10" font-weight="600">Tháng 5</text>
            <text x="495" y="218" fill="#94a3b8" font-size="10" font-weight="600">Tháng 6</text>
          </svg>
        </div>
      </div>

      <!-- Quick Actions (Col span 1) -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
        <div>
          <h3 class="font-extrabold text-slate-900 text-sm">Thao tác nhanh</h3>
          <p class="text-[11px] text-slate-400 font-medium">Lối tắt quản lý hệ thống</p>
        </div>

        <div class="grid grid-cols-2 gap-3.5">
          <button 
            @click="openCreateJobModal"
            class="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-slate-700 hover:text-indigo-600 transition-all font-semibold text-xs active:scale-98"
          >
            <Icon name="uil:plus-circle" class="w-6 h-6" />
            <span>Đăng tin</span>
          </button>
          
          <a 
            href="#"
            class="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-slate-700 hover:text-indigo-600 transition-all font-semibold text-xs active:scale-98"
          >
            <Icon name="uil:users-alt" class="w-6 h-6" />
            <span>Xem ứng viên</span>
          </a>

          <a 
            href="#"
            class="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-slate-700 hover:text-indigo-600 transition-all font-semibold text-xs active:scale-98"
          >
            <Icon name="uil:edit" class="w-6 h-6" />
            <span>Sửa Công ty</span>
          </a>

          <a 
            href="#"
            class="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-slate-700 hover:text-indigo-600 transition-all font-semibold text-xs active:scale-98"
          >
            <Icon name="uil:user-circle" class="w-6 h-6" />
            <span>Hồ sơ Admin</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Recent Jobs List Table -->
    <section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <!-- Header Table -->
      <div class="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="font-extrabold text-slate-900 text-sm">Tin tuyển dụng gần đây</h3>
          <p class="text-[11px] text-slate-400 font-medium">Danh sách các tin tuyển dụng đang hoạt động</p>
        </div>
        
        <!-- Filter Search inside Table -->
        <div class="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 w-72 text-xs">
          <Icon name="uil:search" class="text-slate-400 mr-2 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm tin tuyển dụng..." 
            v-model="searchQuery"
            class="bg-transparent border-none text-slate-800 focus:outline-none w-full"
          />
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse flex items-center justify-between py-3 border-b border-slate-50">
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-100 rounded-lg w-1/3"></div>
            <div class="h-3 bg-slate-100 rounded-lg w-1/4"></div>
          </div>
          <div class="w-24 h-6 bg-slate-100 rounded-lg"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredJobs.length === 0" class="p-12 text-center space-y-4">
        <div class="w-14 h-14 bg-slate-50 text-slate-400 flex items-center justify-center rounded-full mx-auto text-2xl">
          <Icon name="uil:document-info" />
        </div>
        <h4 class="font-bold text-slate-900 text-sm">Không tìm thấy tin tuyển dụng nào</h4>
        <p class="text-slate-500 text-xs max-w-xs mx-auto">Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm. Vui lòng nhập từ khóa khác.</p>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs font-semibold text-slate-600">
          <thead class="bg-slate-50/50 text-[10px] text-slate-400 uppercase border-b border-slate-100">
            <tr>
              <th class="px-6 py-4">Tiêu đề tuyển dụng</th>
              <th class="px-6 py-4">Địa điểm</th>
              <th class="px-6 py-4">Mức lương</th>
              <th class="px-6 py-4">Trạng thái</th>
              <th class="px-6 py-4">Ngày đăng</th>
              <th class="px-6 py-4 text-center">Ứng viên</th>
              <th class="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr 
              v-for="job in filteredJobs" 
              :key="job.id"
              class="hover:bg-slate-50/40 transition-colors"
            >
              <td class="px-6 py-4.5">
                <span class="font-bold text-slate-950 text-xs block hover:text-indigo-600 cursor-pointer transition-colors">{{ job.title }}</span>
                <span class="text-[10px] text-slate-400 font-semibold block mt-0.5">{{ job.type }}</span>
              </td>
              <td class="px-6 py-4.5 font-medium text-slate-500">{{ job.location }}</td>
              <td class="px-6 py-4.5 font-medium text-slate-500">{{ job.salary }}</td>
              <td class="px-6 py-4.5">
                <span :class="['px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border', job.statusClass]">
                  {{ job.status }}
                </span>
              </td>
              <td class="px-6 py-4.5 font-medium text-slate-400">{{ job.createdAt }}</td>
              <td class="px-6 py-4.5 text-center">
                <span class="inline-flex items-center justify-center bg-indigo-50 text-indigo-600 w-6 h-6 rounded-full font-bold">
                  {{ job.applicantsCount }}
                </span>
              </td>
              <td class="px-6 py-4.5 text-right space-x-2">
                <button 
                  @click="openActionDemo('Chi tiết', job)"
                  class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-all"
                  title="Chi tiết"
                >
                  <Icon name="uil:eye" class="w-4.5 h-4.5" />
                </button>
                <button 
                  @click="openActionDemo('Đóng tin', job)"
                  class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50/50 rounded-lg transition-all"
                  title="Đóng tin"
                >
                  <Icon name="uil:ban" class="w-4.5 h-4.5" />
                </button>
                <button 
                  @click="openActionDemo('Xóa', job)"
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-all"
                  title="Xóa tin"
                >
                  <Icon name="uil:trash-alt" class="w-4.5 h-4.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Create Job Modal Simulator -->
    <transition 
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="createModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl max-w-md w-full space-y-4 text-left">
          <div class="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 class="font-extrabold text-slate-900 text-sm">Đăng tin tuyển dụng mới</h3>
            <button @click="createModalOpen = false" class="text-slate-400 hover:text-slate-600">
              <Icon name="uil:multiply" class="w-5 h-5" />
            </button>
          </div>
          <form @submit.prevent="submitCreateJob" class="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label class="block text-slate-600 mb-1">Tiêu đề tin tuyển dụng</label>
              <input 
                type="text" 
                required 
                v-model="newJobForm.title"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                placeholder="Ví dụ: Thực tập sinh Golang Backend"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-600 mb-1">Địa điểm làm việc</label>
                <input 
                  type="text" 
                  required 
                  v-model="newJobForm.location"
                  class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  placeholder="Hà Nội, TP. HCM..."
                />
              </div>
              <div>
                <label class="block text-slate-600 mb-1">Mức lương</label>
                <input 
                  type="text" 
                  required 
                  v-model="newJobForm.salary"
                  class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  placeholder="5 - 8 triệu, Thỏa thuận..."
                />
              </div>
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Loại công việc</label>
              <select 
                v-model="newJobForm.type"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Thực tập">Thực tập (Intern)</option>
                <option value="Bán thời gian">Bán thời gian (Part-time)</option>
                <option value="Toàn thời gian">Toàn thời gian (Full-time)</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-600 mb-1">Mô tả công việc</label>
              <textarea 
                rows="3"
                required
                v-model="newJobForm.description"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                placeholder="Mô tả công việc cần làm..."
              ></textarea>
            </div>
            <div class="pt-3 border-t border-slate-50 flex items-center justify-end gap-3">
              <button 
                type="button" 
                @click="createModalOpen = false" 
                class="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all font-bold"
              >
                Đăng tuyển
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- General Action Modal Simulator -->
    <transition 
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="actionModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl max-w-sm w-full space-y-5 text-center">
          <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            <Icon name="uil:info-circle" />
          </div>
          <div class="space-y-1">
            <h3 class="font-extrabold text-slate-900 text-sm">Thông báo thao tác</h3>
            <p class="text-slate-500 text-xs leading-normal">
              Đã mô phỏng thành công hành động <span class="font-bold text-slate-800">{{ activeAction }}</span> đối với tin tuyển dụng <span class="font-bold text-slate-800">{{ activeActionJob?.title }}</span>.
            </p>
          </div>
          <button 
            @click="actionModalOpen = false" 
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'enterprise',
  middleware: ['auth']
})

const authStore = useAuthStore()

const isLoading = ref(true)
const searchQuery = ref('')
const createModalOpen = ref(false)
const actionModalOpen = ref(false)
const activeAction = ref('')
const activeActionJob = ref<any>(null)

const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Doanh nghiệp')

const newJobForm = ref({
  title: '',
  location: '',
  salary: '',
  type: 'Thực tập',
  description: ''
})

const stats = [
  { title: 'Tổng số tin đã đăng', value: '14', trend: '+2 trong tháng', trendClass: 'bg-green-50 text-green-600' },
  { title: 'Tin đang hiển thị', value: '8', trend: 'Hoạt động', trendClass: 'bg-indigo-50 text-indigo-600' },
  { title: 'Tin đang chờ duyệt', value: '3', trend: 'Cần xử lý', trendClass: 'bg-amber-50 text-amber-600' },
  { title: 'Tin tuyển đã đóng', value: '3', trend: 'Lưu trữ', trendClass: 'bg-slate-100 text-slate-600' },
  { title: 'Tổng số ứng viên', value: '86', trend: '+14% tuần này', trendClass: 'bg-green-50 text-green-600' },
  { title: 'Lượt xem tin tuyển', value: '1,240', trend: '+8.3% ngày', trendClass: 'bg-green-50 text-green-600' }
]

const recentJobs = ref([
  {
    id: 1,
    title: 'Thực tập sinh Golang Backend (Go/SQL)',
    type: 'Thực tập',
    location: 'Hà Nội',
    salary: '5 - 8 triệu',
    status: 'Đang tuyển',
    statusClass: 'bg-green-50 text-green-600 border-green-100/50',
    createdAt: '01/07/2026',
    applicantsCount: 18
  },
  {
    id: 2,
    title: 'Thực tập sinh Frontend Developer (VueJS/Nuxt)',
    type: 'Thực tập',
    location: 'TP. HCM',
    salary: '6 - 9 triệu',
    status: 'Đang tuyển',
    statusClass: 'bg-green-50 text-green-600 border-green-100/50',
    createdAt: '30/06/2026',
    applicantsCount: 14
  },
  {
    id: 3,
    title: 'Content Creator Part-time',
    type: 'Bán thời gian',
    location: 'Đà Nẵng',
    salary: '4 - 6 triệu',
    status: 'Chờ duyệt',
    statusClass: 'bg-amber-50 text-amber-600 border-amber-100/50',
    createdAt: '29/06/2026',
    applicantsCount: 5
  },
  {
    id: 4,
    title: 'Mobile Engineer Intern (React Native)',
    type: 'Thực tập',
    location: 'TP. HCM',
    salary: 'Thỏa thuận',
    status: 'Đã đóng',
    statusClass: 'bg-slate-50 text-slate-400 border-slate-100',
    createdAt: '15/06/2026',
    applicantsCount: 22
  }
])

const filteredJobs = computed(() => {
  if (!searchQuery.value) return recentJobs.value
  const query = searchQuery.value.toLowerCase()
  return recentJobs.value.filter(job => 
    job.title.toLowerCase().includes(query) ||
    job.location.toLowerCase().includes(query) ||
    job.status.toLowerCase().includes(query)
  )
})

const openCreateJobModal = () => {
  newJobForm.value = {
    title: '',
    location: '',
    salary: '',
    type: 'Thực tập',
    description: ''
  }
  createModalOpen.value = true
}

const submitCreateJob = () => {
  const newJob = {
    id: Date.now(),
    title: newJobForm.value.title,
    type: newJobForm.value.type,
    location: newJobForm.value.location,
    salary: newJobForm.value.salary,
    status: 'Chờ duyệt',
    statusClass: 'bg-amber-50 text-amber-600 border-amber-100/50',
    createdAt: new Date().toLocaleDateString('vi-VN'),
    applicantsCount: 0
  }
  recentJobs.value.unshift(newJob)
  createModalOpen.value = false
}

const openActionDemo = (action: string, job: any) => {
  activeAction.value = action
  activeActionJob.value = job
  actionModalOpen.value = true
}

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>
