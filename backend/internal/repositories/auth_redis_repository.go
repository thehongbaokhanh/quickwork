package repositories

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type authRedisRepo struct {
	redisClient *redis.Client
}

type AuthRedisRepository interface {
	AddToBlacklist(
		ctx context.Context,
		token string,
		expiration time.Duration,
	) error

	IsBlacklisted(
		ctx context.Context,
		token string,
	) (bool, error)

	LoginAttemptCount(ctx context.Context, email string) (int64, error)
	IncrementLoginAttempt(ctx context.Context, email string, expiration time.Duration) (int64, error)
	ClearLoginAttempts(ctx context.Context, email string) error
}

var incrementLoginAttemptScript = redis.NewScript(`
local count = redis.call("INCR", KEYS[1])
redis.call("PEXPIRE", KEYS[1], ARGV[1])
return count
`)

func (r *authRedisRepo) AddToBlacklist(
	ctx context.Context,
	token string,
	expiration time.Duration,
) error {

	key := "blacklist:" + token

	return r.redisClient.Set(
		ctx,
		key,
		true,
		expiration,
	).Err()
}

func (r *authRedisRepo) IsBlacklisted(
	ctx context.Context,
	token string,
) (bool, error) {

	key := "blacklist:" + token

	exists, err := r.redisClient.Exists(ctx, key).Result()

	if err != nil {
		return false, err
	}

	return exists == 1, nil
}

func (r *authRedisRepo) LoginAttemptCount(ctx context.Context, email string) (int64, error) {
	value, err := r.redisClient.Get(ctx, loginAttemptKey(email)).Int64()
	if err == redis.Nil {
		return 0, nil
	}
	return value, err
}

func (r *authRedisRepo) IncrementLoginAttempt(ctx context.Context, email string, expiration time.Duration) (int64, error) {
	value, err := incrementLoginAttemptScript.Run(
		ctx,
		r.redisClient,
		[]string{loginAttemptKey(email)},
		expiration.Milliseconds(),
	).Int64()
	return value, err
}

func (r *authRedisRepo) ClearLoginAttempts(ctx context.Context, email string) error {
	return r.redisClient.Del(ctx, loginAttemptKey(email)).Err()
}

func loginAttemptKey(email string) string {
	normalized := strings.ToLower(strings.TrimSpace(email))
	digest := sha256.Sum256([]byte(normalized))
	return "quickwork:auth:login-attempt:" + hex.EncodeToString(digest[:])
}

func NewAuthRedisRepository(
	redisClient *redis.Client,
) AuthRedisRepository {

	return &authRedisRepo{
		redisClient: redisClient,
	}
}
