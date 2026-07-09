import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Các trang không yêu cầu đăng nhập
  const publicPages = ['/auth/login', '/auth/register', '/', '/forgot-password', '/403', '/404', '/500']
  const isPublicPage = publicPages.includes(to.path)

  // 1. Chưa đăng nhập
  if (!authStore.isAuthenticated) {
    if (!isPublicPage) {
      return navigateTo('/auth/login')
    }
    return
  }

  // 2. Đã đăng nhập
  const role = authStore.userRole

  // Kiểm tra tính hợp lệ của role
  const validRoles = ['ADMIN', 'ENTERPRISE', 'STUDENT']
  if (!role || !validRoles.includes(role)) {
    authStore.logout()
    return navigateTo('/auth/login?error=invalid_role')
  }

  // Nếu truy cập lại trang đăng nhập / đăng ký thì điều hướng về dashboard tương ứng
  if (['/auth/login', '/auth/register'].includes(to.path)) {
    if (role === 'ADMIN') return navigateTo('/admin')
    if (role === 'ENTERPRISE') return navigateTo(authStore.enterpriseApproved ? '/enterprise' : '/student')
    if (role === 'STUDENT') return navigateTo('/student')
  }

  // 3. Phân quyền theo Role
  if (to.path.startsWith('/admin') && role !== 'ADMIN') {
    return navigateTo('/403')
  }

  if (to.path.startsWith('/student') && !authStore.canAccessStudentArea) {
    return navigateTo('/403')
  }

  if (to.path.startsWith('/enterprise') && role === 'ENTERPRISE' && !authStore.enterpriseApproved) {
    return navigateTo('/student')
  }

  if (to.path.startsWith('/enterprise') && role !== 'ENTERPRISE') {
    return navigateTo('/403')
  }
})
