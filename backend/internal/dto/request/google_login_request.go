package request

type GoogleLoginRequest struct {
	Code string `json:"code" validate:"required"`
}
