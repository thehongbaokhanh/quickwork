package redis

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"

	"quickwork.local/backend/config"
)

var (
	Client *redis.Client
	Ctx    = context.Background()
)

func Init(cfg *config.Config) error {
	options := &redis.Options{
		Addr:     cfg.RedisHost + ":" + cfg.RedisPort,
		Password: cfg.RedisPassword,
		DB:       0,
	}
	if strings.TrimSpace(cfg.RedisURL) != "" {
		parsed, err := redis.ParseURL(cfg.RedisURL)
		if err != nil {
			return fmt.Errorf("parse Redis URL: %w", err)
		}
		options = parsed
	}

	Client = redis.NewClient(options)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Client.Ping(ctx).Result()
	if err != nil {
		return err
	}

	log.Println("✅ Redis Connected")

	return nil
}
