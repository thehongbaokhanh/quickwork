package request

// RegisterStudentRequest định nghĩa cấu trúc dữ liệu đầu vào khi Sinh viên đăng ký tài khoản.
type RegisterStudentRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name" validate:"required,min=2"`
	Phone    string `json:"phone" validate:"required,numeric,min=10,max=11"`
}