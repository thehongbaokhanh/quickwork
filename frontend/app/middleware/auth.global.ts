import { useAuthStore } from '~/stores/auth'
import { getDefaultRouteForRole } from '~/utils/authRedirect'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Các trang không yêu cầu đăng nhập
  const publicPages = ['/auth/login', '/auth/register', '/login', '/register', '/', '/student', '/blog', '/forgot-password', '/403', '/404', '/500']
  const isPublicJobDetail = /^\/jobs\/\d+$/.test(to.path)
  const isPublicPage = publicPages.includes(to.path) || isPublicJobDetail

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

  // Nếu truy cập lại trang đăng nhập / đăng ký thì điều hướng theo đúng vai trò.
  if (['/auth/login', '/auth/register', '/login', '/register'].includes(to.path)) {
    return navigateTo(getDefaultRouteForRole(role))
  }

  // 3. Phân quyền theo Role
  if (to.path.startsWith('/admin') && role !== 'ADMIN') {
    return navigateTo('/403')
  }

  if (to.path.startsWith('/student') && to.path !== '/student' && !authStore.canAccessStudentArea) {
    return navigateTo('/403')
  }

  if (to.path.startsWith('/enterprise') && role !== 'ENTERPRISE') {
    return navigateTo('/403')
  }

  const enterpriseProtectedPrefixes = ['/enterprise/jobs', '/enterprise/applications', '/enterprise/interviews']
  const isEnterpriseProtectedRoute = enterpriseProtectedPrefixes.some((prefix) => (
    to.path === prefix || to.path.startsWith(`${prefix}/`)
  ))

  if (
    to.path.startsWith('/enterprise')
    && role === 'ENTERPRISE'
    && !authStore.canAccessEnterpriseFeatures
    && isEnterpriseProtectedRoute
  ) {
    return navigateTo({
      path: '/enterprise',
      query: {
        kyb: authStore.enterpriseKybStatus === 'REJECTED' ? 'rejected' : 'pending'
      }
    })
  }
})
