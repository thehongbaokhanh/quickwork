package response

type LoginResponse struct {

	AccessToken string `json:"access_token"`

	RefreshToken string `json:"refresh_token"`

	UserID uint `json:"user_id"`

	Email string `json:"email"`

	Role string `json:"role"`
}