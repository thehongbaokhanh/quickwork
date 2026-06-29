package routes

import (
	"github.com/gofiber/fiber/v2"	
	"quickwork.local/backend/internal/handlers"
	middleware "quickwork.local/backend/internal/middlewares"
)

func SetupTestRoutes(app fiber.Router) {

	testHandler := handlers.NewTestHandler()

	test := app.Group("/test")

	test.Get(
		"/admin",
		middleware.AuthMiddleware(),
		middleware.RoleMiddleware("admin"),
		testHandler.AdminTest,
	)

	test.Get(
		"/student",
		middleware.AuthMiddleware(),
		middleware.RoleMiddleware("student"),
		testHandler.StudentTest,
	)

	test.Get(
		"/enterprise",
		middleware.AuthMiddleware(),
		middleware.RoleMiddleware("enterprise"),
		testHandler.EnterpriseTest,
	)
}

func RegisterTestRoutes(router fiber.Router, testHandler *handlers.TestHandler) {

	admin := router.Group("/admin")
	admin.Get(
		"/test",
		middleware.RoleMiddleware("admin"),
		testHandler.AdminTest,
	)

	student := router.Group("/student")
	student.Get(
		"/test",
		middleware.RoleMiddleware("student"),
		testHandler.StudentTest,
	)

	enterprise := router.Group("/enterprise")
	enterprise.Get(
		"/test",
		middleware.RoleMiddleware("enterprise"),
		testHandler.EnterpriseTest,
	)
}