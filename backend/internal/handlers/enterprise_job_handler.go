package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"quickwork.local/backend/internal/dto/request"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
)

type EnterpriseJobHandler struct {
	jobRepo  repositories.JobRepository
	validate *validator.Validate
}

func NewEnterpriseJobHandler(jobRepo repositories.JobRepository) *EnterpriseJobHandler {
	return &EnterpriseJobHandler{
		jobRepo:  jobRepo,
		validate: validator.New(),
	}
}

func (h *EnterpriseJobHandler) CreateJob(c *fiber.Ctx) error {
	enterpriseID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	var req request.CreateJobRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	if err := h.validate.Struct(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	status := models.JobDraft
	if req.Status == string(models.JobPending) {
		status = models.JobPending
	}

	job := &models.Job{
		EnterpriseID: enterpriseID,
		Title:        req.Title,
		Description:  req.Description,
		Requirements: req.Requirements,
		Salary:       req.Salary,
		Location:     req.Location,
		Slots:        req.Slots,
		Status:       status,
	}

	if err := h.jobRepo.Create(job); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not create job",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

func (h *EnterpriseJobHandler) ListJobs(c *fiber.Ctx) error {
	enterpriseID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	status := c.Query("status")
	jobs, err := h.jobRepo.FindByEnterprise(enterpriseID, status)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not fetch jobs",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    jobs,
	})
}

func (h *EnterpriseJobHandler) UpdateJob(c *fiber.Ctx) error {
	enterpriseID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	idParam := c.Params("id")
	jobID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid job ID",
		})
	}

	var req request.UpdateJobRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	job, err := h.jobRepo.FindByID(uint(jobID))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Job not found",
		})
	}

	if job.EnterpriseID != enterpriseID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Permission denied",
		})
	}

	if req.Title != "" {
		job.Title = req.Title
	}
	if req.Description != "" {
		job.Description = req.Description
	}
	if req.Requirements != "" {
		job.Requirements = req.Requirements
	}
	if req.Salary != "" {
		job.Salary = req.Salary
	}
	if req.Location != "" {
		job.Location = req.Location
	}
	if req.Slots > 0 {
		job.Slots = req.Slots
	}
	if req.Status != "" {
		job.Status = models.JobStatus(req.Status)
	}

	if err := h.jobRepo.Update(job); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not update job",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

func (h *EnterpriseJobHandler) DeleteJob(c *fiber.Ctx) error {
	enterpriseID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	idParam := c.Params("id")
	jobID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid job ID",
		})
	}

	job, err := h.jobRepo.FindByID(uint(jobID))
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Job not found",
		})
	}

	if job.EnterpriseID != enterpriseID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Permission denied",
		})
	}

	job.Status = models.JobClosed
	if err := h.jobRepo.Update(job); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not close job",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Job closed successfully",
	})
}
