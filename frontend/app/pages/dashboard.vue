<template>
  <NuxtLayout name="default">
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h1 class="text-2xl md:text-3xl font-bold mb-2">Xin chào, {{ authStore.user?.name || 'Học viên' }}!</h1>
        <p class="text-blue-100 text-sm md:text-base max-w-md">Chào mừng bạn đến với hệ thống QuickWork. Hãy cập nhật CV của bạn để lọt vào mắt xanh của các doanh nghiệp hàng đầu.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div class="text-gray-400 mb-2"><Icon name="uil:briefcase-alt" class="w-6 h-6" /></div>
          <div class="text-2xl font-bold text-gray-900">12</div>
          <div class="text-xs text-gray-500 mt-1">Việc làm phù hợp với bạn</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div class="text-gray-400 mb-2"><Icon name="uil:file-check-alt" class="w-6 h-6" /></div>
          <div class="text-2xl font-bold text-gray-900">03</div>
          <div class="text-xs text-gray-500 mt-1">Hồ sơ đã gửi ứng tuyển</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div class="text-gray-400 mb-2"><Icon name="uil:eye" class="w-6 h-6" /></div>
          <div class="text-2xl font-bold text-gray-900">145</div>
          <div class="text-xs text-gray-500 mt-1">Lượt xem hồ sơ từ Công ty</div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth']
})

const authStore = useAuthStore()
</script>