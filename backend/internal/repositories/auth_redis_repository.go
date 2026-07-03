package repositories

import (
	"context"
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
}

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

func NewAuthRedisRepository(
	redisClient *redis.Client,
) AuthRedisRepository {

	return &authRedisRepo{
		redisClient: redisClient,
	}
}
