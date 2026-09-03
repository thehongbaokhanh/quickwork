package services

import (
	"strings"
	"sync"
	"time"
)

const (
	loginAttemptLockDuration  = 15 * time.Minute
	loginAttemptSweepInterval = time.Minute
	maxTrackedLoginAttempts   = 10_000
)

type loginAttemptState struct {
	failures    int
	lockedUntil time.Time
	expiresAt   time.Time
}

// loginAttemptLimiter is the bounded process-local fallback used only while
// the shared Redis counter is unavailable.
type loginAttemptLimiter struct {
	mu        sync.Mutex
	attempts  map[string]loginAttemptState
	now       func() time.Time
	lastSweep time.Time
}

func newLoginAttemptLimiter() *loginAttemptLimiter {
	return &loginAttemptLimiter{
		attempts: make(map[string]loginAttemptState),
		now:      time.Now,
	}
}

func (l *loginAttemptLimiter) blocked(email string, maximum int) bool {
	if l == nil || maximum < 1 {
		return false
	}

	key := strings.ToLower(strings.TrimSpace(email))
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.currentTime()
	l.pruneLocked(now)
	state, ok := l.attempts[key]
	if !ok {
		return false
	}
	if !state.expiresAt.IsZero() && !now.Before(state.expiresAt) {
		delete(l.attempts, key)
		return false
	}
	if !state.lockedUntil.IsZero() && now.Before(state.lockedUntil) {
		return true
	}
	if !state.lockedUntil.IsZero() {
		delete(l.attempts, key)
		return false
	}
	if state.failures >= maximum {
		state.lockedUntil = now.Add(loginAttemptLockDuration)
		state.expiresAt = state.lockedUntil
		l.attempts[key] = state
		return true
	}
	return false
}

func (l *loginAttemptLimiter) fail(email string, maximum int) bool {
	if l == nil || maximum < 1 {
		return false
	}

	key := strings.ToLower(strings.TrimSpace(email))
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.currentTime()
	l.pruneLocked(now)
	state, tracked := l.attempts[key]
	if !state.expiresAt.IsZero() && !now.Before(state.expiresAt) {
		state = loginAttemptState{}
	}
	if !state.lockedUntil.IsZero() && now.Before(state.lockedUntil) {
		return true
	}
	if !state.lockedUntil.IsZero() {
		state = loginAttemptState{}
	}
	state.failures++
	state.expiresAt = now.Add(loginAttemptLockDuration)
	if state.failures >= maximum {
		state.lockedUntil = state.expiresAt
	}
	if !tracked && len(l.attempts) >= maxTrackedLoginAttempts {
		// Preserve existing (especially active locked) entries and fail closed for
		// an untracked invalid credential while the bounded map is saturated.
		return true
	}
	if l.attempts == nil {
		l.attempts = make(map[string]loginAttemptState)
	}
	l.attempts[key] = state
	return !state.lockedUntil.IsZero()
}

func (l *loginAttemptLimiter) reset(email string) {
	if l == nil {
		return
	}

	key := strings.ToLower(strings.TrimSpace(email))
	l.mu.Lock()
	delete(l.attempts, key)
	l.mu.Unlock()
}

func (l *loginAttemptLimiter) pruneLocked(now time.Time) {
	if !l.lastSweep.IsZero() &&
		now.Sub(l.lastSweep) < loginAttemptSweepInterval {
		return
	}

	for key, state := range l.attempts {
		if !state.expiresAt.IsZero() && !now.Before(state.expiresAt) {
			delete(l.attempts, key)
		}
	}
	l.lastSweep = now
}

func (l *loginAttemptLimiter) currentTime() time.Time {
	if l.now != nil {
		return l.now()
	}
	return time.Now()
}
