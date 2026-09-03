// Package jwt provides helpers for issuing and validating JSON Web Tokens.
package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var SecretKey []byte

func SetSecret(secret string) {
	SecretKey = []byte(secret)
}

// Claims maps identity parameters into the JWT payload structure.
type Claims struct {
	UserID    uint   `json:"user_id"`
	Role      string `json:"role"`
	TokenUUID string `json:"token_uuid"`
	TokenType string `json:"token_type"`
	jwt.RegisteredClaims
}

// GenerateToken issues a new JWT string signed using HS256 containing identity claims.
func GenerateRefreshToken(userID uint, role string) (string, error) {

	claims := Claims{

		UserID:    userID,
		Role:      role,
		TokenUUID: uuid.NewString(),
		TokenType: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{

			ExpiresAt: jwt.NewNumericDate(
				time.Now().Add(30 * 24 * time.Hour),
			),

			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(SecretKey)

}

func GenerateAccessToken(userID uint, role string) (string, error) {

	claims := Claims{
		UserID:    userID,
		Role:      role,
		TokenUUID: uuid.NewString(),
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{

			ExpiresAt: jwt.NewNumericDate(
				time.Now().Add(24 * time.Hour),
			),

			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(SecretKey)
}

func VerifyToken(tokenString string) (*Claims, error) {

	token, err := jwt.ParseWithClaims(
		tokenString,
		&Claims{},
		func(t *jwt.Token) (interface{}, error) {

			if t.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}

			return SecretKey, nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)

	if !ok || !token.Valid || claims.TokenType != "access" {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func DecodeToken(tokenString string) (*Claims, error) {

	token, err := jwt.NewParser(jwt.WithoutClaimsValidation(), jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()})).ParseWithClaims(
		tokenString,
		&Claims{},
		func(t *jwt.Token) (interface{}, error) {

			if t.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}

			return SecretKey, nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)

	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
