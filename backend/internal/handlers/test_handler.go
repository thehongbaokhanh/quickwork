package handlers

import "github.com/gofiber/fiber/v2"

type TestHandler struct{}

func NewTestHandler() *TestHandler {
	return &TestHandler{}
}

func (h *TestHandler) Profile(c *fiber.Ctx) error {

	userID := c.Locals("user_id")
	role := c.Locals("role")

	return c.JSON(fiber.Map{
		"success": true,
		"user_id": userID,
		"role":    role,
	})
}

func (h *TestHandler) AdminTest(c *fiber.Ctx) error {

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Hello Admin",
	})
}

func (h *TestHandler) StudentTest(c *fiber.Ctx) error {

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Hello Student",
	})
}

func (h *TestHandler) EnterpriseTest(c *fiber.Ctx) error {

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Hello Enterprise",
	})
}