package jwt

import (
	"testing"
	"time"
)

func TestGenerateAccessTokenWithDuration(t *testing.T) {
	SetSecret("settings-test-secret")
	before := time.Now()
	token, err := GenerateAccessTokenWithDuration(42, "ADMIN", 30*time.Minute)
	if err != nil {
		t.Fatalf("generate access token: %v", err)
	}

	claims, err := VerifyToken(token)
	if err != nil {
		t.Fatalf("verify access token: %v", err)
	}
	if claims.UserID != 42 || claims.Role != "ADMIN" {
		t.Fatalf("unexpected identity claims: %+v", claims)
	}
	if claims.ExpiresAt == nil {
		t.Fatal("expiration is required")
	}
	expiresIn := claims.ExpiresAt.Time.Sub(before)
	if expiresIn < 29*time.Minute || expiresIn > 31*time.Minute {
		t.Fatalf("unexpected expiration duration: %s", expiresIn)
	}
}

func TestGenerateAccessTokenWithDurationRejectsNonPositiveDuration(t *testing.T) {
	if _, err := GenerateAccessTokenWithDuration(1, "ADMIN", 0); err == nil {
		t.Fatal("expected invalid duration error")
	}
}
