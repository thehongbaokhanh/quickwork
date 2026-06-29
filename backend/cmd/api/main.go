package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"quickwork.local/backend/config"
	"quickwork.local/backend/database"
	"quickwork.local/backend/internal/handlers"
	middleware "quickwork.local/backend/internal/middlewares"
	"quickwork.local/backend/internal/repositories"
	"quickwork.local/backend/internal/services"
	"quickwork.local/backend/pkg/jwt"
	redispkg "quickwork.local/backend/pkg/redis"
	"quickwork.local/backend/routes"
)

func main() {

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	// Khởi tạo Redis
	redispkg.Init(cfg)

	// Khởi tạo JWT Secret
	jwt.SetSecret(cfg.JWTSecret)

	// Kết nối MySQL
	db, err := database.InitMySQL(cfg)
	if err != nil {
		log.Fatal(err)
	}

	// Migration
	if err := database.Migrate(db); err != nil {
		log.Fatal(err)
	}

	log.Println("✅ Database migration completed")

	// Repository
	userRepo := repositories.NewUserRepository()
	studentRepo := repositories.NewStudentRepository()
	enterpriseRepo := repositories.NewEnterpriseRepository()

	// Service
	authService := services.NewAuthService(
		db,
		userRepo,
		studentRepo,
		enterpriseRepo,
	)

	// Handler
	authHandler := handlers.NewAuthHandler(authService)
	testHandler := handlers.NewTestHandler()

	app := fiber.New()

	app.Use(cors.New())

	api := app.Group("/api/v1")

	// Public API
	routes.RegisterAuthRoutes(api, authHandler)

	// Protected API
	protected := api.Group("/", middleware.AuthMiddleware())
	protected.Get("/profile", testHandler.Profile)

	routes.RegisterTestRoutes(protected, testHandler)	

	log.Println("Server started at :" + cfg.AppPort)
	log.Fatal(app.Listen(":" + cfg.AppPort))
}
