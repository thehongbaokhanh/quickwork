package handlers

import (
	"errors"
	"net/http"
	"strings"
	"unicode/utf8"

	"github.com/gofiber/fiber/v2"

	"quickwork.local/backend/internal/services"
)

type StudentCareerGuidanceHandler struct {
	service *services.CareerGuidanceService
}

type careerGuidanceRequest struct {
	Goal              string   `json:"goal"`
	ArticleTitle      string   `json:"article_title"`
	ArticleCategory   string   `json:"article_category"`
	ArticleExcerpt    string   `json:"article_excerpt"`
	ArticleHighlights []string `json:"article_highlights"`
}

func NewStudentCareerGuidanceHandler(service *services.CareerGuidanceService) *StudentCareerGuidanceHandler {
	return &StudentCareerGuidanceHandler{service: service}
}

func (h *StudentCareerGuidanceHandler) Generate(c *fiber.Ctx) error {
	if _, ok := c.Locals("user_id").(uint); !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}

	var request careerGuidanceRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Dữ liệu yêu cầu không hợp lệ."})
	}
	request.Goal = strings.TrimSpace(request.Goal)
	request.ArticleTitle = strings.TrimSpace(request.ArticleTitle)
	request.ArticleCategory = strings.TrimSpace(request.ArticleCategory)
	request.ArticleExcerpt = strings.TrimSpace(request.ArticleExcerpt)
	if request.Goal == "" || request.ArticleTitle == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mục tiêu và bài viết là bắt buộc."})
	}
	if utf8.RuneCountInString(request.Goal) > 600 || utf8.RuneCountInString(request.ArticleTitle) > 200 || utf8.RuneCountInString(request.ArticleCategory) > 100 || utf8.RuneCountInString(request.ArticleExcerpt) > 800 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Nội dung yêu cầu vượt quá giới hạn cho phép."})
	}
	if len(request.ArticleHighlights) > 6 {
		request.ArticleHighlights = request.ArticleHighlights[:6]
	}
	highlights := make([]string, 0, len(request.ArticleHighlights))
	for _, highlight := range request.ArticleHighlights {
		value := strings.TrimSpace(highlight)
		if value == "" || utf8.RuneCountInString(value) > 300 {
			continue
		}
		highlights = append(highlights, value)
	}

	result, err := h.service.Generate(c.UserContext(), services.CareerGuidanceInput{
		Goal:              request.Goal,
		ArticleTitle:      request.ArticleTitle,
		ArticleCategory:   request.ArticleCategory,
		ArticleExcerpt:    request.ArticleExcerpt,
		ArticleHighlights: highlights,
	})
	if err != nil {
		if errors.Is(err, services.ErrCareerGuidanceUnavailable) {
			return c.Status(http.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "message": "Trợ lý AI chưa được cấu hình trên máy chủ."})
		}
		return c.Status(http.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "message": "Trợ lý AI đang bận. Vui lòng thử lại sau."})
	}
	return c.JSON(fiber.Map{"success": true, "data": result})
}
