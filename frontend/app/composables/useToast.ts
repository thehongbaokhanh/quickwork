export interface ToastMessage {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  groupKey?: string
  count?: number
}

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>()
const MAX_VISIBLE_TOASTS = 1
const DEFAULT_TOAST_DURATION = 2400

export type ToastOptions = Pick<ToastMessage, 'duration' | 'groupKey'>

export const useToast = () => {
  const toasts = useState<ToastMessage[]>('quickwork-toast-queue', () => [])

  const removeToast = (id: string) => {
    const timer = toastTimers.get(id)
    if (timer) clearTimeout(timer)
    toastTimers.delete(id)

    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const scheduleRemoval = (toast: ToastMessage) => {
    const timer = toastTimers.get(toast.id)
    if (timer) clearTimeout(timer)
    toastTimers.delete(toast.id)

    if (Number(toast.duration) > 0) {
      toastTimers.set(toast.id, setTimeout(() => removeToast(toast.id), Number(toast.duration)))
    }
  }

  const addToast = (toast: Omit<ToastMessage, 'id' | 'count'>) => {
    const groupKey = String(toast.groupKey || '').trim()
    const existing = groupKey ? toasts.value.find(item => item.groupKey === groupKey) : undefined
    const duration = toast.duration ?? DEFAULT_TOAST_DURATION

    if (existing) {
      existing.title = toast.title
      existing.message = toast.message
      existing.type = toast.type
      existing.duration = duration
      existing.count = (existing.count || 1) + 1
      scheduleRemoval(existing)
      return existing.id
    }

    while (toasts.value.length >= MAX_VISIBLE_TOASTS) {
      const oldest = toasts.value[0]
      if (!oldest) break
      removeToast(oldest.id)
    }

    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = { ...toast, groupKey: groupKey || undefined, id, duration, count: 1 }

    toasts.value.push(newToast)
    scheduleRemoval(newToast)
    return id
  }

  const success = (title: string, message?: string, options: ToastOptions = {}) => addToast({ title, message, type: 'success', ...options })
  const error = (title: string, message?: string, options: ToastOptions = {}) => addToast({ title, message, type: 'error', ...options })
  const info = (title: string, message?: string, options: ToastOptions = {}) => addToast({ title, message, type: 'info', ...options })
  const warning = (title: string, message?: string, options: ToastOptions = {}) => addToast({ title, message, type: 'warning', ...options })

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
