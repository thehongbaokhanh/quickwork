package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"quickwork.local/backend/internal/models"
)

type StudentJobHandler struct {
	db *gorm.DB
}

func NewStudentJobHandler(db *gorm.DB) *StudentJobHandler {
	return &StudentJobHandler{db: db}
}

func (h *StudentJobHandler) ApplyJob(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	jobID, err := parseJobID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid job ID",
		})
	}

	if err := h.ensureApprovedJob(jobID); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tin tuyển dụng không còn khả dụng.",
		})
	}

	var existing models.JobApplication
	err = h.db.Where("student_id = ? AND job_id = ?", studentID, jobID).First(&existing).Error
	if err == nil {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Bạn đã ứng tuyển tin này.",
			"data":    existing,
		})
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể kiểm tra trạng thái ứng tuyển.",
		})
	}

	application := models.JobApplication{
		StudentID: studentID,
		JobID:     jobID,
		Status:    models.JobApplicationApplied,
	}

	if err := h.db.Create(&application).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể ứng tuyển tin này.",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Ứng tuyển thành công.",
		"data":    application,
	})
}

func (h *StudentJobHandler) ListAppliedJobs(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	var applications []models.JobApplication
	if err := h.db.
		Preload("Job").
		Preload("Job.EnterpriseProfile").
		Preload("Job.Skills").
		Where("student_id = ?", studentID).
		Order("created_at DESC").
		Find(&applications).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải danh sách đã ứng tuyển.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    applications,
	})
}

func (h *StudentJobHandler) SaveFavoriteJob(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	jobID, err := parseJobID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid job ID",
		})
	}

	if err := h.ensureApprovedJob(jobID); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tin tuyển dụng không còn khả dụng.",
		})
	}

	var existing models.FavoriteJob
	err = h.db.Where("student_id = ? AND job_id = ?", studentID, jobID).First(&existing).Error
	if err == nil {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Tin đã có trong danh sách yêu thích.",
			"data":    existing,
		})
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể kiểm tra trạng thái yêu thích.",
		})
	}

	favorite := models.FavoriteJob{
		StudentID: studentID,
		JobID:     jobID,
	}

	if err := h.db.Create(&favorite).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể lưu tin yêu thích.",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Đã lưu tin yêu thích.",
		"data":    favorite,
	})
}

func (h *StudentJobHandler) RemoveFavoriteJob(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	jobID, err := parseJobID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid job ID",
		})
	}

	if err := h.db.Where("student_id = ? AND job_id = ?", studentID, jobID).Delete(&models.FavoriteJob{}).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể bỏ yêu thích tin này.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã bỏ tin khỏi danh sách yêu thích.",
	})
}

func (h *StudentJobHandler) ListFavoriteJobs(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	var favorites []models.FavoriteJob
	if err := h.db.
		Preload("Job").
		Preload("Job.EnterpriseProfile").
		Preload("Job.Skills").
		Where("student_id = ?", studentID).
		Order("created_at DESC").
		Find(&favorites).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải danh sách yêu thích.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    favorites,
	})
}

func (h *StudentJobHandler) GetJobActions(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	var appliedJobIDs []uint
	if err := h.db.Model(&models.JobApplication{}).
		Where("student_id = ?", studentID).
		Pluck("job_id", &appliedJobIDs).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải trạng thái ứng tuyển.",
		})
	}

	var favoriteJobIDs []uint
	if err := h.db.Model(&models.FavoriteJob{}).
		Where("student_id = ?", studentID).
		Pluck("job_id", &favoriteJobIDs).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải trạng thái yêu thích.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"applied_job_ids":  appliedJobIDs,
			"favorite_job_ids": favoriteJobIDs,
		},
	})
}

func (h *StudentJobHandler) ensureApprovedJob(jobID uint) error {
	var job models.Job
	return h.db.Where("id = ? AND status = ? AND slots > 0", jobID, models.JobApproved).First(&job).Error
}

func parseJobID(c *fiber.Ctx) (uint, error) {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}
