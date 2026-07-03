import apiClient from '~/services/api'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: apiClient,
    },
  }
})
