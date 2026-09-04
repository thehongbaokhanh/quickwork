package handlers

import (
	"errors"
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
	"quickwork.local/backend/internal/services"
)

type EnterpriseJobHandler struct {
	jobRepo             repositories.JobRepository
	db                  *gorm.DB
	validate            *validator.Validate
	notificationService services.NotificationService
	settingsService     *services.SystemSettingsService
}

func NewEnterpriseJobHandler(jobRepo repositories.JobRepository, db *gorm.DB, notificationService services.NotificationService, settingsService *services.SystemSettingsService) *EnterpriseJobHandler {
	return &EnterpriseJobHandler{
		jobRepo:             jobRepo,
		db:                  db,
		validate:            validator.New(),
		notificationService: notificationService,
		settingsService:     settingsService,
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

type createSkillRequest struct {
	Name         string `json:"name"`
	CategoryID   uint   `json:"category_id"`
	CategoryName string `json:"category_name"`
}

type updateEnterpriseAccountProfileRequest struct {
	CompanyName      string  `json:"company_name"`
	Phone            string  `json:"phone"`
	TaxCode          *string `json:"tax_code"`
	GPKDURL          string  `json:"gpkd_url"`
	LogoURL          *string `json:"logo_url"`
	CoverImageURL    *string `json:"cover_image_url"`
	Industry         *string `json:"industry"`
	CompanySize      *string `json:"company_size"`
	WorkModel        *string `json:"work_model"`
	RecruitmentLevel *string `json:"recruitment_level"`
	Description      *string `json:"description"`
	Address          *string `json:"address"`
	Country          *string `json:"country"`
	City             *string `json:"city"`
	District         *string `json:"district"`
	Ward             *string `json:"ward"`
	Latitude         *string `json:"latitude"`
	Longitude        *string `json:"longitude"`
}

var (
	errInvalidSkillIDs   = errors.New("invalid skill ids")
	errDraftLimitReached = errors.New("draft limit reached")
)

func uniqueSkillIDs(rawIDs []uint) []uint {
	seen := make(map[uint]struct{}, len(rawIDs))
	ids := make([]uint, 0, len(rawIDs))
	for _, id := range rawIDs {
		if id == 0 {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		ids = append(ids, id)
	}
	return ids
}

func loadSkillsByIDs(tx *gorm.DB, skillIDs []uint) ([]models.Skill, error) {
	ids := uniqueSkillIDs(skillIDs)
	if len(ids) == 0 {
		return []models.Skill{}, nil
	}

	var skills []models.Skill
	if err := tx.Preload("Category").Where("id IN ?", ids).Find(&skills).Error; err != nil {
		return nil, err
	}
	if len(skills) != len(ids) {
		return nil, errInvalidSkillIDs
	}
	return skills, nil
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

func isValidOptionalContactPhone(value string) bool {
	if value == "" {
		return true
	}
	if len(value) < 10 || len(value) > 11 {
		return false
	}
	for _, char := range value {
		if char < '0' || char > '9' {
			return false
		}
	}
	return true
}

func applyJobSubmissionTiming(job *models.Job, previousStatus models.JobStatus, submitted bool, pendingHours int, now time.Time) {
	if job == nil || !submitted {
		return
	}
	if pendingHours <= 0 {
		pendingHours = 48
	}

	now = now.UTC()
	if previousStatus != models.JobPending || job.SubmittedAt == nil {
		submittedAt := now
		job.SubmittedAt = &submittedAt
	}

	if job.Status == models.JobPending {
		if previousStatus != models.JobPending || job.ReviewDueAt == nil {
			reviewDueAt := now.Add(time.Duration(pendingHours) * time.Hour)
			job.ReviewDueAt = &reviewDueAt
		}
		job.ReviewedAt = nil
		job.RejectReason = ""
		return
	}

	if job.Status == models.JobApproved {
		reviewedAt := now
		job.ReviewedAt = &reviewedAt
		job.RejectReason = ""
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

func (h *EnterpriseJobHandler) GetProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	var user models.User
	if err := h.db.Preload("EnterpriseProfile").First(&user, userID).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy hồ sơ nhà tuyển dụng.",
		})
	}

	requireKYB := true
	if h.settingsService != nil {
		if snapshot, err := h.settingsService.Current(c.UserContext()); err == nil {
			requireKYB = snapshot.Settings.Registration.RequireKYB
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": struct {
			models.User
			EnterpriseRequireKYB bool `json:"enterprise_require_kyb"`
		}{
			User:                 user,
			EnterpriseRequireKYB: requireKYB,
		},
	})
}

func (h *EnterpriseJobHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	var req updateEnterpriseAccountProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	companyName := strings.TrimSpace(req.CompanyName)
	phone := strings.TrimSpace(req.Phone)
	gpkdURL := strings.TrimSpace(req.GPKDURL)
	if companyName == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Vui lòng nhập tên hiển thị doanh nghiệp.",
		})
	}
	if !isValidOptionalContactPhone(phone) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Số điện thoại liên hệ phải có từ 10 đến 11 chữ số.",
		})
	}

	var user models.User
	if err := h.db.Preload("EnterpriseProfile").First(&user, userID).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy hồ sơ nhà tuyển dụng.",
		})
	}
	if user.EnterpriseProfile == nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Hồ sơ doanh nghiệp chưa được khởi tạo.",
		})
	}

	user.EnterpriseProfile.CompanyName = companyName
	user.EnterpriseProfile.Phone = phone
	if req.TaxCode != nil {
		user.EnterpriseProfile.TaxCode = strings.TrimSpace(*req.TaxCode)
	}
	if req.LogoURL != nil {
		user.EnterpriseProfile.LogoURL = strings.TrimSpace(*req.LogoURL)
	}
	if req.CoverImageURL != nil {
		user.EnterpriseProfile.CoverImageURL = strings.TrimSpace(*req.CoverImageURL)
	}
	if req.Industry != nil {
		user.EnterpriseProfile.Industry = strings.TrimSpace(*req.Industry)
	}
	if req.CompanySize != nil {
		user.EnterpriseProfile.CompanySize = strings.TrimSpace(*req.CompanySize)
	}
	if req.WorkModel != nil {
		user.EnterpriseProfile.WorkModel = strings.TrimSpace(*req.WorkModel)
	}
	if req.RecruitmentLevel != nil {
		user.EnterpriseProfile.RecruitmentLevel = strings.TrimSpace(*req.RecruitmentLevel)
	}
	if req.Description != nil {
		user.EnterpriseProfile.Description = strings.TrimSpace(*req.Description)
	}
	if req.Address != nil {
		user.EnterpriseProfile.Address = strings.TrimSpace(*req.Address)
	}
	if req.Country != nil {
		user.EnterpriseProfile.Country = strings.TrimSpace(*req.Country)
	}
	if req.City != nil {
		user.EnterpriseProfile.City = strings.TrimSpace(*req.City)
	}
	if req.District != nil {
		user.EnterpriseProfile.District = strings.TrimSpace(*req.District)
	}
	if req.Ward != nil {
		user.EnterpriseProfile.Ward = strings.TrimSpace(*req.Ward)
	}
	if req.Latitude != nil {
		user.EnterpriseProfile.Latitude = strings.TrimSpace(*req.Latitude)
	}
	if req.Longitude != nil {
		user.EnterpriseProfile.Longitude = strings.TrimSpace(*req.Longitude)
	}
	if gpkdURL != "" {
		if gpkdURL != strings.TrimSpace(user.EnterpriseProfile.GPKDURL) {
			user.EnterpriseProfile.GPKDURL = gpkdURL
		}
		if user.EnterpriseProfile.KYBStatus != models.KYBApproved {
			user.EnterpriseProfile.KYBStatus = models.KYBPending
			user.EnterpriseProfile.StatusKYB = models.KYBPending
			user.EnterpriseProfile.KYBRejectReason = ""
		}
	}
	if err := h.db.Save(user.EnterpriseProfile).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể cập nhật hồ sơ nhà tuyển dụng.",
		})
	}

	if err := h.db.Preload("EnterpriseProfile").First(&user, userID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải lại hồ sơ nhà tuyển dụng.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đã cập nhật hồ sơ nhà tuyển dụng.",
		"data":    user,
	})
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

func (h *EnterpriseJobHandler) ListSkills(c *fiber.Ctx) error {
	var skills []models.Skill
	if err := h.db.
		Preload("Category").
		Order("name ASC").
		Find(&skills).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải danh sách kỹ năng.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    skills,
	})
}

func (h *EnterpriseJobHandler) CreateSkill(c *fiber.Ctx) error {
	var req createSkillRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Vui lòng nhập tên kỹ năng.",
		})
	}

	categoryName := strings.TrimSpace(req.CategoryName)
	if categoryName == "" {
		categoryName = "Kỹ năng khác"
	}

	var skill models.Skill
	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.
			Preload("Category").
			Where("LOWER(name) = LOWER(?)", name).
			First(&skill).Error; err == nil {
			return nil
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		var category models.Category
		if req.CategoryID > 0 {
			if err := tx.First(&category, req.CategoryID).Error; err != nil {
				return err
			}
		} else {
			category = models.Category{Name: categoryName}
			if err := tx.Where("LOWER(name) = LOWER(?)", categoryName).FirstOrCreate(&category, models.Category{Name: categoryName}).Error; err != nil {
				return err
			}
		}

		skill = models.Skill{
			Name:       name,
			CategoryID: category.ID,
		}
		if err := tx.Create(&skill).Error; err != nil {
			return err
		}

		return tx.Preload("Category").First(&skill, skill.ID).Error
	})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể thêm kỹ năng: " + err.Error(),
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    skill,
	})
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

	snapshot, err := h.settingsService.Current(c.UserContext())
	if err != nil {
		return c.Status(http.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải chính sách kiểm duyệt.",
		})
	}
	moderation := snapshot.Settings.Moderation
	submitted := status == models.JobPending
	if status == models.JobPending && moderation.Mode == "automatic" {
		status = models.JobApproved
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
	applyJobSubmissionTiming(job, "", submitted, moderation.PendingHours, time.Now())

	var createdJob models.Job
	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if job.Status == models.JobDraft {
			if err := lockEnterpriseAndCheckDraftLimit(tx, enterpriseID, moderation.DraftLimit); err != nil {
				return err
			}
		}
		if err := tx.Create(job).Error; err != nil {
			return err
		}

		skills, err := loadSkillsByIDs(tx, req.SkillIDs)
		if err != nil {
			return err
		}
		if len(skills) > 0 {
			if err := tx.Model(job).Association("Skills").Replace(skills); err != nil {
				return err
			}
		}

		if err := tx.
			Preload("EnterpriseProfile").
			Preload("Skills").
			Preload("Skills.Category").
			First(&createdJob, job.ID).Error; err != nil {
			return err
		}

		if createdJob.Status == models.JobPending && h.notificationService != nil {
			if _, err := h.notificationService.NotifyAdminsJobSubmittedTx(tx, createdJob); err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
		if errors.Is(err, errDraftLimitReached) {
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Đã đạt giới hạn %d tin nháp.", moderation.DraftLimit),
			})
		}
		if errors.Is(err, errInvalidSkillIDs) {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Một số kỹ năng không tồn tại.",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not create job: " + err.Error(),
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    createdJob,
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

	if _, err := h.notificationService.NotifyInterviewScheduledTx(tx, application, interviewAt, method, location, note); err != nil {
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

	if _, err := h.notificationService.NotifyInterviewResultTx(tx, application, result, resultNote); err != nil {
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

	previousStatus := job.Status

	snapshot, err := h.settingsService.Current(c.UserContext())
	if err != nil {
		return c.Status(http.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải chính sách kiểm duyệt.",
		})
	}
	moderation := snapshot.Settings.Moderation

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
	submitted := false
	if req.Status != "" {
		requestedStatus := models.JobStatus(strings.ToUpper(strings.TrimSpace(req.Status)))
		switch requestedStatus {
		case models.JobDraft, models.JobPending, models.JobClosed:
		default:
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Status must be DRAFT, PENDING or CLOSED",
			})
		}

		submitted = requestedStatus == models.JobPending
		if submitted && moderation.Mode == "automatic" {
			requestedStatus = models.JobApproved
		}
		job.Status = requestedStatus
	}
	applyJobSubmissionTiming(job, previousStatus, submitted, moderation.PendingHours, time.Now())

	var updatedJob models.Job
	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if job.Status == models.JobDraft && previousStatus != models.JobDraft {
			if err := lockEnterpriseAndCheckDraftLimit(tx, enterpriseID, moderation.DraftLimit); err != nil {
				return err
			}
		}
		if err := tx.Save(job).Error; err != nil {
			return err
		}

		if req.SkillIDs != nil {
			skills, err := loadSkillsByIDs(tx, req.SkillIDs)
			if err != nil {
				return err
			}

			if len(skills) == 0 {
				if err := tx.Model(job).Association("Skills").Clear(); err != nil {
					return err
				}
			} else if err := tx.Model(job).Association("Skills").Replace(skills); err != nil {
				return err
			}
		}

		if err := tx.
			Preload("EnterpriseProfile").
			Preload("Skills").
			Preload("Skills.Category").
			First(&updatedJob, job.ID).Error; err != nil {
			return err
		}

		if previousStatus != models.JobPending && updatedJob.Status == models.JobPending && h.notificationService != nil {
			if _, err := h.notificationService.NotifyAdminsJobSubmittedTx(tx, updatedJob); err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
		if errors.Is(err, errDraftLimitReached) {
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Đã đạt giới hạn %d tin nháp.", moderation.DraftLimit),
			})
		}
		if errors.Is(err, errInvalidSkillIDs) {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Một số kỹ năng không tồn tại.",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Could not update job",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    updatedJob,
	})
}

func lockEnterpriseAndCheckDraftLimit(tx *gorm.DB, enterpriseID uint, limit int) error {
	var profile models.EnterpriseProfile
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Select("user_id").
		Where("user_id = ?", enterpriseID).
		First(&profile).Error; err != nil {
		return err
	}

	var draftCount int64
	if err := tx.Model(&models.Job{}).
		Where("enterprise_id = ? AND status = ?", enterpriseID, models.JobDraft).
		Count(&draftCount).Error; err != nil {
		return err
	}
	if draftCount >= int64(limit) {
		return errDraftLimitReached
	}
	return nil
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
