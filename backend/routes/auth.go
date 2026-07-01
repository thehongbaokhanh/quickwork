package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

// RegisterAuthRoutes khởi chạy ánh xạ đường dẫn dành riêng cho phân hệ bảo mật xác thực
func RegisterAuthRoutes(router fiber.Router, authHandler *handlers.AuthHandler) {
	authGroup := router.Group("/auth")

	// Đăng ký các Endpoint mới theo đúng đặc tả nghiệp vụ đề ra
	authGroup.Post("/register-student", authHandler.RegisterStudent)
	authGroup.Post("/register-enterprise", authHandler.RegisterEnterprise)
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/register-admin", authHandler.RegisterFirstAdmin)
}