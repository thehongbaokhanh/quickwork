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
        tokenUUID string,
        expiration time.Duration,
    ) error

    IsBlacklisted(
        ctx context.Context,
        tokenUUID string,
    ) (bool,error)
}

func (r *authRedisRepo) AddToBlacklist(
    ctx context.Context,
    tokenUUID string,
    expiration time.Duration,
) error {

    key := "blacklist:" + tokenUUID

    return r.redisClient.Set(
        ctx,
        key,
        true,
        expiration,
    ).Err()
}

func (r *authRedisRepo) IsBlacklisted(
    ctx context.Context,
    tokenUUID string,
) (bool,error){

    key := "blacklist:" + tokenUUID

    exists, err := r.redisClient.Exists(ctx,key).Result()

    if err != nil{
        return false,err
    }

    return exists == 1,nil
}

func NewAuthRedisRepository(
    redisClient *redis.Client,
) AuthRedisRepository {

    return &authRedisRepo{
        redisClient: redisClient,
    }
}