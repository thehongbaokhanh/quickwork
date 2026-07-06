<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    <!-- Welcome Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-indigo-100/50 relative overflow-hidden">
      <!-- Design circles overlay -->
      <div class="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full transform translate-x-20 -translate-y-20"></div>
      <div class="absolute left-1/3 bottom-0 w-48 h-48 bg-white/5 rounded-full transform translate-y-20"></div>

      <div class="max-w-xl space-y-4 relative">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Xin chào, {{ userName }}! 👋
        </h1>
        <p class="text-indigo-100 text-xs sm:text-sm leading-relaxed font-normal">
          Chào mừng bạn quay lại với hệ thống QuickWork. Hãy cập nhật CV cá nhân để lọt vào mắt xanh của hàng trăm doanh nghiệp uy tín hàng đầu.
        </p>

        <!-- Interactive Search & Filter Bar -->
        <div class="pt-4 flex flex-col sm:flex-row gap-3">
          <div class="flex items-center bg-white/10 backdrop-blur border border-white/20 rounded-xl px-3.5 py-2.5 flex-1 text-xs">
            <Icon name="uil:search" class="text-white/70 mr-2 w-4.5 h-4.5" />
            <input 
              type="text" 
              placeholder="Tìm vị trí thực tập, part-time..." 
              v-model="searchQuery"
              class="bg-transparent border-none text-white placeholder-white/60 focus:outline-none w-full"
            />
          </div>
          <button 
            @click="clearFilters"
            class="px-5 py-2.5 bg-white text-indigo-600 font-bold text-xs rounded-xl shadow hover:bg-slate-50 active:scale-98 transition-all shrink-0"
          >
            Xem tất cả
          </button>
        </div>

        <!-- Quick Filters Tags -->
        <div class="flex flex-wrap gap-2 pt-2">
          <span 
            v-for="tag in filterTags" 
            :key="tag" 
            @click="toggleFilterTag(tag)"
            :class="['px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border shadow-sm', activeTag === tag ? 'bg-white text-indigo-600 border-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/20']"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <!-- Stat item 1 -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
        <div>
          <span class="text-2xl font-black text-slate-900">850+</span>
          <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Việc làm phù hợp</div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
          <Icon name="uil:briefcase-alt" />
        </div>
      </div>

      <!-- Stat item 2 -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
        <div>
          <span class="text-2xl font-black text-slate-900">4,200+</span>
          <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Đối tác doanh nghiệp</div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
          <Icon name="uil:building" />
        </div>
      </div>

      <!-- Stat item 3 -->
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
        <div>
          <span class="text-2xl font-black text-slate-900">12.5K+</span>
          <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Ứng viên đã kết nối</div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
          <Icon name="uil:users-alt" />
        </div>
      </div>
    </section>

    <!-- Featured Jobs Grid -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-extrabold text-slate-900">Việc làm nổi bật</h2>
          <p class="text-xs text-slate-400 font-medium">Được doanh nghiệp tài trợ tuyển dụng gấp</p>
        </div>
        <span class="text-xs font-bold text-indigo-600 cursor-pointer hover:underline">Xem thêm &rarr;</span>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse space-y-4">
          <div class="flex gap-4">
            <div class="w-12 h-12 rounded-2xl bg-slate-100"></div>
            <div class="flex-1 space-y-2 py-1">
              <div class="h-4 bg-slate-100 rounded-lg w-3/4"></div>
              <div class="h-3 bg-slate-100 rounded-lg w-1/2"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-slate-100 rounded-lg w-full"></div>
            <div class="h-3 bg-slate-100 rounded-lg w-5/6"></div>
          </div>
          <div class="flex gap-2">
            <div class="h-6 bg-slate-100 rounded-lg w-20"></div>
            <div class="h-6 bg-slate-100 rounded-lg w-20"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredFeaturedJobs.length === 0" class="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto text-3xl">
          <Icon name="uil:frown" />
        </div>
        <h3 class="font-bold text-slate-900">Không tìm thấy việc làm phù hợp</h3>
        <p class="text-slate-500 text-sm max-w-sm mx-auto">Chúng tôi không tìm thấy kết quả khớp với bộ lọc hoặc từ khóa hiện tại. Vui lòng thay đổi thông tin lọc tìm kiếm.</p>
        <button @click="clearFilters" class="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow transition-all hover:bg-indigo-700">Xóa bộ lọc</button>
      </div>

      <!-- Featured Jobs List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="job in filteredFeaturedJobs" 
          :key="job.id"
          class="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        >
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-sm shrink-0 border border-indigo-100/40">
                {{ job.logoFallback }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors cursor-pointer">{{ job.title }}</h3>
                <p class="text-xs text-slate-400 font-semibold mt-0.5">{{ job.company }}</p>
              </div>
              <span class="ml-auto bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-indigo-100/50 shrink-0">
                {{ job.badge }}
              </span>
            </div>
            <p class="text-xs text-slate-500 leading-normal">{{ job.description }}</p>
          </div>

          <div class="flex items-center justify-between border-t border-slate-50 mt-6 pt-4 text-xs font-semibold text-slate-500">
            <div class="flex flex-wrap gap-3">
              <span class="flex items-center gap-1"><Icon name="uil:usd-circle" class="text-indigo-500 w-4 h-4" />{{ job.salary }}</span>
              <span class="flex items-center gap-1"><Icon name="uil:map-marker" class="text-indigo-500 w-4 h-4" />{{ job.location }}</span>
            </div>
            <button 
              @click="openQuickApply(job)" 
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-md shadow-indigo-100/80 transition-all hover:scale-102"
            >
              Ứng tuyển
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- New Jobs & Featured Companies Row -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- New Jobs List (Left Col) -->
      <div class="lg:col-span-8 space-y-6">
        <div>
          <h2 class="text-lg font-extrabold text-slate-900">Danh sách việc làm mới</h2>
          <p class="text-xs text-slate-400 font-medium">Hồ sơ ứng tuyển được cập nhật trong ngày</p>
        </div>

        <div class="space-y-4">
          <div 
            v-for="job in newJobs" 
            :key="job.id" 
            class="bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-100/50 shadow-sm hover:shadow hover:-translate-y-[1px] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                {{ job.logoFallback }}
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors cursor-pointer">{{ job.title }}</h4>
                <p class="text-[11px] text-slate-400 font-semibold mt-0.5">{{ job.company }} • <span class="font-normal">{{ job.salary }}</span></p>
              </div>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0">
              <div class="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span class="flex items-center gap-1"><Icon name="uil:map-marker" class="w-4.5 h-4.5" />{{ job.location }}</span>
                <span class="px-2 py-0.5 bg-slate-50 rounded text-[10px] font-bold text-slate-500 uppercase">{{ job.type }}</span>
              </div>
              <button 
                @click="openQuickApply(job)"
                class="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-xl transition-all"
              >
                Nộp đơn
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Companies (Right Col) -->
      <div class="lg:col-span-4 space-y-6">
        <div>
          <h2 class="text-lg font-extrabold text-slate-900">Doanh nghiệp nổi bật</h2>
          <p class="text-xs text-slate-400 font-medium">Đối tác KYB xác thực chính thức</p>
        </div>

        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          <div 
            v-for="company in featuredCompanies" 
            :key="company.name" 
            class="p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0">
              {{ company.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-slate-900 text-xs truncate">{{ company.name }}</h4>
              <p class="text-[10px] text-indigo-600 font-semibold mt-0.5">{{ company.openJobs }} việc làm đang mở</p>
            </div>
            <Icon name="uil:angle-right" class="text-slate-400 w-5 h-5 shrink-0" />
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Apply Modal Simulator -->
    <transition 
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="applyModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl max-w-sm w-full space-y-6 text-center">
          <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            <Icon name="uil:check-circle" />
          </div>
          <div class="space-y-2">
            <h3 class="font-extrabold text-slate-900 text-base">Ứng tuyển thành công!</h3>
            <p class="text-slate-500 text-xs leading-normal">
              CV cá nhân của bạn đã được gửi trực tiếp tới hòm thư của công ty <span class="font-bold text-slate-800">{{ activeApplyJob?.company }}</span> cho vị trí <span class="font-bold text-slate-800">{{ activeApplyJob?.title }}</span>.
            </p>
          </div>
          <button 
            @click="closeApplyModal" 
            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Đóng cửa sổ
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
  layout: 'student',
  middleware: ['auth']
})

const authStore = useAuthStore()

// State management
const searchQuery = ref('')
const activeTag = ref<string | null>(null)
const isLoading = ref(true)
const applyModalOpen = ref(false)
const activeApplyJob = ref<any>(null)

// Compute user details
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'Học viên')

const filterTags = ['Tất cả', 'Thực tập', 'Bán thời gian', 'Remote', 'Golang', 'VueJS']

// Test Mock Data representing Featured Jobs
const featuredJobs = [
  {
    id: 1,
    title: 'Software Engineer Intern (Golang/Vue)',
    company: 'FPT Software',
    logoFallback: 'FS',
    badge: 'Hot',
    description: 'Thực tập sinh phát triển hệ thống backend sử dụng Go và viết giao diện Nuxt/Vue. Có cơ hội trở thành nhân viên chính thức.',
    salary: '5 - 8 triệu',
    location: 'Hà Nội',
    type: 'Thực tập'
  },
  {
    id: 2,
    title: 'Frontend Developer Intern (React/Vue)',
    company: 'VNG Corporation',
    logoFallback: 'VNG',
    badge: 'Gấp',
    description: 'Phát triển giao diện ứng dụng web cho các dịch vụ giải trí cốt lõi của VNG. Yêu cầu nắm vững HTML/CSS/Javascript.',
    salary: '6 - 10 triệu',
    location: 'TP. HCM',
    type: 'Thực tập'
  },
  {
    id: 3,
    title: 'Marketing Executive - Part Time',
    company: 'Shopee Vietnam',
    logoFallback: 'SP',
    badge: 'Mới',
    description: 'Hỗ trợ lên kế hoạch chạy chiến dịch tiếp thị và quản trị cộng đồng người dùng Shopee Live. Thời gian làm việc linh hoạt.',
    salary: '4 - 7 triệu',
    location: 'TP. HCM',
    type: 'Bán thời gian'
  },
  {
    id: 4,
    title: 'Content Creator Assistant',
    company: 'TechCorp Asia',
    logoFallback: 'TC',
    badge: 'Hot',
    description: 'Biên tập nội dung truyền thông mạng xã hội, viết bài blog chuẩn SEO và lên kịch bản video ngắn cho sản phẩm thương hiệu.',
    salary: 'Thỏa thuận',
    location: 'Đà Nẵng',
    type: 'Bán thời gian'
  }
]

// Mock Data for New Jobs
const newJobs = [
  {
    id: 10,
    title: 'Junior QA/QC Engineer',
    company: 'Viettel Telecom',
    logoFallback: 'VT',
    salary: '8 - 12 triệu',
    location: 'Hà Nội',
    type: 'Full-time'
  },
  {
    id: 11,
    title: 'Graphic Designer Assistant',
    company: 'Garena VN',
    logoFallback: 'GR',
    salary: '5 - 7 triệu',
    location: 'TP. HCM',
    type: 'Bán thời gian'
  },
  {
    id: 12,
    title: 'NodeJS Developer (Remote)',
    company: 'VinGroup IT',
    logoFallback: 'VG',
    salary: '10 - 15 triệu',
    location: 'Hà Nội',
    type: 'Full-time'
  }
]

// Mock Data for Featured Companies
const featuredCompanies = [
  { name: 'FPT Software', initials: 'FPT', openJobs: 12 },
  { name: 'VNG Corporation', initials: 'VNG', openJobs: 8 },
  { name: 'Shopee Vietnam', initials: 'SHO', openJobs: 15 },
  { name: 'Viettel Group', initials: 'VT', openJobs: 9 }
]

// Filter logic
const filteredFeaturedJobs = computed(() => {
  return featuredJobs.filter(job => {
    if (activeTag.value && activeTag.value !== 'Tất cả') {
      const tagLower = activeTag.value.toLowerCase()
      const matchesTag = 
        job.type.toLowerCase().includes(tagLower) || 
        job.description.toLowerCase().includes(tagLower) ||
        job.title.toLowerCase().includes(tagLower)
      if (!matchesTag) return false
    }

    if (searchQuery.value) {
      const queryLower = searchQuery.value.toLowerCase()
      const matchesQuery = 
        job.title.toLowerCase().includes(queryLower) ||
        job.company.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower) ||
        job.location.toLowerCase().includes(queryLower)
      if (!matchesQuery) return false
    }

    return true
  })
})

const toggleFilterTag = (tag: string) => {
  if (tag === 'Tất cả') {
    activeTag.value = null
  } else {
    activeTag.value = tag
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  activeTag.value = null
}

const openQuickApply = (job: any) => {
  activeApplyJob.value = job
  applyModalOpen.value = true
}

const closeApplyModal = () => {
  applyModalOpen.value = false
  activeApplyJob.value = null
}

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>
