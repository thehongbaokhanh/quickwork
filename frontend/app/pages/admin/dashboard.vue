<template>
  <div class="space-y-6">
    <!-- Quick Actions -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-slate-900">Tổng quan</h1>
      <div class="flex gap-3">
        <UiButton variant="outline" icon="uil:file-download-alt">Xuất báo cáo</UiButton>
        <UiButton variant="primary" icon="uil:plus">Thêm Người Dùng</UiButton>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div v-for="stat in summaryStats" :key="stat.name" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
        <div :class="`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.colorClass}`">
          <Icon :name="stat.icon" />
        </div>
        <div>
          <p class="text-sm font-medium text-slate-500">{{ stat.name }}</p>
          <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Area -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <h2 class="text-lg font-semibold text-slate-900 mb-6">Tăng trưởng Người Dùng (Mock)</h2>
        <div class="flex-1 flex items-end justify-between gap-2 h-64 mt-auto">
          <div v-for="(val, idx) in chartData" :key="idx" class="w-full bg-blue-100 rounded-t-md relative group">
            <div 
              class="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600" 
              :style="{ height: `${val}%` }"
            ></div>
          </div>
        </div>
        <div class="flex justify-between mt-3 text-xs text-slate-400 font-medium px-1">
          <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Thông báo mới</h2>
        <div class="space-y-4">
          <div v-for="notif in notifications" :key="notif.id" class="flex gap-3 items-start">
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
              <Icon :name="notif.icon" class="text-slate-500 w-4 h-4" />
            </div>
            <div>
              <p class="text-sm text-slate-800"><span class="font-medium">{{ notif.user }}</span> {{ notif.action }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ notif.time }}</p>
            </div>
          </div>
        </div>
        <UiButton variant="ghost" class="w-full mt-4 text-blue-600">Xem tất cả</UiButton>
      </div>
    </div>

    <!-- Recent Activities Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-slate-900">Hoạt động gần đây</h2>
        <UiButton variant="ghost" size="sm" icon="uil:filter">Lọc</UiButton>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
              <th class="px-6 py-3 font-medium">Họ Tên</th>
              <th class="px-6 py-3 font-medium">Vai trò</th>
              <th class="px-6 py-3 font-medium">Trạng thái</th>
              <th class="px-6 py-3 font-medium">Ngày đăng ký</th>
              <th class="px-6 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="user in recentUsers" :key="user.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{{ user.name }}</p>
                    <p class="text-xs text-slate-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex px-2 py-1 rounded-md text-xs font-medium" :class="roleColors[user.role]">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1.5 text-slate-600">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Hoạt động</span>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-500">{{ user.date }}</td>
              <td class="px-6 py-4 text-right">
                <button class="text-slate-400 hover:text-blue-600 transition-colors">
                  <Icon name="uil:ellipsis-h" class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

definePageMeta({
  layout: 'admin'
})

const summaryStats = [
  { name: 'Tổng Người Dùng', value: '12,450', icon: 'uil:users-alt', colorClass: 'bg-blue-100 text-blue-600' },
  { name: 'Học Viên', value: '8,200', icon: 'uil:graduation-cap', colorClass: 'bg-indigo-100 text-indigo-600' },
  { name: 'Doanh Nghiệp', value: '4,250', icon: 'uil:building', colorClass: 'bg-purple-100 text-purple-600' },
  { name: 'Việc Làm Đang Mở', value: '842', icon: 'uil:briefcase-alt', colorClass: 'bg-emerald-100 text-emerald-600' },
  { name: 'Lượt Ứng Tuyển', value: '24k', icon: 'uil:file-alt', colorClass: 'bg-amber-100 text-amber-600' }
]

const chartData = [30, 45, 25, 60, 80, 50, 95]

const notifications = [
  { id: 1, user: 'TechCorp', action: 'vừa đăng một việc làm mới.', time: '5 phút trước', icon: 'uil:briefcase' },
  { id: 2, user: 'Nguyễn Văn A', action: 'đã tạo tài khoản học viên.', time: '12 phút trước', icon: 'uil:user-plus' },
  { id: 3, user: 'FPT Software', action: 'đã cập nhật thông tin công ty.', time: '1 giờ trước', icon: 'uil:edit' },
  { id: 4, user: 'Lê Thị B', action: 'đã ứng tuyển vị trí Frontend.', time: '3 giờ trước', icon: 'uil:file-check-alt' }
]

const roleColors: Record<string, string> = {
  'STUDENT': 'bg-indigo-50 text-indigo-700',
  'ENTERPRISE': 'bg-purple-50 text-purple-700',
  'ADMIN': 'bg-red-50 text-red-700'
}

const recentUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nva@gmail.com', role: 'STUDENT', date: '30/06/2026' },
  { id: 2, name: 'TechCorp VN', email: 'contact@techcorp.vn', role: 'ENTERPRISE', date: '30/06/2026' },
  { id: 3, name: 'Trần Bình', email: 'binht@gmail.com', role: 'STUDENT', date: '29/06/2026' },
  { id: 4, name: 'FPT Software', email: 'hr@fpt.com', role: 'ENTERPRISE', date: '28/06/2026' }
]
</script>
