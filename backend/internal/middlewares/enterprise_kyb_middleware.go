package middlewares

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

func EnterpriseApprovedMiddleware(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("user_id").(uint)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Unauthorized",
			})
		}

		var profile models.EnterpriseProfile
		if err := db.Where("user_id = ?", userID).First(&profile).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Enterprise profile is not available",
			})
		}

		kybStatus := profile.KYBStatus
		if kybStatus == "" {
			kybStatus = profile.StatusKYB
		}

		if kybStatus != models.KYBApproved || strings.TrimSpace(profile.GPKDURL) == "" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Enterprise account must be approved and have a business license",
			})
		}

		return c.Next()
	}
}
