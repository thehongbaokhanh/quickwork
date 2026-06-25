package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"quickwork.local/backend/config"
	"quickwork.local/backend/database"
	"quickwork.local/backend/internal/handlers"
	"quickwork.local/backend/internal/repositories"
	"quickwork.local/backend/internal/services"
	"quickwork.local/backend/routes"
)

func main() {

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.InitMySQL(cfg)
	if err != nil {
		log.Fatal(err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	
	log.Println("✅ Database migration completed")

	userRepo := repositories.NewUserRepository()
	studentRepo := repositories.NewStudentRepository()
	enterpriseRepo := repositories.NewEnterpriseRepository()

	authService := service.NewAuthService(
		db,
		userRepo,
		studentRepo,
		enterpriseRepo,
	)

	authHandler := handlers.NewAuthHandler(authService)

	app := fiber.New()

	app.Use(cors.New())

	api := app.Group("/api/v1")

	routes.RegisterAuthRoutes(api, authHandler)

	log.Fatal(app.Listen(":" + cfg.AppPort))
}
