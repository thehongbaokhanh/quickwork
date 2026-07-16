<template>
  <AuthLoginExperience v-if="true" />
  <div v-else class="min-h-screen bg-[#edf3fb] p-2 font-sans text-slate-950 sm:p-4">
    <div class="relative mx-auto min-h-[calc(100vh-1rem)] max-w-[1320px] overflow-hidden rounded-[24px] border border-white bg-white shadow-2xl shadow-slate-200/90 sm:min-h-[calc(100vh-2rem)]">
      <header class="relative z-20 flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">
        <NuxtLink to="/" class="inline-flex items-center gap-3">
          <img src="/images/brand/quickwork-wordmark-transparent.png" alt="QuickWork" class="h-12 w-auto object-contain">
        </NuxtLink>

        <NuxtLink
          to="/auth/register"
          class="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
        >
          Chưa có tài khoản? <span class="font-bold text-sky-600">Đăng ký ngay</span>
        </NuxtLink>
      </header>

      <div class="relative grid min-h-[calc(100vh-6.5rem)] lg:grid-cols-[0.82fr_1.18fr]">
        <section class="relative hidden overflow-hidden px-10 pb-10 pt-8 lg:flex lg:flex-col lg:justify-between">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,0.18),transparent_30%),linear-gradient(155deg,#ffffff_0%,#f0f9ff_48%,#e8f2fb_100%)]" />
          <div class="absolute bottom-0 left-0 right-0 h-[48%] bg-[url('/images/quickwork-career-hero.png')] bg-cover bg-bottom opacity-45" />
          <div class="absolute left-0 top-28 grid grid-cols-6 gap-3 opacity-45">
            <span v-for="dot in 48" :key="dot" class="h-1 w-1 rounded-full bg-sky-500" />
          </div>

          <div class="relative z-10 mt-16 max-w-md">
            <p class="text-lg font-medium text-slate-700">Chào mừng trở lại</p>
            <h1 class="mt-7 text-4xl font-bold leading-tight tracking-tight text-slate-950 xl:text-5xl">
              Đăng nhập để tiếp tục hành trình sự nghiệp của bạn
            </h1>
            <p class="mt-6 text-base leading-8 text-slate-700">
              Khám phá hàng nghìn cơ hội việc làm phù hợp với kỹ năng và đam mê của bạn.
            </p>
          </div>

          <div class="relative z-10 mb-20 flex items-end justify-center">
            <div class="relative h-60 w-60 rounded-[34px] border border-white/80 bg-white/60 shadow-2xl shadow-sky-900/15 backdrop-blur">
              <img src="/images/brand/quickwork-logo-main-transparent.png" alt="QuickWork" class="absolute inset-8 h-44 w-44 object-contain">
              <span class="absolute -right-8 top-16 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-xl">
                <Icon name="uil:briefcase-alt" class="h-8 w-8" />
              </span>
              <span class="absolute -bottom-8 -left-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-xl">
                <Icon name="uil:users-alt" class="h-8 w-8" />
              </span>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-3 gap-4 rounded-xl bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-300">
            <div v-for="item in trustItems" :key="item.title" class="flex items-start gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                <Icon :name="item.icon" class="h-5 w-5" />
              </span>
              <span>
                <span class="block text-sm font-semibold">{{ item.title }}</span>
                <span class="mt-1 block text-xs leading-5 text-slate-300">{{ item.description }}</span>
              </span>
            </div>
          </div>
        </section>

        <main class="relative flex items-center justify-center px-5 pb-10 pt-4 sm:px-8 lg:px-12">
          <form
            class="w-full max-w-[470px] rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-2xl shadow-slate-200/80 sm:px-9 sm:py-10"
            @submit.prevent="handleLogin"
          >
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-slate-950">Chào mừng trở lại</h2>
              <p class="mt-3 text-base leading-7 text-slate-700">
                Đăng nhập để tiếp tục hành trình sự nghiệp cùng <span class="font-bold text-sky-600">QuickWork</span>.
              </p>
            </div>

            <div v-if="errorMessage" class="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              <Icon name="uil:exclamation-circle" class="mt-0.5 h-5 w-5 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <div class="mt-7 space-y-5">
              <label class="block">
                <span class="text-sm font-semibold text-slate-900">Email hoặc số điện thoại</span>
                <span class="mt-2 flex items-center gap-3 rounded-lg border bg-white px-4 py-3.5 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100" :class="errors.email ? 'border-rose-300' : 'border-slate-200'">
                  <Icon name="uil:envelope" class="h-5 w-5 text-slate-500" />
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full border-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Nhập email của bạn"
                    @blur="validateEmail"
                    @input="validateEmail"
                  >
                </span>
                <span v-if="errors.email" class="mt-1 block text-xs font-medium text-rose-600">{{ errors.email }}</span>
              </label>

              <label class="block">
                <span class="text-sm font-semibold text-slate-900">Mật khẩu</span>
                <span class="mt-2 flex items-center gap-3 rounded-lg border bg-white px-4 py-3.5 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100" :class="errors.password ? 'border-rose-300' : 'border-slate-200'">
                  <Icon name="uil:lock" class="h-5 w-5 text-slate-500" />
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full border-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Nhập mật khẩu"
                    @blur="validatePassword"
                    @input="validatePassword"
                  >
                  <button type="button" class="text-slate-500 transition hover:text-slate-900" @click="showPassword = !showPassword">
                    <Icon :name="showPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                  </button>
                </span>
                <span v-if="errors.password" class="mt-1 block text-xs font-medium text-rose-600">{{ errors.password }}</span>
              </label>

              <div class="flex items-center justify-between gap-4">
                <label class="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500">
                  Ghi nhớ đăng nhập
                </label>
                <NuxtLink to="/forgot-password" class="text-sm font-semibold text-sky-600 transition hover:text-sky-700">
                  Quên mật khẩu?
                </NuxtLink>
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="group flex w-full items-center justify-center gap-3 rounded-lg bg-sky-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}</span>
                <Icon name="uil:arrow-right" class="h-5 w-5 transition group-hover:translate-x-0.5" />
              </button>
            </div>

            <div class="my-6 flex items-center gap-4">
              <span class="h-px flex-1 bg-slate-200" />
              <span class="text-xs font-semibold uppercase text-slate-500">Hoặc</span>
              <span class="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              :disabled="isLoading"
              class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleGoogleLogin"
            >
              <span class="text-lg font-bold text-[#4285F4]">G</span>
              Tiếp tục với Google
            </button>

            <p class="mt-7 text-center text-sm font-medium text-slate-700">
              Chưa có tài khoản?
              <NuxtLink to="/auth/register" class="font-semibold text-sky-600 transition hover:text-sky-700">
                Đăng ký ngay
              </NuxtLink>
            </p>
          </form>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AuthLoginExperience from '~/components/AuthLoginExperience.vue'
import { useAuthStore } from '~/stores/auth'
import { getLoginRedirectForRole } from '~/utils/authRedirect'

const route = useRoute()
const authStore = useAuthStore()
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const trustItems = [
  { title: 'An toàn & bảo mật', description: 'Thông tin của bạn được bảo vệ tuyệt đối', icon: 'uil:shield-check' },
  { title: 'Nhiều cơ hội', description: 'Hàng nghìn việc làm đang chờ bạn', icon: 'uil:briefcase-alt' },
  { title: 'Phát triển sự nghiệp', description: 'Tìm công việc phù hợp để phát triển bản thân', icon: 'uil:chart-line' }
]

onMounted(() => {
  if (route.query.error === 'invalid_role') {
    errorMessage.value = 'Tài khoản của bạn có quyền truy cập không hợp lệ hoặc chưa được phân quyền.'
  } else if (route.query.error === 'enterprise_pending') {
    errorMessage.value = 'Tài khoản doanh nghiệp của bạn chưa được duyệt.'
  } else if (route.query.error === 'account_blocked') {
    errorMessage.value = 'Tài khoản của bạn đang bị khóa hoặc bị cấm. Vui lòng liên hệ quản trị viên.'
  }
})

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

    if (!authStore.userRole) {
      throw new Error('Không lấy được thông tin quyền người dùng hợp lệ')
    }

    const requestedRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
    const redirectTo = getLoginRedirectForRole(authStore.userRole, requestedRedirect)
    await navigateTo(redirectTo)
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Thông tin tài khoản hoặc mật khẩu chưa chính xác.'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const configResponse: any = await $fetch('http://localhost:8080/api/v1/auth/google/config')
    const config = configResponse.data

    if (config && config.client_id) {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=openid%20email%20profile`
      window.location.href = googleAuthUrl
    } else {
      const mockRedirectUri = config.redirect_uri || 'http://localhost:3000/auth/google/callback'
      window.location.href = `${mockRedirectUri}?code=mock_google_code_${Date.now()}`
    }
  } catch (err: any) {
    errorMessage.value = 'Không thể kết nối cấu hình đăng nhập Google: ' + (err.message || err)
    isLoading.value = false
  }
}
</script>
