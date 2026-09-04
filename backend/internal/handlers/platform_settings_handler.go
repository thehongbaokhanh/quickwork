package handlers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/services"
)

type PlatformSettingsHandler struct {
	settings *services.SystemSettingsService
}

func NewPlatformSettingsHandler(settings *services.SystemSettingsService) *PlatformSettingsHandler {
	return &PlatformSettingsHandler{settings: settings}
}

func (h *PlatformSettingsHandler) Get(c *fiber.Ctx) error {
	if h == nil || h.settings == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Dịch vụ cấu hình nền tảng chưa sẵn sàng.",
		})
	}

	snapshot, err := h.settings.Current(c.UserContext())
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải cấu hình nền tảng.",
		})
	}

	etag := fmt.Sprintf("W/\"platform-%d\"", snapshot.Version)
	c.Set(fiber.HeaderCacheControl, "public, max-age=60, stale-while-revalidate=300")
	c.Set(fiber.HeaderETag, etag)
	if c.Get(fiber.HeaderIfNoneMatch) == etag {
		return c.SendStatus(fiber.StatusNotModified)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"platform": snapshot.Settings.Platform,
			"version":  snapshot.Version,
		},
	})
}
