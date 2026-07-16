package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

func RegisterStudentRoutes(router fiber.Router, handler *handlers.StudentJobHandler) {
	router.Get("/job-actions", handler.GetJobActions)
	router.Get("/applied-jobs", handler.ListAppliedJobs)
	router.Get("/favorite-jobs", handler.ListFavoriteJobs)
	router.Post("/jobs/:id/apply", handler.ApplyJob)
	router.Post("/jobs/:id/favorite", handler.SaveFavoriteJob)
	router.Delete("/jobs/:id/favorite", handler.RemoveFavoriteJob)
}
