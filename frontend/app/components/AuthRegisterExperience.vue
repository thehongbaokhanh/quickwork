<template>
  <AuthShell active="register" hero-variant="register" reverse>
    <template #hero>
      <div class="relative z-10 flex h-full flex-col justify-between gap-10">
        <div class="max-w-xl">
          <span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100">
            <Icon name="uil:user-plus" class="h-5 w-5" aria-hidden="true" />
            Tạo tài khoản mới
          </span>
          <h1 id="auth-hero-title" class="mt-7 text-4xl font-bold leading-tight tracking-tight text-slate-950 xl:text-5xl">
            Bắt đầu hành trình sự nghiệp của bạn cùng
            <span class="text-sky-600">QuickWork</span>
          </h1>
          <p class="mt-5 max-w-lg text-base font-medium leading-8 text-slate-600">
            Tham gia cộng đồng ứng viên và doanh nghiệp để khám phá cơ hội nghề nghiệp phù hợp mỗi ngày.
          </p>
        </div>

        <div class="grid gap-5">
          <article v-for="item in benefits" :key="item.title" class="flex max-w-lg items-start gap-4 rounded-lg bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
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
          <div class="absolute bottom-8 h-64 w-[90%] rounded-[48%] bg-sky-100/80 blur-sm" />
          <img src="/images/quickwork-career-hero.png" alt="" class="relative z-10 max-h-[350px] w-full max-w-[520px] object-contain object-bottom">
          <div class="absolute left-8 top-12 z-20 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-xl">
            <p class="text-xs font-bold text-slate-400">Hoàn toàn miễn phí</p>
            <div class="mt-2 flex items-center gap-2">
              <Icon name="uil:check-circle" class="h-5 w-5 text-sky-600" aria-hidden="true" />
              <span class="h-2 w-24 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <section class="w-full max-w-[680px] rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80 sm:p-9" aria-labelledby="register-title">
      <div>
        <p class="text-sm font-bold uppercase tracking-wide text-sky-600">QuickWork Account</p>
        <h2 id="register-title" class="mt-3 text-3xl font-bold tracking-tight text-slate-950">Đăng ký tài khoản</h2>
        <p class="mt-3 text-sm font-medium leading-6 text-slate-600">Bắt đầu hành trình sự nghiệp của bạn.</p>
      </div>

      <div class="mt-6 grid rounded-lg bg-slate-100 p-1 sm:grid-cols-2" role="tablist" aria-label="Chọn loại tài khoản">
        <button
          type="button"
          role="tab"
          :aria-selected="role === 'STUDENT'"
          :class="tabClass(role === 'STUDENT')"
          @click="changeRole('STUDENT')"
        >
          <Icon name="uil:graduation-cap" class="h-5 w-5" aria-hidden="true" />
          Sinh viên
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="role === 'COMPANY'"
          :class="tabClass(role === 'COMPANY')"
          @click="changeRole('COMPANY')"
        >
          <Icon name="uil:building" class="h-5 w-5" aria-hidden="true" />
          Doanh nghiệp
        </button>
      </div>

      <div v-if="successMessage" class="mt-5 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-700" role="status" aria-live="polite">
        <Icon name="uil:check-circle" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{{ successMessage }}</span>
      </div>

      <div v-if="errorMessage" class="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert" aria-live="polite">
        <Icon name="uil:exclamation-circle" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{{ errorMessage }}</span>
      </div>

      <form v-if="role === 'STUDENT'" class="mt-7 space-y-5" @submit.prevent="handleStudentRegister">
        <div class="grid gap-5 sm:grid-cols-2">
          <AuthField label="Họ và tên" icon="uil:user" input-id="student-name" :error="studentErrors.name">
            <input id="student-name" v-model="studentForm.name" type="text" autocomplete="name" required class="qw-auth-input" placeholder="Nhập họ và tên" :aria-invalid="Boolean(studentErrors.name)" :aria-describedby="studentErrors.name ? 'student-name-error' : undefined" @blur="validateStudentName" @input="validateStudentName">
          </AuthField>

          <AuthField label="Số điện thoại" icon="uil:phone" input-id="student-phone" :error="studentErrors.phone">
            <input id="student-phone" v-model="studentForm.phone" type="tel" autocomplete="tel" required class="qw-auth-input" placeholder="Nhập số điện thoại" :aria-invalid="Boolean(studentErrors.phone)" :aria-describedby="studentErrors.phone ? 'student-phone-error' : undefined" @blur="validateStudentPhone" @input="validateStudentPhone">
          </AuthField>
        </div>

        <AuthField label="Email" icon="uil:envelope" input-id="student-email" :error="studentErrors.email">
          <input id="student-email" v-model="studentForm.email" type="email" autocomplete="email" required class="qw-auth-input" placeholder="Nhập email của bạn" :aria-invalid="Boolean(studentErrors.email)" :aria-describedby="studentErrors.email ? 'student-email-error' : undefined" @blur="validateStudentEmail" @input="validateStudentEmail">
        </AuthField>

        <div class="grid gap-5 sm:grid-cols-2">
          <AuthField label="Mật khẩu" icon="uil:lock" input-id="student-password" :error="studentErrors.password">
            <input id="student-password" v-model="studentForm.password" :type="showStudentPassword ? 'text' : 'password'" autocomplete="new-password" required class="qw-auth-input" placeholder="Tạo mật khẩu" :aria-invalid="Boolean(studentErrors.password)" :aria-describedby="studentErrors.password ? 'student-password-error' : undefined" @blur="validateStudentPassword" @input="validateStudentPassword">
            <button type="button" class="qw-icon-button" :aria-label="showStudentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showStudentPassword = !showStudentPassword">
              <Icon :name="showStudentPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" aria-hidden="true" />
            </button>
          </AuthField>

          <AuthField label="Xác nhận mật khẩu" icon="uil:lock" input-id="student-confirm-password" :error="studentErrors.confirmPassword">
            <input id="student-confirm-password" v-model="studentForm.confirmPassword" :type="showStudentConfirmPassword ? 'text' : 'password'" autocomplete="new-password" required class="qw-auth-input" placeholder="Nhập lại mật khẩu" :aria-invalid="Boolean(studentErrors.confirmPassword)" :aria-describedby="studentErrors.confirmPassword ? 'student-confirm-password-error' : undefined" @blur="validateStudentConfirmPassword" @input="validateStudentConfirmPassword">
            <button type="button" class="qw-icon-button" :aria-label="showStudentConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'" @click="showStudentConfirmPassword = !showStudentConfirmPassword">
              <Icon :name="showStudentConfirmPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" aria-hidden="true" />
            </button>
          </AuthField>
        </div>

        <AgreementCheckbox />

        <button type="submit" :disabled="isLoading" class="qw-auth-primary">
          <span>{{ isLoading ? 'Đang đăng ký...' : 'Đăng ký' }}</span>
          <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      <form v-else class="mt-7 space-y-5" @submit.prevent="handleCompanyRegister">
        <div class="grid gap-5 sm:grid-cols-2">
          <AuthField label="Tên doanh nghiệp" icon="uil:building" input-id="company-name" :error="companyErrors.company_name">
            <input id="company-name" v-model="companyForm.company_name" type="text" autocomplete="organization" required class="qw-auth-input" placeholder="Nhập tên doanh nghiệp" :aria-invalid="Boolean(companyErrors.company_name)" :aria-describedby="companyErrors.company_name ? 'company-name-error' : undefined" @blur="validateCompanyName" @input="validateCompanyName">
          </AuthField>

          <AuthField label="Mã số thuế" icon="uil:receipt" input-id="company-tax" :error="companyErrors.tax_code">
            <input id="company-tax" v-model="companyForm.tax_code" type="text" inputmode="numeric" required class="qw-auth-input" placeholder="Nhập mã số thuế" :aria-invalid="Boolean(companyErrors.tax_code)" :aria-describedby="companyErrors.tax_code ? 'company-tax-error' : undefined" @blur="validateCompanyTax" @input="validateCompanyTax">
          </AuthField>
        </div>

        <AuthField label="Số điện thoại liên hệ" icon="uil:phone" input-id="company-phone" :error="companyErrors.phone">
          <input id="company-phone" v-model="companyForm.phone" type="tel" autocomplete="tel" required class="qw-auth-input" placeholder="Nhập số điện thoại liên hệ" :aria-invalid="Boolean(companyErrors.phone)" :aria-describedby="companyErrors.phone ? 'company-phone-error' : undefined" @blur="validateCompanyPhone" @input="validateCompanyPhone">
        </AuthField>

        <AuthField label="Email doanh nghiệp" icon="uil:envelope" input-id="company-email" :error="companyErrors.email">
          <input id="company-email" v-model="companyForm.email" type="email" autocomplete="email" required class="qw-auth-input" placeholder="Nhập email doanh nghiệp" :aria-invalid="Boolean(companyErrors.email)" :aria-describedby="companyErrors.email ? 'company-email-error' : undefined" @blur="validateCompanyEmail" @input="validateCompanyEmail">
        </AuthField>

        <label class="block">
          <span class="text-sm font-bold text-slate-900">Giấy phép kinh doanh (GPKD)</span>
          <span class="mt-2 flex flex-col gap-3 rounded-lg border px-4 py-3 transition sm:flex-row sm:items-center" :class="companyErrors.gpkd_url ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'">
            <label for="gpkd-file" class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus-within:ring-4 focus-within:ring-sky-100">
              <Icon name="uil:upload" class="h-4 w-4" aria-hidden="true" />
              Chọn file
              <input id="gpkd-file" type="file" class="sr-only" accept=".jpg,.jpeg,.png,.pdf,.docx" :aria-invalid="Boolean(companyErrors.gpkd_url)" :aria-describedby="companyErrors.gpkd_url ? 'gpkd-file-error' : undefined" @change="handleFileUpload">
            </label>
            <span class="text-sm font-semibold" :class="companyForm.gpkd_url ? 'text-sky-700' : 'text-slate-600'">
              <span v-if="uploadingFile">Đang tải lên...</span>
              <span v-else-if="companyForm.gpkd_url">Đã tải lên giấy phép</span>
              <span v-else>Chưa có file nào được chọn</span>
            </span>
          </span>
          <span v-if="companyErrors.gpkd_url" id="gpkd-file-error" class="mt-1.5 block text-xs font-semibold text-rose-600" role="alert">{{ companyErrors.gpkd_url }}</span>
        </label>

        <div class="grid gap-5 sm:grid-cols-2">
          <AuthField label="Mật khẩu" icon="uil:lock" input-id="company-password" :error="companyErrors.password">
            <input id="company-password" v-model="companyForm.password" :type="showCompanyPassword ? 'text' : 'password'" autocomplete="new-password" required class="qw-auth-input" placeholder="Tạo mật khẩu" :aria-invalid="Boolean(companyErrors.password)" :aria-describedby="companyErrors.password ? 'company-password-error' : undefined" @blur="validateCompanyPassword" @input="validateCompanyPassword">
            <button type="button" class="qw-icon-button" :aria-label="showCompanyPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showCompanyPassword = !showCompanyPassword">
              <Icon :name="showCompanyPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" aria-hidden="true" />
            </button>
          </AuthField>

          <AuthField label="Xác nhận mật khẩu" icon="uil:lock" input-id="company-confirm-password" :error="companyErrors.confirmPassword">
            <input id="company-confirm-password" v-model="companyForm.confirmPassword" :type="showCompanyConfirmPassword ? 'text' : 'password'" autocomplete="new-password" required class="qw-auth-input" placeholder="Nhập lại mật khẩu" :aria-invalid="Boolean(companyErrors.confirmPassword)" :aria-describedby="companyErrors.confirmPassword ? 'company-confirm-password-error' : undefined" @blur="validateCompanyConfirmPassword" @input="validateCompanyConfirmPassword">
            <button type="button" class="qw-icon-button" :aria-label="showCompanyConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'" @click="showCompanyConfirmPassword = !showCompanyConfirmPassword">
              <Icon :name="showCompanyConfirmPassword ? 'uil:eye-slash' : 'uil:eye'" class="h-5 w-5" aria-hidden="true" />
            </button>
          </AuthField>
        </div>

        <AgreementCheckbox />

        <button type="submit" :disabled="isLoading || uploadingFile" class="qw-auth-primary">
          <span>{{ isLoading ? 'Đang đăng ký...' : 'Đăng ký doanh nghiệp' }}</span>
          <Icon name="uil:arrow-right" class="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      <div class="my-7 flex items-center gap-4">
        <span class="h-px flex-1 bg-slate-200" />
        <span class="text-xs font-semibold uppercase text-slate-400">hoặc</span>
        <span class="h-px flex-1 bg-slate-200" />
      </div>

      <button type="button" :disabled="isLoading || uploadingFile" class="qw-auth-secondary" @click="handleGoogleLogin">
        <span class="text-lg font-bold text-[#4285F4]" aria-hidden="true">G</span>
        Đăng ký với Google
      </button>

      <p class="mt-7 text-center text-sm font-semibold text-slate-600">
        Đã có tài khoản?
        <NuxtLink to="/login" class="rounded-md font-semibold text-sky-600 outline-none transition hover:text-sky-700 focus-visible:ring-4 focus-visible:ring-sky-100">
          Đăng nhập ngay
        </NuxtLink>
      </p>
    </section>
  </AuthShell>
</template>

<script setup lang="ts">
import { defineComponent, h, reactive, ref, resolveComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import AuthField from '~/components/AuthField.vue'
import AuthShell from '~/components/AuthShell.vue'
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
  { title: 'Hoàn toàn miễn phí', description: 'Tạo tài khoản và ứng tuyển miễn phí 100%.', icon: 'uil:credit-card-search', iconClass: 'bg-sky-50 text-sky-700' },
  { title: 'Hồ sơ chuyên nghiệp', description: 'Xây dựng hồ sơ ấn tượng và thu hút nhà tuyển dụng.', icon: 'uil:file-alt', iconClass: 'bg-sky-50 text-sky-700' },
  { title: 'Cập nhật việc làm mới', description: 'Nhận thông báo việc làm phù hợp mỗi ngày.', icon: 'uil:bell', iconClass: 'bg-violet-50 text-violet-700' }
]

const AgreementCheckbox = defineComponent({
  setup() {
    const NuxtLink = resolveComponent('NuxtLink')

    return () => h('label', { class: 'flex items-start gap-3 text-sm font-semibold leading-6 text-slate-600' }, [
      h('input', {
        type: 'checkbox',
        required: true,
        class: 'mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500',
        'aria-label': 'Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật'
      }),
      h('span', {}, [
        'Tôi đồng ý với ',
        h(NuxtLink, { to: '#', class: 'font-semibold text-sky-600 hover:text-sky-700' }, () => 'Điều khoản sử dụng'),
        ' và ',
        h(NuxtLink, { to: '#', class: 'font-semibold text-sky-600 hover:text-sky-700' }, () => 'Chính sách bảo mật')
      ])
    ])
  }
})

const tabClass = (active: boolean) => [
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-sky-100',
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
  phone: '',
  gpkd_url: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const companyErrors = reactive({
  company_name: '',
  tax_code: '',
  phone: '',
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

const validateCompanyPhone = () => {
  if (!companyForm.phone) {
    companyErrors.phone = 'Vui lòng nhập số điện thoại liên hệ.'
  } else if (!/^\d+$/.test(companyForm.phone)) {
    companyErrors.phone = 'Số điện thoại liên hệ chỉ được chứa ký tự số.'
  } else if (companyForm.phone.length < 10 || companyForm.phone.length > 11) {
    companyErrors.phone = 'Số điện thoại liên hệ phải từ 10 đến 11 số.'
  } else {
    companyErrors.phone = ''
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
  validateCompanyPhone()
  validateCompanyEmail()
  validateCompanyPassword()
  validateCompanyConfirmPassword()

  companyErrors.gpkd_url = companyForm.gpkd_url ? '' : 'Vui lòng tải lên giấy phép kinh doanh (GPKD).'

  if (
    companyErrors.company_name ||
    companyErrors.tax_code ||
    companyErrors.phone ||
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
      phone: companyForm.phone,
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
  font-weight: 600;
  color: #0f172a;
  outline: none;
}

.qw-auth-input::placeholder {
  color: #94a3b8;
}

.qw-icon-button {
  border-radius: 0.375rem;
  padding: 0.25rem;
  color: #64748b;
  outline: none;
  transition: color 150ms ease, box-shadow 150ms ease;
}

.qw-icon-button:hover {
  color: #0f172a;
}

.qw-icon-button:focus-visible {
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.16);
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
