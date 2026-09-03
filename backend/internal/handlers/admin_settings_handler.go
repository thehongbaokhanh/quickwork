package handlers

import (
	"errors"
	"runtime"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/services"
)

const adminSettingsAppVersion = "v1.0.0"

// AdminSettingsHandler exposes the single shared settings aggregate. GET and
// PUT return the same snapshot shape so the frontend never needs a follow-up
// request after saving or resolving a version conflict.
type AdminSettingsHandler struct {
	db       *gorm.DB
	settings *services.SystemSettingsService
	started  time.Time
}

type updateAdminSettingsRequest struct {
	Settings services.SystemSettings `json:"settings"`
	Version  uint64                  `json:"version"`
}

type adminSettingsMeta struct {
	AdminCount       int64  `json:"admin_count"`
	AppVersion       string `json:"app_version"`
	UptimeSeconds    int64  `json:"uptime_seconds"`
	MemoryAllocBytes uint64 `json:"memory_alloc_bytes"`
	Goroutines       int    `json:"goroutines"`
	DatabaseStatus   string `json:"database_status"`
}

type adminSettingsPayload struct {
	Settings     services.SystemSettings             `json:"settings"`
	Defaults     services.SystemSettings             `json:"defaults"`
	Capabilities services.SystemSettingsCapabilities `json:"capabilities"`
	Version      uint64                              `json:"version"`
	Configured   bool                                `json:"configured"`
	UpdatedBy    *uint                               `json:"updated_by"`
	UpdatedAt    *time.Time                          `json:"updated_at"`
	Meta         adminSettingsMeta                   `json:"meta"`
}

func NewAdminSettingsHandler(db *gorm.DB, settings *services.SystemSettingsService) *AdminSettingsHandler {
	return &AdminSettingsHandler{db: db, settings: settings, started: time.Now().UTC()}
}

func (h *AdminSettingsHandler) Get(c *fiber.Ctx) error {
	if h == nil || h.settings == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Dịch vụ cấu hình hệ thống chưa sẵn sàng.",
		})
	}
	snapshot, err := h.settings.Current(c.UserContext())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải cấu hình hệ thống.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    h.payload(snapshot),
	})
}

func (h *AdminSettingsHandler) Update(c *fiber.Ctx) error {
	if h == nil || h.settings == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Dịch vụ cấu hình hệ thống chưa sẵn sàng.",
		})
	}
	var req updateAdminSettingsRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Dữ liệu cấu hình không hợp lệ.",
		})
	}

	userID, ok := c.Locals("user_id").(uint)
	if !ok || userID == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	if strings.TrimSpace(req.Settings.Security.IPAllowlist) != "" &&
		!services.MatchIPAllowlist(req.Settings.Security.IPAllowlist, c.IP()) {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"success": false,
			"message": "Danh sách IP phải chứa địa chỉ IP hiện tại để tránh khóa tài khoản quản trị.",
			"errors": services.SystemSettingsFieldErrors{
				"security.ipAllowlist": "IP hiện tại (" + c.IP() + ") không nằm trong danh sách cho phép.",
			},
		})
	}

	snapshot, err := h.settings.Update(c.UserContext(), req.Settings, req.Version, userID)
	if err != nil {
		var validationErr *services.SystemSettingsValidationError
		if errors.As(err, &validationErr) {
			return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
				"success": false,
				"message": "Cấu hình chưa hợp lệ.",
				"errors":  validationErr.Fields,
			})
		}

		var conflictErr *services.SystemSettingsConflictError
		if errors.As(err, &conflictErr) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"success": false,
				"code":    "ADMIN_SETTINGS_VERSION_CONFLICT",
				"message": "Cấu hình đã được một quản trị viên khác cập nhật.",
				"data": fiber.Map{
					"current": h.payload(conflictErr.Current),
				},
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể lưu cấu hình hệ thống.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã cập nhật cấu hình dùng chung.",
		"data":    h.payload(snapshot),
	})
}

func (h *AdminSettingsHandler) payload(snapshot services.SystemSettingsSnapshot) adminSettingsPayload {
	var memory runtime.MemStats
	runtime.ReadMemStats(&memory)

	meta := adminSettingsMeta{
		AppVersion:       adminSettingsAppVersion,
		UptimeSeconds:    int64(time.Since(h.started).Seconds()),
		MemoryAllocBytes: memory.Alloc,
		Goroutines:       runtime.NumGoroutine(),
		DatabaseStatus:   "online",
	}
	if h.db == nil {
		meta.DatabaseStatus = "unknown"
	} else if err := h.db.Model(&models.User{}).
		Where("role = ?", models.RoleAdmin).
		Count(&meta.AdminCount).Error; err != nil {
		meta.DatabaseStatus = "degraded"
	}

	return adminSettingsPayload{
		Settings:     snapshot.Settings,
		Defaults:     services.DefaultSystemSettings(),
		Capabilities: snapshot.Capabilities,
		Version:      snapshot.Version,
		Configured:   snapshot.Configured,
		UpdatedBy:    snapshot.UpdatedBy,
		UpdatedAt:    snapshot.UpdatedAt,
		Meta:         meta,
	}
}
