// Package password handles cryptography operations for user password hashing and verification.
package password

import (
	"golang.org/x/crypto/bcrypt"
)

// Hash mã hóa mật khẩu bằng bcrypt
func Hash(password string) (string, error) {

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

// Compare so sánh mật khẩu nhập vào với mật khẩu đã mã hóa
func Compare(hashedPassword, plainPassword string) error {
	return bcrypt.CompareHashAndPassword(
		[]byte(hashedPassword),
		[]byte(plainPassword),
	)
}

// Verify trả về true/false
func Verify(hashedPassword, password string) bool {
	return bcrypt.CompareHashAndPassword(
		[]byte(hashedPassword),
		[]byte(password),
	) == nil
}