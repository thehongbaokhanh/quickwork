package middlewares

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"quickwork.local/backend/internal/models"
	jwtpkg "quickwork.local/backend/pkg/jwt"
	redispkg "quickwork.local/backend/pkg/redis"
)

func AuthMiddleware(databases ...*gorm.DB) fiber.Handler {
	var db *gorm.DB
	if len(databases) > 0 {
		db = databases[0]
	}

	return func(c *fiber.Ctx) error {

		authHeader := c.Get("Authorization")

		if authHeader == "" {

			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Missing Authorization Header",
			})
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {

			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid Authorization Header",
			})
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		if redispkg.Client != nil {
			exists, err := redispkg.Client.Exists(
				c.Context(),
				"blacklist:"+token,
			).Result()

			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Token blacklist check failed",
				})
			}

			if exists == 1 {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"success": false,
					"message": "Invalid Token",
				})
			}
		}

		claims, err := jwtpkg.VerifyToken(token)

		if err != nil {

			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid Token",
			})
		}

		if db != nil {
			var user models.User
			if err := db.Select("id", "status").First(&user, claims.UserID).Error; err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"success": false,
					"message": "Phiên đăng nhập không còn hợp lệ.",
				})
			}

			switch user.Status {
			case models.UserStatusActive:
				c.Locals("user_status", string(user.Status))
			case models.UserStatusInactive:
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"success": false,
					"message": "Tài khoản của bạn đang bị tạm khóa. Vui lòng liên hệ quản trị viên.",
				})
			case models.UserStatusBanned:
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"success": false,
					"message": "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ quản trị viên.",
				})
			default:
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"success": false,
					"message": "Tài khoản của bạn chưa được kích hoạt.",
				})
			}
		}

		c.Locals("user_id", claims.UserID)

		c.Locals("role", claims.Role)

		return c.Next()
	}
}
