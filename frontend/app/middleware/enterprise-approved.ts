import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }

  if (authStore.userRole !== 'ENTERPRISE') {
    return navigateTo('/403')
  }

  if (!authStore.canAccessEnterpriseFeatures) {
    return navigateTo({
      path: '/enterprise',
      query: {
        kyb: authStore.enterpriseKybStatus === 'REJECTED' ? 'rejected' : 'pending'
      }
    })
  }
})
