import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '~/services/auth.service'


// Định nghĩa cấu trúc thông tin User cơ bản
interface UserProfile {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'ENTERPRISE' | 'ADMIN'
  enterpriseKybStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  enterpriseApproved?: boolean
  enterpriseRequireKyb?: boolean
  businessLicenseUrl?: string
  enterpriseKybRejectReason?: string
  avatar?: string
  student_profile?: Record<string, any>
  studentProfile?: Record<string, any>
  enterprise_profile?: Record<string, any>
  enterpriseProfile?: Record<string, any>
}

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const userProfileCookie = useCookie<UserProfile | undefined | null>('user_profile', {
    path: '/',
    sameSite: 'lax',
  })

  // Hàm làm sạch cookie để phòng chống việc Nuxt 3 chuyển đổi null/undefined thành chuỗi "null"/"undefined"
  const cleanCookieValue = <T>(cookieRef: { value: T | null | undefined }): T | undefined => {
    const val = cookieRef.value
    if (val === null || val === undefined || (typeof val === 'string' && (val === 'null' || val === 'undefined'))) {
      cookieRef.value = undefined
      return undefined
    }
    return val as T
  }

  const cleanUserProfile = cleanCookieValue(userProfileCookie)

  const user = ref<UserProfile | null>(cleanUserProfile || null)
  const token = ref<string | null>(null)

  // Khởi tạo trạng thái từ localStorage nếu đang chạy ở phía Trình duyệt (Client)
  if (import.meta.client) {
    localStorage.removeItem('qw_access_token')
    localStorage.removeItem('qw_refresh_token')

    if (!cleanUserProfile) {
      const savedUser = localStorage.getItem('qw_user_profile')
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        try {
          user.value = JSON.parse(savedUser)
          userProfileCookie.value = user.value
        } catch (e) {
          console.error('Lỗi phân tích cú pháp profile người dùng:', e)
        }
      }
    }
  }

  // --- GETTERS (COMPUTED) ---
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const enterpriseKybStatus = computed(() => user.value?.enterpriseKybStatus || null)
  const enterpriseApproved = computed(() => user.value?.role === 'ENTERPRISE' && user.value?.enterpriseApproved === true)
  const enterpriseKybRequired = computed(() => user.value?.role === 'ENTERPRISE' && user.value?.enterpriseRequireKyb !== false)
  const canAccessEnterpriseFeatures = computed(() => (
    user.value?.role === 'ENTERPRISE'
    && (!enterpriseKybRequired.value || enterpriseApproved.value)
  ))
  const canAccessEnterprise = computed(() => user.value?.role === 'ENTERPRISE')
  const canAccessStudentArea = computed(() => user.value?.role === 'STUDENT')

  // --- ACTIONS ---
  /**
   * Xử lý hành động Đăng nhập từ UI Form
   */
  async function login(credentials: any) {

    clearAuth()

    const response = await AuthService.login(credentials)

    const data = response.data

    user.value = {
      id: String(data.user_id),
      email: data.email,
      name: data.name || "",
      avatar: data.avatar || "",
      role: data.role,
      enterpriseKybStatus: data.enterprise_kyb_status || null,
      enterpriseApproved: data.enterprise_approved === true,
      enterpriseRequireKyb: data.enterprise_require_kyb !== false,
      businessLicenseUrl: data.business_license_url || '',
      enterpriseKybRejectReason: data.enterprise_kyb_reject_reason || ''
    }
    userProfileCookie.value = user.value

    if (process.client) {
      localStorage.setItem(
        "qw_user_profile",
        JSON.stringify(user.value)
      )
    }
  }

  function setCurrentUser(userData: UserProfile) {
    user.value = userData
    userProfileCookie.value = userData
    if (process.client) {
      localStorage.setItem("qw_user_profile", JSON.stringify(userData))
    }
  }

  function syncEnterprisePolicy(payload: {
    requireKyb: boolean
    kybStatus?: string
    businessLicenseUrl?: string
    rejectReason?: string
  }) {
    if (user.value?.role !== 'ENTERPRISE') return
    const status = String(payload.kybStatus || user.value.enterpriseKybStatus || 'PENDING').toUpperCase()
    const normalizedStatus: 'PENDING' | 'APPROVED' | 'REJECTED' =
      status === 'APPROVED' || status === 'REJECTED' ? status : 'PENDING'
    const businessLicenseUrl = String(payload.businessLicenseUrl ?? user.value.businessLicenseUrl ?? '').trim()
    setCurrentUser({
      ...user.value,
      enterpriseRequireKyb: payload.requireKyb,
      enterpriseKybStatus: normalizedStatus,
      enterpriseApproved: normalizedStatus === 'APPROVED' && Boolean(businessLicenseUrl),
      businessLicenseUrl,
      enterpriseKybRejectReason: String(payload.rejectReason ?? user.value.enterpriseKybRejectReason ?? '').trim()
    })
  }

  function clearAuth() {
    token.value = null
    user.value = null
    userProfileCookie.value = undefined
    if (process.client) {
      localStorage.removeItem("qw_access_token")
      localStorage.removeItem("qw_refresh_token")
      localStorage.removeItem("qw_user_profile")
    }
  }

  async function logout() {
    try {
      await AuthService.logout()
    } catch (e) {
      console.error('Logout API failed:', e)
    }

    clearAuth()
    navigateTo("/auth/login")
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    enterpriseKybStatus,
    enterpriseApproved,
    enterpriseKybRequired,
    canAccessEnterpriseFeatures,
    canAccessEnterprise,
    canAccessStudentArea,
    login,
    logout,
    setCurrentUser,
    syncEnterprisePolicy,
    clearAuth
  }
})
