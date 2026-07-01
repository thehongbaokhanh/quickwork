import { ref } from 'vue'

export interface ToastMessage {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<ToastMessage[]>([])

export const useToast = () => {
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id, duration: toast.duration || 3000 }
    
    toasts.value.push(newToast)

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, message?: string) => addToast({ title, message, type: 'success' })
  const error = (title: string, message?: string) => addToast({ title, message, type: 'error' })
  const info = (title: string, message?: string) => addToast({ title, message, type: 'info' })
  const warning = (title: string, message?: string) => addToast({ title, message, type: 'warning' })

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
