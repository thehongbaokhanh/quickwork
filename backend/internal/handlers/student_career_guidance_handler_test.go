package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"

	"quickwork.local/backend/internal/services"
)

func TestStudentCareerGuidanceHandlerValidatesGoal(t *testing.T) {
	app := fiber.New()
	handler := NewStudentCareerGuidanceHandler(services.NewCareerGuidanceService(nil, time.Second))
	app.Post("/career-guidance", func(c *fiber.Ctx) error {
		c.Locals("user_id", uint(12))
		return handler.Generate(c)
	})

	request := httptest.NewRequest(http.MethodPost, "/career-guidance", strings.NewReader(`{"goal":"","article_title":"Lộ trình Backend"}`))
	request.Header.Set("Content-Type", "application/json")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.StatusCode)
	}
}

func TestStudentCareerGuidanceHandlerReportsMissingAIConfiguration(t *testing.T) {
	app := fiber.New()
	handler := NewStudentCareerGuidanceHandler(services.NewCareerGuidanceService(nil, time.Second))
	app.Post("/career-guidance", func(c *fiber.Ctx) error {
		c.Locals("user_id", uint(12))
		return handler.Generate(c)
	})

	request := httptest.NewRequest(http.MethodPost, "/career-guidance", strings.NewReader(`{"goal":"Tôi muốn ứng tuyển Backend Intern","article_title":"Lộ trình Backend"}`))
	request.Header.Set("Content-Type", "application/json")
	response, err := app.Test(request)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", response.StatusCode)
	}
}
