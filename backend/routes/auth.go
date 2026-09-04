package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"quickwork.local/backend/internal/handlers"
	"time"
)

// RegisterAuthRoutes khởi chạy ánh xạ đường dẫn dành riêng cho phân hệ bảo mật xác thực
func RegisterAuthRoutes(router fiber.Router, authHandler *handlers.AuthHandler) {
	authGroup := router.Group("/auth")
	loginLimiter := limiter.New(limiter.Config{Max: 10, Expiration: time.Minute, KeyGenerator: func(c *fiber.Ctx) string { return c.IP() }})
	registrationLimiter := limiter.New(limiter.Config{Max: 10, Expiration: time.Hour, KeyGenerator: func(c *fiber.Ctx) string { return c.IP() }})
	adminBootstrapLimiter := limiter.New(limiter.Config{Max: 5, Expiration: time.Hour, KeyGenerator: func(c *fiber.Ctx) string { return c.IP() }})
	uploadLimiter := limiter.New(limiter.Config{Max: 20, Expiration: time.Hour, KeyGenerator: func(c *fiber.Ctx) string { return c.IP() }})

	// Đăng ký các Endpoint mới theo đúng đặc tả nghiệp vụ đề ra
	authGroup.Post("/register-student", registrationLimiter, authHandler.RegisterStudent)
	authGroup.Post("/register-enterprise", registrationLimiter, authHandler.RegisterEnterprise)
	authGroup.Post("/login", loginLimiter, authHandler.Login)
	authGroup.Post("/logout", authHandler.Logout)
	authGroup.Post("/register-admin", adminBootstrapLimiter, authHandler.RegisterFirstAdmin)
	authGroup.Post("/upload", uploadLimiter, authHandler.UploadGPKD)
	authGroup.Post("/google", loginLimiter, authHandler.GoogleLogin)
	authGroup.Get("/google/config", authHandler.GetGoogleConfig)
}
