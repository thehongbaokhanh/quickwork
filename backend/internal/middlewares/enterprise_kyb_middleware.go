package middlewares

import (
	"slices"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/services"
)

func EnterpriseApprovedMiddleware(db *gorm.DB, settings *services.SystemSettingsService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		snapshot, err := settings.Current(c.UserContext())
		if err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"success": false,
				"message": "Không thể kiểm tra chính sách KYB.",
			})
		}
		if !snapshot.Settings.Registration.RequireKYB {
			return c.Next()
		}

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

		if kybStatus == models.KYBApproved && strings.TrimSpace(profile.GPKDURL) != "" {
			return c.Next()
		}

		if isEnterpriseProfileRoute(c) {
			return c.Next()
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

func isEnterpriseProfileRoute(c *fiber.Ctx) bool {
	if c.Path() != "/api/v1/enterprise/profile" {
		return false
	}
	return slices.Contains([]string{fiber.MethodGet, fiber.MethodPut}, c.Method())
}
