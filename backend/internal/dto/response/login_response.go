package response

type LoginResponse struct {
	AccessToken string `json:"access_token"`

	RefreshToken string `json:"refresh_token"`

	UserID uint `json:"user_id"`

	Email string `json:"email"`

	Role string `json:"role"`

	EnterpriseKYBStatus string `json:"enterprise_kyb_status,omitempty"`

	EnterpriseApproved bool `json:"enterprise_approved"`

	BusinessLicenseURL string `json:"business_license_url,omitempty"`
}
