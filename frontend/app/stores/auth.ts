import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '~/services/auth.service'


// Định nghĩa cấu trúc thông tin User cơ bản
interface UserProfile {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'ENTERPRISE' | 'ADMIN'
}

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const user = ref<UserProfile | null>(null)
  const token = ref<string | null>(null)

  // Khởi tạo trạng thái từ localStorage nếu đang chạy ở phía Trình duyệt (Client)
  if (import.meta.client) {
    token.value = localStorage.getItem('qw_access_token')
    const savedUser = localStorage.getItem('qw_user_profile')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Lỗi phân tích cú pháp profile người dùng:', e)
      }
    }
  }

  // --- GETTERS (COMPUTED) ---
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)

  // --- ACTIONS ---
  /**
   * Xử lý hành động Đăng nhập từ UI Form
   */
  async function login(credentials:any){

    const response = await AuthService.login(credentials)

    const data = response.data

    token.value = data.access_token

    user.value = {

        id: String(data.user_id),

        email: data.email,

        name: "",

        role: data.role
    }

    if(process.client){

        localStorage.setItem(
            "qw_access_token",
            data.access_token
        )

        localStorage.setItem(
            "qw_refresh_token",
            data.refresh_token
        )

        localStorage.setItem(
            "qw_user_profile",
            JSON.stringify(user.value)
        )
    }
}

  function setCurrentUser(userData: UserProfile) {
    user.value = userData
    if (process.client) {
      localStorage.setItem("qw_user_profile", JSON.stringify(userData))
    }
  }

  function clearAuth() {
    token.value = null
    user.value = null
    if (process.client) {
      localStorage.removeItem("qw_access_token")
      localStorage.removeItem("qw_refresh_token")
      localStorage.removeItem("qw_user_profile")
    }
  }

  /**
   * Xử lý hành động Đăng xuất xóa sạch dữ liệu phiên làm việc
   */
  async function logout(){
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
    login,
    logout,
    setCurrentUser,
    clearAuth
  }
})