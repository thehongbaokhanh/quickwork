// Package config parses environment variables to configure the backend application.
// It loads settings from a local .env file or system environment, converting values
// to their corresponding Go types.
package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config aggregates all runtime configuration configurations for the QuickWork backend.
type Config struct {
	AppName               string
	AppPort               string
	AppEnv                string
	AdminSecret           string
	DBHost                string
	DBPort                string
	DBName                string
	DBUser                string
	DBPassword            string
	RedisHost             string
	RedisPort             string
	RedisPassword         string
	JWTSecret             string
	JWTExpiryHours        int
	JWTRefreshExpiryHours int
	UploadDir             string
}

// LoadConfig loads the environment variables into the Config struct.
// It searches for a .env file and falls back to standard shell variables if none is found.
func LoadConfig() (*Config, error) {
	// Attempt to load .env file. We log but do not fail if not present (production environment fallback)
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found in runtime directory, relying on system environment variables")
	}

	jwtExpiry, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		jwtExpiry = 24
	}

	jwtRefreshExpiry, err := strconv.Atoi(getEnv("JWT_REFRESH_EXPIRY_HOURS", "720"))
	if err != nil {
		jwtRefreshExpiry = 720
	}

	cfg := &Config{
		AppName:               getEnv("APP_NAME", "QuickWork"),
		AppPort:               getEnv("APP_PORT", "8080"),
		AppEnv:                getEnv("APP_ENV", "development"),
		AdminSecret:           getEnv("ADMIN_SECRET", ""),
		DBHost:                getEnv("DB_HOST", "127.0.0.1"),
		DBPort:                getEnv("DB_PORT", "3306"),
		DBName:                getEnv("DB_NAME", "quickwork"),
		DBUser:                getEnv("DB_USER", "root"),
		DBPassword:            getEnv("DB_PASSWORD", "khanhanhan"),
		RedisHost:             getEnv("REDIS_HOST", "127.0.0.1"),
		RedisPort:             getEnv("REDIS_PORT", "6379"),
		RedisPassword:         getEnv("REDIS_PASSWORD", ""),
		JWTSecret:             getEnv("JWT_SECRET", "super_secret_jwt_key"),
		JWTExpiryHours:        jwtExpiry,
		JWTRefreshExpiryHours: jwtRefreshExpiry,
		UploadDir:             getEnv("UPLOAD_DIR", "storage"),
	}

	return cfg, nil
}

// getEnv retrieves the environment variable key or returns a fallback value.
func getEnv(key, fallback string) string {
	if val, exists := os.LookupEnv(key); exists {
		return val
	}
	return fallback
}
