package response

import "time"

// RegisterResponse trả ra thông tin cơ bản sau khi tạo tài khoản thành công mà không lộ mật khẩu.
type RegisterResponse struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}