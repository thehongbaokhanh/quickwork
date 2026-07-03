<template>
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
            @blur="validateEmail"
            @input="validateEmail"
            type="email"
            required
            class="appearance-none block w-full px-3 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            :class="errors.email ? 'border-red-300' : 'border-gray-300'"
            placeholder="example@quickwork.vn"
          />
        </div>
        <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <div class="mt-1">
          <input
            id="password"
            v-model="form.password"
            @blur="validatePassword"
            @input="validatePassword"
            type="password"
            required
            class="appearance-none block w-full px-3 py-2.5 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            :class="errors.password ? 'border-red-300' : 'border-gray-300'"
            placeholder="••••••••"
          />
        </div>
        <p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
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

      <div class="relative flex items-center justify-center my-4">
        <div class="border-t border-gray-200 w-full"></div>
        <span class="absolute bg-white px-3 text-xs text-gray-400 uppercase font-semibold">Hoặc</span>
      </div>

      <div>
        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-all disabled:opacity-50"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.24 1 3.19 3.73 1.24 7.74l3.96 3.07C6.18 7.74 8.85 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.43-4.92 3.43-8.6z"
            />
            <path
              fill="#FBBC05"
              d="M5.2 14.81c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31L1.24 7.12C.45 8.7.01 10.47.01 12.31c0 1.84.44 3.61 1.23 5.19l3.96-3.07z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.18.79-2.69 1.27-4.26 1.27-3.15 0-5.82-2.7-6.8-5.77L1.24 15.8C3.19 19.8 7.24 23 12 23z"
            />
          </svg>
          Tiếp tục với Google
        </button>
      </div>

      <div class="text-center text-sm text-gray-600 pt-2">
        Chưa có tài khoản? 
        <NuxtLink to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">Đăng ký ngay</NuxtLink>
      </div>
    </form>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'



const authStore = useAuthStore()
const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const validateEmail = () => {
  if (!form.email) {
    errors.email = 'Vui lòng nhập email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email không hợp lệ.'
  } else {
    errors.email = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'Vui lòng nhập mật khẩu.'
  } else {
    errors.password = ''
  }
}

const handleLogin = async () => {
  validateEmail()
  validatePassword()

  if (errors.email || errors.password) return

  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.login({
    email: form.email,
    password: form.password
})
    
    // Đăng nhập thành công, điều phối luồng dựa trên vai trò người dùng
    const role = authStore.userRole

if (!role) {
  throw new Error("Không lấy được thông tin quyền người dùng")
}

if (role === "ADMIN") {
  await navigateTo("/admin/dashboard")
} else if (role === "ENTERPRISE") {
  await navigateTo("/enterprise/dashboard")
} else {
  await navigateTo("/dashboard")
} } catch (err: any) {
    errorMessage.value = err.message || 'Thông tin tài khoản hoặc mật khẩu chưa chính xác.'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // Fetch Google config from backend
    const configResponse: any = await $fetch('http://localhost:8080/api/v1/auth/google/config')
    const config = configResponse.data
    
    if (config && config.client_id) {
      // Real Google flow
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=openid%20email%20profile`
      window.location.href = googleAuthUrl
    } else {
      // Mock Google flow: direct redirection to callback with code parameter
      const mockRedirectUri = config.redirect_uri || 'http://localhost:3000/auth/google/callback'
      window.location.href = `${mockRedirectUri}?code=mock_google_code_${Date.now()}`
    }
  } catch (err: any) {
    errorMessage.value = 'Không thể kết nối cấu hình đăng nhập Google: ' + (err.message || err)
    isLoading.value = false
  }
}
</script>