package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

func RegisterAdminRoutes(router fiber.Router, handler *handlers.AdminHandler) {
	router.Get("/users", handler.ListUsers)
	router.Get("/students", handler.ListStudents)
	router.Get("/enterprises", handler.ListEnterprises)
	router.Put("/users/:id", handler.UpdateUser)
	router.Put("/users/:id/status", handler.UpdateUserStatus)
	router.Put("/enterprises/:id/kyb", handler.UpdateEnterpriseKYB)
	router.Post("/enterprises/:id/request-gpkd", handler.RequestEnterpriseGPKD)
	router.Get("/jobs", handler.ListJobs)
	router.Put("/jobs/:id/review", handler.ReviewJob)
	router.Get("/dashboard/stats", handler.GetDashboardStats)
	router.Get("/users/recent", handler.ListRecentUsers)
}
