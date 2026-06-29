package services

import (
	"context"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"time"
)

var ctx = context.Background()

type SessionService struct {
	Redis *redis.Client
}

func (s *SessionService) GenerateRefreshToken(userID uint) (string, error) {
	token := uuid.NewString()

	err := s.Redis.Set(ctx, token, userID, 7*24*time.Hour).Err()
	if err != nil {
		return "", err
	}

	return token, nil
}