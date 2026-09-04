package repositories

import (
	"strings"
	"testing"
)

func TestLoginAttemptKeyNormalizesAndDoesNotExposeEmail(t *testing.T) {
	email := " Admin.User+test@Example.COM "
	first := loginAttemptKey(email)
	second := loginAttemptKey("admin.user+test@example.com")

	if first != second {
		t.Fatalf("normalized keys differ: %q != %q", first, second)
	}
	if strings.Contains(strings.ToLower(first), "admin.user") ||
		strings.Contains(strings.ToLower(first), "example.com") {
		t.Fatalf("key exposes email PII: %q", first)
	}
	if !strings.HasPrefix(first, "quickwork:auth:login-attempt:") {
		t.Fatalf("unexpected key prefix: %q", first)
	}
}
