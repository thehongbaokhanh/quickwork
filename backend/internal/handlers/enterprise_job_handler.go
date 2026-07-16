package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/dto/request"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
)

type EnterpriseJobHandler struct {
	jobRepo  repositories.JobRepository
	db       *gorm.DB
	validate *validator.Validate
}

func NewEnterpriseJobHandler(jobRepo repositories.JobRepository, db *gorm.DB) *EnterpriseJobHandler {
	return &EnterpriseJobHandler{
		jobRepo:  jobRepo,
		db:       db,
		validate: validator.New(),
	}
}

type reviewApplicationRequest struct {
	Status       string `json:"status"`
	EmployerNote string `json:"employer_note"`
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
	switch strings.ToUpper(strings.TrimSpace(req.Status)) {
	case "", string(models.JobDraft):
		status = models.JobDraft
	case string(models.JobPending):
		status = models.JobPending
	default:
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Status must be DRAFT or PENDING",
		})
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
			"message": "Could not create job: " + err.Error(),
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

func (h *EnterpriseJobHandler) ListApplications(c *fiber.Ctx) error {
	enterpriseID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	query := h.db.Model(&models.JobApplication{}).
		Preload("Job").
		Preload("Student").
		Preload("Student.StudentProfile").
		Preload("Student.StudentProfile.Skills").
		Joins("JOIN jobs ON jobs.id = job_applications.job_id").
		Where("jobs.enterprise_id = ?", enterpriseID)

	if status := strings.ToUpper(strings.TrimSpace(c.Query("status"))); status != "" {
		query = query.Where("job_applications.status = ?", status)
	}

	if rawJobID := strings.TrimSpace(c.Query("job_id")); rawJobID != "" {
		jobID, err := strconv.ParseUint(rawJobID, 10, 32)
		if err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid job ID",
			})
		}
		query = query.Where("job_applications.job_id = ?", uint(jobID))
	}

	var applications []models.JobApplication
	if err := query.Order("job_applications.created_at DESC").Find(&applications).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải danh sách ứng viên.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    applications,
	})
}

func (h *EnterpriseJobHandler) ReviewApplication(c *fiber.Ctx) error {
	enterpriseID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	idParam := c.Params("id")
	applicationID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid application ID",
		})
	}

	var req reviewApplicationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	status := models.JobApplicationStatus(strings.ToUpper(strings.TrimSpace(req.Status)))
	if status != models.JobApplicationAccepted && status != models.JobApplicationRejected {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Status must be ACCEPTED or REJECTED",
		})
	}

	var application models.JobApplication
	if err := h.db.Preload("Job").First(&application, uint(applicationID)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy đơn ứng tuyển.",
		})
	}

	if application.Job == nil || application.Job.EnterpriseID != enterpriseID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Bạn không có quyền xử lý đơn ứng tuyển này.",
		})
	}

	now := time.Now()
	application.Status = status
	application.EmployerNote = strings.TrimSpace(req.EmployerNote)
	application.ReviewedAt = &now

	if err := h.db.Save(&application).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể cập nhật đơn ứng tuyển.",
		})
	}

	if err := h.db.
		Preload("Job").
		Preload("Student").
		Preload("Student.StudentProfile").
		Preload("Student.StudentProfile.Skills").
		First(&application, application.ID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Đã cập nhật nhưng không thể tải lại đơn ứng tuyển.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã cập nhật trạng thái đơn ứng tuyển.",
		"data":    application,
	})
}

func (h *EnterpriseJobHandler) ListPublicJobs(c *fiber.Ctx) error {
	filters := map[string]any{
		"status": models.JobApproved,
	}

	if q := strings.TrimSpace(c.Query("q")); q != "" {
		filters["q"] = q
	}
	if location := strings.TrimSpace(c.Query("location")); location != "" {
		filters["location"] = location
	}
	if salary := strings.TrimSpace(c.Query("salary")); salary != "" {
		filters["salary"] = salary
	}

	jobs, err := h.jobRepo.FindJobs(filters)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not fetch public jobs",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    jobs,
	})
}

func (h *EnterpriseJobHandler) GetPublicJob(c *fiber.Ctx) error {
	idParam := c.Params("id")
	jobID, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid job ID",
		})
	}

	job, err := h.jobRepo.FindByID(uint(jobID))
	if err != nil || job.Status != models.JobApproved {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Job not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    job,
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
