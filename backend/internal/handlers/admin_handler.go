package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type AdminHandler struct {
	db *gorm.DB
}

type adminUserQuery struct {
	role   string
	status string
	search string
}

type updateUserRequest struct {
	Email             *string                         `json:"email"`
	Status            *string                         `json:"status"`
	StudentProfile    *updateStudentProfileRequest    `json:"student_profile"`
	EnterpriseProfile *updateEnterpriseProfileRequest `json:"enterprise_profile"`
}

type updateStudentProfileRequest struct {
	Name   *string `json:"name"`
	Phone  *string `json:"phone"`
	Avatar *string `json:"avatar"`
	CVURL  *string `json:"cv_url"`
}

type updateEnterpriseProfileRequest struct {
	CompanyName *string `json:"company_name"`
	TaxCode     *string `json:"tax_code"`
	GPKDURL     *string `json:"gpkd_url"`
	KYBStatus   *string `json:"kyb_status"`
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{
		db: db,
	}
}

func (h *AdminHandler) ListUsers(c *fiber.Ctx) error {
	users, err := h.findUsers(adminUserQuery{
		role:   strings.ToUpper(strings.TrimSpace(c.Query("role"))),
		status: strings.ToUpper(strings.TrimSpace(c.Query("status"))),
		search: strings.TrimSpace(c.Query("q")),
	})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch users: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    users,
	})
}

func (h *AdminHandler) ListStudents(c *fiber.Ctx) error {
	users, err := h.findUsers(adminUserQuery{
		role:   string(models.RoleStudent),
		status: strings.ToUpper(strings.TrimSpace(c.Query("status"))),
		search: strings.TrimSpace(c.Query("q")),
	})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch students: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    users,
	})
}

func (h *AdminHandler) ListEnterprises(c *fiber.Ctx) error {
	users, err := h.findUsers(adminUserQuery{
		role:   string(models.RoleEnterprise),
		status: strings.ToUpper(strings.TrimSpace(c.Query("status"))),
		search: strings.TrimSpace(c.Query("q")),
	})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch enterprises: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    users,
	})
}

func (h *AdminHandler) UpdateUserStatus(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid user ID",
		})
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	status := models.UserStatus(strings.ToUpper(strings.TrimSpace(req.Status)))
	if status != models.UserStatusActive && status != models.UserStatusInactive && status != models.UserStatusBanned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Status must be ACTIVE, INACTIVE or BANNED",
		})
	}

	var user models.User
	if err := h.db.First(&user, uint(userID)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "User not found",
		})
	}

	if user.Role == models.RoleAdmin {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Admin account status is protected",
		})
	}

	user.Status = status
	if err := h.db.Save(&user).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update user status",
		})
	}

	if err := h.db.Preload("StudentProfile.Skills").Preload("EnterpriseProfile").First(&user, user.ID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to reload user",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

func (h *AdminHandler) UpdateUser(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid user ID",
		})
	}

	var req updateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	var user models.User
	if err := h.db.Preload("StudentProfile.Skills").Preload("EnterpriseProfile").First(&user, uint(userID)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "User not found",
		})
	}

	tx := h.db.Begin()
	if tx.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not start update transaction",
		})
	}

	if req.Email != nil {
		email := strings.TrimSpace(*req.Email)
		if email == "" {
			tx.Rollback()
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Email is required",
			})
		}

		if !strings.EqualFold(email, user.Email) {
			var count int64
			if err := tx.Model(&models.User{}).
				Where("LOWER(email) = ? AND id <> ?", strings.ToLower(email), user.ID).
				Count(&count).Error; err != nil {
				tx.Rollback()
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Failed to check email",
				})
			}
			if count > 0 {
				tx.Rollback()
				return c.Status(http.StatusConflict).JSON(fiber.Map{
					"success": false,
					"message": "Email already exists",
				})
			}
		}

		user.Email = email
	}

	if req.Status != nil {
		status := models.UserStatus(strings.ToUpper(strings.TrimSpace(*req.Status)))
		if status != models.UserStatusActive && status != models.UserStatusInactive && status != models.UserStatusBanned {
			tx.Rollback()
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Status must be ACTIVE, INACTIVE or BANNED",
			})
		}
		if user.Role == models.RoleAdmin && status != user.Status {
			tx.Rollback()
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Admin account status is protected",
			})
		}
		user.Status = status
	}

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update user",
		})
	}

	if req.StudentProfile != nil {
		if user.Role != models.RoleStudent {
			tx.Rollback()
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "User is not a student account",
			})
		}
		if err := h.updateStudentProfile(tx, &user, req.StudentProfile); err != nil {
			tx.Rollback()
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}
	}

	if req.EnterpriseProfile != nil {
		if user.Role != models.RoleEnterprise {
			tx.Rollback()
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "User is not an enterprise account",
			})
		}
		if err := h.updateEnterpriseProfile(tx, &user, req.EnterpriseProfile); err != nil {
			tx.Rollback()
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to commit user update",
		})
	}

	if err := h.db.Preload("StudentProfile.Skills").Preload("EnterpriseProfile").First(&user, user.ID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to reload user",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

func (h *AdminHandler) UpdateEnterpriseKYB(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid enterprise ID",
		})
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	status := models.KYBStatus(strings.ToUpper(strings.TrimSpace(req.Status)))
	if status != models.KYBPending && status != models.KYBApproved && status != models.KYBRejected {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "KYB status must be PENDING, APPROVED or REJECTED",
		})
	}

	var profile models.EnterpriseProfile
	if err := h.db.Where("user_id = ?", uint(userID)).First(&profile).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Enterprise profile not found",
		})
	}

	if status == models.KYBApproved && strings.TrimSpace(profile.GPKDURL) == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Cannot approve enterprise without business license",
		})
	}

	profile.KYBStatus = status
	profile.StatusKYB = status
	if err := h.db.Save(&profile).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update KYB status",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    profile,
	})
}

func (h *AdminHandler) RequestEnterpriseGPKD(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid enterprise ID",
		})
	}

	adminID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	var user models.User
	if err := h.db.Preload("EnterpriseProfile").First(&user, uint(userID)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Enterprise not found",
		})
	}

	if user.Role != models.RoleEnterprise || user.EnterpriseProfile == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "User is not an enterprise account",
		})
	}

	if strings.TrimSpace(user.EnterpriseProfile.GPKDURL) != "" {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Enterprise already has business license",
		})
	}

	content := "Vui lòng bổ sung giấy phép kinh doanh để tài khoản doanh nghiệp được xét duyệt và sử dụng đầy đủ chức năng."
	notification := models.Notification{
		UserID:  uint(userID),
		Type:    models.NotificationWarning,
		Title:   "Yêu cầu nộp giấy phép kinh doanh",
		Content: content,
	}
	message := models.Message{
		SenderID:   adminID,
		ReceiverID: uint(userID),
		Content:    content,
	}

	tx := h.db.Begin()
	if err := tx.Create(&notification).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create notification",
		})
	}
	if err := tx.Create(&message).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create message",
		})
	}
	if err := tx.Commit().Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to send request",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Business license request sent",
		"data": fiber.Map{
			"notification": notification,
			"message":      message,
		},
	})
}

func (h *AdminHandler) ListJobs(c *fiber.Ctx) error {
	var jobs []models.Job
	status := strings.ToUpper(strings.TrimSpace(c.Query("status")))
	query := h.db.Model(&models.Job{}).Preload("EnterpriseProfile")

	if status != "" {
		query = query.Where("UPPER(status) = ?", status)
	}

	if err := query.Order("created_at DESC").Find(&jobs).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch jobs: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    jobs,
	})
}

func (h *AdminHandler) ListRecentUsers(c *fiber.Ctx) error {
	limit, err := strconv.Atoi(c.Query("limit", "5"))
	if err != nil || limit <= 0 {
		limit = 5
	}
	if limit > 20 {
		limit = 20
	}

	var users []models.User
	if err := h.db.
		Preload("StudentProfile").
		Preload("EnterpriseProfile").
		Order("created_at DESC").
		Limit(limit).
		Find(&users).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch recent users: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    users,
	})
}

func (h *AdminHandler) ReviewJob(c *fiber.Ctx) error {
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
	req.Status = strings.ToUpper(strings.TrimSpace(req.Status))
	req.RejectReason = strings.TrimSpace(req.RejectReason)

	if req.Status != "APPROVED" && req.Status != "REJECTED" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Status must be APPROVED or REJECTED",
		})
	}

	if req.Status == "REJECTED" && req.RejectReason == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Reject reason is required when status is REJECTED",
		})
	}

	var job models.Job
	if err := h.db.First(&job, uint(jobID)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Job not found",
		})
	}

	job.Status = models.JobStatus(req.Status)
	if req.Status == "REJECTED" {
		job.RejectReason = req.RejectReason
	} else {
		job.RejectReason = ""
	}

	if err := h.db.Save(&job).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update job status",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

func (h *AdminHandler) GetDashboardStats(c *fiber.Ctx) error {
	var totalStudents int64
	var totalEnterprises int64
	var activeJobs int64
	var pendingJobs int64

	if err := h.db.Model(&models.User{}).Where("role = ?", models.RoleStudent).Count(&totalStudents).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	if err := h.db.Model(&models.User{}).Where("role = ?", models.RoleEnterprise).Count(&totalEnterprises).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	if err := h.db.Model(&models.Job{}).Where("UPPER(status) = ?", models.JobApproved).Count(&activeJobs).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	if err := h.db.Model(&models.Job{}).Where("UPPER(status) = ?", models.JobPending).Count(&pendingJobs).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_students":    totalStudents,
			"total_enterprises": totalEnterprises,
			"active_jobs":       activeJobs,
			"pending_jobs":      pendingJobs,
		},
	})
}

func (h *AdminHandler) updateStudentProfile(tx *gorm.DB, user *models.User, req *updateStudentProfileRequest) error {
	profile := user.StudentProfile
	if profile == nil {
		profile = &models.StudentProfile{UserID: user.ID}
		if req.Name == nil || strings.TrimSpace(*req.Name) == "" {
			return errors.New("student name is required when creating profile")
		}
	}

	if req.Name != nil {
		name := strings.TrimSpace(*req.Name)
		if name == "" {
			return errors.New("student name is required")
		}
		profile.Name = name
	}
	if req.Phone != nil {
		profile.Phone = strings.TrimSpace(*req.Phone)
	}
	if req.Avatar != nil {
		profile.Avatar = strings.TrimSpace(*req.Avatar)
	}
	if req.CVURL != nil {
		profile.CVURL = strings.TrimSpace(*req.CVURL)
	}

	if err := tx.Save(profile).Error; err != nil {
		return errors.New("failed to update student profile")
	}

	return nil
}

func (h *AdminHandler) updateEnterpriseProfile(tx *gorm.DB, user *models.User, req *updateEnterpriseProfileRequest) error {
	profile := user.EnterpriseProfile
	if profile == nil {
		profile = &models.EnterpriseProfile{
			UserID:    user.ID,
			KYBStatus: models.KYBPending,
			StatusKYB: models.KYBPending,
		}
		if req.CompanyName == nil || strings.TrimSpace(*req.CompanyName) == "" {
			return errors.New("company name is required when creating profile")
		}
	}

	if req.CompanyName != nil {
		companyName := strings.TrimSpace(*req.CompanyName)
		if companyName == "" {
			return errors.New("company name is required")
		}
		profile.CompanyName = companyName
	}
	if req.TaxCode != nil {
		taxCode := strings.TrimSpace(*req.TaxCode)
		if taxCode == "" {
			return errors.New("tax code is required")
		}
		if !strings.EqualFold(taxCode, profile.TaxCode) {
			var count int64
			if err := tx.Model(&models.EnterpriseProfile{}).
				Where("tax_code = ? AND user_id <> ?", taxCode, user.ID).
				Count(&count).Error; err != nil {
				return errors.New("failed to check tax code")
			}
			if count > 0 {
				return errors.New("tax code already exists")
			}
		}
		profile.TaxCode = taxCode
	}
	if req.GPKDURL != nil {
		profile.GPKDURL = strings.TrimSpace(*req.GPKDURL)
	}
	if req.KYBStatus != nil {
		status := models.KYBStatus(strings.ToUpper(strings.TrimSpace(*req.KYBStatus)))
		if status != models.KYBPending && status != models.KYBApproved && status != models.KYBRejected {
			return errors.New("KYB status must be PENDING, APPROVED or REJECTED")
		}
		profile.KYBStatus = status
		profile.StatusKYB = status
	}

	kybStatus := profile.KYBStatus
	if kybStatus == "" {
		kybStatus = profile.StatusKYB
	}
	if kybStatus == models.KYBApproved && strings.TrimSpace(profile.GPKDURL) == "" {
		return errors.New("cannot approve enterprise without business license")
	}

	if err := tx.Save(profile).Error; err != nil {
		return errors.New("failed to update enterprise profile")
	}

	return nil
}

func (h *AdminHandler) findUsers(filters adminUserQuery) ([]models.User, error) {
	var users []models.User
	query := h.db.Model(&models.User{}).
		Preload("StudentProfile.Skills").
		Preload("EnterpriseProfile")

	if filters.role != "" && filters.role != "ALL" {
		query = query.Where("users.role = ?", filters.role)
	}
	if filters.status != "" && filters.status != "ALL" {
		query = query.Where("users.status = ?", filters.status)
	}
	if filters.search != "" {
		search := "%" + strings.ToLower(filters.search) + "%"
		query = query.
			Joins("LEFT JOIN student_profiles ON student_profiles.user_id = users.id").
			Joins("LEFT JOIN enterprise_profiles ON enterprise_profiles.user_id = users.id").
			Where(
				"LOWER(users.email) LIKE ? OR LOWER(student_profiles.name) LIKE ? OR LOWER(student_profiles.phone) LIKE ? OR LOWER(enterprise_profiles.company_name) LIKE ? OR LOWER(enterprise_profiles.tax_code) LIKE ?",
				search,
				search,
				search,
				search,
				search,
			)
	}

	err := query.Order("CASE WHEN users.role = 'ADMIN' THEN 0 ELSE 1 END, users.created_at DESC").Find(&users).Error
	return users, err
}
