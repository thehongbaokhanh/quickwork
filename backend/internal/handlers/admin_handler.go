package handlers

import (
	"errors"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/services"
)

type AdminHandler struct {
	db                  *gorm.DB
	notificationService services.NotificationService
}

type adminUserQuery struct {
	role   string
	status string
	search string
}

type adminCategoryResponse struct {
	ID         uint                 `json:"id"`
	Name       string               `json:"name"`
	SkillCount int64                `json:"skill_count"`
	JobCount   int64                `json:"job_count"`
	Skills     []adminSkillResponse `json:"skills"`
	CreatedAt  time.Time            `json:"created_at"`
	UpdatedAt  time.Time            `json:"updated_at"`
}

type adminSkillResponse struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	JobCount int64  `json:"job_count"`
}

type reportCountItem struct {
	Label string  `json:"label"`
	Count int64   `json:"count"`
	Rate  float64 `json:"rate"`
}

type reportGrowthItem struct {
	Label        string `json:"label"`
	Users        int64  `json:"users"`
	Jobs         int64  `json:"jobs"`
	Applications int64  `json:"applications"`
}

type reportEnterpriseItem struct {
	Name             string  `json:"name"`
	JobCount         int64   `json:"job_count"`
	ApplicationCount int64   `json:"application_count"`
	ResponseRate     float64 `json:"response_rate"`
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
	CompanyName     *string `json:"company_name"`
	Phone           *string `json:"phone"`
	TaxCode         *string `json:"tax_code"`
	GPKDURL         *string `json:"gpkd_url"`
	LogoURL         *string `json:"logo_url"`
	CoverImageURL   *string `json:"cover_image_url"`
	Industry        *string `json:"industry"`
	CompanySize     *string `json:"company_size"`
	WorkModel       *string `json:"work_model"`
	KYBStatus       *string `json:"kyb_status"`
	KYBRejectReason *string `json:"kyb_reject_reason"`
}

func NewAdminHandler(db *gorm.DB, notificationService services.NotificationService) *AdminHandler {
	return &AdminHandler{
		db:                  db,
		notificationService: notificationService,
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
		Status       string `json:"status"`
		RejectReason string `json:"reject_reason"`
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
		Status       string `json:"status"`
		RejectReason string `json:"reject_reason"`
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

	tx := h.db.Begin()
	if tx.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not start KYB update transaction",
		})
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	rejectReason := strings.TrimSpace(req.RejectReason)
	if status == models.KYBRejected && rejectReason == "" {
		rejectReason = "Ho so xac minh doanh nghiep chua dat yeu cau. Vui long bo sung lai GPKD hoac thong tin phap ly."
	}

	profile.KYBStatus = status
	profile.StatusKYB = status
	if status == models.KYBRejected {
		profile.KYBRejectReason = rejectReason
	} else {
		profile.KYBRejectReason = ""
	}
	if err := tx.Save(&profile).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update KYB status",
		})
	}

	if h.notificationService != nil {
		sourceID := uint(userID)
		if _, err := h.notificationService.CreateTx(tx, services.CreateNotificationInput{
			UserID:     uint(userID),
			Type:       models.NotificationTypeKYB,
			Title:      kybNotificationTitle(status),
			Content:    kybNotificationContent(status, rejectReason),
			SourceType: "ENTERPRISE_PROFILE",
			SourceID:   &sourceID,
			ActionURL:  "/enterprise/settings",
		}); err != nil {
			tx.Rollback()
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to create KYB notification",
			})
		}
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to commit KYB status",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    profile,
	})
}

func kybNotificationTitle(status models.KYBStatus) string {
	switch status {
	case models.KYBApproved:
		return "Hồ sơ doanh nghiệp đã được duyệt"
	case models.KYBRejected:
		return "Hồ sơ KYB cần bổ sung"
	default:
		return "Hồ sơ KYB đang chờ duyệt"
	}
}

func kybNotificationContent(status models.KYBStatus, rejectReason string) string {
	switch status {
	case models.KYBApproved:
		return "Tài khoản doanh nghiệp của bạn đã được xác minh. Bạn có thể sử dụng đầy đủ các chức năng tuyển dụng."
	case models.KYBRejected:
		if strings.TrimSpace(rejectReason) != "" {
			return "Hồ sơ KYB cần bổ sung. Lý do: " + strings.TrimSpace(rejectReason)
		}
		return "Hồ sơ xác minh doanh nghiệp chưa đạt yêu cầu. Vui lòng kiểm tra lại giấy phép kinh doanh hoặc thông tin pháp lý trong trang cài đặt."
	default:
		return "Hồ sơ doanh nghiệp đang ở trạng thái chờ KYB. Nếu chưa nộp giấy phép kinh doanh, vui lòng bổ sung trong trang cài đặt."
	}
}

func (h *AdminHandler) RequestEnterpriseGPKD(c *fiber.Ctx) error {
	userID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid enterprise ID",
		})
	}

	if _, ok := c.Locals("user_id").(uint); !ok {
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

	tx := h.db.Begin()
	notification, err := h.notificationService.NotifyGPKDRequestedTx(tx, uint(userID))
	if err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create notification",
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

	rejectReason := ""
	if req.Status == "REJECTED" {
		rejectReason = req.RejectReason
	}

	reviewedAt := time.Now().UTC()
	result := h.db.Model(&models.Job{}).
		Where("id = ? AND status = ?", job.ID, models.JobPending).
		Updates(map[string]any{
			"status":        models.JobStatus(req.Status),
			"reject_reason": rejectReason,
			"reviewed_at":   reviewedAt,
		})
	if result.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update job status",
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(http.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Job is no longer pending review",
		})
	}
	if err := h.db.First(&job, job.ID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to reload job",
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

func (h *AdminHandler) GetReportsSummary(c *fiber.Ctx) error {
	period, start, buckets := buildReportPeriod(c.Query("period", "30d"), time.Now())

	var totalUsers, activeEnterprises, activeJobs, applications int64
	var approvedJobs, pendingJobs, rejectedJobs, closedJobs int64
	var reviewedApplications int64
	queries := []struct {
		query *gorm.DB
		value *int64
	}{
		{h.db.Model(&models.User{}), &totalUsers},
		{h.db.Model(&models.User{}).Where("role = ? AND status = ?", models.RoleEnterprise, models.UserStatusActive), &activeEnterprises},
		{h.db.Model(&models.Job{}).Where("status = ? AND slots > 0", models.JobApproved), &activeJobs},
		{h.db.Model(&models.JobApplication{}), &applications},
		{h.db.Model(&models.Job{}).Where("status = ?", models.JobApproved), &approvedJobs},
		{h.db.Model(&models.Job{}).Where("status = ?", models.JobPending), &pendingJobs},
		{h.db.Model(&models.Job{}).Where("status = ?", models.JobRejected), &rejectedJobs},
		{h.db.Model(&models.Job{}).Where("status = ?", models.JobClosed), &closedJobs},
		{h.db.Model(&models.JobApplication{}).Where("status <> ?", models.JobApplicationApplied), &reviewedApplications},
	}
	for _, item := range queries {
		if err := item.query.Count(item.value).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp báo cáo."})
		}
	}

	var roleRows []struct {
		Role  string
		Count int64
	}
	if err := h.db.Model(&models.User{}).Select("role, COUNT(*) AS count").Group("role").Scan(&roleRows).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp cơ cấu tài khoản."})
	}
	accountDistribution := make([]reportCountItem, 0, len(roleRows))
	for _, row := range roleRows {
		accountDistribution = append(accountDistribution, reportCountItem{Label: row.Role, Count: row.Count, Rate: percent(row.Count, totalUsers)})
	}

	growth, err := h.buildReportGrowth(start, buckets)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp tăng trưởng."})
	}
	topEnterprises, err := h.getTopEnterprises()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp doanh nghiệp."})
	}
	topCategories, err := h.getTopCategories()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp ngành nghề."})
	}
	topLocations, err := h.getTopLocations()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp địa điểm."})
	}
	completionRate, err := h.getStudentProfileCompletionRate()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp độ hoàn thiện hồ sơ."})
	}

	reviewedJobs := approvedJobs + rejectedJobs
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"period": period,
			"summary": fiber.Map{
				"total_users": totalUsers, "active_enterprises": activeEnterprises, "active_jobs": activeJobs,
				"applications": applications, "job_approval_rate": percent(approvedJobs, reviewedJobs),
				"application_response_rate": percent(reviewedApplications, applications),
			},
			"account_distribution": accountDistribution,
			"job_status_distribution": []reportCountItem{
				{Label: string(models.JobApproved), Count: approvedJobs, Rate: percent(approvedJobs, approvedJobs+pendingJobs+rejectedJobs+closedJobs)},
				{Label: string(models.JobPending), Count: pendingJobs, Rate: percent(pendingJobs, approvedJobs+pendingJobs+rejectedJobs+closedJobs)},
				{Label: string(models.JobRejected), Count: rejectedJobs, Rate: percent(rejectedJobs, approvedJobs+pendingJobs+rejectedJobs+closedJobs)},
				{Label: string(models.JobClosed), Count: closedJobs, Rate: percent(closedJobs, approvedJobs+pendingJobs+rejectedJobs+closedJobs)},
			},
			"growth": growth, "top_enterprises": topEnterprises, "top_categories": topCategories,
			"top_locations": topLocations, "profile_completion_rate": completionRate,
		},
	})
}

func (h *AdminHandler) ListCategories(c *fiber.Ctx) error {
	var categories []models.Category
	query := h.db.Model(&models.Category{}).Preload("Skills").Order("name ASC")
	if search := strings.TrimSpace(c.Query("q")); search != "" {
		query = query.Where("LOWER(name) LIKE ?", "%"+strings.ToLower(search)+"%")
	}
	if err := query.Find(&categories).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tải danh mục."})
	}

	var skillJobRows []struct {
		SkillID  uint
		JobCount int64
	}
	if err := h.db.Table("job_skills").Select("skill_id, COUNT(DISTINCT job_id) AS job_count").Group("skill_id").Scan(&skillJobRows).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tổng hợp kỹ năng."})
	}
	jobCounts := make(map[uint]int64, len(skillJobRows))
	for _, row := range skillJobRows {
		jobCounts[row.SkillID] = row.JobCount
	}

	items := make([]adminCategoryResponse, 0, len(categories))
	for _, category := range categories {
		item := adminCategoryResponse{ID: category.ID, Name: category.Name, SkillCount: int64(len(category.Skills)), CreatedAt: category.CreatedAt, UpdatedAt: category.UpdatedAt}
		for _, skill := range category.Skills {
			count := jobCounts[skill.ID]
			item.JobCount += count
			item.Skills = append(item.Skills, adminSkillResponse{ID: skill.ID, Name: skill.Name, JobCount: count})
		}
		items = append(items, item)
	}
	return c.JSON(fiber.Map{"success": true, "data": items})
}

func (h *AdminHandler) CreateCategory(c *fiber.Ctx) error {
	var req struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Dữ liệu danh mục không hợp lệ."})
	}
	name := strings.TrimSpace(req.Name)
	if name == "" || len(name) > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tên danh mục phải có từ 1 đến 100 ký tự."})
	}
	var count int64
	if err := h.db.Model(&models.Category{}).Where("LOWER(name) = ?", strings.ToLower(name)).Count(&count).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể kiểm tra danh mục."})
	}
	if count > 0 {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"success": false, "message": "Tên danh mục đã tồn tại."})
	}
	category := models.Category{Name: name}
	if err := h.db.Create(&category).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tạo danh mục."})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{"success": true, "message": "Đã tạo danh mục.", "data": category})
}

func (h *AdminHandler) UpdateCategory(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã danh mục không hợp lệ."})
	}
	var req struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Dữ liệu danh mục không hợp lệ."})
	}
	name := strings.TrimSpace(req.Name)
	if name == "" || len(name) > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tên danh mục phải có từ 1 đến 100 ký tự."})
	}
	var category models.Category
	if err := h.db.First(&category, uint(id)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy danh mục."})
	}
	var duplicate int64
	if err := h.db.Model(&models.Category{}).Where("LOWER(name) = ? AND id <> ?", strings.ToLower(name), category.ID).Count(&duplicate).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể kiểm tra danh mục."})
	}
	if duplicate > 0 {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"success": false, "message": "Tên danh mục đã tồn tại."})
	}
	category.Name = name
	if err := h.db.Save(&category).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể cập nhật danh mục."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã cập nhật danh mục.", "data": category})
}

func (h *AdminHandler) DeleteCategory(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã danh mục không hợp lệ."})
	}
	var category models.Category
	if err := h.db.First(&category, uint(id)).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy danh mục."})
	}
	var skillCount int64
	if err := h.db.Model(&models.Skill{}).Where("category_id = ?", category.ID).Count(&skillCount).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể kiểm tra danh mục."})
	}
	if skillCount > 0 {
		return c.Status(http.StatusConflict).JSON(fiber.Map{"success": false, "message": "Không thể xóa danh mục đang chứa kỹ năng."})
	}
	if err := h.db.Delete(&category).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể xóa danh mục."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã xóa danh mục."})
}

func (h *AdminHandler) buildReportGrowth(start time.Time, buckets []reportBucket) ([]reportGrowthItem, error) {
	type createdRow struct{ CreatedAt time.Time }
	load := func(model any) ([]time.Time, error) {
		var rows []createdRow
		if err := h.db.Model(model).Select("created_at").Where("created_at >= ?", start).Find(&rows).Error; err != nil {
			return nil, err
		}
		values := make([]time.Time, 0, len(rows))
		for _, row := range rows {
			values = append(values, row.CreatedAt)
		}
		return values, nil
	}
	users, err := load(&models.User{})
	if err != nil {
		return nil, err
	}
	jobs, err := load(&models.Job{})
	if err != nil {
		return nil, err
	}
	applications, err := load(&models.JobApplication{})
	if err != nil {
		return nil, err
	}
	result := make([]reportGrowthItem, len(buckets))
	for i, bucket := range buckets {
		result[i].Label = bucket.Label
	}
	assign := func(values []time.Time, field string) {
		for _, value := range values {
			for i, bucket := range buckets {
				if !value.Before(bucket.Start) && value.Before(bucket.End) {
					if field == "users" {
						result[i].Users++
					} else if field == "jobs" {
						result[i].Jobs++
					} else {
						result[i].Applications++
					}
					break
				}
			}
		}
	}
	assign(users, "users")
	assign(jobs, "jobs")
	assign(applications, "applications")
	return result, nil
}

func (h *AdminHandler) getTopEnterprises() ([]reportEnterpriseItem, error) {
	var rows []struct {
		Name                                      string
		JobCount, ApplicationCount, ReviewedCount int64
	}
	err := h.db.Table("enterprise_profiles ep").
		Select("ep.company_name AS name, COUNT(DISTINCT j.id) AS job_count, COUNT(ja.id) AS application_count, COALESCE(SUM(CASE WHEN ja.status <> 'APPLIED' THEN 1 ELSE 0 END), 0) AS reviewed_count").
		Joins("LEFT JOIN jobs j ON j.enterprise_id = ep.user_id").Joins("LEFT JOIN job_applications ja ON ja.job_id = j.id").
		Group("ep.user_id, ep.company_name").Order("application_count DESC, job_count DESC").Limit(5).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	items := make([]reportEnterpriseItem, 0, len(rows))
	for _, row := range rows {
		items = append(items, reportEnterpriseItem{Name: row.Name, JobCount: row.JobCount, ApplicationCount: row.ApplicationCount, ResponseRate: percent(row.ReviewedCount, row.ApplicationCount)})
	}
	return items, nil
}

func (h *AdminHandler) getTopCategories() ([]reportCountItem, error) {
	var rows []struct {
		Label string
		Count int64
	}
	err := h.db.Table("categories c").Select("c.name AS label, COUNT(DISTINCT js.job_id) AS count").
		Joins("LEFT JOIN skills s ON s.category_id = c.id").Joins("LEFT JOIN job_skills js ON js.skill_id = s.id").
		Group("c.id, c.name").Order("count DESC, c.name ASC").Limit(5).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	var total int64
	for _, row := range rows {
		total += row.Count
	}
	items := make([]reportCountItem, 0, len(rows))
	for _, row := range rows {
		items = append(items, reportCountItem{Label: row.Label, Count: row.Count, Rate: percent(row.Count, total)})
	}
	return items, nil
}

func (h *AdminHandler) getTopLocations() ([]reportCountItem, error) {
	var jobs []models.Job
	if err := h.db.Model(&models.Job{}).Select("location").Where("location <> ''").Find(&jobs).Error; err != nil {
		return nil, err
	}
	counts := map[string]int64{}
	for _, job := range jobs {
		counts[normalizeReportLocation(job.Location)]++
	}
	items := make([]reportCountItem, 0, len(counts))
	for label, count := range counts {
		items = append(items, reportCountItem{Label: label, Count: count})
	}
	sort.Slice(items, func(i, j int) bool {
		if items[i].Count == items[j].Count {
			return items[i].Label < items[j].Label
		}
		return items[i].Count > items[j].Count
	})
	if len(items) > 5 {
		items = items[:5]
	}
	var total int64
	for _, item := range items {
		total += item.Count
	}
	for i := range items {
		items[i].Rate = percent(items[i].Count, total)
	}
	return items, nil
}

func (h *AdminHandler) getStudentProfileCompletionRate() (float64, error) {
	var profiles []models.StudentProfile
	if err := h.db.Preload("Skills").Preload("WorkExperiences").Preload("Educations").Preload("Portfolios").Find(&profiles).Error; err != nil {
		return 0, err
	}
	if len(profiles) == 0 {
		return 0, nil
	}
	completed := 0
	for _, profile := range profiles {
		values := []bool{strings.TrimSpace(profile.Name) != "", strings.TrimSpace(profile.Phone) != "", strings.TrimSpace(profile.Avatar) != "", strings.TrimSpace(profile.PreferredLocation) != "", strings.TrimSpace(profile.Summary) != "", len(profile.Skills) > 0, len(profile.WorkExperiences) > 0, len(profile.Educations) > 0, strings.TrimSpace(profile.CVURL) != "", len(profile.Portfolios) > 0 || strings.TrimSpace(profile.PortfolioURL) != ""}
		for _, value := range values {
			if value {
				completed++
			}
		}
	}
	return percent(int64(completed), int64(len(profiles)*10)), nil
}

type reportBucket struct {
	Label      string
	Start, End time.Time
}

func buildReportPeriod(value string, now time.Time) (string, time.Time, []reportBucket) {
	period := strings.ToLower(strings.TrimSpace(value))
	if period != "7d" && period != "quarter" && period != "year" {
		period = "30d"
	}
	var start time.Time
	var count int
	var unit string
	switch period {
	case "7d":
		start = now.AddDate(0, 0, -6)
		count = 7
		unit = "day"
	case "quarter":
		start = now.AddDate(0, -2, 0)
		count = 3
		unit = "month"
	case "year":
		start = now.AddDate(0, -11, 0)
		count = 12
		unit = "month"
	default:
		start = now.AddDate(0, 0, -29)
		count = 6
		unit = "fiveDays"
	}
	start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, now.Location())
	buckets := make([]reportBucket, 0, count)
	for i := 0; i < count; i++ {
		var bucketStart, bucketEnd time.Time
		var label string
		if unit == "month" {
			bucketStart = time.Date(start.Year(), start.Month()+time.Month(i), 1, 0, 0, 0, 0, now.Location())
			bucketEnd = bucketStart.AddDate(0, 1, 0)
			label = bucketStart.Format("01/2006")
		} else {
			days := i
			if unit == "fiveDays" {
				days = i * 5
			}
			bucketStart = start.AddDate(0, 0, days)
			bucketEnd = bucketStart.AddDate(0, 0, map[bool]int{true: 5, false: 1}[unit == "fiveDays"])
			label = bucketStart.Format("02/01")
		}
		buckets = append(buckets, reportBucket{Label: label, Start: bucketStart, End: bucketEnd})
	}
	if len(buckets) > 0 {
		buckets[len(buckets)-1].End = now.Add(time.Second)
	}
	return period, start, buckets
}

func percent(value, total int64) float64 {
	if total <= 0 {
		return 0
	}
	result := float64(value) * 100 / float64(total)
	return float64(int(result*10+0.5)) / 10
}

func normalizeReportLocation(value string) string {
	parts := strings.Split(value, ",")
	label := strings.TrimSpace(parts[len(parts)-1])
	if label == "" {
		return "Chưa cập nhật"
	}
	lower := strings.ToLower(label)
	for _, prefix := range []string{"thành phố ", "tỉnh "} {
		if strings.HasPrefix(lower, prefix) {
			label = strings.TrimSpace(label[len(prefix):])
			break
		}
	}
	return label
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
	if req.Phone != nil {
		profile.Phone = strings.TrimSpace(*req.Phone)
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
	if req.LogoURL != nil {
		profile.LogoURL = strings.TrimSpace(*req.LogoURL)
	}
	if req.CoverImageURL != nil {
		profile.CoverImageURL = strings.TrimSpace(*req.CoverImageURL)
	}
	if req.Industry != nil {
		profile.Industry = strings.TrimSpace(*req.Industry)
	}
	if req.CompanySize != nil {
		profile.CompanySize = strings.TrimSpace(*req.CompanySize)
	}
	if req.WorkModel != nil {
		profile.WorkModel = strings.TrimSpace(*req.WorkModel)
	}
	if req.KYBStatus != nil {
		status := models.KYBStatus(strings.ToUpper(strings.TrimSpace(*req.KYBStatus)))
		if status != models.KYBPending && status != models.KYBApproved && status != models.KYBRejected {
			return errors.New("KYB status must be PENDING, APPROVED or REJECTED")
		}
		profile.KYBStatus = status
		profile.StatusKYB = status
	}
	if req.KYBRejectReason != nil {
		profile.KYBRejectReason = strings.TrimSpace(*req.KYBRejectReason)
	}

	kybStatus := profile.KYBStatus
	if kybStatus == "" {
		kybStatus = profile.StatusKYB
	}
	if kybStatus == models.KYBApproved && strings.TrimSpace(profile.GPKDURL) == "" {
		return errors.New("cannot approve enterprise without business license")
	}
	if kybStatus == models.KYBRejected && strings.TrimSpace(profile.KYBRejectReason) == "" {
		return errors.New("reject reason is required when KYB is REJECTED")
	}
	if kybStatus != models.KYBRejected {
		profile.KYBRejectReason = ""
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
				"LOWER(users.email) LIKE ? OR LOWER(student_profiles.name) LIKE ? OR LOWER(student_profiles.phone) LIKE ? OR LOWER(enterprise_profiles.company_name) LIKE ? OR LOWER(enterprise_profiles.phone) LIKE ? OR LOWER(enterprise_profiles.tax_code) LIKE ?",
				search,
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
