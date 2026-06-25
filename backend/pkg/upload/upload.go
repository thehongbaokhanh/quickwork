// Package upload manages HTTP multi-part form file uploads, ensuring constraints.
package upload

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// SaveFile parses, validates, and saves a file from the context.
// Returns the relative path to the saved file or an error.
func SaveFile(c *fiber.Ctx, formKey string, targetDir string, maxBytes int64, allowedExts []string) (string, error) {
	fileHeader, err := c.FormFile(formKey)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve file from form: %w", err)
	}

	// 1. Validate File Size
	if fileHeader.Size > maxBytes {
		return "", fmt.Errorf("file exceeds size limit of %d bytes", maxBytes)
	}

	// 2. Validate File Extension
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if len(allowedExts) > 0 {
		allowed := false
		for _, allowedExt := range allowedExts {
			if ext == strings.ToLower(allowedExt) {
				allowed = true
				break
			}
		}
		if !allowed {
			return "", errors.New("unsupported file extension")
		}
	}

	// 3. Generate a safe unique name
	newFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	targetPath := filepath.Join(targetDir, newFileName)

	// Save using Fiber context
	if err := c.SaveFile(fileHeader, targetPath); err != nil {
		return "", fmt.Errorf("failed to save uploaded file: %w", err)
	}

	// Return clean slashes path for consistency across OS platforms
	return filepath.ToSlash(targetPath), nil
}
