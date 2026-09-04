// Package config parses environment variables to configure the backend application.
// It loads settings from a local .env file or system environment, converting values
// to their corresponding Go types.
package config

import (
	"fmt"
	"log"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config aggregates all runtime configuration configurations for the QuickWork backend.
type Config struct {
	AppName                   string
	AppPort                   string
	AppEnv                    string
	AdminSecret               string
	AdminIPAllowlist          string
	DBHost                    string
	DBPort                    string
	DBName                    string
	DBUser                    string
	DBPassword                string
	DBTLS                     string
	DatabaseSeedEnabled       bool
	RedisURL                  string
	RedisHost                 string
	RedisPort                 string
	RedisPassword             string
	JWTSecret                 string
	JWTExpiryHours            int
	JWTRefreshExpiryHours     int
	AuthCookieSecure          bool
	AuthExposeTokens          bool
	CORSAllowedOrigins        string
	UploadDir                 string
	CloudinaryURL             string
	UploadMalwareScanRequired bool
	ClamAVAddress             string
	GoogleClientID            string
	GoogleClientSecret        string
	GoogleRedirectURI         string
	OpenAIAPIKey              string
	OpenAIModel               string
	OpenAIBaseURL             string
	JobMatchCandidateLimit    int
	JobMatchCacheTTLMinutes   int
	JobMatchAITimeoutSeconds  int
	MessageQueueEnabled       bool
	RabbitMQURL               string
	RabbitMQExchange          string
	RabbitMQQueue             string
	RabbitMQRoutingKey        string
	RabbitMQPrefetch          int
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
	jobMatchCandidateLimit := getEnvInt("JOB_MATCH_CANDIDATE_LIMIT", 20)
	jobMatchCacheTTLMinutes := getEnvInt("JOB_MATCH_CACHE_TTL_MINUTES", 45)
	jobMatchAITimeoutSeconds := getEnvInt("JOB_MATCH_AI_TIMEOUT_SECONDS", 12)
	databaseSeedEnabled, seedErr := strconv.ParseBool(getEnv("DB_SEED_ENABLED", "true"))
	if seedErr != nil {
		databaseSeedEnabled = true
	}
	messageQueueEnabled, _ := strconv.ParseBool(getEnv("MQ_ENABLED", "false"))
	authCookieSecure, _ := strconv.ParseBool(getEnv("AUTH_COOKIE_SECURE", "false"))
	authExposeTokens, _ := strconv.ParseBool(getEnv("AUTH_EXPOSE_TOKENS", "true"))
	uploadMalwareScanRequired, _ := strconv.ParseBool(getEnv("UPLOAD_MALWARE_SCAN_REQUIRED", "false"))
	appPort := strings.TrimSpace(os.Getenv("APP_PORT"))
	if appPort == "" {
		appPort = getEnv("PORT", "8080")
	}
	redisURL := strings.TrimSpace(os.Getenv("REDIS_URL"))
	redisPassword := getEnv("REDIS_PASSWORD", "")
	if redisPassword == "" {
		redisPassword = passwordFromURL(redisURL)
	}

	cfg := &Config{
		AppName:                   getEnv("APP_NAME", "QuickWork"),
		AppPort:                   appPort,
		AppEnv:                    getEnv("APP_ENV", "development"),
		AdminSecret:               getEnv("ADMIN_SECRET", ""),
		AdminIPAllowlist:          getEnv("ADMIN_IP_ALLOWLIST", ""),
		DBHost:                    getEnv("DB_HOST", "127.0.0.1"),
		DBPort:                    getEnv("DB_PORT", "3306"),
		DBName:                    getEnv("DB_NAME", "quickwork"),
		DBUser:                    getEnv("DB_USER", "root"),
		DBPassword:                getEnv("DB_PASSWORD", "khanhanhan"),
		DBTLS:                     getEnv("DB_TLS", "false"),
		DatabaseSeedEnabled:       databaseSeedEnabled,
		RedisURL:                  redisURL,
		RedisHost:                 getEnv("REDIS_HOST", "127.0.0.1"),
		RedisPort:                 getEnv("REDIS_PORT", "6379"),
		RedisPassword:             redisPassword,
		JWTSecret:                 getEnv("JWT_SECRET", "super_secret_jwt_key"),
		JWTExpiryHours:            jwtExpiry,
		JWTRefreshExpiryHours:     jwtRefreshExpiry,
		AuthCookieSecure:          authCookieSecure,
		AuthExposeTokens:          authExposeTokens,
		CORSAllowedOrigins:        normalizeCORSAllowedOrigins(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")),
		UploadDir:                 getEnv("UPLOAD_DIR", "storage"),
		CloudinaryURL:             getEnv("CLOUDINARY_URL", ""),
		UploadMalwareScanRequired: uploadMalwareScanRequired,
		ClamAVAddress:             getEnv("CLAMAV_ADDRESS", ""),
		GoogleClientID:            getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:        getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURI:         getEnv("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/google/callback"),
		OpenAIAPIKey:              getEnv("OPENAI_API_KEY", ""),
		OpenAIModel:               getEnv("OPENAI_MODEL", "gpt-4o-mini"),
		OpenAIBaseURL:             getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
		JobMatchCandidateLimit:    jobMatchCandidateLimit,
		JobMatchCacheTTLMinutes:   jobMatchCacheTTLMinutes,
		JobMatchAITimeoutSeconds:  jobMatchAITimeoutSeconds,
		MessageQueueEnabled:       messageQueueEnabled,
		RabbitMQURL:               resolveRabbitMQURL(),
		RabbitMQExchange:          getEnv("RABBITMQ_EXCHANGE", "quickwork.events"),
		RabbitMQQueue:             getEnv("RABBITMQ_QUEUE", "quickwork.notifications"),
		RabbitMQRoutingKey:        getEnv("RABBITMQ_ROUTING_KEY", "notification.create"),
		RabbitMQPrefetch:          getEnvInt("RABBITMQ_PREFETCH", 20),
	}

	return cfg, nil
}

// ValidateProduction rejects unsafe or incomplete production-like settings
// before any network listener is opened. The demo environment keeps all
// authentication and transport safeguards, but explicitly permits the two
// infrastructure trade-offs documented for the free Render tier: an
// unauthenticated private Key Value URL and uploads without ClamAV.
func (c *Config) ValidateProduction() error {
	if c == nil {
		return nil
	}
	environment := strings.ToLower(strings.TrimSpace(c.AppEnv))
	if environment != "production" && environment != "demo" {
		return nil
	}
	isDemo := environment == "demo"

	var problems []string
	requireSecret := func(name string, value string, minimum int) {
		trimmed := strings.TrimSpace(value)
		if len(trimmed) < minimum || containsPlaceholder(trimmed) {
			problems = append(problems, name+" must be a non-placeholder secret of at least "+strconv.Itoa(minimum)+" characters")
		}
	}

	requireSecret("ADMIN_SECRET", c.AdminSecret, 32)
	requireSecret("JWT_SECRET", c.JWTSecret, 32)
	requireSecret("DB_PASSWORD", c.DBPassword, 16)
	redisPassword := c.RedisPassword
	if strings.TrimSpace(c.RedisURL) != "" {
		redisURL, err := url.Parse(strings.TrimSpace(c.RedisURL))
		if err != nil || (redisURL.Scheme != "redis" && redisURL.Scheme != "rediss") || redisURL.Host == "" {
			problems = append(problems, "REDIS_URL must use redis:// or rediss:// with a valid host")
		} else if redisPassword == "" {
			redisPassword = passwordFromURL(c.RedisURL)
		}
	}
	if !isDemo {
		requireSecret("REDIS_PASSWORD", redisPassword, 16)
	}

	if c.MessageQueueEnabled {
		rabbitURL, err := url.Parse(strings.TrimSpace(c.RabbitMQURL))
		if err != nil || (rabbitURL.Scheme != "amqp" && rabbitURL.Scheme != "amqps") || rabbitURL.Host == "" || rabbitURL.User == nil {
			problems = append(problems, "RABBITMQ_URL must use amqp:// or amqps:// with credentials and a valid host")
		} else if password, ok := rabbitURL.User.Password(); !ok {
			problems = append(problems, "RABBITMQ_URL must include a password")
		} else {
			requireSecret("RABBITMQ_PASSWORD", password, 16)
		}
	}

	cloudinaryURL, err := url.Parse(strings.TrimSpace(c.CloudinaryURL))
	if err != nil || cloudinaryURL.Scheme != "cloudinary" || cloudinaryURL.Host == "" ||
		cloudinaryURL.User == nil || cloudinaryURL.User.Username() == "" || containsPlaceholder(c.CloudinaryURL) {
		problems = append(problems, "CLOUDINARY_URL must use cloudinary://api_key:api_secret@cloud_name with real credentials")
	} else if password, ok := cloudinaryURL.User.Password(); !ok || strings.TrimSpace(password) == "" {
		problems = append(problems, "CLOUDINARY_URL must include the Cloudinary API secret")
	}

	if !c.AuthCookieSecure {
		problems = append(problems, "AUTH_COOKIE_SECURE must be true")
	}
	if c.AuthExposeTokens {
		problems = append(problems, "AUTH_EXPOSE_TOKENS must be false")
	}
	if c.DatabaseSeedEnabled {
		problems = append(problems, "DB_SEED_ENABLED must be false")
	}
	if isDemo && !strings.EqualFold(strings.TrimSpace(c.DBTLS), "true") {
		problems = append(problems, "DB_TLS must be true for the external demo database")
	}
	if strings.TrimSpace(c.AdminIPAllowlist) == "" || containsPlaceholder(c.AdminIPAllowlist) {
		problems = append(problems, "ADMIN_IP_ALLOWLIST must contain the trusted admin IPv4/CIDR range")
	}

	origins := strings.Split(c.CORSAllowedOrigins, ",")
	if len(origins) == 0 {
		problems = append(problems, "CORS_ALLOWED_ORIGINS must contain the HTTPS application origin")
	}
	for _, origin := range origins {
		normalized := strings.TrimSpace(origin)
		if normalized == "" || normalized == "*" || !strings.HasPrefix(strings.ToLower(normalized), "https://") || containsPlaceholder(normalized) {
			problems = append(problems, "CORS_ALLOWED_ORIGINS may contain only explicit HTTPS origins")
			break
		}
	}

	if isDemo {
		if c.UploadMalwareScanRequired && strings.TrimSpace(c.ClamAVAddress) == "" {
			problems = append(problems, "CLAMAV_ADDRESS is required when malware scanning is enabled")
		}
	} else {
		if !c.UploadMalwareScanRequired {
			problems = append(problems, "UPLOAD_MALWARE_SCAN_REQUIRED must be true")
		}
		if strings.TrimSpace(c.ClamAVAddress) == "" {
			problems = append(problems, "CLAMAV_ADDRESS is required when malware scanning is enabled")
		}
	}

	if len(problems) > 0 {
		return fmt.Errorf("unsafe %s configuration: %s", environment, strings.Join(problems, "; "))
	}
	return nil
}

func containsPlaceholder(value string) bool {
	normalized := strings.ToUpper(strings.TrimSpace(value))
	return strings.Contains(normalized, "CHANGE_ME") ||
		strings.Contains(normalized, "CHANGEME") ||
		strings.Contains(normalized, "REPLACE_ME") ||
		strings.Contains(normalized, "EXAMPLE.COM")
}

func passwordFromURL(value string) string {
	parsed, err := url.Parse(strings.TrimSpace(value))
	if err != nil || parsed.User == nil {
		return ""
	}
	password, _ := parsed.User.Password()
	return password
}

func normalizeCORSAllowedOrigins(value string) string {
	origins := strings.Split(value, ",")
	for index, origin := range origins {
		origin = strings.TrimSpace(origin)
		if origin != "" && !strings.Contains(origin, "://") {
			origin = "https://" + origin
		}
		origins[index] = origin
	}
	return strings.Join(origins, ",")
}

func resolveRabbitMQURL() string {
	if value := strings.TrimSpace(os.Getenv("RABBITMQ_URL")); value != "" {
		return value
	}

	scheme := getEnv("RABBITMQ_SCHEME", "amqp")
	host := getEnv("RABBITMQ_HOST", "127.0.0.1")
	port := getEnv("RABBITMQ_PORT", "5672")
	username := getEnv("RABBITMQ_USERNAME", "quickwork")
	password := getEnv("RABBITMQ_PASSWORD", "quickwork_dev")
	return (&url.URL{
		Scheme: scheme,
		User:   url.UserPassword(username, password),
		Host:   net.JoinHostPort(host, port),
		Path:   "/",
	}).String()
}

func getEnvInt(key string, fallback int) int {
	value, err := strconv.Atoi(getEnv(key, strconv.Itoa(fallback)))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

// getEnv retrieves the environment variable key or returns a fallback value.
func getEnv(key, fallback string) string {
	if val, exists := os.LookupEnv(key); exists {
		return val
	}
	return fallback
}
