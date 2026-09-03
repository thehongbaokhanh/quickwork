package services

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"
)

type fakeAuthRedisRepository struct {
	mu         sync.Mutex
	counts     map[string]int64
	err        error
	clearCalls int
}

func (f *fakeAuthRedisRepository) AddToBlacklist(context.Context, string, time.Duration) error {
	return nil
}

func (f *fakeAuthRedisRepository) IsBlacklisted(context.Context, string) (bool, error) {
	return false, nil
}

func (f *fakeAuthRedisRepository) LoginAttemptCount(_ context.Context, email string) (int64, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.err != nil {
		return 0, f.err
	}
	return f.counts[email], nil
}

func (f *fakeAuthRedisRepository) IncrementLoginAttempt(_ context.Context, email string, _ time.Duration) (int64, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.err != nil {
		return 0, f.err
	}
	f.counts[email]++
	return f.counts[email], nil
}

func (f *fakeAuthRedisRepository) ClearLoginAttempts(_ context.Context, email string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.err != nil {
		return f.err
	}
	delete(f.counts, email)
	f.clearCalls++
	return nil
}

func TestDistributedLoginLimiterSharesCounterAcrossServices(t *testing.T) {
	store := &fakeAuthRedisRepository{counts: map[string]int64{}}
	first := &authService{authRedisRepo: store, loginLimiter: newLoginAttemptLimiter()}
	second := &authService{authRedisRepo: store, loginLimiter: newLoginAttemptLimiter()}
	ctx := context.Background()
	email := "shared@example.com"

	if first.recordLoginFailure(ctx, email, 3) {
		t.Fatal("first failure locked account")
	}
	if second.recordLoginFailure(ctx, email, 3) {
		t.Fatal("second failure locked account")
	}
	if !first.recordLoginFailure(ctx, email, 3) {
		t.Fatal("third distributed failure did not lock account")
	}
	blocked, tracked := second.loginAttemptBlocked(ctx, email, 3)
	if !blocked || !tracked {
		t.Fatalf("shared counter = blocked %v, tracked %v; want true, true", blocked, tracked)
	}

	second.clearLoginFailures(ctx, email, tracked)
	blocked, _ = first.loginAttemptBlocked(ctx, email, 3)
	if blocked || store.clearCalls != 1 {
		t.Fatalf("successful reset = blocked %v, clear calls %d", blocked, store.clearCalls)
	}
}

func TestDistributedLoginLimiterFallsBackLocallyWhenRedisFails(t *testing.T) {
	store := &fakeAuthRedisRepository{counts: map[string]int64{}, err: errors.New("redis down")}
	service := &authService{authRedisRepo: store, loginLimiter: newLoginAttemptLimiter()}
	ctx := context.Background()

	blocked, tracked := service.loginAttemptBlocked(ctx, "fallback@example.com", 2)
	if blocked || tracked {
		t.Fatalf("initial fallback check = blocked %v, tracked %v", blocked, tracked)
	}
	if service.recordLoginFailure(ctx, "fallback@example.com", 2) {
		t.Fatal("first local failure locked account")
	}
	if !service.recordLoginFailure(ctx, "fallback@example.com", 2) {
		t.Fatal("second local failure did not lock account")
	}
}

func TestFailClosedAuthSettingsDisablesRegistrationButKeepsLoginDefaults(t *testing.T) {
	settings := failClosedAuthSettings()
	if settings.Registration.Student || settings.Registration.Enterprise {
		t.Fatalf("registration reopened in fail-closed settings: %+v", settings.Registration)
	}
	if !settings.Security.StrongPassword || settings.Security.SessionMinutes <= 0 || settings.Security.LoginAttempts <= 0 {
		t.Fatalf("login/security defaults are unusable: %+v", settings.Security)
	}
}
