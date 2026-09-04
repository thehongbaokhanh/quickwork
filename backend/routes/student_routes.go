package routes

import (
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/handlers"
)

func RegisterStudentRoutes(router fiber.Router, handler *handlers.StudentJobHandler, recommendationHandler *handlers.StudentRecommendationHandler, careerGuidanceHandler *handlers.StudentCareerGuidanceHandler) {
	router.Get("/profile", handler.GetProfile)
	router.Put("/profile", handler.UpdateProfile)
	router.Post("/profile/upload", handler.UploadProfileFile)
	router.Get("/skills", handler.ListProfileSkills)
	router.Post("/skills", handler.CreateProfileSkill)
	router.Post("/profile/experiences", handler.CreateWorkExperience)
	router.Put("/profile/experiences/:id", handler.UpdateWorkExperience)
	router.Delete("/profile/experiences/:id", handler.DeleteWorkExperience)
	router.Post("/profile/educations", handler.CreateEducation)
	router.Put("/profile/educations/:id", handler.UpdateEducation)
	router.Delete("/profile/educations/:id", handler.DeleteEducation)
	router.Post("/profile/portfolios", handler.CreatePortfolio)
	router.Put("/profile/portfolios/:id", handler.UpdatePortfolio)
	router.Delete("/profile/portfolios/:id", handler.DeletePortfolio)
	router.Get("/job-actions", handler.GetJobActions)
	router.Get("/job-recommendations", recommendationHandler.GetJobRecommendations)
	router.Post("/career-guidance", careerGuidanceHandler.Generate)
	router.Get("/applied-jobs", handler.ListAppliedJobs)
	router.Get("/favorite-jobs", handler.ListFavoriteJobs)
	router.Get("/companies/:id", handler.GetCompanyProfile)
	router.Post("/jobs/:id/apply", handler.ApplyJob)
	router.Post("/jobs/:id/favorite", handler.SaveFavoriteJob)
	router.Delete("/jobs/:id/favorite", handler.RemoveFavoriteJob)
}
