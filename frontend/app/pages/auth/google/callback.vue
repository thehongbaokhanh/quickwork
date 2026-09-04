<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center space-y-6">
      <!-- Loading state -->
      <div v-if="status === 'loading'" class="space-y-4">
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent shadow-sm"></div>
        </div>
        <h2 class="text-xl font-bold text-slate-800">Đang xác thực Google</h2>
        <p class="text-sm text-slate-500">Vui lòng đợi trong giây lát trong khi chúng tôi đăng nhập vào hệ thống QuickWork...</p>
      </div>

      <!-- Success state -->
      <div v-else-if="status === 'success'" class="space-y-4">
        <div class="flex justify-center text-sky-500">
          <Icon name="uil:check-circle" class="w-16 h-16" />
        </div>
        <h2 class="text-xl font-bold text-slate-800">Đăng nhập thành công</h2>
        <p class="text-sm text-slate-500">Đang đồng bộ phiên hoạt động và chuyển hướng theo vai trò tài khoản...</p>
      </div>

      <!-- Error state -->
      <div v-else class="space-y-4">
        <div class="flex justify-center text-red-500">
          <Icon name="uil:exclamation-circle" class="w-16 h-16" />
        </div>
        <h2 class="text-xl font-bold text-slate-800">Xác thực thất bại</h2>
        <p class="text-sm text-red-500 font-medium">{{ errorMessage }}</p>
        <div class="pt-4">
          <NuxtLink 
            to="/auth/login" 
            class="inline-flex items-center justify-center px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            Quay lại Đăng nhập
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { AuthService } from '~/services/auth.service'
import { getLoginRedirectForRole } from '~/utils/authRedirect'

const route = useRoute()
const authStore = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string

  if (!code) {
    status.value = 'error'
    errorMessage.value = 'Không tìm thấy mã xác thực Google (auth code).'
    return
  }

  try {
    // Call backend endpoint to verify / register Google user
    const response: any = await AuthService.googleLogin(code)

    if (response.success && response.data) {
      const data = response.data
      
      const userProfile = {
        id: String(data.user_id),
        email: data.email,
        name: data.email.split('@')[0], // placeholder name
        role: data.role as 'STUDENT' | 'ENTERPRISE' | 'ADMIN',
        enterpriseKybStatus: data.enterprise_kyb_status || null,
        enterpriseApproved: data.enterprise_approved === true,
        enterpriseRequireKyb: data.enterprise_require_kyb !== false,
        businessLicenseUrl: data.business_license_url || '',
        enterpriseKybRejectReason: data.enterprise_kyb_reject_reason || ''
      }
      authStore.setCurrentUser(userProfile)

      status.value = 'success'
      
      // Redirect by account role after a valid login.
      setTimeout(async () => {
        if (['ADMIN', 'ENTERPRISE', 'STUDENT'].includes(data.role)) {
          const requestedRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
          await navigateTo(getLoginRedirectForRole(data.role, requestedRedirect))
        } else {
          status.value = 'error'
          errorMessage.value = 'Quyền hạn của tài khoản không hợp lệ.'
        }
      }, 1500)
    } else {
      status.value = 'error'
      errorMessage.value = response.message || 'Xác thực Google không thành công từ phía máy chủ.'
    }
  } catch (err: any) {
    status.value = 'error'
    errorMessage.value = err.data?.message || err.message || 'Lỗi kết nối máy chủ khi xác thực Google.'
  }
})
</script>
