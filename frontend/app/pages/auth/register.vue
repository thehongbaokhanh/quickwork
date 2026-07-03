<template>
  <div class="space-y-6">
      <div class="flex bg-gray-100 p-1 rounded-xl gap-1">
        <button 
          type="button"
          @click="changeRole('STUDENT')"
          :class="['flex-1 py-1.5 text-xs font-medium rounded-lg transition-all', role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
        >
          Tài khoản Sinh Viên
        </button>
        <button 
          type="button"
          @click="changeRole('COMPANY')"
          :class="['flex-1 py-1.5 text-xs font-medium rounded-lg transition-all', role === 'COMPANY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
        >
          Tài khoản Doanh Nghiệp
        </button>
      </div>

      <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl flex items-center gap-2">
        <Icon name="uil:check-circle" class="w-5 h-5 shrink-0" />
        <span>{{ successMessage }}</span>
      </div>

      <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
        <Icon name="uil:exclamation-circle" class="w-5 h-5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- STUDENT FORM -->
      <form v-if="role === 'STUDENT'" @submit.prevent="handleStudentRegister" class="space-y-4">
        <div>
          <label for="student-name" class="block text-sm font-medium text-gray-700">Họ và tên</label>
          <div class="mt-1">
            <input
              id="student-name"
              v-model="studentForm.name"
              @blur="validateStudentName"
              @input="validateStudentName"
              type="text"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="studentErrors.name ? 'border-red-300' : 'border-gray-300'"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <p v-if="studentErrors.name" class="mt-1 text-xs text-red-500">{{ studentErrors.name }}</p>
        </div>

        <div>
          <label for="student-phone" class="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <div class="mt-1">
            <input
              id="student-phone"
              v-model="studentForm.phone"
              @blur="validateStudentPhone"
              @input="validateStudentPhone"
              type="text"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="studentErrors.phone ? 'border-red-300' : 'border-gray-300'"
              placeholder="0987654321"
            />
          </div>
          <p v-if="studentErrors.phone" class="mt-1 text-xs text-red-500">{{ studentErrors.phone }}</p>
        </div>

        <div>
          <label for="student-email" class="block text-sm font-medium text-gray-700">Email học viên</label>
          <div class="mt-1">
            <input
              id="student-email"
              v-model="studentForm.email"
              @blur="validateStudentEmail"
              @input="validateStudentEmail"
              type="email"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="studentErrors.email ? 'border-red-300' : 'border-gray-300'"
              placeholder="student@example.com"
            />
          </div>
          <p v-if="studentErrors.email" class="mt-1 text-xs text-red-500">{{ studentErrors.email }}</p>
        </div>

        <div>
          <label for="student-password" class="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <div class="mt-1">
            <input
              id="student-password"
              v-model="studentForm.password"
              @blur="validateStudentPassword"
              @input="validateStudentPassword"
              type="password"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="studentErrors.password ? 'border-red-300' : 'border-gray-300'"
              placeholder="••••••••"
            />
          </div>
          <p v-if="studentErrors.password" class="mt-1 text-xs text-red-500">{{ studentErrors.password }}</p>
        </div>

        <div>
          <label for="student-confirm-password" class="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <div class="mt-1">
            <input
              id="student-confirm-password"
              v-model="studentForm.confirmPassword"
              @blur="validateStudentConfirmPassword"
              @input="validateStudentConfirmPassword"
              type="password"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="studentErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'"
              placeholder="••••••••"
            />
          </div>
          <p v-if="studentErrors.confirmPassword" class="mt-1 text-xs text-red-500">{{ studentErrors.confirmPassword }}</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản' }}
          </button>
        </div>
      </form>

      <!-- COMPANY FORM -->
      <form v-else @submit.prevent="handleCompanyRegister" class="space-y-4">
        <div>
          <label for="company-name" class="block text-sm font-medium text-gray-700">Tên doanh nghiệp</label>
          <div class="mt-1">
            <input
              id="company-name"
              v-model="companyForm.company_name"
              @blur="validateCompanyName"
              @input="validateCompanyName"
              type="text"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="companyErrors.company_name ? 'border-red-300' : 'border-gray-300'"
              placeholder="Công ty TNHH QuickWork"
            />
          </div>
          <p v-if="companyErrors.company_name" class="mt-1 text-xs text-red-500">{{ companyErrors.company_name }}</p>
        </div>

        <div>
          <label for="company-tax" class="block text-sm font-medium text-gray-700">Mã số thuế</label>
          <div class="mt-1">
            <input
              id="company-tax"
              v-model="companyForm.tax_code"
              @blur="validateCompanyTax"
              @input="validateCompanyTax"
              type="text"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="companyErrors.tax_code ? 'border-red-300' : 'border-gray-300'"
              placeholder="0123456789"
            />
          </div>
          <p v-if="companyErrors.tax_code" class="mt-1 text-xs text-red-500">{{ companyErrors.tax_code }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Giấy phép kinh doanh (GPKD)</label>
          <div class="mt-1 flex items-center gap-4">
            <label
              for="gpkd-file"
              class="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500"
            >
              <span>Chọn file GPKD</span>
              <input
                id="gpkd-file"
                type="file"
                class="sr-only"
                accept=".jpg,.jpeg,.png,.pdf,.docx"
                @change="handleFileUpload"
              />
            </label>
            <div v-if="uploadingFile" class="text-xs text-gray-500 flex items-center gap-1.5">
              <span class="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
              Đang tải lên...
            </div>
            <div v-else-if="companyForm.gpkd_url" class="text-xs text-green-600 flex items-center gap-1">
              <Icon name="uil:check" class="w-4 h-4" />
              Đã tải lên giấy phép
            </div>
            <div v-else class="text-xs text-gray-400">
              Chưa có file nào được chọn
            </div>
          </div>
          <p v-if="companyErrors.gpkd_url" class="mt-1 text-xs text-red-500">{{ companyErrors.gpkd_url }}</p>
        </div>

        <div>
          <label for="company-email" class="block text-sm font-medium text-gray-700">Email doanh nghiệp</label>
          <div class="mt-1">
            <input
              id="company-email"
              v-model="companyForm.email"
              @blur="validateCompanyEmail"
              @input="validateCompanyEmail"
              type="email"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="companyErrors.email ? 'border-red-300' : 'border-gray-300'"
              placeholder="recruiter@company.com"
            />
          </div>
          <p v-if="companyErrors.email" class="mt-1 text-xs text-red-500">{{ companyErrors.email }}</p>
        </div>

        <div>
          <label for="company-password" class="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <div class="mt-1">
            <input
              id="company-password"
              v-model="companyForm.password"
              @blur="validateCompanyPassword"
              @input="validateCompanyPassword"
              type="password"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="companyErrors.password ? 'border-red-300' : 'border-gray-300'"
              placeholder="••••••••"
            />
          </div>
          <p v-if="companyErrors.password" class="mt-1 text-xs text-red-500">{{ companyErrors.password }}</p>
        </div>

        <div>
          <label for="company-confirm-password" class="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <div class="mt-1">
            <input
              id="company-confirm-password"
              v-model="companyForm.confirmPassword"
              @blur="validateCompanyConfirmPassword"
              @input="validateCompanyConfirmPassword"
              type="password"
              required
              class="appearance-none block w-full px-3 py-2 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              :class="companyErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'"
              placeholder="••••••••"
            />
          </div>
          <p v-if="companyErrors.confirmPassword" class="mt-1 text-xs text-red-500">{{ companyErrors.confirmPassword }}</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading || uploadingFile"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {{ isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản Doanh nghiệp' }}
          </button>
        </div>
      </form>

      <div class="relative flex items-center justify-center my-4">
        <div class="border-t border-gray-200 w-full"></div>
        <span class="absolute bg-white px-3 text-xs text-gray-400 uppercase font-semibold">Hoặc</span>
      </div>

      <div>
        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="isLoading || uploadingFile"
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

      <div class="text-center text-sm text-gray-500 pt-2">
        <NuxtLink to="/auth/login" class="text-blue-600 font-medium hover:underline">Quay lại Đăng nhập</NuxtLink>
      </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

import { ref, reactive } from 'vue'
import { AuthService } from '~/services/auth.service'

const role = ref<'STUDENT' | 'COMPANY'>('STUDENT')
const isLoading = ref(false)
const uploadingFile = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const changeRole = (newRole: 'STUDENT' | 'COMPANY') => {
  role.value = newRole
  errorMessage.value = ''
  successMessage.value = ''
}

// --- STUDENT FORM DATA & VALIDATION ---
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
    const payload = {
      email: studentForm.email,
      password: studentForm.password,
      name: studentForm.name,
      phone: studentForm.phone
    }
    const res: any = await AuthService.registerStudent(payload)
    if (res.success) {
      successMessage.value = 'Đăng ký tài khoản Sinh viên thành công! Đang chuyển hướng sang Đăng nhập...'
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 2000)
    } else {
      errorMessage.value = res.message || 'Đăng ký thất bại. Vui lòng thử lại.'
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || 'Lỗi hệ thống khi đăng ký.'
  } finally {
    isLoading.value = false
  }
}

// --- COMPANY FORM DATA & VALIDATION ---
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

  if (!companyForm.gpkd_url) {
    companyErrors.gpkd_url = 'Vui lòng tải lên giấy phép kinh doanh (GPKD).'
  } else {
    companyErrors.gpkd_url = ''
  }

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
    const payload = {
      email: companyForm.email,
      password: companyForm.password,
      company_name: companyForm.company_name,
      tax_code: companyForm.tax_code,
      gpkd_url: companyForm.gpkd_url
    }
    const res: any = await AuthService.registerEnterprise(payload)
    if (res.success) {
      successMessage.value = 'Đăng ký tài khoản Doanh nghiệp thành công! Đang chuyển hướng sang Đăng nhập...'
      setTimeout(() => {
        navigateTo('/auth/login')
      }, 2000)
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
    
    // Fetch Google config from backend
    const configResponse: any = await $fetch('http://localhost:8080/api/v1/auth/google/config')
    const config = configResponse.data
    
    if (config && config.client_id) {
      // Real Google flow
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&response_type=code&scope=openid%20email%20profile`
      window.location.href = googleAuthUrl
    } else {
      // Mock Google flow
      const mockRedirectUri = config.redirect_uri || 'http://localhost:3000/auth/google/callback'
      window.location.href = `${mockRedirectUri}?code=mock_google_code_${Date.now()}`
    }
  } catch (err: any) {
    errorMessage.value = 'Không thể kết nối cấu hình đăng nhập Google: ' + (err.message || err)
    isLoading.value = false
  }
}
</script>