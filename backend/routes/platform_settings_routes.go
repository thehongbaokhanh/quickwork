package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

func RegisterPlatformSettingsRoutes(router fiber.Router, handler *handlers.PlatformSettingsHandler) {
	router.Get("/platform/settings", handler.Get)
}
