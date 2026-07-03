package middlewares

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	jwtpkg "quickwork.local/backend/pkg/jwt"
	redispkg "quickwork.local/backend/pkg/redis"
)

func AuthMiddleware() fiber.Handler {

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

		c.Locals("user_id", claims.UserID)

		c.Locals("role", claims.Role)

		return c.Next()
	}
}
