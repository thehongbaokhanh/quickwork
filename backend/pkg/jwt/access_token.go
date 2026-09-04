package jwt

import (
	"errors"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// GenerateAccessTokenWithDuration issues an access token using the shared
// admin-configured session duration. The existing helper remains available
// for callers that intentionally use its legacy 24-hour default.
func GenerateAccessTokenWithDuration(userID uint, role string, duration time.Duration) (string, error) {
	if duration <= 0 {
		return "", errors.New("access token duration must be greater than zero")
	}

	now := time.Now()
	claims := Claims{
		UserID:    userID,
		Role:      role,
		TokenUUID: uuid.NewString(),
		TokenType: "access",
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(now.Add(duration)),
			IssuedAt:  jwtlib.NewNumericDate(now),
		},
	}

	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	return token.SignedString(SecretKey)
}
