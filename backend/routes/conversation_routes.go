package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

func RegisterConversationRoutes(router fiber.Router, handler *handlers.ConversationHandler) {
	router.Get("/conversations", handler.ListConversations)
	router.Get("/conversations/unread-count", handler.CountUnread)
	router.Get("/conversations/:id/messages", handler.ListMessages)
	router.Post("/conversations/:id/messages", handler.SendMessageByConversation)
	router.Put("/conversations/:id/read", handler.MarkRead)

	router.Post("/job-applications/:id/conversation", handler.OpenByApplication)
	router.Post("/job-applications/:id/messages", handler.SendMessageByApplication)
}
