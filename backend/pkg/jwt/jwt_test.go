package jwt

import "testing"

func TestGenerateAndVerifyToken(t *testing.T) {

	secret := "my-secret"

	token, err := GenerateToken(
		1,
		"abc@gmail.com",
		"student",
		secret,
		1,
	)

	if err != nil {
		t.Fatal(err)
	}

	claims, err := VerifyToken(token, secret)

	if err != nil {
		t.Fatal(err)
	}

	if claims.UserID != 1 {
		t.Error("Wrong user id")
	}

	if claims.Email != "abc@gmail.com" {
		t.Error("Wrong email")
	}

	if claims.Role != "student" {
		t.Error("Wrong role")
	}

}

func TestVerifyWrongSecret(t *testing.T) {

	token, _ := GenerateToken(
		1,
		"abc@gmail.com",
		"student",
		"secret1",
		1,
	)

	_, err := VerifyToken(token, "secret2")

	if err == nil {
		t.Error("Should return error")
	}
}