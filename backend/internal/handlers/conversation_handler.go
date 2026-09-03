package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/dto/request"
	"quickwork.local/backend/internal/services"
)

type ConversationHandler struct {
	conversationService services.ConversationService
}

func NewConversationHandler(conversationService services.ConversationService) *ConversationHandler {
	return &ConversationHandler{conversationService: conversationService}
}

func (h *ConversationHandler) ListConversations(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
	}

	result, err := h.conversationService.ListForCurrentUser(
		c.UserContext(),
		userID,
		parsePositiveInt(c.Query("page"), 1),
		parsePositiveInt(c.Query("page_size"), 20),
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tải danh sách trò chuyện."})
	}

	return c.JSON(fiber.Map{"success": true, "data": result})
}

func (h *ConversationHandler) OpenByApplication(c *fiber.Ctx) error {
	userID, applicationID, ok := h.currentUserAndApplicationID(c)
	if !ok {
		return nil
	}

	result, err := h.conversationService.OpenByApplication(c.UserContext(), userID, applicationID)
	if err != nil {
		return conversationError(c, err)
	}

	return c.JSON(fiber.Map{"success": true, "data": result})
}

func (h *ConversationHandler) ListMessages(c *fiber.Ctx) error {
	userID, conversationID, ok := h.currentUserAndConversationID(c)
	if !ok {
		return nil
	}

	var beforeID *uint
	if rawBeforeID := c.Query("before_id"); rawBeforeID != "" {
		parsed, err := strconv.ParseUint(rawBeforeID, 10, 32)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "before_id không hợp lệ."})
		}
		value := uint(parsed)
		beforeID = &value
	}

	result, err := h.conversationService.ListMessages(c.UserContext(), userID, conversationID, beforeID, parsePositiveInt(c.Query("limit"), 30))
	if err != nil {
		return conversationError(c, err)
	}

	return c.JSON(fiber.Map{"success": true, "data": result})
}

func (h *ConversationHandler) SendMessageByApplication(c *fiber.Ctx) error {
	userID, applicationID, ok := h.currentUserAndApplicationID(c)
	if !ok {
		return nil
	}

	req := new(request.SendMessageRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Invalid request body"})
	}

	result, err := h.conversationService.SendMessageByApplication(c.UserContext(), userID, applicationID, req.Content)
	if err != nil {
		return conversationError(c, err)
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{"success": true, "data": result})
}

func (h *ConversationHandler) SendMessageByConversation(c *fiber.Ctx) error {
	userID, conversationID, ok := h.currentUserAndConversationID(c)
	if !ok {
		return nil
	}

	req := new(request.SendMessageRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Invalid request body"})
	}

	result, err := h.conversationService.SendMessageByConversation(c.UserContext(), userID, conversationID, req.Content)
	if err != nil {
		return conversationError(c, err)
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{"success": true, "data": result})
}

func (h *ConversationHandler) MarkRead(c *fiber.Ctx) error {
	userID, conversationID, ok := h.currentUserAndConversationID(c)
	if !ok {
		return nil
	}

	result, err := h.conversationService.MarkRead(c.UserContext(), userID, conversationID)
	if err != nil {
		return conversationError(c, err)
	}

	return c.JSON(fiber.Map{"success": true, "data": result})
}

func (h *ConversationHandler) CountUnread(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
	}

	count, err := h.conversationService.CountUnread(c.UserContext(), userID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể đếm tin nhắn chưa đọc."})
	}

	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"unread_count": count}})
}

func (h *ConversationHandler) currentUserAndApplicationID(c *fiber.Ctx) (uint, uint, bool) {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		_ = c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
		return 0, 0, false
	}
	applicationID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		_ = c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Invalid application ID"})
		return 0, 0, false
	}
	return userID, uint(applicationID), true
}

func (h *ConversationHandler) currentUserAndConversationID(c *fiber.Ctx) (uint, uint, bool) {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		_ = c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Unauthorized"})
		return 0, 0, false
	}
	conversationID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		_ = c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Invalid conversation ID"})
		return 0, 0, false
	}
	return userID, uint(conversationID), true
}

func conversationError(c *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, services.ErrMessageContentRequired):
		return c.Status(http.StatusBadRequest).JSON(errorResponse("Vui lòng nhập nội dung tin nhắn.", "MESSAGE_CONTENT_REQUIRED"))
	case errors.Is(err, services.ErrMessageTooLong):
		return c.Status(http.StatusBadRequest).JSON(errorResponse("Tin nhắn chỉ được tối đa 2.000 ký tự.", "MESSAGE_CONTENT_TOO_LONG"))
	case errors.Is(err, services.ErrConversationForbidden):
		return c.Status(http.StatusForbidden).JSON(errorResponse("Bạn không có quyền truy cập cuộc trò chuyện này.", "CONVERSATION_FORBIDDEN"))
	case errors.Is(err, services.ErrConversationClosed):
		return c.Status(http.StatusForbidden).JSON(errorResponse("Cuộc trò chuyện đã đóng hoặc đơn ứng tuyển không còn nhận tin nhắn.", "CONVERSATION_CLOSED"))
	case errors.Is(err, services.ErrConversationNotFound), errors.Is(err, services.ErrApplicationNotFound):
		return c.Status(http.StatusNotFound).JSON(errorResponse("Không tìm thấy cuộc trò chuyện.", "CONVERSATION_NOT_FOUND"))
	default:
		return c.Status(http.StatusInternalServerError).JSON(errorResponse("Không thể xử lý yêu cầu trò chuyện.", "CONVERSATION_ERROR"))
	}
}

func errorResponse(message string, code string) fiber.Map {
	return fiber.Map{
		"success": false,
		"message": message,
		"errors":  fiber.Map{"code": code},
	}
}
