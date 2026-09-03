package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/services"
)

type NotificationHandler struct {
	notificationService services.NotificationService
}

func NewNotificationHandler(notificationService services.NotificationService) *NotificationHandler {
	return &NotificationHandler{notificationService: notificationService}
}

func (h *NotificationHandler) ListNotifications(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
	}

	page := parsePositiveInt(c.Query("page"), 1)
	pageSize := parsePositiveInt(c.Query("page_size"), 20)
	notificationType := strings.ToUpper(strings.TrimSpace(c.Query("type")))

	var isRead *bool
	if raw := strings.TrimSpace(c.Query("is_read")); raw != "" {
		parsed, err := strconv.ParseBool(raw)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "is_read không hợp lệ.",
				"errors":  fiber.Map{"code": "INVALID_IS_READ"},
			})
		}
		isRead = &parsed
	}

	result, err := h.notificationService.ListForCurrentUser(c.UserContext(), userID, isRead, notificationType, page, pageSize)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải danh sách thông báo.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})	
}

func (h *NotificationHandler) CountUnread(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
	}

	count, err := h.notificationService.CountUnread(c.UserContext(), userID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể đếm thông báo chưa đọc."})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"unread_count": count,
		},
	})
}

func (h *NotificationHandler) MarkAsRead(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
	}

	notificationID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Invalid notification ID"})
	}

	updated, err := h.notificationService.MarkAsRead(c.UserContext(), uint(notificationID), userID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể đánh dấu thông báo."})
	}
	if !updated {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy thông báo.",
			"errors":  fiber.Map{"code": "NOTIFICATION_NOT_FOUND"},
		})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Đã đánh dấu thông báo là đã đọc."})
}

func (h *NotificationHandler) MarkAllAsRead(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
	}

	updatedCount, err := h.notificationService.MarkAllAsRead(c.UserContext(), userID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể đánh dấu toàn bộ thông báo."})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã đánh dấu tất cả thông báo là đã đọc.",
		"data": fiber.Map{
			"updated_count": updatedCount,
		},
	})
}

func parsePositiveInt(value string, fallback int) int {
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}
