import axios from 'axios'

// Khởi tạo một cấu hình Axios Instance chuyên biệt cho hệ thống QuickWork
const apiClient = axios.create({
  timeout: 10000, // 10 giây nếu backend GoFiber không phản hồi sẽ tự hủy request
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request Interceptor: Tự động đính kèm JWT Token vào Header của mọi yêu cầu
apiClient.interceptors.request.use(
  (config) => {
    // Chỉ chạy ở phía Client (Trình duyệt) vì Pinia và localStorage nằm ở Client
    if (import.meta.client) {
      const token = localStorage.getItem('qw_access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Xử lý dữ liệu trả về tập trung và bắt lỗi bảo mật toàn cục
apiClient.interceptors.response.use(
  (response) => {
    // GoFiber thường bọc dữ liệu trong một data object, chúng ta bóc tách lấy data sạch
    return response.data
  },
  (error) => {
    const response = error.response

    // Xử lý lỗi 401 Unauthorized tập trung (Token không hợp lệ hoặc hết hạn)
    if (response && response.status === 401) {
      if (import.meta.client) {
        console.warn('Xác thực thất bại hoặc Token hết hạn. Hệ thống tự động điều hướng...')
        // Xóa sạch dấu vết Token cũ để tránh lặp lỗi vô hạn
        localStorage.removeItem('qw_access_token')
        localStorage.removeItem('qw_user_role')
        
        // Điều hướng người dùng quay lại trang đăng nhập một cách cưỡng bức
        window.location.href = '/login'
      }
    }

    // Đóng gói và chuẩn hóa định dạng thông báo lỗi trả về từ GoFiber để phía UI dễ hiển thị
    const errorMessage = response?.data?.message || 'Đã có lỗi hệ thống xảy ra, vui lòng thử lại.'
    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient