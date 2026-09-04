package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"quickwork.local/backend/internal/models"
)

func openSystemSettingsTestDB(t *testing.T) *gorm.DB {
	t.Helper()
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
		t.Fatalf("migrate system settings: %v", err)
	}
	return db
}

func TestSystemSettingsCurrentReturnsDefaultsWithoutCreatingRow(t *testing.T) {
	db := openSystemSettingsTestDB(t)
	service := NewSystemSettingsService(db)

	snapshot, err := service.Current(context.Background())
	if err != nil {
		t.Fatalf("Current() error = %v", err)
	}
	if snapshot.Version != 0 || snapshot.Configured || snapshot.UpdatedBy != nil || snapshot.UpdatedAt != nil {
		t.Fatalf("unexpected default metadata: %+v", snapshot)
	}
	if !reflect.DeepEqual(snapshot.Settings, DefaultSystemSettings()) {
		t.Fatalf("Current() settings = %#v, want defaults", snapshot.Settings)
	}
	if snapshot.Capabilities.Moderation.PendingHours != SystemSettingCapabilityActive ||
		snapshot.Capabilities.Platform.Timezone != SystemSettingCapabilityStoredOnly ||
		snapshot.Capabilities.Platform.Language != SystemSettingCapabilityStoredOnly ||
		snapshot.Capabilities.Moderation.HideRejected != SystemSettingCapabilityFixed {
		t.Fatalf("unexpected capabilities: %+v", snapshot.Capabilities)
	}

	var count int64
	if err := db.Model(&models.SystemSetting{}).Count(&count).Error; err != nil {
		t.Fatalf("count rows: %v", err)
	}
	if count != 0 {
		t.Fatalf("Current() created %d rows, want 0", count)
	}
}

func TestSystemSettingsCurrentDoesNotLogMissingSingletonAsError(t *testing.T) {
	db := openSystemSettingsTestDB(t)
	var output bytes.Buffer
	db = db.Session(&gorm.Session{Logger: logger.New(
		log.New(&output, "", 0),
		logger.Config{LogLevel: logger.Error},
	)})

	snapshot, err := NewSystemSettingsService(db).Current(context.Background())
	if err != nil {
		t.Fatalf("Current() error = %v", err)
	}
	if snapshot.Version != 0 || snapshot.Configured {
		t.Fatalf("unexpected default snapshot: %+v", snapshot)
	}
	if strings.Contains(strings.ToLower(output.String()), "record not found") {
		t.Fatalf("missing singleton was logged as an error: %s", output.String())
	}
}

func TestSystemSettingsUpdatePersistsOneVersionedNormalizedRow(t *testing.T) {
	db := openSystemSettingsTestDB(t)
	clock := time.Date(2026, 8, 22, 10, 30, 0, 0, time.FixedZone("ICT", 7*60*60))
	service := newSystemSettingsService(db, time.Minute, func() time.Time { return clock })
	settings := DefaultSystemSettings()
	settings.Platform.SystemName = "  QuickWork   Shared  "
	settings.Platform.AdminDisplayName = "  Trung tâm   quản trị  "
	settings.Platform.SupportEmail = "  SUPPORT@QUICKWORK.VN  "
	settings.Platform.Language = " EN "
	settings.Platform.Timezone = " Asia/Ho_Chi_Minh "
	settings.Moderation.Mode = " AUTOMATIC "
	settings.Moderation.PendingHours = 48
	settings.Security.IPAllowlist = "192.168.1.7/24, 192.168.1.20, 192.168.1.20, 2001:0db8::1"
	settings.Registration.VerifyEmail = true
	settings.Moderation.HideRejected = false
	settings.Notifications.CriticalEmail = true
	settings.Notifications.DailyDigest = true
	settings.Notifications.ReportedJob = true
	settings.Security.TwoFactorAdmin = true
	settings.Backup.Daily = true

	saved, err := service.Update(context.Background(), settings, 0, 42)
	if err != nil {
		t.Fatalf("initial Update() error = %v", err)
	}
	if saved.Version != 1 || !saved.Configured || saved.UpdatedBy == nil || *saved.UpdatedBy != 42 {
		t.Fatalf("unexpected saved metadata: %+v", saved)
	}
	if saved.UpdatedAt == nil || !saved.UpdatedAt.Equal(clock.UTC()) {
		t.Fatalf("UpdatedAt = %v, want %v", saved.UpdatedAt, clock.UTC())
	}
	if saved.Settings.Platform.SystemName != "QuickWork Shared" ||
		saved.Settings.Platform.AdminDisplayName != "Trung tâm quản trị" ||
		saved.Settings.Platform.SupportEmail != "support@quickwork.vn" ||
		saved.Settings.Platform.Language != "en" ||
		saved.Settings.Moderation.Mode != "automatic" {
		t.Fatalf("settings were not normalized: %+v", saved.Settings)
	}
	if saved.Settings.Security.IPAllowlist != "192.168.1.0/24, 192.168.1.20, 2001:db8::1" {
		t.Fatalf("IPAllowlist = %q", saved.Settings.Security.IPAllowlist)
	}
	if saved.Settings.Registration.VerifyEmail || !saved.Settings.Moderation.HideRejected ||
		saved.Settings.Notifications.CriticalEmail || saved.Settings.Notifications.DailyDigest ||
		saved.Settings.Notifications.ReportedJob || saved.Settings.Security.TwoFactorAdmin || saved.Settings.Backup.Daily {
		t.Fatalf("unsupported fields were not forced safe: %+v", saved.Settings)
	}

	var row models.SystemSetting
	if err := db.First(&row, models.SystemSettingSingletonID).Error; err != nil {
		t.Fatalf("load stored row: %v", err)
	}
	if !strings.Contains(row.SettingsJSON, `"systemName":"QuickWork Shared"`) {
		t.Fatalf("stored JSON does not use camelCase contract: %s", row.SettingsJSON)
	}

	conflictSnapshot, err := service.Update(context.Background(), saved.Settings, 0, 43)
	if !errors.Is(err, ErrSystemSettingsConflict) {
		t.Fatalf("stale initial Update() error = %v, want conflict", err)
	}
	if conflictSnapshot.Version != 1 {
		t.Fatalf("conflict snapshot version = %d, want 1", conflictSnapshot.Version)
	}
	var conflictErr *SystemSettingsConflictError
	if !errors.As(err, &conflictErr) || conflictErr.Current.Version != 1 {
		t.Fatalf("conflict error missing current snapshot: %#v", err)
	}

	next := saved.Settings
	next.Platform.SystemName = "QuickWork v2"
	clock = clock.Add(time.Minute)
	updated, err := service.Update(context.Background(), next, saved.Version, 99)
	if err != nil {
		t.Fatalf("second Update() error = %v", err)
	}
	if updated.Version != 2 || updated.Settings.Platform.SystemName != "QuickWork v2" {
		t.Fatalf("unexpected updated snapshot: %+v", updated)
	}

	var count int64
	if err := db.Model(&models.SystemSetting{}).Count(&count).Error; err != nil {
		t.Fatalf("count rows: %v", err)
	}
	if count != 1 {
		t.Fatalf("row count = %d, want singleton row", count)
	}
	if _, err := service.Update(context.Background(), saved.Settings, saved.Version, 42); !errors.Is(err, ErrSystemSettingsConflict) {
		t.Fatalf("stale Update() error = %v, want conflict", err)
	}

	reloaded, err := NewSystemSettingsService(db).ForceReload(context.Background())
	if err != nil {
		t.Fatalf("ForceReload() error = %v", err)
	}
	if reloaded.Version != 2 || reloaded.Settings.Platform.SystemName != "QuickWork v2" {
		t.Fatalf("persisted snapshot = %+v", reloaded)
	}
}

func TestValidateAndNormalizeSystemSettingsRejectsInvalidFields(t *testing.T) {
	tests := []struct {
		name   string
		field  string
		mutate func(*SystemSettings)
	}{
		{name: "system name", field: "platform.systemName", mutate: func(v *SystemSettings) { v.Platform.SystemName = " " }},
		{name: "email", field: "platform.supportEmail", mutate: func(v *SystemSettings) { v.Platform.SupportEmail = "invalid" }},
		{name: "timezone", field: "platform.timezone", mutate: func(v *SystemSettings) { v.Platform.Timezone = "UTC+07" }},
		{name: "language", field: "platform.language", mutate: func(v *SystemSettings) { v.Platform.Language = "fr" }},
		{name: "mode", field: "moderation.mode", mutate: func(v *SystemSettings) { v.Moderation.Mode = "hybrid" }},
		{name: "pending hours", field: "moderation.pendingHours", mutate: func(v *SystemSettings) { v.Moderation.PendingHours = 12 }},
		{name: "draft limit", field: "moderation.draftLimit", mutate: func(v *SystemSettings) { v.Moderation.DraftLimit = 0 }},
		{name: "session", field: "security.sessionMinutes", mutate: func(v *SystemSettings) { v.Security.SessionMinutes = 45 }},
		{name: "login attempts", field: "security.loginAttempts", mutate: func(v *SystemSettings) { v.Security.LoginAttempts = 21 }},
		{name: "IP", field: "security.ipAllowlist", mutate: func(v *SystemSettings) { v.Security.IPAllowlist = "999.1.1.1" }},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			settings := DefaultSystemSettings()
			test.mutate(&settings)
			_, err := ValidateAndNormalizeSystemSettings(settings)
			var validationErr *SystemSettingsValidationError
			if !errors.As(err, &validationErr) {
				t.Fatalf("error = %v, want SystemSettingsValidationError", err)
			}
			if _, ok := validationErr.Fields[test.field]; !ok {
				t.Fatalf("fields = %#v, want %q", validationErr.Fields, test.field)
			}
		})
	}

	if !MatchIPAllowlist("", "203.0.113.9") ||
		!MatchIPAllowlist("192.0.2.0/24, 2001:db8::/32", "192.0.2.45:8080") ||
		!MatchIPAllowlist("2001:db8::/32", "[2001:db8::7]:443") ||
		MatchIPAllowlist("192.0.2.0/24", "198.51.100.1") ||
		MatchIPAllowlist("invalid", "192.0.2.1") ||
		MatchIPAllowlist("", "not-an-ip") {
		t.Fatal("MatchIPAllowlist returned an unexpected result")
	}
}

func TestSystemSettingsMalformedStorageAndCacheReload(t *testing.T) {
	t.Run("malformed JSON", func(t *testing.T) {
		db := openSystemSettingsTestDB(t)
		row := models.SystemSetting{ID: models.SystemSettingSingletonID, SettingsJSON: "{", Version: 1, UpdatedBy: 1}
		if err := db.Create(&row).Error; err != nil {
			t.Fatalf("create malformed row: %v", err)
		}
		if _, err := NewSystemSettingsService(db).ForceReload(context.Background()); err == nil {
			t.Fatal("ForceReload() error = nil, want malformed JSON error")
		}
	})

	t.Run("cache and forced reload", func(t *testing.T) {
		db := openSystemSettingsTestDB(t)
		clock := time.Date(2026, 8, 22, 0, 0, 0, 0, time.UTC)
		service := newSystemSettingsService(db, time.Minute, func() time.Time { return clock })
		initial, err := service.Current(context.Background())
		if err != nil || initial.Version != 0 {
			t.Fatalf("initial Current() = %+v, %v", initial, err)
		}

		settings := DefaultSystemSettings()
		settings.Platform.SystemName = "Database value"
		payload, _ := json.Marshal(settings)
		row := models.SystemSetting{ID: models.SystemSettingSingletonID, SettingsJSON: string(payload), Version: 1, UpdatedBy: 8, CreatedAt: clock, UpdatedAt: clock}
		if err := db.Create(&row).Error; err != nil {
			t.Fatalf("create row: %v", err)
		}
		cached, err := service.Current(context.Background())
		if err != nil || cached.Version != 0 {
			t.Fatalf("cached Current() = %+v, %v", cached, err)
		}
		forced, err := service.ForceReload(context.Background())
		if err != nil || forced.Version != 1 || forced.Settings.Platform.SystemName != "Database value" {
			t.Fatalf("ForceReload() = %+v, %v", forced, err)
		}

		settings.Platform.SystemName = "New database value"
		payload, _ = json.Marshal(settings)
		if err := db.Model(&models.SystemSetting{}).
			Where("id = ?", models.SystemSettingSingletonID).
			Updates(map[string]any{"settings_json": string(payload), "version": uint64(2)}).Error; err != nil {
			t.Fatalf("direct update: %v", err)
		}
		stillCached, _ := service.Current(context.Background())
		if stillCached.Version != 1 {
			t.Fatalf("Current() bypassed fresh cache: %+v", stillCached)
		}
		clock = clock.Add(time.Minute + time.Second)
		expired, err := service.Current(context.Background())
		if err != nil || expired.Version != 2 || expired.Settings.Platform.SystemName != "New database value" {
			t.Fatalf("expired Current() = %+v, %v", expired, err)
		}
	})
}
