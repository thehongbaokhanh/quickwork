<template>
  <AuthRegisterExperience v-if="true" />
  <div v-else class="min-h-screen bg-[#edf3fb] p-2 font-sans text-slate-950 sm:p-4">
    <div class="relative mx-auto min-h-[calc(100vh-1rem)] max-w-[1320px] overflow-hidden rounded-[24px] border border-white bg-white shadow-2xl shadow-slate-200/90 sm:min-h-[calc(100vh-2rem)]">
      <header class="relative z-20 flex h-20 items-center justify-between border-b border-slate-100 bg-white px-5 sm:px-8 lg:px-10">
        <NuxtLink to="/" class="inline-flex items-center gap-3">
          <img src="/images/brand/quickwork-wordmark-transparent.png" alt="QuickWork" class="h-12 w-auto object-contain">
        </NuxtLink>

        <nav class="hidden items-center gap-8 text-sm font-semibold text-slate-800 lg:flex">
          <NuxtLink to="/student" class="transition hover:text-sky-600">Việc làm</NuxtLink>
          <a href="#" class="transition hover:text-sky-600">Công ty</a>
          <a href="#" class="transition hover:text-sky-600">Mức lương</a>
          <a href="#" class="transition hover:text-sky-600">Blog</a>
          <a href="#" class="transition hover:text-sky-600">Khám phá</a>
        </nav>

        <div class="flex items-center gap-2">
          <NuxtLink to="/auth/login" class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:text-sky-700">
            Đăng nhập
          </NuxtLink>
          <NuxtLink to="/auth/register" class="hidden rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 sm:inline-flex">
            Đăng ký
          </NuxtLink>
        </div>
      </header>

      <div class="relative grid min-h-[calc(100vh-6.5rem)] lg:grid-cols-[0.88fr_1.12fr]">
        <section class="relative hidden overflow-hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,0.17),transparent_29%),linear-gradient(150deg,#ffffff_0%,#f0f9ff_50%,#e9f3fb_100%)]" />
          <div class="absolute bottom-0 left-0 right-0 h-[44%] bg-[url('/images/quickwork-career-hero.png')] bg-cover bg-bottom opacity-38" />

          <div class="relative z-10 max-w-lg">
            <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
              <Icon name="uil:user-plus" class="h-5 w-5" />
              Tạo tài khoản mới
            </span>
            <h1 class="mt-8 text-4xl font-bold leading-tight tracking-tight text-slate-950 xl:text-5xl">
              Bắt đầu hành trình sự nghiệp của bạn cùng <span class="text-sky-700">QuickWork</span>
            </h1>

            <div class="mt-10 space-y-6">
              <div v-for="item in benefits" :key="item.title" class="flex gap-4">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
                <span>
                  <span class="block text-sm font-semibold text-slate-950">{{ item.title }}</span>
                  <span class="mt-1 block text-sm leading-6 text-slate-700">{{ item.description }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-3 items-center gap-6 rounded-xl bg-slate-950 px-8 py-7 text-white shadow-2xl shadow-slate-300">
            <div class="flex -space-x-3">
              <span v-for="avatar in ['M', 'A', 'L', '+2K']" :key="avatar" class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 bg-white text-xs font-bold text-slate-800">
                {{ avatar }}
              </span>
            </div>
            <div class="border-l border-white/10 pl-6">
              <p class="text-xl font-bold">4.8/5</p>
              <p class="mt-1 text-xs text-slate-300">Đánh giá từ người dùng</p>
            </div>
            <div class="border-l border-white/10 pl-6">
              <p class="text-xl font-bold">10.000+</p>
              <p class="mt-1 text-xs text-slate-300">Người dùng đã tin tưởng</p>
            </div>
          </div>
        </section>

        <main class="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div class="w-full max-w-[660px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80 sm:p-8">
            <div class="mb-6 lg:hidden">
              <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                <Icon name="uil:user-plus" class="h-5 w-5" />
                Tạo tài khoản mới
              </span>
              <h1 class="mt-5 text-3xl font-bold leading-tight text-slate-950">
                Bắt đầu cùng <span class="text-sky-700">QuickWork</span>
              </h1>
            </div>

            <div class="grid rounded-xl bg-slate-100 p-1 sm:grid-cols-2">
              <button type="button" :class="tabClass(role === 'STUDENT')" @click="changeRole('STUDENT')">
                Tài khoản Sinh viên
              </button>
              <button type="button" :class="tabClass(role === 'COMPANY')" @click="changeRole('COMPANY')">
                Tài khoản Doanh nghiệp
              </button>
            </div>

            <div v-if="successMessage" class="mt-5 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-medium text-sky-700">
              <Icon name="uil:check-circle" class="mt-0.5 h-5 w-5 shrink-0" />
              <span>{{ successMessage }}</span>
            </div>

            <div v-if="errorMessage" class="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              <Icon name="uil:exclamation-circle" class="mt-0.5 h-5 w-5 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <form v-if="role === 'STUDENT'" class="mt-8 space-y-5" @submit.prevent="handleStudentRegister">
              <div class="grid gap-5 sm:grid-cols-2">
                <AuthField label="Họ và tên" icon="uil:user" :error="studentErrors.name">
                  <input
                    v-model="studentForm.name"
                    type="text"
                    required
                    class="qw-auth-input"
                    placeholder="Nhập họ và tên của bạn"
                    @blur="validateStudentName"
                    @input="validateStudentName"
                  >
                </AuthField>

                <AuthField label="Số điện thoại" icon="uil:phone" :error="studentErrors.phone">
                  <input
                    v-model="studentForm.phone"
                    type="text"
                    required
                    class="qw-auth-input"
                    placeholder="Nhập số điện thoại"
                    @blur="validateStudentPhone"
                    @input="validateStudentPhone"
                  >
                </AuthField>
              </div>

              <AuthField label="Email học viên" icon="uil:envelope" :error="studentErrors.email">
                <input
                  v-model="studentForm.email"
                  type="email"
                  required
                  class="qw-auth-input"
                  placeholder="Nhập email của bạn"
                  @blur="validateStudentEmail"
                  @input="validateStudentEmail"
                >
              </AuthField>

              <div class="grid gap-5 sm:grid-cols-2">
                <AuthField label="Mật khẩu" icon="uil:lock" :error="studentErrors.password">
                  <input
                    v-model="studentForm.password"
                    :type="showStudentPassword ? 'text' : 'password'"
                    required
                    class="qw-auth-input"
                    placeholder="Tạo mật khẩu ít nhất 6 ký tự"
                    @blur="validateStudentPassword"
                    @input="validateStudentPassword"
                  >
                  <button type="button" class="text-slate-500 transition hover:text-slate-900" @click="showStudentPassword = !showStudentPassword">
                    <Icon :name="showStudentPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                  </button>
                </AuthField>

                <AuthField label="Xác nhận mật khẩu" icon="uil:lock" :error="studentErrors.confirmPassword">
                  <input
                    v-model="studentForm.confirmPassword"
                    :type="showStudentConfirmPassword ? 'text' : 'password'"
                    required
                    class="qw-auth-input"
                    placeholder="Nhập lại mật khẩu"
                    @blur="validateStudentConfirmPassword"
                    @input="validateStudentConfirmPassword"
                  >
                  <button type="button" class="text-slate-500 transition hover:text-slate-900" @click="showStudentConfirmPassword = !showStudentConfirmPassword">
                    <Icon :name="showStudentConfirmPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                  </button>
                </AuthField>
              </div>

              <button type="submit" :disabled="isLoading" class="qw-auth-submit">
                <Icon name="uil:user-plus" class="h-5 w-5" />
                {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản' }}
              </button>
            </form>

            <form v-else class="mt-8 space-y-5" @submit.prevent="handleCompanyRegister">
              <div class="grid gap-5 sm:grid-cols-2">
                <AuthField label="Tên doanh nghiệp" icon="uil:building" :error="companyErrors.company_name">
                  <input
                    v-model="companyForm.company_name"
                    type="text"
                    required
                    class="qw-auth-input"
                    placeholder="Nhập tên doanh nghiệp"
                    @blur="validateCompanyName"
                    @input="validateCompanyName"
                  >
                </AuthField>

                <AuthField label="Mã số thuế" icon="uil:receipt" :error="companyErrors.tax_code">
                  <input
                    v-model="companyForm.tax_code"
                    type="text"
                    required
                    class="qw-auth-input"
                    placeholder="Nhập mã số thuế"
                    @blur="validateCompanyTax"
                    @input="validateCompanyTax"
                  >
                </AuthField>
              </div>

              <AuthField label="Email doanh nghiệp" icon="uil:envelope" :error="companyErrors.email">
                <input
                  v-model="companyForm.email"
                  type="email"
                  required
                  class="qw-auth-input"
                  placeholder="Nhập email doanh nghiệp"
                  @blur="validateCompanyEmail"
                  @input="validateCompanyEmail"
                >
              </AuthField>

              <label class="block">
                <span class="text-sm font-semibold text-slate-900">Giấy phép kinh doanh (GPKD)</span>
                <span class="mt-2 flex flex-col gap-3 rounded-lg border px-4 py-3 transition sm:flex-row sm:items-center" :class="companyErrors.gpkd_url ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'">
                  <label for="gpkd-file" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <Icon name="uil:upload" class="h-4 w-4" />
                    Chọn file GPKD
                    <input id="gpkd-file" type="file" class="sr-only" accept=".jpg,.jpeg,.png,.pdf,.docx" @change="handleFileUpload">
                  </label>
                  <span class="text-sm font-medium" :class="companyForm.gpkd_url ? 'text-sky-700' : 'text-slate-600'">
                    <span v-if="uploadingFile">Đang tải lên...</span>
                    <span v-else-if="companyForm.gpkd_url">Đã tải lên giấy phép</span>
                    <span v-else>Chưa có file nào được chọn</span>
                  </span>
                </span>
                <span v-if="companyErrors.gpkd_url" class="mt-1 block text-xs font-medium text-rose-600">{{ companyErrors.gpkd_url }}</span>
              </label>

              <div class="grid gap-5 sm:grid-cols-2">
                <AuthField label="Mật khẩu" icon="uil:lock" :error="companyErrors.password">
                  <input
                    v-model="companyForm.password"
                    :type="showCompanyPassword ? 'text' : 'password'"
                    required
                    class="qw-auth-input"
                    placeholder="Tạo mật khẩu ít nhất 6 ký tự"
                    @blur="validateCompanyPassword"
                    @input="validateCompanyPassword"
                  >
                  <button type="button" class="text-slate-500 transition hover:text-slate-900" @click="showCompanyPassword = !showCompanyPassword">
                    <Icon :name="showCompanyPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                  </button>
                </AuthField>

                <AuthField label="Xác nhận mật khẩu" icon="uil:lock" :error="companyErrors.confirmPassword">
                  <input
                    v-model="companyForm.confirmPassword"
                    :type="showCompanyConfirmPassword ? 'text' : 'password'"
                    required
                    class="qw-auth-input"
                    placeholder="Nhập lại mật khẩu"
                    @blur="validateCompanyConfirmPassword"
                    @input="validateCompanyConfirmPassword"
                  >
                  <button type="button" class="text-slate-500 transition hover:text-slate-900" @click="showCompanyConfirmPassword = !showCompanyConfirmPassword">
                    <Icon :name="showCompanyConfirmPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" />
                  </button>
                </AuthField>
              </div>

              <button type="submit" :disabled="isLoading || uploadingFile" class="qw-auth-submit">
                <Icon name="uil:user-plus" class="h-5 w-5" />
                {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản doanh nghiệp' }}
              </button>
            </form>

            <div class="my-7 flex items-center gap-4">
              <span class="h-px flex-1 bg-slate-200" />
              <span class="text-xs font-semibold uppercase text-slate-500">Hoặc</span>
              <span class="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              :disabled="isLoading || uploadingFile"
              class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              @click="handleGoogleLogin"
            >
              <span class="text-lg font-bold text-[#4285F4]">G</span>
              Đăng ký với Google
            </button>

            <p class="mt-7 text-center text-sm font-medium text-slate-700">
              Đã có tài khoản?
              <NuxtLink to="/auth/login" class="font-semibold text-sky-600 transition hover:text-sky-700">
                Đăng nhập ngay
              </NuxtLink>
            </p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

import { defineComponent, h, reactive, ref, resolveComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import AuthRegisterExperience from '~/components/AuthRegisterExperience.vue'
import { AuthService } from '~/services/auth.service'

type RegisterRole = 'STUDENT' | 'COMPANY'

const route = useRoute()
const role = ref<RegisterRole>('STUDENT')
const isLoading = ref(false)
const uploadingFile = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showStudentPassword = ref(false)
const showStudentConfirmPassword = ref(false)
const showCompanyPassword = ref(false)
const showCompanyConfirmPassword = ref(false)

const benefits = [
  { title: 'Ứng tuyển dễ dàng', description: 'Tìm việc phù hợp và ứng tuyển chỉ với vài bước đơn giản.', icon: 'uil:check' },
  { title: 'Nhiều cơ hội việc làm', description: 'Hàng nghìn việc làm từ các công ty uy tín đang chờ bạn.', icon: 'uil:star' },
  { title: 'Quản lý hồ sơ chuyên nghiệp', description: 'Tạo hồ sơ nổi bật và quản lý mọi hoạt động tuyển dụng.', icon: 'uil:file-alt' }
]

const AuthField = defineComponent({
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    error: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    const Icon = resolveComponent('Icon')

    return () => h('label', { class: 'block' }, [
      h('span', { class: 'text-sm font-semibold text-slate-900' }, props.label),
      h(
        'span',
        {
          class: [
            'mt-2 flex items-center gap-3 rounded-lg border bg-white px-4 py-3.5 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100',
            props.error ? 'border-rose-300' : 'border-slate-200'
          ]
        },
        [
          h(Icon, { name: props.icon, class: 'h-5 w-5 text-slate-500' }),
          ...(slots.default?.() || [])
        ]
      ),
      props.error ? h('span', { class: 'mt-1 block text-xs font-medium text-rose-600' }, props.error) : null
    ])
  }
})

const tabClass = (active: boolean) => [
  'rounded-lg px-4 py-3 text-sm font-semibold transition',
  active ? 'bg-white text-sky-700 shadow-sm ring-1 ring-sky-200' : 'text-slate-600 hover:text-slate-900'
]

const changeRole = (newRole: RegisterRole) => {
  role.value = newRole
  errorMessage.value = ''
  successMessage.value = ''
}

const queryToRole = () => {
  const raw = route.query.role || route.query.type || route.query.account
  const value = Array.isArray(raw) ? raw[0] : raw
  const normalized = String(value || '').toLowerCase()

  if (['enterprise', 'company', 'employer', 'recruiter', 'business', 'doanh-nghiep', 'nha-tuyen-dung'].includes(normalized)) {
    return 'COMPANY'
  }

  return 'STUDENT'
}

watch(
  () => [route.query.role, route.query.type, route.query.account],
  () => changeRole(queryToRole()),
  { immediate: true }
)

const studentForm = reactive({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const studentErrors = reactive({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateStudentName = () => {
  if (!studentForm.name) {
    studentErrors.name = 'Vui lòng nhập họ và tên.'
  } else if (studentForm.name.length < 2) {
    studentErrors.name = 'Họ và tên phải có ít nhất 2 ký tự.'
  } else {
    studentErrors.name = ''
  }
}

const validateStudentPhone = () => {
  if (!studentForm.phone) {
    studentErrors.phone = 'Vui lòng nhập số điện thoại.'
  } else if (!/^\d+$/.test(studentForm.phone)) {
    studentErrors.phone = 'Số điện thoại chỉ được chứa ký tự số.'
  } else if (studentForm.phone.length < 10 || studentForm.phone.length > 11) {
    studentErrors.phone = 'Số điện thoại phải từ 10 đến 11 số.'
  } else {
    studentErrors.phone = ''
  }
}

const validateStudentEmail = () => {
  if (!studentForm.email) {
    studentErrors.email = 'Vui lòng nhập email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentForm.email)) {
    studentErrors.email = 'Email không đúng định dạng.'
  } else {
    studentErrors.email = ''
  }
}

const validateStudentPassword = () => {
  if (!studentForm.password) {
    studentErrors.password = 'Vui lòng nhập mật khẩu.'
  } else if (studentForm.password.length < 6) {
    studentErrors.password = 'Mật khẩu phải từ 6 ký tự.'
  } else {
    studentErrors.password = ''
  }
}

const validateStudentConfirmPassword = () => {
  if (!studentForm.confirmPassword) {
    studentErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
  } else if (studentForm.confirmPassword !== studentForm.password) {
    studentErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  } else {
    studentErrors.confirmPassword = ''
  }
}

const handleStudentRegister = async () => {
  validateStudentName()
  validateStudentPhone()
  validateStudentEmail()
  validateStudentPassword()
  validateStudentConfirmPassword()

  if (
    studentErrors.name ||
    studentErrors.phone ||
    studentErrors.email ||
    studentErrors.password ||
    studentErrors.confirmPassword
  ) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res: any = await AuthService.registerStudent({
      email: studentForm.email,
      password: studentForm.password,
      name: studentForm.name,
      phone: studentForm.phone
    })

    if (res.success) {
      successMessage.value = 'Đăng ký tài khoản sinh viên thành công. Đang chuyển hướng sang đăng nhập...'
      setTimeout(() => navigateTo('/auth/login'), 2000)
    } else {
      errorMessage.value = res.message || 'Đăng ký thất bại. Vui lòng thử lại.'
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || 'Lỗi hệ thống khi đăng ký.'
  } finally {
    isLoading.value = false
  }
}

const companyForm = reactive({
  company_name: '',
  tax_code: '',
  gpkd_url: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const companyErrors = reactive({
  company_name: '',
  tax_code: '',
  gpkd_url: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateCompanyName = () => {
  if (!companyForm.company_name) {
    companyErrors.company_name = 'Vui lòng nhập tên doanh nghiệp.'
  } else if (companyForm.company_name.length < 3) {
    companyErrors.company_name = 'Tên doanh nghiệp phải từ 3 ký tự trở lên.'
  } else {
    companyErrors.company_name = ''
  }
}

const validateCompanyTax = () => {
  if (!companyForm.tax_code) {
    companyErrors.tax_code = 'Vui lòng nhập mã số thuế.'
  } else if (!/^\d+$/.test(companyForm.tax_code)) {
    companyErrors.tax_code = 'Mã số thuế chỉ được chứa số.'
  } else if (companyForm.tax_code.length < 10 || companyForm.tax_code.length > 13) {
    companyErrors.tax_code = 'Mã số thuế phải từ 10 đến 13 ký số.'
  } else {
    companyErrors.tax_code = ''
  }
}

const validateCompanyEmail = () => {
  if (!companyForm.email) {
    companyErrors.email = 'Vui lòng nhập email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyForm.email)) {
    companyErrors.email = 'Email không đúng định dạng.'
  } else {
    companyErrors.email = ''
  }
}

const validateCompanyPassword = () => {
  if (!companyForm.password) {
    companyErrors.password = 'Vui lòng nhập mật khẩu.'
  } else if (companyForm.password.length < 6) {
    companyErrors.password = 'Mật khẩu phải từ 6 ký tự.'
  } else {
    companyErrors.password = ''
  }
}

const validateCompanyConfirmPassword = () => {
  if (!companyForm.confirmPassword) {
    companyErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
  } else if (companyForm.confirmPassword !== companyForm.password) {
    companyErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  } else {
    companyErrors.confirmPassword = ''
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingFile.value = true
  errorMessage.value = ''
  companyErrors.gpkd_url = ''

  try {
    const res: any = await AuthService.uploadGPKD(file)
    if (res.success && res.url) {
      companyForm.gpkd_url = res.url
    } else {
      companyErrors.gpkd_url = 'Tải file lên thất bại.'
    }
  } catch (err: any) {
    companyErrors.gpkd_url = err.data?.message || err.message || 'Lỗi tải file lên.'
  } finally {
    uploadingFile.value = false
  }
}

const handleCompanyRegister = async () => {
  validateCompanyName()
  validateCompanyTax()
  validateCompanyEmail()
  validateCompanyPassword()
  validateCompanyConfirmPassword()

  companyErrors.gpkd_url = companyForm.gpkd_url ? '' : 'Vui lòng tải lên giấy phép kinh doanh (GPKD).'

  if (
    companyErrors.company_name ||
    companyErrors.tax_code ||
    companyErrors.gpkd_url ||
    companyErrors.email ||
    companyErrors.password ||
    companyErrors.confirmPassword
  ) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res: any = await AuthService.registerEnterprise({
      email: companyForm.email,
      password: companyForm.password,
      company_name: companyForm.company_name,
      tax_code: companyForm.tax_code,
      gpkd_url: companyForm.gpkd_url
    })

    if (res.success) {
      successMessage.value = 'Đăng ký tài khoản doanh nghiệp thành công. Đang chuyển hướng sang đăng nhập...'
      setTimeout(() => navigateTo('/auth/login'), 2000)
    } else {
      errorMessage.value = res.message || 'Đăng ký thất bại. Vui lòng thử lại.'
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || 'Lỗi hệ thống khi đăng ký.'
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
    errorMessage.value = 'Không thể kết nối cấu hình đăng ký Google: ' + (err.message || err)
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
  font-weight: 500;
  color: #0f172a;
  outline: none;
}

.qw-auth-input::placeholder {
  color: #94a3b8;
}

.qw-auth-submit {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  background: #0284c7;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 18px 32px rgba(2, 132, 199, 0.22);
  transition: background 150ms ease, opacity 150ms ease;
}

.qw-auth-submit:hover {
  background: #0369a1;
}

.qw-auth-submit:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
