package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
	_ "quickwork.local/backend/docs"

	"quickwork.local/backend/config"
	"quickwork.local/backend/database"
	"quickwork.local/backend/internal/handlers"
	middleware "quickwork.local/backend/internal/middlewares"
	"quickwork.local/backend/internal/repositories"
	"quickwork.local/backend/internal/services"
	"quickwork.local/backend/pkg/jwt"
	"quickwork.local/backend/pkg/redis"
	"quickwork.local/backend/routes"
)

// @title QuickWork API
// @version 1.0
// @description Backend API của QuickWork
// @host localhost:8080
// @BasePath /api/v1
func main() {

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}
	// Khởi tạo Cloudinary
	config.InitCloudinary()

	// Khởi tạo Redis
	if err := redis.Init(cfg); err != nil {
		log.Fatal("Redis initialization failed:", err)
	}
	defer redis.Client.Close()

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

	if err := database.Seed(db); err != nil {
		log.Fatal(err)
	}

	log.Println("✅ Database seed completed")

	// Repository
	userRepo := repositories.NewUserRepository()
	studentRepo := repositories.NewStudentRepository()
	enterpriseRepo := repositories.NewEnterpriseRepository()
	authRedisRepo := repositories.NewAuthRedisRepository(redis.Client)
	jobRepo := repositories.NewJobRepository(db)

	// Service
	authService := services.NewAuthService(
		db,
		cfg,
		userRepo,
		studentRepo,
		enterpriseRepo,
		authRedisRepo,
	)
	// Handler
	authHandler := handlers.NewAuthHandler(authService)
	testHandler := handlers.NewTestHandler()
	enterpriseJobHandler := handlers.NewEnterpriseJobHandler(jobRepo)
	adminHandler := handlers.NewAdminHandler(db)

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,http://127.0.0.1:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowCredentials: true,
	}))

	// Serve static files from uploads directory
	app.Static("/uploads", "./uploads")

	api := app.Group("/api/v1")

	routes.RegisterAuthRoutes(api, authHandler)
	api.Get("/jobs", enterpriseJobHandler.ListPublicJobs)
	api.Get("/jobs/:id", enterpriseJobHandler.GetPublicJob)

	protected := api.Group("/", middleware.AuthMiddleware(db))

	protected.Get("/profile", testHandler.Profile)

	routes.RegisterTestRoutes(protected, testHandler)

	enterpriseGroup := protected.Group("/enterprise", middleware.RoleMiddleware("ENTERPRISE"), middleware.EnterpriseApprovedMiddleware(db))
	routes.RegisterEnterpriseJobRoutes(enterpriseGroup, enterpriseJobHandler)

	adminGroup := protected.Group("/admin", middleware.RoleMiddleware("ADMIN"))
	routes.RegisterAdminRoutes(adminGroup, adminHandler)

	// Swagger
	app.Get("/swagger/*", swagger.HandlerDefault)

	log.Println("Server started at :" + cfg.AppPort)
	log.Fatal(app.Listen(":" + cfg.AppPort))
}
