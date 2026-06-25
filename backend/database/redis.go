// Package database handles connection setups, lifecycle management,
// migrations, and database seeding for GORM MySQL and Redis.
package database

import (
	"context"
	"fmt"
	"time"

	"quickwork.local/backend/config"
	"quickwork.local/backend/pkg/logger"

	"github.com/redis/go-redis/v9"
)

// InitRedis connects to Redis, pings the server, and returns the client instance.
func InitRedis(cfg *config.Config) (*redis.Client, error) {
	addr := fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort)

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: cfg.RedisPassword,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := rdb.Ping(ctx).Result(); err != nil {
		return nil, fmt.Errorf("redis ping failed: %w", err)
	}

	logger.Info("✅ Redis Connected")
	return rdb, nil
}
