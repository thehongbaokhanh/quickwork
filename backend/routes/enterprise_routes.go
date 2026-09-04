package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

func RegisterEnterpriseJobRoutes(router fiber.Router, handler *handlers.EnterpriseJobHandler) {
	router.Get("/profile", handler.GetProfile)
	router.Put("/profile", handler.UpdateProfile)
	router.Get("/applications", handler.ListApplications)
	router.Put("/applications/:id/status", handler.ReviewApplication)
	router.Put("/applications/:id/interview", handler.ScheduleInterview)
	router.Put("/applications/:id/interview-result", handler.SubmitInterviewResult)
	router.Get("/skills", handler.ListSkills)
	router.Post("/skills", handler.CreateSkill)

	jobs := router.Group("/jobs")
	jobs.Post("/", handler.CreateJob)
	jobs.Get("/", handler.ListJobs)
	jobs.Put("/:id", handler.UpdateJob)
	jobs.Delete("/:id", handler.DeleteJob)
}
