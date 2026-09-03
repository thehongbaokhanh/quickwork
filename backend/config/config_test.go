package config

import (
	"net/url"
	"testing"
)

func TestValidateProduction(t *testing.T) {
	cfg := &Config{
		AppEnv:                    "production",
		AdminSecret:               "0123456789abcdef0123456789abcdef",
		AdminIPAllowlist:          "203.0.113.10/32",
		DBPassword:                "0123456789abcdef",
		DatabaseSeedEnabled:       false,
		RedisPassword:             "abcdef0123456789",
		JWTSecret:                 "0123456789abcdef0123456789abcdef",
		AuthCookieSecure:          true,
		AuthExposeTokens:          false,
		CORSAllowedOrigins:        "https://jobs.quickwork.vn",
		CloudinaryURL:             "cloudinary://1234567890:0123456789abcdef@quickwork-production",
		UploadMalwareScanRequired: true,
		ClamAVAddress:             "clamav:3310",
	}
	if err := cfg.ValidateProduction(); err != nil {
		t.Fatalf("expected safe production config, got %v", err)
	}

	cfg.CloudinaryURL = ""
	if err := cfg.ValidateProduction(); err == nil {
		t.Fatal("expected missing Cloudinary credentials to fail closed")
	}
}

func TestValidateDevelopmentAllowsOptionalProviders(t *testing.T) {
	if err := (&Config{AppEnv: "development"}).ValidateProduction(); err != nil {
		t.Fatalf("development config should not require production providers: %v", err)
	}
}

func TestLoadConfigUsesRenderPortAndManagedServiceURLs(t *testing.T) {
	t.Setenv("APP_PORT", "")
	t.Setenv("PORT", "10000")
	t.Setenv("REDIS_URL", "rediss://default:abcdef0123456789@cache.internal:6379")
	t.Setenv("REDIS_PASSWORD", "")
	t.Setenv("RABBITMQ_URL", "")
	t.Setenv("RABBITMQ_HOST", "rabbit.internal")
	t.Setenv("RABBITMQ_PORT", "5672")
	t.Setenv("RABBITMQ_USERNAME", "quickwork")
	t.Setenv("RABBITMQ_PASSWORD", "rabbit-secret-1234")
	t.Setenv("CORS_ALLOWED_ORIGINS", "quickwork-web.onrender.com")

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("load config: %v", err)
	}
	if cfg.AppPort != "10000" {
		t.Fatalf("expected Render PORT, got %q", cfg.AppPort)
	}
	if cfg.RedisPassword != "abcdef0123456789" {
		t.Fatalf("expected password derived from REDIS_URL, got %q", cfg.RedisPassword)
	}
	if cfg.CORSAllowedOrigins != "https://quickwork-web.onrender.com" {
		t.Fatalf("expected HTTPS-normalized CORS origin, got %q", cfg.CORSAllowedOrigins)
	}
	rabbitURL, err := url.Parse(cfg.RabbitMQURL)
	if err != nil {
		t.Fatalf("parse RabbitMQ URL: %v", err)
	}
	if rabbitURL.Host != "rabbit.internal:5672" || rabbitURL.User.Username() != "quickwork" {
		t.Fatalf("unexpected RabbitMQ URL %q", cfg.RabbitMQURL)
	}
	password, _ := rabbitURL.User.Password()
	if password != "rabbit-secret-1234" {
		t.Fatalf("unexpected RabbitMQ password %q", password)
	}
}

func TestValidateProductionAcceptsManagedRedisURLAndRejectsWeakRabbitMQ(t *testing.T) {
	cfg := &Config{
		AppEnv:                    "production",
		AdminSecret:               "0123456789abcdef0123456789abcdef",
		AdminIPAllowlist:          "203.0.113.10/32",
		DBPassword:                "0123456789abcdef",
		DatabaseSeedEnabled:       false,
		RedisURL:                  "rediss://default:abcdef0123456789@cache.internal:6379",
		JWTSecret:                 "0123456789abcdef0123456789abcdef",
		AuthCookieSecure:          true,
		AuthExposeTokens:          false,
		CORSAllowedOrigins:        "https://quickwork-web.onrender.com",
		CloudinaryURL:             "cloudinary://1234567890:0123456789abcdef@quickwork-production",
		UploadMalwareScanRequired: true,
		ClamAVAddress:             "clamav:3310",
		MessageQueueEnabled:       true,
		RabbitMQURL:               "amqp://quickwork:rabbit-secret-1234@rabbit.internal:5672/",
	}
	if err := cfg.ValidateProduction(); err != nil {
		t.Fatalf("expected managed service URLs to pass, got %v", err)
	}

	cfg.RabbitMQURL = "amqp://quickwork:weak@rabbit.internal:5672/"
	if err := cfg.ValidateProduction(); err == nil {
		t.Fatal("expected weak RabbitMQ password to fail closed")
	}
}
