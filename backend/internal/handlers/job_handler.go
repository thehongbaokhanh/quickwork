package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/services"
)

type JobHandler struct {
	jobService services.JobService
	validate   *validator.Validate
}

func NewJobHandler(jobService services.JobService) *JobHandler {
	return &JobHandler{
		jobService: jobService,
		validate:   validator.New(),
	}
}

func (h *JobHandler) CreateJob(c *fiber.Ctx) error {
	var req services.CreateJobDTO
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	userIDLocal := c.Locals("user_id")
	var enterpriseID uint
	if val, ok := userIDLocal.(float64); ok {
		enterpriseID = uint(val)
	} else if val, ok := userIDLocal.(uint); ok {
		enterpriseID = val
	} else {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized: invalid user ID type",
		})
	}

	if err := h.jobService.CreateJob(enterpriseID, req); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Job created successfully",
	})
}

func (h *JobHandler) GetDashboardStats(c *fiber.Ctx) error {
	stats, err := h.jobService.GetDashboardStats()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

func (h *JobHandler) GetPendingJobs(c *fiber.Ctx) error {
	jobs, err := h.jobService.GetAdminPendingJobs()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    jobs,
	})
}

func (h *JobHandler) ReviewJob(c *fiber.Ctx) error {
	idParam := c.Params("id")
	jobID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid job ID",
		})
	}

	var req struct {
		Status       string `json:"status"`
		RejectReason string `json:"reject_reason"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	if err := h.jobService.ReviewJob(uint(jobID), req.Status, req.RejectReason); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Job reviewed successfully",
	})
}
