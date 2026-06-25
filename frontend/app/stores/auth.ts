import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '~/services/auth.service'

// Định nghĩa cấu trúc thông tin User cơ bản
interface UserProfile {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'COMPANY' | 'ADMIN'
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
  async function login(credentials: any) {
    try {
      // Gọi qua tầng Service, không gọi Axios trực tiếp
      const response: any = await AuthService.login(credentials)
      
      // Giả định Backend GoFiber trả về cấu trúc: { token: string, user: UserProfile }
      token.value = response.token
      user.value = response.user

      // Lưu trữ trạng thái xuống bộ nhớ trình duyệt để duy trì phiên làm việc
      if (import.meta.client) {
        localStorage.setItem('qw_access_token', response.token)
        localStorage.setItem('qw_user_profile', JSON.stringify(response.user))
        localStorage.setItem('qw_user_role', response.user.role)
      }
      
      return response
    } catch (error) {
      // Đẩy lỗi ra ngoài để UI Form hiển thị thông báo cho người dùng
      throw error
    }
  }

  /**
   * Xử lý hành động Đăng xuất xóa sạch dữ liệu phiên làm việc
   */
  function logout() {
    token.value = null
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem('qw_access_token')
      localStorage.removeItem('qw_user_profile')
      localStorage.removeItem('qw_user_role')
      
      // Ép điều hướng về trang đăng nhập sạch sẽ
      navigateTo('/login')
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout
  }
})