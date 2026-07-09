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
  businessLicenseUrl?: string
}

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const accessTokenCookie = useCookie<string | undefined | null>('access_token', {
    path: '/',
    sameSite: 'lax',
  })
  const refreshTokenCookie = useCookie<string | undefined | null>('refresh_token', {
    path: '/',
    sameSite: 'lax',
  })
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

  const cleanAccessToken = cleanCookieValue(accessTokenCookie)
  const cleanRefreshToken = cleanCookieValue(refreshTokenCookie)
  const cleanUserProfile = cleanCookieValue(userProfileCookie)

  const user = ref<UserProfile | null>(cleanUserProfile || null)
  const token = ref<string | null>(cleanAccessToken || null)

  // Khởi tạo trạng thái từ localStorage nếu đang chạy ở phía Trình duyệt (Client)
  if (import.meta.client) {
    const legacyAccessToken = localStorage.getItem('qw_access_token')
    const legacyRefreshToken = localStorage.getItem('qw_refresh_token')

    if (!cleanAccessToken && legacyAccessToken && legacyAccessToken !== 'null' && legacyAccessToken !== 'undefined') {
      accessTokenCookie.value = legacyAccessToken
      token.value = legacyAccessToken
    }

    if (!cleanRefreshToken && legacyRefreshToken && legacyRefreshToken !== 'null' && legacyRefreshToken !== 'undefined') {
      refreshTokenCookie.value = legacyRefreshToken
    }

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
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const enterpriseKybStatus = computed(() => user.value?.enterpriseKybStatus || null)
  const enterpriseApproved = computed(() => user.value?.role === 'ENTERPRISE' && user.value?.enterpriseApproved === true)
  const canAccessEnterprise = computed(() => user.value?.role === 'ENTERPRISE' && enterpriseApproved.value)
  const canAccessStudentArea = computed(() => user.value?.role === 'STUDENT' || (user.value?.role === 'ENTERPRISE' && !enterpriseApproved.value))

  // --- ACTIONS ---
  /**
   * Xử lý hành động Đăng nhập từ UI Form
   */
  async function login(credentials:any){

    const response = await AuthService.login(credentials)

    const data = response.data

    token.value = data.access_token
    accessTokenCookie.value = data.access_token
    refreshTokenCookie.value = data.refresh_token

    user.value = {
        id: String(data.user_id),
        email: data.email,
        name: "",
        role: data.role,
        enterpriseKybStatus: data.enterprise_kyb_status || null,
        enterpriseApproved: data.enterprise_approved === true,
        businessLicenseUrl: data.business_license_url || ''
    }
    userProfileCookie.value = user.value

    if(process.client){
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

  function clearAuth() {
    token.value = null
    user.value = null
    accessTokenCookie.value = undefined
    refreshTokenCookie.value = undefined
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
    canAccessEnterprise,
    canAccessStudentArea,
    login,
    logout,
    setCurrentUser,
    clearAuth
  }
})
