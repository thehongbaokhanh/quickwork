import { useToast } from '~/composables/useToast'

export function useStudentLoginPrompt() {
  const toast = useToast()

  function notifyStudentLoginRequired(message = 'Vui lòng đăng nhập bằng tài khoản sinh viên để tiếp tục.') {
    toast.warning('Bạn cần đăng nhập', message)
  }

  return {
    notifyStudentLoginRequired
  }
}
