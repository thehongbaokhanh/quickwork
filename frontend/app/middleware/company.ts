import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (authStore.userRole !== 'COMPANY') {
    return navigateTo('/403')
  }
})