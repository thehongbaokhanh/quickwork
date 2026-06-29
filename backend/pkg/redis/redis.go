package redis

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"

	"quickwork.local/backend/config"
)

var (
	Client *redis.Client
	Ctx = context.Background()
)


func Init(cfg *config.Config) {

	Client = redis.NewClient(&redis.Options{
		Addr:     cfg.RedisHost + ":" + cfg.RedisPort,
		Password: cfg.RedisPassword,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Client.Ping(ctx).Result()

	if err != nil {
		log.Fatal("Redis Error:", err)
	}

	log.Println("✅ Redis Connected")
}