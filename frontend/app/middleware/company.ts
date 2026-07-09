import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  if (authStore.userRole !== 'ENTERPRISE') {
    return navigateTo('/403')
  }

  if (!authStore.enterpriseApproved) {
    return navigateTo('/student')
  }
})
