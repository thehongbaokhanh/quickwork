// Package pagination parses request pagination query parameters.
package pagination

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

const (
	defaultPage  = 1
	defaultLimit = 10
	maxLimit     = 100
)

// Params contains offset-pagination calculation results.
type Params struct {
	Page   int `json:"page"`
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

// GetParams extracts page and limit query variables, validating and bounding them.
func GetParams(c *fiber.Ctx) Params {
	pageStr := c.Query("page", strconv.Itoa(defaultPage))
	limitStr := c.Query("limit", strconv.Itoa(defaultLimit))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = defaultPage
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = defaultLimit
	}

	if limit > maxLimit {
		limit = maxLimit
	}

	offset := (page - 1) * limit

	return Params{
		Page:   page,
		Limit:  limit,
		Offset: offset,
	}
}
