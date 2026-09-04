package response

type LoginResponse struct {
	AccessToken string `json:"access_token,omitempty"`

	RefreshToken string `json:"refresh_token,omitempty"`

	UserID uint `json:"user_id"`

	Email string `json:"email"`

	Name string `json:"name,omitempty"`

	Avatar string `json:"avatar,omitempty"`

	Role string `json:"role"`

	EnterpriseKYBStatus string `json:"enterprise_kyb_status,omitempty"`

	EnterpriseApproved bool `json:"enterprise_approved"`

	EnterpriseRequireKYB bool `json:"enterprise_require_kyb"`

	BusinessLicenseURL string `json:"business_license_url,omitempty"`

	EnterpriseKYBRejectReason string `json:"enterprise_kyb_reject_reason,omitempty"`
}
