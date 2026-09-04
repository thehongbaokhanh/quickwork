package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
	middleware "quickwork.local/backend/internal/middlewares"
)

func RegisterJobRoutes(router fiber.Router, handler *handlers.JobHandler) {
	// POST /api/v1/enterprise/jobs
	router.Post("/enterprise/jobs", middleware.AuthMiddleware(), middleware.RoleMiddleware("ENTERPRISE"), handler.CreateJob)

	// GET /api/v1/admin/dashboard/stats
	router.Get("/admin/dashboard/stats", middleware.AuthMiddleware(), middleware.RoleMiddleware("ADMIN"), handler.GetDashboardStats)

	// GET /api/v1/admin/jobs
	router.Get("/admin/jobs", middleware.AuthMiddleware(), middleware.RoleMiddleware("ADMIN"), handler.GetPendingJobs)

	// PUT /api/v1/admin/jobs/:id/review
	router.Put("/admin/jobs/:id/review", middleware.AuthMiddleware(), middleware.RoleMiddleware("ADMIN"), handler.ReviewJob)
}
