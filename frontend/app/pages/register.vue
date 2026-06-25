<template>
  <NuxtLayout name="auth">
    <div class="space-y-6">
      <div class="flex bg-gray-100 p-1 rounded-xl gap-1">
        <button 
          @click="role = 'STUDENT'"
          :class="['flex-1 py-1.5 text-xs font-medium rounded-lg transition-all', role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
        >
          Tài khoản Sinh Viên
        </button>
        <button 
          @click="role = 'COMPANY'"
          :class="['flex-1 py-1.5 text-xs font-medium rounded-lg transition-all', role === 'COMPANY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
        >
          Tài khoản Doanh Nghiệp
        </button>
      </div>

      <div class="p-4 bg-blue-50 rounded-xl text-xs text-blue-700">
        Bạn đang chuẩn bị đăng ký với tư cách: <strong>{{ role === 'STUDENT' ? 'Ứng viên tìm việc' : 'Nhà tuyển dụng doanh nghiệp' }}</strong>.
      </div>

      <div class="text-center text-sm text-gray-500">
        <NuxtLink to="/login" class="text-blue-600 font-medium hover:underline">Quay lại Đăng nhập</NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  middleware: ['guest']
})

const role = ref<'STUDENT' | 'COMPANY'>('STUDENT')
</script>