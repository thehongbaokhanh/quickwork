package request

type RegisterAdminRequest struct {

    FullName string `json:"fullName"`

    Email string `json:"email"`

    Password string `json:"password"`

}