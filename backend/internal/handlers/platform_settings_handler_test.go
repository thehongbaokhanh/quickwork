package handlers

import (
	"fmt"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/services"
)

func TestPlatformSettingsHandlerReturnsCacheableSnapshotAndETag(t *testing.T) {
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "_"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("get sql db: %v", err)
	}
	sqlDB.SetMaxOpenConns(1)
	t.Cleanup(func() { _ = sqlDB.Close() })
	if err := db.AutoMigrate(&models.SystemSetting{}); err != nil {
		t.Fatalf("migrate settings: %v", err)
	}

	app := fiber.New()
	handler := NewPlatformSettingsHandler(services.NewSystemSettingsService(db))
	app.Get("/platform/settings", handler.Get)

	response, err := app.Test(httptest.NewRequest("GET", "/platform/settings", nil))
	if err != nil {
		t.Fatalf("GET platform settings: %v", err)
	}
	if response.StatusCode != fiber.StatusOK {
		t.Fatalf("status = %d, want 200", response.StatusCode)
	}
	if response.Header.Get("Cache-Control") != "public, max-age=60, stale-while-revalidate=300" {
		t.Fatalf("Cache-Control = %q", response.Header.Get("Cache-Control"))
	}
	etag := response.Header.Get("ETag")
	if etag != "W/\"platform-0\"" {
		t.Fatalf("ETag = %q, want weak quoted version tag", etag)
	}

	request := httptest.NewRequest("GET", "/platform/settings", nil)
	request.Header.Set("If-None-Match", etag)
	response, err = app.Test(request)
	if err != nil {
		t.Fatalf("conditional GET platform settings: %v", err)
	}
	if response.StatusCode != fiber.StatusNotModified {
		t.Fatalf("conditional status = %d, want 304", response.StatusCode)
	}
}
