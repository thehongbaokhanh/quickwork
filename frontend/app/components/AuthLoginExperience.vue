<template>
  <AuthShell active="login" hero-variant="login">
    <template #hero>
      <div class="relative z-10 flex h-full flex-col justify-between gap-10">
        <div class="max-w-xl">
          <span class="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100">
            <Icon name="uil:users-alt" class="h-5 w-5" aria-hidden="true" />
            Chào mừng trở lại
          </span>
          <h1 id="auth-hero-title" class="mt-7 text-4xl font-bold leading-tight tracking-tight text-slate-950 xl:text-5xl">
            Đăng nhập để tiếp tục hành trình
            <span class="text-sky-600">sự nghiệp</span>
            của bạn
          </h1>
          <p class="mt-5 max-w-lg text-base font-medium leading-8 text-slate-600">
            Khám phá cơ hội phù hợp, quản lý hồ sơ và kết nối với nhà tuyển dụng đã xác thực trên QuickWork.
          </p>
        </div>

        <div class="grid gap-4">
          <article v-for="item in trustItems" :key="item.title" class="flex max-w-lg items-start gap-4 rounded-lg bg-white/75 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
            <span :class="['flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', item.iconClass]">
              <Icon :name="item.icon" class="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span class="block text-sm font-bold text-slate-950">{{ item.title }}</span>
              <span class="mt-1 block text-sm font-medium leading-6 text-slate-600">{{ item.description }}</span>
            </span>
          </article>
        </div>

        <div class="relative hidden min-h-[300px] items-end justify-center xl:flex">
          <div class="absolute bottom-0 h-56 w-[92%] rounded-[48%] bg-sky-100/70 blur-sm" />
          <img src="/images/quickwork-career-hero.png" alt="" class="relative z-10 max-h-[340px] w-full max-w-[520px] object-contain object-bottom">
          <div class="absolute right-8 top-10 z-20 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-xl">
            <p class="text-xs font-bold text-slate-400">Hồ sơ phù hợp</p>
            <div class="mt-2 flex items-center gap-2">
              <span class="h-2 w-20 rounded bg-slate-200" />
              <Icon name="uil:check-circle" class="h-5 w-5 text-sky-600" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <form
      class="w-full max-w-[520px] rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80 sm:p-9"
      aria-labelledby="login-title"
      novalidate
      @submit.prevent="handleLogin"
    >
      <div>
        <p class="text-sm font-bold uppercase tracking-wide text-sky-600">QuickWork Portal</p>
        <h2 id="login-title" class="mt-3 text-3xl font-bold tracking-tight text-slate-950">Đăng nhập</h2>
        <p class="mt-3 text-sm font-medium leading-6 text-slate-600">Chào mừng bạn quay trở lại.</p>
      </div>

      <div v-if="errorMessage" class="mt-6 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert" aria-live="polite">
        <Icon name="uil:exclamation-circle" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="loginNotice" class="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800" role="status" aria-live="polite">
        <Icon name="uil:exclamation-triangle" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{{ loginNotice }}</span>
      </div>

      <div class="mt-7 space-y-5">
        <AuthField label="Email" icon="uil:envelope" input-id="login-email" :error="errors.email">
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="qw-auth-input"
            placeholder="Nhập email của bạn"
            :aria-invalid="Boolean(errors.email)"
            :aria-describedby="errors.email ? 'login-email-error' : undefined"
            @blur="validateEmail"
            @input="validateEmail"
          >
        </AuthField>

        <AuthField label="Mật khẩu" icon="uil:lock" input-id="login-password" :error="errors.password">
          <input
            id="login-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="qw-auth-input"
            placeholder="Nhập mật khẩu"
            :aria-invalid="Boolean(errors.password)"
            :aria-describedby="errors.password ? 'login-password-error' : undefined"
            @blur="validatePassword"
            @input="validatePassword"
          >
          <button
            type="button"
            class="rounded-md p-1 text-slate-500 outline-none transition hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-sky-100"
            :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
            @click="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" aria-hidden="true" />
          </button>
        </AuthField>

        <div class="flex items-center justify-between gap-4">
          <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input id="remember-me" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500">
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <NuxtLink to="/forgot-password" class="rounded-md text-sm font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100">
            Quên mật khẩu?
          </NuxtLink>
        </div>

        <button type="submit" :disabled="isLoading" class="qw-auth-primary">
          <span>{{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}</span>
          <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div class="my-6 flex items-center gap-4">
        <span class="h-px flex-1 bg-slate-200" />
        <span class="text-xs font-semibold uppercase text-slate-400">hoặc</span>
        <span class="h-px flex-1 bg-slate-200" />
      </div>

      <button type="button" :disabled="isLoading" class="qw-auth-secondary" @click="handleGoogleLogin">
        <span class="text-lg font-bold text-[#4285F4]" aria-hidden="true">G</span>
        Tiếp tục với Google
      </button>

      <p class="mt-7 text-center text-sm font-semibold text-slate-600">
        Chưa có tài khoản?
        <NuxtLink to="/register" class="rounded-md font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100">
          Đăng ký ngay
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthField from '~/components/AuthField.vue'
import AuthShell from '~/components/AuthShell.vue'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth'
import { getLoginRedirectForRole } from '~/utils/authRedirect'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const isLoading = ref(false)
const errorMessage = ref('')
const loginNotice = ref('')
const showPassword = ref(false)

const LOGIN_NOTICE_REDIRECT_DELAY_MS = 1400

const trustItems = [
  { title: 'Cơ hội đa dạng', description: 'Hàng nghìn việc làm từ các công ty uy tín đang chờ bạn.', icon: 'uil:briefcase-alt', iconClass: 'bg-sky-50 text-sky-700' },
  { title: 'Thông tin minh bạch', description: 'Mức lương rõ ràng, đánh giá chân thực từ ứng viên.', icon: 'uil:shield-check', iconClass: 'bg-sky-50 text-sky-700' },
  { title: 'Ứng tuyển dễ dàng', description: 'Kết nối nhanh chóng với nhà tuyển dụng chỉ với vài bước đơn giản.', icon: 'uil:user-check', iconClass: 'bg-violet-50 text-violet-700' }
]

onMounted(() => {
  if (route.query.error === 'invalid_role') {
    errorMessage.value = 'Tài khoản của bạn có quyền truy cập không hợp lệ hoặc chưa được phân quyền.'
  } else if (route.query.error === 'enterprise_pending') {
    loginNotice.value = 'Tài khoản doanh nghiệp của bạn chưa được duyệt. Bạn vẫn có thể đăng nhập để xem thông báo và nộp GPKD trong phần cài đặt.'
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

const waitForLoginNotice = () => new Promise((resolve) => setTimeout(resolve, LOGIN_NOTICE_REDIRECT_DELAY_MS))

const getEnterpriseLoginNotice = () => {
  if (authStore.userRole !== 'ENTERPRISE' || !authStore.enterpriseKybRequired || authStore.enterpriseApproved) return ''

  if (authStore.enterpriseKybStatus === 'REJECTED') {
    return 'Hồ sơ doanh nghiệp của bạn chưa được duyệt. Vui lòng kiểm tra thông báo và cập nhật lại GPKD trong phần cài đặt.'
  }

  return 'Tài khoản doanh nghiệp của bạn chưa được duyệt. Bạn vẫn có thể đăng nhập để xem thông báo và nộp GPKD trong phần cài đặt.'
}

const handleLogin = async () => {
  validateEmail()
  validatePassword()

  if (errors.email || errors.password) return

  isLoading.value = true
  errorMessage.value = ''
  loginNotice.value = ''
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
    const enterpriseNotice = getEnterpriseLoginNotice()

    if (enterpriseNotice) {
      loginNotice.value = enterpriseNotice
      toast.warning('Tài khoản doanh nghiệp chưa được duyệt', enterpriseNotice)
      await waitForLoginNotice()
    }

    await navigateTo(redirectTo)
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Thông tin tài khoản hoặc mật khẩu chưa chính xác.'
    loginNotice.value = ''
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    loginNotice.value = ''

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

<style scoped>
.qw-auth-input {
  width: 100%;
  border: 0;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  outline: none;
}

.qw-auth-input::placeholder {
  color: #94a3b8;
}

.qw-auth-primary,
.qw-auth-secondary {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  outline: none;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease, box-shadow 150ms ease;
}

.qw-auth-primary {
  background: #0284c7;
  color: white;
  box-shadow: 0 18px 32px rgba(2, 132, 199, 0.22);
}

.qw-auth-primary:hover {
  background: #0369a1;
}

.qw-auth-primary:focus-visible,
.qw-auth-secondary:focus-visible {
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.16);
}

.qw-auth-secondary {
  border: 1px solid #e2e8f0;
  background: white;
  color: #0f172a;
}

.qw-auth-secondary:hover {
  background: #f8fafc;
}

.qw-auth-primary:disabled,
.qw-auth-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
