package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"quickwork.local/backend/internal/services"
)

type StudentRecommendationHandler struct {
	service *services.JobRecommendationService
}

func NewStudentRecommendationHandler(service *services.JobRecommendationService) *StudentRecommendationHandler {
	return &StudentRecommendationHandler{service: service}
}

func (h *StudentRecommendationHandler) GetJobRecommendations(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	limit := 20
	if rawLimit := strings.TrimSpace(c.Query("limit")); rawLimit != "" {
		parsed, err := strconv.Atoi(rawLimit)
		if err != nil || parsed < 1 || parsed > services.MaxRecommendationResultLimit {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "limit phải nằm trong khoảng 1 đến 100."})
		}
		limit = parsed
	}
	refresh := strings.EqualFold(c.Query("refresh"), "true") || c.Query("refresh") == "1"
	result, err := h.service.Recommend(c.UserContext(), studentID, limit, refresh)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy hồ sơ sinh viên."})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tải gợi ý việc làm lúc này."})
	}
	return c.JSON(fiber.Map{"success": true, "data": result})
}
