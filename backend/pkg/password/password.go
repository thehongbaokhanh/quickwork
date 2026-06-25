// Package password handles cryptography operations for user password hashing and verification.
package password

import (
	"golang.org/x/crypto/bcrypt"
)

// Hash hashes a plaintext password using Bcrypt with standard cost.
func Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// Verify compares a plaintext password with its Bcrypt hash, returning true if they match.
func Verify(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
