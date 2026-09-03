package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

// RegisterAdminSettingsRoutes registers the shared settings endpoints separately
// so the existing admin resource routes keep their focused handler contract.
func RegisterAdminSettingsRoutes(router fiber.Router, handler *handlers.AdminSettingsHandler) {
	router.Get("/settings", handler.Get)
	router.Put("/settings", handler.Update)
}
