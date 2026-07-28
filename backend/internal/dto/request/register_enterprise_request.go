package request

// RegisterEnterpriseRequest định nghĩa cấu trúc dữ liệu đầu vào khi Doanh nghiệp đăng ký tài khoản.
type RegisterEnterpriseRequest struct {
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,min=6"`
	CompanyName string `json:"company_name" validate:"required,min=3"`
	Phone       string `json:"phone" validate:"required,numeric,min=10,max=11"`
	TaxCode     string `json:"tax_code" validate:"required,numeric,min=10,max=13"`
	GPKDURL     string `json:"gpkd_url" validate:"required"`
}
