<template>
  <NuxtLayout name="auth">
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
        <Icon name="uil:exclamation-circle" class="w-5 h-5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email học viên / Doanh nghiệp</label>
        <div class="mt-1">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="example@quickwork.vn"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <div class="mt-1">
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember-me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label id="remember-me-label" for="remember-me" class="ml-2 block text-sm text-gray-900">Ghi nhớ đăng nhập</label>
        </div>
        <div class="text-sm">
          <NuxtLink to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">Quên mật khẩu?</NuxtLink>
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
        >
          {{ isLoading ? 'Đang xác thực dữ liệu...' : 'Đăng nhập hệ thống' }}
        </button>
      </div>

      <div class="text-center text-sm text-gray-600 pt-2">
        Chưa có tài khoản? 
        <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">Đăng ký ngay</NuxtLink>
      </div>
    </form>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['guest']
})

const authStore = useAuthStore()
const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.login({ email: form.email, password: form.password })
    
    // Đăng nhập thành công, điều phối luồng dựa trên vai trò người dùng
    const role = authStore.userRole
    if (role === 'ADMIN') await navigateTo('/admin/dashboard')
    else if (role === 'COMPANY') await navigateTo('/company/dashboard')
    else await navigateTo('/dashboard')
  } catch (err: any) {
    errorMessage.value = err.message || 'Thông tin tài khoản hoặc mật khẩu chưa chính xác.'
  } finally {
    isLoading.value = false
  }
}
</script>