package middlewares

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/services"
)

// AdminIPAllowlistMiddleware applies the shared admin IP policy after the
// request has already passed authentication and role checks.
func AdminIPAllowlistMiddleware(settings *services.SystemSettingsService, bootstrapAllowlist ...string) fiber.Handler {
	staticAllowlist := ""
	if len(bootstrapAllowlist) > 0 {
		staticAllowlist = strings.TrimSpace(bootstrapAllowlist[0])
	}
	return func(c *fiber.Ctx) error {
		if staticAllowlist != "" && !services.MatchIPAllowlist(staticAllowlist, c.IP()) {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Địa chỉ IP này không được phép truy cập khu vực quản trị.",
			})
		}
		if settings == nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"success": false,
				"message": "Dịch vụ cấu hình hệ thống chưa sẵn sàng.",
			})
		}
		snapshot, err := settings.Current(c.UserContext())
		if err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"success": false,
				"message": "Không thể kiểm tra chính sách truy cập quản trị.",
			})
		}

		allowlist := strings.TrimSpace(snapshot.Settings.Security.IPAllowlist)
		if allowlist == "" || services.MatchIPAllowlist(allowlist, c.IP()) {
			return c.Next()
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Địa chỉ IP này không được phép truy cập khu vực quản trị.",
		})
	}
}
