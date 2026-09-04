package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

func RegisterNotificationRoutes(router fiber.Router, handler *handlers.NotificationHandler) {
	router.Get("/notifications", handler.ListNotifications)
	router.Get("/notifications/unread-count", handler.CountUnread)
	router.Put("/notifications/:id/read", handler.MarkAsRead)
	router.Put("/notifications/read-all", handler.MarkAllAsRead)
}
