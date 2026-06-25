// Package response standardizes the HTTP response payload structures for the API.
package response

import (
	"github.com/gofiber/fiber/v2"
)

// APIResponse represents the standard format for all JSON responses.
type APIResponse struct {
	Status  string      `json:"status"`            // "success" or "error"
	Message string      `json:"message"`           // Description message
	Data    interface{} `json:"data,omitempty"`    // Payloads (optional)
	Errors  interface{} `json:"errors,omitempty"`  // Structured errors (optional)
}

// Success serializes a successful action payload and status code.
func Success(c *fiber.Ctx, statusCode int, message string, data interface{}) error {
	return c.Status(statusCode).JSON(APIResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

// Error serializes an error message and lists payload errors.
func Error(c *fiber.Ctx, statusCode int, message string, errors interface{}) error {
	return c.Status(statusCode).JSON(APIResponse{
		Status:  "error",
		Message: message,
		Errors:  errors,
	})
}
