package services

import (
	"strconv"
	"testing"
	"time"
)

func TestLoginAttemptLimiterLocksAndExpires(t *testing.T) {
	now := time.Date(2026, 8, 22, 1, 0, 0, 0, time.UTC)
	limiter := newLoginAttemptLimiter()
	limiter.now = func() time.Time { return now }

	if limiter.blocked("admin@example.com", 2) {
		t.Fatal("fresh email must not be blocked")
	}
	if limiter.fail("Admin@Example.com ", 2) {
		t.Fatal("first failed attempt must not lock")
	}
	if !limiter.fail("admin@example.com", 2) {
		t.Fatal("second failed attempt must lock")
	}
	if !limiter.blocked("ADMIN@example.com", 2) {
		t.Fatal("email keys must be normalized")
	}

	now = now.Add(loginAttemptLockDuration + time.Second)
	if limiter.blocked("admin@example.com", 2) {
		t.Fatal("lock must expire after the configured window")
	}
}

func TestLoginAttemptLimiterReset(t *testing.T) {
	limiter := newLoginAttemptLimiter()
	limiter.fail("admin@example.com", 1)
	limiter.reset("admin@example.com")
	if limiter.blocked("admin@example.com", 1) {
		t.Fatal("successful login must reset failed attempts")
	}
}

func TestLoginAttemptLimiterExpiresPartialFailuresAndBoundsMemory(t *testing.T) {
	now := time.Date(2026, 8, 22, 1, 0, 0, 0, time.UTC)
	limiter := newLoginAttemptLimiter()
	limiter.now = func() time.Time { return now }
	limiter.fail("partial@example.com", 5)

	now = now.Add(loginAttemptLockDuration + time.Second)
	if limiter.fail("partial@example.com", 5) {
		t.Fatal("expired partial failure must restart from the first attempt")
	}
	if got := limiter.attempts["partial@example.com"].failures; got != 1 {
		t.Fatalf("expected one fresh failure, got %d", got)
	}

	for index := 0; index < maxTrackedLoginAttempts+100; index++ {
		limiter.fail("user"+strconv.Itoa(index)+"@example.com", 20)
	}
	if got := len(limiter.attempts); got > maxTrackedLoginAttempts {
		t.Fatalf("attempt map exceeded cap: %d", got)
	}
}

func TestLoginAttemptLimiterCapacityPreservesActiveLocks(t *testing.T) {
	limiter := newLoginAttemptLimiter()
	limiter.fail("locked@example.com", 1)
	for index := 0; index < maxTrackedLoginAttempts-1; index++ {
		limiter.fail("capacity"+strconv.Itoa(index)+"@example.com", 20)
	}

	if !limiter.fail("overflow@example.com", 20) {
		t.Fatal("saturated limiter must fail closed for a new invalid credential")
	}
	if !limiter.blocked("locked@example.com", 1) {
		t.Fatal("capacity handling must preserve an existing active lock")
	}
	if got := len(limiter.attempts); got != maxTrackedLoginAttempts {
		t.Fatalf("expected bounded map size %d, got %d", maxTrackedLoginAttempts, got)
	}
}

func TestZeroValueLoginAttemptLimiterIsSafe(t *testing.T) {
	var limiter loginAttemptLimiter
	if limiter.fail("admin@example.com", 2) {
		t.Fatal("first failure on zero-value limiter must not lock")
	}
	if limiter.blocked("admin@example.com", 2) {
		t.Fatal("one failure must remain below the limit")
	}
}
