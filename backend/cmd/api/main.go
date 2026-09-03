package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
	_ "quickwork.local/backend/docs"

	"quickwork.local/backend/config"
	"quickwork.local/backend/database"
	"quickwork.local/backend/internal/handlers"
	"quickwork.local/backend/internal/messaging"
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
	if err := cfg.ValidateProduction(); err != nil {
		log.Fatal(err)
	}
	runtimeCtx, stopRuntime := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stopRuntime()
	// Khởi tạo Cloudinary
	if err := config.InitCloudinary(cfg.CloudinaryURL); err != nil {
		log.Fatal(err)
	}

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

	if cfg.DatabaseSeedEnabled {
		if err := database.Seed(db); err != nil {
			log.Fatal(err)
		}
		log.Println("✅ Database seed completed")
	} else {
		log.Println("Database seed disabled")
	}

	// Repository
	userRepo := repositories.NewUserRepository()
	studentRepo := repositories.NewStudentRepository()
	enterpriseRepo := repositories.NewEnterpriseRepository()
	authRedisRepo := repositories.NewAuthRedisRepository(redis.Client)
	jobRepo := repositories.NewJobRepository(db)
	notificationRepo := repositories.NewNotificationRepository(db)
	conversationRepo := repositories.NewConversationRepository(db)
	messageRepo := repositories.NewMessageRepository(db)
	recommendationRepo := repositories.NewRecommendationRepository(db)

	// Service
	settingsService := services.NewSystemSettingsService(db)
	jobModerationScheduler := services.NewJobModerationScheduler(db, settingsService, redis.Client)
	jobModerationScheduler.Start(runtimeCtx)
	var notificationEventQueue services.NotificationEventQueue
	var notificationQueue *messaging.NotificationQueue
	if cfg.MessageQueueEnabled {
		notificationQueue = messaging.NewNotificationQueue(db, messaging.NotificationQueueConfig{
			URL:        cfg.RabbitMQURL,
			Exchange:   cfg.RabbitMQExchange,
			Queue:      cfg.RabbitMQQueue,
			RoutingKey: cfg.RabbitMQRoutingKey,
			Prefetch:   cfg.RabbitMQPrefetch,
		})
		notificationEventQueue = notificationQueue
		notificationQueue.Start(runtimeCtx)
		log.Println("RabbitMQ notification queue enabled")
	}
	notificationService := services.NewNotificationService(notificationRepo, settingsService, notificationEventQueue)
	authService := services.NewAuthService(
		db,
		cfg,
		userRepo,
		studentRepo,
		enterpriseRepo,
		authRedisRepo,
		settingsService,
		notificationService,
	)
	conversationService := services.NewConversationService(
		db,
		conversationRepo,
		messageRepo,
		notificationService,
	)
	var jobMatchAI services.JobMatchAI
	var careerGuidanceAI services.CareerGuidanceAI
	if cfg.OpenAIAPIKey != "" {
		jobMatchAI = services.NewOpenAIJobMatchAI(services.OpenAIJobMatchConfig{
			APIKey:  cfg.OpenAIAPIKey,
			Model:   cfg.OpenAIModel,
			BaseURL: cfg.OpenAIBaseURL,
			Timeout: time.Duration(cfg.JobMatchAITimeoutSeconds) * time.Second,
		})
		careerGuidanceAI = services.NewOpenAICareerGuidanceAI(services.OpenAICareerGuidanceConfig{
			APIKey:  cfg.OpenAIAPIKey,
			Model:   cfg.OpenAIModel,
			BaseURL: cfg.OpenAIBaseURL,
			Timeout: time.Duration(cfg.JobMatchAITimeoutSeconds) * time.Second,
		})
	}
	recommendationService := services.NewJobRecommendationService(
		recommendationRepo,
		services.NewRedisRecommendationCache(redis.Client),
		jobMatchAI,
		services.JobRecommendationConfig{
			CandidateLimit: cfg.JobMatchCandidateLimit,
			CacheTTL:       time.Duration(cfg.JobMatchCacheTTLMinutes) * time.Minute,
			AITimeout:      time.Duration(cfg.JobMatchAITimeoutSeconds) * time.Second,
			Weights:        services.DefaultMatchWeights,
		},
	)
	// Handler
	authHandler := handlers.NewAuthHandler(authService, cfg)
	testHandler := handlers.NewTestHandler()
	enterpriseJobHandler := handlers.NewEnterpriseJobHandler(jobRepo, db, notificationService, settingsService)
	studentJobHandler := handlers.NewStudentJobHandler(db, notificationService, cfg)
	studentRecommendationHandler := handlers.NewStudentRecommendationHandler(recommendationService)
	studentCareerGuidanceHandler := handlers.NewStudentCareerGuidanceHandler(services.NewCareerGuidanceService(careerGuidanceAI, time.Duration(cfg.JobMatchAITimeoutSeconds)*time.Second))
	adminHandler := handlers.NewAdminHandler(db, notificationService)
	adminSettingsHandler := handlers.NewAdminSettingsHandler(db, settingsService)
	platformSettingsHandler := handlers.NewPlatformSettingsHandler(settingsService)
	notificationHandler := handlers.NewNotificationHandler(notificationService)
	conversationHandler := handlers.NewConversationHandler(conversationService)

	app := fiber.New(fiber.Config{
		BodyLimit:               12 * 1024 * 1024,
		ReadTimeout:             30 * time.Second,
		WriteTimeout:            60 * time.Second,
		IdleTimeout:             90 * time.Second,
		ProxyHeader:             fiber.HeaderXForwardedFor,
		EnableTrustedProxyCheck: true,
		TrustedProxies:          []string{"10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"},
		EnableIPValidation:      true,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins:     strings.TrimSpace(cfg.CORSAllowedOrigins),
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, If-None-Match",
		AllowMethods:     "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowCredentials: true,
		ExposeHeaders:    "ETag, Cache-Control",
	}))

	// Serve static files from uploads directory
	app.Static("/uploads", "./uploads")

	api := app.Group("/api/v1")

	routes.RegisterAuthRoutes(api, authHandler)
	routes.RegisterPlatformSettingsRoutes(api, platformSettingsHandler)
	api.Get("/jobs", enterpriseJobHandler.ListPublicJobs)
	api.Get("/jobs/:id", enterpriseJobHandler.GetPublicJob)

	protected := api.Group("/", middleware.AuthMiddleware(db))

	protected.Get("/profile", testHandler.Profile)
	protected.Post("/auth/change-password", authHandler.ChangePassword)

	routes.RegisterTestRoutes(protected, testHandler)
	routes.RegisterNotificationRoutes(protected, notificationHandler)
	routes.RegisterConversationRoutes(protected, conversationHandler)

	studentGroup := protected.Group("/student", middleware.RoleMiddleware("STUDENT"))
	routes.RegisterStudentRoutes(studentGroup, studentJobHandler, studentRecommendationHandler, studentCareerGuidanceHandler)

	enterpriseGroup := protected.Group("/enterprise", middleware.RoleMiddleware("ENTERPRISE"), middleware.EnterpriseApprovedMiddleware(db, settingsService))
	routes.RegisterEnterpriseJobRoutes(enterpriseGroup, enterpriseJobHandler)

	adminGroup := protected.Group("/admin", middleware.RoleMiddleware("ADMIN"), middleware.AdminIPAllowlistMiddleware(settingsService, cfg.AdminIPAllowlist))
	routes.RegisterAdminSettingsRoutes(adminGroup, adminSettingsHandler)
	routes.RegisterAdminRoutes(adminGroup, adminHandler)

	if !strings.EqualFold(cfg.AppEnv, "production") {
		app.Get("/swagger/*", swagger.HandlerDefault)
	}

	go func() {
		<-runtimeCtx.Done()
		if err := app.ShutdownWithTimeout(10 * time.Second); err != nil {
			log.Printf("HTTP graceful shutdown failed: %v", err)
		}
	}()

	log.Println("Server started at :" + cfg.AppPort)
	if err := app.Listen(":" + cfg.AppPort); err != nil {
		log.Printf("Server stopped: %v", err)
	}
	stopRuntime()
	if notificationQueue != nil {
		notificationQueue.Wait()
	}
}
