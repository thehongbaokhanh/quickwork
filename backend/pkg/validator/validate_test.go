package validator

import "testing"

type UserDTO struct {
	Email string `validate:"required,email"`
	Name  string `validate:"required"`
}

func TestValidateStruct(t *testing.T) {

	user := UserDTO{
		Email: "abc@gmail.com",
		Name:  "Bao Khanh",
	}

	errs := ValidateStruct(user)

	if errs != nil {
		t.Error("Should not have validation errors")
	}
}

func TestValidateStructFail(t *testing.T) {

	user := UserDTO{}

	errs := ValidateStruct(user)

	if errs == nil {
		t.Error("Should return validation errors")
	}

	if len(errs) != 2 {
		t.Error("Should have 2 errors")
	}
}