import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  // Nếu đã đăng nhập, tự động điều hướng về Dashboard phù hợp, không cho vào trang Auth nữa
  if (authStore.isAuthenticated) {
    const role = authStore.userRole
    
    if (role === 'ADMIN') return navigateTo('/admin/dashboard')
    if (role === 'ENTERPRISE') return navigateTo('/enterprise/dashboard')
    return navigateTo('/dashboard') // Mặc định cho STUDENT
  }
})