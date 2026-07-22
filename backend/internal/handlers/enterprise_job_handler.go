package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

type scheduleInterviewRequest struct {
	InterviewAt       string `json:"interview_at"`
	InterviewMethod   string `json:"interview_method"`
	InterviewLocation string `json:"interview_location"`
	InterviewNote     string `json:"interview_note"`
}

type interviewResultRequest struct {
	Result     string `json:"result"`
	ResultNote string `json:"result_note"`
}

func parseInterviewTime(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return time.Time{}, fmt.Errorf("empty interview time")
	}

	rfcLayouts := []string{time.RFC3339Nano, time.RFC3339}
	for _, layout := range rfcLayouts {
		if parsed, err := time.Parse(layout, value); err == nil {
			return parsed, nil
		}
	}

	localLayouts := []string{"2006-01-02T15:04", "2006-01-02T15:04:05", "2006-01-02 15:04"}
	for _, layout := range localLayouts {
		if parsed, err := time.ParseInLocation(layout, value, time.Local); err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("invalid interview time")
}

func buildInterviewNotificationContent(application models.JobApplication, interviewAt time.Time, method string, location string, note string) string {
	jobTitle := "vị trí ứng tuyển"
	if application.Job != nil && strings.TrimSpace(application.Job.Title) != "" {
		jobTitle = application.Job.Title
	}

	parts := []string{
		fmt.Sprintf("Bạn có lịch phỏng vấn cho %s vào %s.", jobTitle, interviewAt.Format("15:04 02/01/2006")),
		"Hình thức: " + method + ".",
	}
	if location != "" {
		parts = append(parts, "Địa điểm/Link: "+location+".")
	}
	if note != "" {
		parts = append(parts, "Ghi chú: "+note)
	}

	return strings.Join(parts, "\n")
}

func parseInterviewResult(value string) (models.InterviewResult, bool) {
	result := models.InterviewResult(strings.ToUpper(strings.TrimSpace(value)))
	switch result {
	case models.InterviewResultHired, models.InterviewResultRejected, models.InterviewResultNoShow:
		return result, true
	default:
		return "", false
	}
}

func getInterviewResultLabel(result models.InterviewResult) string {
	switch result {
	case models.InterviewResultHired:
		return "Được nhận"
	case models.InterviewResultRejected:
		return "Không nhận"
	case models.InterviewResultNoShow:
		return "Không đến phỏng vấn"
	default:
		return "Chưa cập nhật"
	}
}

func buildInterviewResultNotification(application models.JobApplication, result models.InterviewResult, note string) models.Notification {
	jobTitle := "vị trí ứng tuyển"
	if application.Job != nil && strings.TrimSpace(application.Job.Title) != "" {
		jobTitle = application.Job.Title
	}

	title := "Cập nhật kết quả phỏng vấn"
	if result == models.InterviewResultHired {
		title = "Chúc mừng, bạn đã được nhận"
	}

	parts := []string{
		fmt.Sprintf("Kết quả phỏng vấn cho %s: %s.", jobTitle, getInterviewResultLabel(result)),
	}
	if note != "" {
		parts = append(parts, "Ghi chú: "+note)
	}

	notificationType := models.NotificationInfo
	if result == models.InterviewResultRejected || result == models.InterviewResultNoShow {
		notificationType = models.NotificationWarning
	}

	return models.Notification{
		UserID:  application.StudentID,
		Type:    notificationType,
		Title:   title,
		Content: strings.Join(parts, "\n"),
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

func (h *EnterpriseJobHandler) ScheduleInterview(c *fiber.Ctx) error {
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

	var req scheduleInterviewRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	interviewAt, err := parseInterviewTime(req.InterviewAt)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Thời gian phỏng vấn không hợp lệ.",
		})
	}

	method := strings.TrimSpace(req.InterviewMethod)
	if method == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Vui lòng chọn hình thức phỏng vấn.",
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
			"message": "Bạn không có quyền đặt lịch cho đơn ứng tuyển này.",
		})
	}

	if application.Status != models.JobApplicationAccepted {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Chỉ có thể đặt lịch phỏng vấn cho ứng viên đã được duyệt.",
		})
	}

	location := strings.TrimSpace(req.InterviewLocation)
	note := strings.TrimSpace(req.InterviewNote)
	now := time.Now()

	application.InterviewAt = &interviewAt
	application.InterviewMethod = method
	application.InterviewLocation = location
	application.InterviewNote = note
	application.InterviewScheduledAt = &now

	tx := h.db.Begin()
	if tx.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể bắt đầu giao dịch đặt lịch.",
		})
	}

	if err := tx.Save(&application).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể lưu lịch phỏng vấn.",
		})
	}

	notification := models.Notification{
		UserID:  application.StudentID,
		Type:    models.NotificationInfo,
		Title:   "Lịch phỏng vấn mới",
		Content: buildInterviewNotificationContent(application, interviewAt, method, location, note),
	}
	if err := tx.Create(&notification).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tạo thông báo phỏng vấn.",
		})
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể hoàn tất đặt lịch phỏng vấn.",
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
			"message": "Đã đặt lịch nhưng không thể tải lại đơn ứng tuyển.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã đặt lịch phỏng vấn cho ứng viên.",
		"data":    application,
	})
}

func (h *EnterpriseJobHandler) SubmitInterviewResult(c *fiber.Ctx) error {
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

	var req interviewResultRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	result, ok := parseInterviewResult(req.Result)
	if !ok {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kết quả phỏng vấn không hợp lệ.",
		})
	}

	resultNote := strings.TrimSpace(req.ResultNote)
	if result == models.InterviewResultRejected && resultNote == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Vui lòng nhập ghi chú lý do không nhận ứng viên.",
		})
	}

	now := time.Now()
	tx := h.db.Begin()
	if tx.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể bắt đầu giao dịch xử lý lịch phỏng vấn.",
		})
	}

	var application models.JobApplication
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Preload("Job").
		First(&application, uint(applicationID)).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy đơn ứng tuyển.",
		})
	}

	if application.Job == nil || application.Job.EnterpriseID != enterpriseID {
		tx.Rollback()
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Bạn không có quyền xử lý lịch phỏng vấn này.",
		})
	}

	if application.Status != models.JobApplicationAccepted {
		tx.Rollback()
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Chỉ có thể xử lý lịch phỏng vấn của ứng viên đã được duyệt.",
		})
	}

	if application.InterviewAt == nil {
		tx.Rollback()
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Đơn ứng tuyển này chưa có lịch phỏng vấn.",
		})
	}

	if now.Before(*application.InterviewAt) {
		tx.Rollback()
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Chỉ có thể cập nhật kết quả sau thời gian phỏng vấn.",
		})
	}

	if application.InterviewResult != "" {
		tx.Rollback()
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Lịch phỏng vấn này đã có kết quả.",
		})
	}

	if result == models.InterviewResultHired {
		var job models.Job
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&job, application.JobID).Error; err != nil {
			tx.Rollback()
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Không tìm thấy tin tuyển dụng.",
			})
		}

		if job.EnterpriseID != enterpriseID {
			tx.Rollback()
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Bạn không có quyền cập nhật tin tuyển dụng này.",
			})
		}

		if job.Slots <= 0 {
			tx.Rollback()
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Tin tuyển dụng đã hết số lượng tuyển dụng.",
			})
		}

		job.Slots--
		if job.Slots <= 0 {
			job.Status = models.JobClosed
		}

		if err := tx.Save(&job).Error; err != nil {
			tx.Rollback()
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Không thể cập nhật số lượng tuyển dụng.",
			})
		}
	}

	application.InterviewResult = result
	application.InterviewResultNote = resultNote
	application.InterviewResultAt = &now

	if err := tx.Save(&application).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể lưu kết quả phỏng vấn.",
		})
	}

	notification := buildInterviewResultNotification(application, result, resultNote)
	if err := tx.Create(&notification).Error; err != nil {
		tx.Rollback()
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tạo thông báo kết quả phỏng vấn.",
		})
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể hoàn tất xử lý kết quả phỏng vấn.",
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
			"message": "Đã cập nhật nhưng không thể tải lại lịch phỏng vấn.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã cập nhật kết quả phỏng vấn.",
		"data":    application,
	})
}

func (h *EnterpriseJobHandler) ListPublicJobs(c *fiber.Ctx) error {
	filters := map[string]any{
		"status":    models.JobApproved,
		"available": true,
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
	if err != nil || job.Status != models.JobApproved || job.Slots <= 0 {
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
