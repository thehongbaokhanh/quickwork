import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  // Yêu cầu phải đăng nhập và phải có quyền ADMIN
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (authStore.userRole !== 'ADMIN') {
    return navigateTo('/403') // Trang từ chối truy cập
  }
})