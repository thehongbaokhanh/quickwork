package middlewares

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

func RoleMiddleware(roles ...string) fiber.Handler {
    return func(c *fiber.Ctx) error {

        role, ok := c.Locals("role").(string)
        if !ok {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Unauthorized",
            })
        }

        role = strings.ToLower(role)

        for _, r := range roles {
            if role == strings.ToLower(r) {
                return c.Next()
            }
        }

        return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
            "success": false,
            "message": "Permission denied",
        })
    }
}