package handlers

import (
	"errors"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"quickwork.local/backend/config"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/services"
	uploadsecurity "quickwork.local/backend/pkg/upload"
)

type StudentJobHandler struct {
	db                  *gorm.DB
	notificationService services.NotificationService
	config              *config.Config
}

func NewStudentJobHandler(db *gorm.DB, notificationService services.NotificationService, configs ...*config.Config) *StudentJobHandler {
	cfg := &config.Config{}
	if len(configs) > 0 && configs[0] != nil {
		cfg = configs[0]
	}
	return &StudentJobHandler{db: db, notificationService: notificationService, config: cfg}
}

type updateStudentSettingsRequest struct {
	Name                   *string `json:"name"`
	Phone                  *string `json:"phone"`
	Avatar                 *string `json:"avatar"`
	CVURL                  *string `json:"cv_url"`
	CVFileName             *string `json:"cv_file_name"`
	Summary                *string `json:"summary"`
	PortfolioURL           *string `json:"portfolio_url"`
	SkillIDs               *[]uint `json:"skill_ids"`
	PreferredLocation      *string `json:"preferred_location"`
	PreferredCategory      *string `json:"preferred_category"`
	ExpectedSalary         *string `json:"expected_salary"`
	PreferredJobType       *string `json:"preferred_job_type"`
	ProfileVisible         *bool   `json:"profile_visible"`
	AllowEnterpriseContact *bool   `json:"allow_enterprise_contact"`
	ShowContactInfo        *bool   `json:"show_contact_info"`
}

func (h *StudentJobHandler) GetProfile(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}

	return h.respondWithStudentProfile(c, studentID, http.StatusOK, "")
}

func (h *StudentJobHandler) UpdateProfile(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}

	req := new(updateStudentSettingsRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu cập nhật."})
	}

	updates := map[string]any{}
	addTextUpdate := func(column string, value *string) {
		if value != nil {
			updates[column] = strings.TrimSpace(*value)
		}
	}
	addTextUpdate("name", req.Name)
	addTextUpdate("phone", req.Phone)
	addTextUpdate("avatar", req.Avatar)
	addTextUpdate("cv_url", req.CVURL)
	if req.CVFileName != nil {
		fileName := normalizeStudentFileName(*req.CVFileName)
		if len([]rune(fileName)) > 255 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tên tệp CV không được vượt quá 255 ký tự."})
		}
		updates["cv_file_name"] = fileName
	}
	if req.CVURL != nil && strings.TrimSpace(*req.CVURL) == "" {
		updates["cv_file_name"] = ""
	}
	addTextUpdate("summary", req.Summary)
	addTextUpdate("portfolio_url", req.PortfolioURL)
	addTextUpdate("preferred_location", req.PreferredLocation)
	addTextUpdate("preferred_category", req.PreferredCategory)
	addTextUpdate("expected_salary", req.ExpectedSalary)
	addTextUpdate("preferred_job_type", req.PreferredJobType)

	if name, exists := updates["name"]; exists && name == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Họ và tên không được để trống."})
	}
	if phone, exists := updates["phone"]; exists {
		value := phone.(string)
		if value != "" && !isValidStudentPhone(value) {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Số điện thoại phải gồm 10 đến 11 chữ số."})
		}
	}

	if req.ProfileVisible != nil {
		updates["profile_visible"] = *req.ProfileVisible
	}
	if req.AllowEnterpriseContact != nil {
		updates["allow_enterprise_contact"] = *req.AllowEnterpriseContact
	}
	if req.ShowContactInfo != nil {
		updates["show_contact_info"] = *req.ShowContactInfo
	}

	if len(updates) == 0 && req.SkillIDs == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không có thông tin nào để cập nhật."})
	}

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if len(updates) > 0 {
			if err := tx.Model(&models.StudentProfile{}).Where("user_id = ?", studentID).Updates(updates).Error; err != nil {
				return err
			}
		}
		if req.SkillIDs != nil {
			var profile models.StudentProfile
			if err := tx.Where("user_id = ?", studentID).First(&profile).Error; err != nil {
				return err
			}
			ids := uniqueUintValues(*req.SkillIDs)
			var skills []models.Skill
			if len(ids) > 0 {
				if err := tx.Where("id IN ?", ids).Find(&skills).Error; err != nil {
					return err
				}
				if len(skills) != len(ids) {
					return fiber.NewError(http.StatusBadRequest, "Một hoặc nhiều kỹ năng không hợp lệ.")
				}
			}
			if err := tx.Model(&profile).Association("Skills").Replace(skills); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"success": false, "message": fiberErr.Message})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể cập nhật cài đặt sinh viên."})
	}

	return h.respondWithStudentProfile(c, studentID, http.StatusOK, "Cập nhật cài đặt thành công.")
}

func (h *StudentJobHandler) UploadProfileFile(c *fiber.Ctx) error {
	kind := strings.ToLower(strings.TrimSpace(c.FormValue("kind")))
	maxSize := int64(0)
	folder := ""
	allowedExtensions := map[string]bool{}

	switch kind {
	case "avatar":
		maxSize = 5 * 1024 * 1024
		folder = "students/avatars"
		allowedExtensions = map[string]bool{".jpg": true, ".jpeg": true, ".png": true}
	case "cv":
		maxSize = 10 * 1024 * 1024
		folder = "students/cv"
		allowedExtensions = map[string]bool{".pdf": true, ".doc": true, ".docx": true}
	default:
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Loại tệp tải lên không hợp lệ."})
	}

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không tìm thấy tệp tải lên."})
	}
	if fileHeader.Size <= 0 || fileHeader.Size > maxSize {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Kích thước tệp vượt quá giới hạn cho phép."})
	}

	if config.CLD == nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Dịch vụ lưu trữ tệp chưa được cấu hình."})
	}

	fileReader, err := uploadsecurity.OpenValidated(c.UserContext(), fileHeader, uploadsecurity.SecurityPolicy{
		MaxBytes: maxSize, AllowedExtensions: allowedExtensions,
		MalwareScanRequired: h.config.UploadMalwareScanRequired, ClamAVAddress: h.config.ClamAVAddress,
	})
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tệp không hợp lệ hoặc không vượt qua kiểm tra an toàn."})
	}
	defer fileReader.Close()

	result, err := config.CLD.Upload.Upload(c.UserContext(), fileReader, uploader.UploadParams{
		Folder:       folder,
		ResourceType: "auto",
	})
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tải tệp lên hệ thống lưu trữ."})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tải tệp thành công.",
		"data": fiber.Map{
			"url":  result.SecureURL,
			"name": normalizeStudentFileName(fileHeader.Filename),
			"size": fileHeader.Size,
			"kind": kind,
		},
	})
}

func normalizeStudentFileName(value string) string {
	fileName := strings.TrimSpace(strings.ReplaceAll(value, "\\", "/"))
	if fileName == "" {
		return ""
	}
	fileName = path.Base(fileName)
	if fileName == "." || fileName == "/" {
		return ""
	}
	return fileName
}

func (h *StudentJobHandler) respondWithStudentProfile(c *fiber.Ctx, studentID uint, status int, message string) error {
	var user models.User
	if err := h.db.
		Preload("StudentProfile.Skills.Category").
		Preload("StudentProfile.WorkExperiences", func(db *gorm.DB) *gorm.DB { return db.Order("start_date DESC") }).
		Preload("StudentProfile.Educations", func(db *gorm.DB) *gorm.DB { return db.Order("start_date DESC") }).
		Preload("StudentProfile.Portfolios", func(db *gorm.DB) *gorm.DB { return db.Order("created_at DESC") }).
		First(&user, studentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy hồ sơ sinh viên."})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tải hồ sơ sinh viên."})
	}

	response := fiber.Map{"success": true, "data": user}
	if message != "" {
		response["message"] = message
	}
	return c.Status(status).JSON(response)
}

func (h *StudentJobHandler) ListProfileSkills(c *fiber.Ctx) error {
	var skills []models.Skill
	if err := h.db.Preload("Category").Order("name ASC").Find(&skills).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể tải danh mục kỹ năng."})
	}
	return c.JSON(fiber.Map{"success": true, "data": skills})
}

type studentSkillRequest struct {
	Name         string `json:"name"`
	CategoryID   uint   `json:"category_id"`
	CategoryName string `json:"category_name"`
}

func (h *StudentJobHandler) CreateProfileSkill(c *fiber.Ctx) error {
	if _, ok := c.Locals("user_id").(uint); !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}

	var req studentSkillRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu kỹ năng."})
	}

	name := strings.TrimSpace(req.Name)
	categoryName := strings.TrimSpace(req.CategoryName)
	if name == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Vui lòng nhập tên kỹ năng."})
	}
	if len([]rune(name)) > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tên kỹ năng không được vượt quá 100 ký tự."})
	}
	if req.CategoryID == 0 && categoryName == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Vui lòng chọn hoặc nhập tên danh mục kỹ năng."})
	}
	if len([]rune(categoryName)) > 100 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Tên danh mục không được vượt quá 100 ký tự."})
	}

	var skill models.Skill
	created := false
	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Preload("Category").Where("LOWER(name) = LOWER(?)", name).First(&skill).Error; err == nil {
			return nil
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		var category models.Category
		if req.CategoryID > 0 {
			if err := tx.First(&category, req.CategoryID).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return fiber.NewError(http.StatusBadRequest, "Danh mục kỹ năng không tồn tại.")
				}
				return err
			}
		} else if err := tx.Where("LOWER(name) = LOWER(?)", categoryName).FirstOrCreate(&category, models.Category{Name: categoryName}).Error; err != nil {
			return err
		}

		skill = models.Skill{Name: name, CategoryID: category.ID}
		if err := tx.Create(&skill).Error; err != nil {
			return err
		}
		created = true
		return tx.Preload("Category").First(&skill, skill.ID).Error
	})
	if err != nil {
		if fiberErr, ok := err.(*fiber.Error); ok {
			return c.Status(fiberErr.Code).JSON(fiber.Map{"success": false, "message": fiberErr.Message})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể thêm kỹ năng vào danh mục."})
	}

	status := http.StatusOK
	message := "Kỹ năng đã tồn tại và được chọn lại."
	if created {
		status = http.StatusCreated
		message = "Đã thêm kỹ năng mới."
	}
	return c.Status(status).JSON(fiber.Map{"success": true, "message": message, "data": skill})
}

type studentExperienceRequest struct {
	Position    string `json:"position"`
	Company     string `json:"company"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	IsCurrent   bool   `json:"is_current"`
	Description string `json:"description"`
}

type studentEducationRequest struct {
	School      string `json:"school"`
	Major       string `json:"major"`
	Degree      string `json:"degree"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	Description string `json:"description"`
}

type studentPortfolioRequest struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

func (h *StudentJobHandler) CreateWorkExperience(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	var req studentExperienceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu kinh nghiệm."})
	}
	experience, err := buildStudentExperience(studentID, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if err := h.db.Create(&experience).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể lưu kinh nghiệm."})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{"success": true, "message": "Đã thêm kinh nghiệm làm việc.", "data": experience})
}

func (h *StudentJobHandler) UpdateWorkExperience(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	id, err := parseStudentProfileEntryID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã kinh nghiệm không hợp lệ."})
	}
	var existing models.StudentWorkExperience
	if err := h.db.Where("id = ? AND student_id = ?", id, studentID).First(&existing).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy kinh nghiệm."})
	}
	var req studentExperienceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu kinh nghiệm."})
	}
	updated, err := buildStudentExperience(studentID, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	updated.ID, updated.CreatedAt = existing.ID, existing.CreatedAt
	if err := h.db.Save(&updated).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể cập nhật kinh nghiệm."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã cập nhật kinh nghiệm làm việc.", "data": updated})
}

func (h *StudentJobHandler) DeleteWorkExperience(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	id, err := parseStudentProfileEntryID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã kinh nghiệm không hợp lệ."})
	}
	result := h.db.Where("id = ? AND student_id = ?", id, studentID).Delete(&models.StudentWorkExperience{})
	if result.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể xóa kinh nghiệm."})
	}
	if result.RowsAffected == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy kinh nghiệm."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã xóa kinh nghiệm làm việc."})
}

func (h *StudentJobHandler) CreateEducation(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	var req studentEducationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu học vấn."})
	}
	education, err := buildStudentEducation(studentID, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if err := h.db.Create(&education).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể lưu học vấn."})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{"success": true, "message": "Đã thêm học vấn.", "data": education})
}

func (h *StudentJobHandler) UpdateEducation(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	id, err := parseStudentProfileEntryID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã học vấn không hợp lệ."})
	}
	var existing models.StudentEducation
	if err := h.db.Where("id = ? AND student_id = ?", id, studentID).First(&existing).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy học vấn."})
	}
	var req studentEducationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu học vấn."})
	}
	updated, err := buildStudentEducation(studentID, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	updated.ID, updated.CreatedAt = existing.ID, existing.CreatedAt
	if err := h.db.Save(&updated).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể cập nhật học vấn."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã cập nhật học vấn.", "data": updated})
}

func (h *StudentJobHandler) DeleteEducation(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	id, err := parseStudentProfileEntryID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã học vấn không hợp lệ."})
	}
	result := h.db.Where("id = ? AND student_id = ?", id, studentID).Delete(&models.StudentEducation{})
	if result.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể xóa học vấn."})
	}
	if result.RowsAffected == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy học vấn."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã xóa học vấn."})
}

func (h *StudentJobHandler) CreatePortfolio(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	var req studentPortfolioRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu portfolio."})
	}
	portfolio, err := buildStudentPortfolio(studentID, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if err := h.db.Create(&portfolio).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể lưu portfolio."})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{"success": true, "message": "Đã thêm portfolio.", "data": portfolio})
}

func (h *StudentJobHandler) UpdatePortfolio(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	id, err := parseStudentProfileEntryID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã portfolio không hợp lệ."})
	}
	var existing models.StudentPortfolio
	if err := h.db.Where("id = ? AND student_id = ?", id, studentID).First(&existing).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy portfolio."})
	}
	var req studentPortfolioRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Không thể đọc dữ liệu portfolio."})
	}
	updated, err := buildStudentPortfolio(studentID, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	updated.ID, updated.CreatedAt = existing.ID, existing.CreatedAt
	if err := h.db.Save(&updated).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể cập nhật portfolio."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã cập nhật portfolio.", "data": updated})
}

func (h *StudentJobHandler) DeletePortfolio(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Phiên đăng nhập không hợp lệ."})
	}
	id, err := parseStudentProfileEntryID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Mã portfolio không hợp lệ."})
	}
	result := h.db.Where("id = ? AND student_id = ?", id, studentID).Delete(&models.StudentPortfolio{})
	if result.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Không thể xóa portfolio."})
	}
	if result.RowsAffected == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Không tìm thấy portfolio."})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Đã xóa portfolio."})
}

func buildStudentExperience(studentID uint, req studentExperienceRequest) (models.StudentWorkExperience, error) {
	position, company := strings.TrimSpace(req.Position), strings.TrimSpace(req.Company)
	if position == "" || company == "" {
		return models.StudentWorkExperience{}, errors.New("Vị trí và công ty là thông tin bắt buộc.")
	}
	startDate, err := time.Parse("2006-01-02", strings.TrimSpace(req.StartDate))
	if err != nil {
		return models.StudentWorkExperience{}, errors.New("Ngày bắt đầu không hợp lệ.")
	}
	var endDate *time.Time
	if !req.IsCurrent && strings.TrimSpace(req.EndDate) != "" {
		parsed, parseErr := time.Parse("2006-01-02", strings.TrimSpace(req.EndDate))
		if parseErr != nil || parsed.Before(startDate) {
			return models.StudentWorkExperience{}, errors.New("Ngày kết thúc không hợp lệ.")
		}
		endDate = &parsed
	}
	return models.StudentWorkExperience{StudentID: studentID, Position: position, Company: company, StartDate: startDate, EndDate: endDate, IsCurrent: req.IsCurrent, Description: strings.TrimSpace(req.Description)}, nil
}

func buildStudentEducation(studentID uint, req studentEducationRequest) (models.StudentEducation, error) {
	school, major := strings.TrimSpace(req.School), strings.TrimSpace(req.Major)
	if school == "" || major == "" {
		return models.StudentEducation{}, errors.New("Trường học và chuyên ngành là thông tin bắt buộc.")
	}
	startDate, err := time.Parse("2006-01-02", strings.TrimSpace(req.StartDate))
	if err != nil {
		return models.StudentEducation{}, errors.New("Ngày bắt đầu không hợp lệ.")
	}
	var endDate *time.Time
	if strings.TrimSpace(req.EndDate) != "" {
		parsed, parseErr := time.Parse("2006-01-02", strings.TrimSpace(req.EndDate))
		if parseErr != nil || parsed.Before(startDate) {
			return models.StudentEducation{}, errors.New("Ngày kết thúc không hợp lệ.")
		}
		endDate = &parsed
	}
	return models.StudentEducation{StudentID: studentID, School: school, Major: major, Degree: strings.TrimSpace(req.Degree), StartDate: startDate, EndDate: endDate, Description: strings.TrimSpace(req.Description)}, nil
}

func buildStudentPortfolio(studentID uint, req studentPortfolioRequest) (models.StudentPortfolio, error) {
	title, rawURL := strings.TrimSpace(req.Title), strings.TrimSpace(req.URL)
	if title == "" || rawURL == "" {
		return models.StudentPortfolio{}, errors.New("Tên và liên kết portfolio là thông tin bắt buộc.")
	}
	if len(title) > 150 || len(rawURL) > 500 {
		return models.StudentPortfolio{}, errors.New("Tên hoặc liên kết portfolio vượt quá độ dài cho phép.")
	}
	parsed, err := url.ParseRequestURI(rawURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return models.StudentPortfolio{}, errors.New("Liên kết portfolio phải là URL HTTP hoặc HTTPS hợp lệ.")
	}
	return models.StudentPortfolio{StudentID: studentID, Title: title, URL: rawURL}, nil
}

func parseStudentProfileEntryID(c *fiber.Ctx) (uint, error) {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	return uint(id), err
}

func uniqueUintValues(values []uint) []uint {
	seen := make(map[uint]struct{}, len(values))
	result := make([]uint, 0, len(values))
	for _, value := range values {
		if value == 0 {
			continue
		}
		if _, exists := seen[value]; exists {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}

func isValidStudentPhone(value string) bool {
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

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&application).Error; err != nil {
			return err
		}

		if err := tx.
			Preload("Job").
			Preload("Job.EnterpriseProfile").
			Preload("Student").
			Preload("Student.StudentProfile").
			First(&application, application.ID).Error; err != nil {
			return err
		}

		if h.notificationService != nil {
			if _, err := h.notificationService.NotifyAdminsApplicationSubmittedTx(tx, application); err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
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

// GetCompanyProfile returns a public-safe company view for a student who has
// already applied to one of that enterprise's jobs. Legal/KYB documents and
// private contact fields are intentionally excluded from the response.
func (h *StudentJobHandler) GetCompanyProfile(c *fiber.Ctx) error {
	studentID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Unauthorized",
		})
	}

	enterpriseID, err := parseJobID(c)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Mã doanh nghiệp không hợp lệ.",
		})
	}

	var applicationCount int64
	if err := h.db.Model(&models.JobApplication{}).
		Joins("JOIN jobs ON jobs.id = job_applications.job_id").
		Where("job_applications.student_id = ? AND jobs.enterprise_id = ?", studentID, enterpriseID).
		Count(&applicationCount).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể kiểm tra quan hệ ứng tuyển.",
		})
	}
	if applicationCount == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy thông tin công ty cho đơn ứng tuyển của bạn.",
		})
	}

	var profile models.EnterpriseProfile
	if err := h.db.Model(&models.EnterpriseProfile{}).
		Joins("JOIN users ON users.id = enterprise_profiles.user_id").
		Where("enterprise_profiles.user_id = ? AND users.role = ? AND users.status = ? AND users.deleted_at IS NULL", enterpriseID, models.RoleEnterprise, models.UserStatusActive).
		First(&profile).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Công ty không tồn tại hoặc không còn hoạt động.",
		})
	}

	var jobs []models.Job
	if err := h.db.Model(&models.Job{}).
		Select(`jobs.*,
			(SELECT COUNT(*) FROM job_applications WHERE job_applications.job_id = jobs.id) AS application_count,
			(SELECT COUNT(*) FROM favorite_jobs WHERE favorite_jobs.job_id = jobs.id) AS favorite_count`).
		Preload("Skills").
		Preload("Skills.Category").
		Where("jobs.enterprise_id = ? AND jobs.status = ? AND jobs.slots > 0", enterpriseID, models.JobApproved).
		Order("jobs.created_at DESC").
		Find(&jobs).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tải việc làm của công ty.",
		})
	}

	jobItems := make([]fiber.Map, 0, len(jobs))
	totalOpenings := 0
	for _, job := range jobs {
		totalOpenings += job.Slots
		skills := make([]fiber.Map, 0, len(job.Skills))
		for _, skill := range job.Skills {
			category := ""
			if skill.Category != nil {
				category = skill.Category.Name
			}
			skills = append(skills, fiber.Map{
				"id":       skill.ID,
				"name":     skill.Name,
				"category": category,
			})
		}
		jobItems = append(jobItems, fiber.Map{
			"id":                job.ID,
			"title":             job.Title,
			"description":       job.Description,
			"requirements":      job.Requirements,
			"salary":            job.Salary,
			"location":          job.Location,
			"slots":             job.Slots,
			"application_count": job.ApplicationCount,
			"favorite_count":    job.FavoriteCount,
			"skills":            skills,
			"created_at":        job.CreatedAt,
		})
	}

	kybStatus := profile.KYBStatus
	if kybStatus == "" {
		kybStatus = profile.StatusKYB
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"profile": fiber.Map{
				"user_id":           profile.UserID,
				"company_name":      profile.CompanyName,
				"logo_url":          profile.LogoURL,
				"cover_image_url":   profile.CoverImageURL,
				"industry":          profile.Industry,
				"company_size":      profile.CompanySize,
				"work_model":        profile.WorkModel,
				"recruitment_level": profile.RecruitmentLevel,
				"description":       profile.Description,
				"address":           profile.Address,
				"country":           profile.Country,
				"city":              profile.City,
				"district":          profile.District,
				"ward":              profile.Ward,
				"verified":          kybStatus == models.KYBApproved,
				"created_at":        profile.CreatedAt,
			},
			"jobs": jobItems,
			"stats": fiber.Map{
				"open_job_count": len(jobItems),
				"total_openings": totalOpenings,
			},
		},
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
