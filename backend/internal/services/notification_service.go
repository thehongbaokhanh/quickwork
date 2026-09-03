package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
)

type CreateNotificationInput struct {
	UserID     uint
	Type       models.NotificationType
	Title      string
	Content    string
	SourceType string
	SourceID   *uint
	ActionURL  string
}

type NotificationListResult struct {
	Items      []models.Notification `json:"items"`
	Pagination Pagination            `json:"pagination"`
}

type Pagination struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

type NotificationEventQueue interface {
	Enqueue(ctx context.Context, tx *gorm.DB, notification *models.Notification) error
}

type NotificationService interface {
	Create(ctx context.Context, input CreateNotificationInput) (*models.Notification, error)
	CreateTx(tx *gorm.DB, input CreateNotificationInput) (*models.Notification, error)
	ListForCurrentUser(ctx context.Context, userID uint, isRead *bool, notificationType string, page int, pageSize int) (*NotificationListResult, error)
	CountUnread(ctx context.Context, userID uint) (int64, error)
	MarkAsRead(ctx context.Context, notificationID uint, userID uint) (bool, error)
	MarkAllAsRead(ctx context.Context, userID uint) (int64, error)
	NotifyInterviewScheduledTx(tx *gorm.DB, application models.JobApplication, interviewAt time.Time, method string, location string, note string) (*models.Notification, error)
	NotifyInterviewResultTx(tx *gorm.DB, application models.JobApplication, result models.InterviewResult, note string) (*models.Notification, error)
	NotifyGPKDRequestedTx(tx *gorm.DB, enterpriseUserID uint) (*models.Notification, error)
	NotifyNewMessageTx(tx *gorm.DB, receiverID uint, receiverRole models.UserRole, conversationID uint, senderName string) (*models.Notification, error)
	NotifyAdminsJobSubmittedTx(tx *gorm.DB, job models.Job) ([]models.Notification, error)
	NotifyAdminsApplicationSubmittedTx(tx *gorm.DB, application models.JobApplication) ([]models.Notification, error)
	NotifyAdminsEnterprisePendingTx(tx *gorm.DB, enterprise models.EnterpriseProfile) ([]models.Notification, error)
}

type notificationService struct {
	repo     repositories.NotificationRepository
	settings *SystemSettingsService
	queue    NotificationEventQueue
}

func NewNotificationService(repo repositories.NotificationRepository, settings *SystemSettingsService, queues ...NotificationEventQueue) NotificationService {
	service := &notificationService{repo: repo, settings: settings}
	if len(queues) > 0 {
		service.queue = queues[0]
	}
	return service
}

func (s *notificationService) Create(ctx context.Context, input CreateNotificationInput) (*models.Notification, error) {
	notification := buildNotification(input)
	if !s.inAppEnabled(ctx) {
		return notification, nil
	}
	if s.queue != nil {
		if err := s.queue.Enqueue(ctx, nil, notification); err != nil {
			return nil, err
		}
		return notification, nil
	}
	if err := s.repo.Create(ctx, notification); err != nil {
		return nil, err
	}
	return notification, nil
}

func (s *notificationService) CreateTx(tx *gorm.DB, input CreateNotificationInput) (*models.Notification, error) {
	notification := buildNotification(input)
	if !s.inAppEnabled(context.Background()) {
		return notification, nil
	}
	if s.queue != nil {
		if err := s.queue.Enqueue(context.Background(), tx, notification); err != nil {
			return nil, err
		}
		return notification, nil
	}
	if err := s.repo.CreateTx(tx, notification); err != nil {
		return nil, err
	}
	return notification, nil
}

func (s *notificationService) ListForCurrentUser(ctx context.Context, userID uint, isRead *bool, notificationType string, page int, pageSize int) (*NotificationListResult, error) {
	page, pageSize, offset := normalizePage(page, pageSize)
	items, total, err := s.repo.ListByUser(ctx, userID, isRead, notificationType, pageSize, offset)
	if err != nil {
		return nil, err
	}

	return &NotificationListResult{
		Items: items,
		Pagination: Pagination{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages(total, pageSize),
		},
	}, nil
}

func (s *notificationService) CountUnread(ctx context.Context, userID uint) (int64, error) {
	return s.repo.CountUnread(ctx, userID)
}

func (s *notificationService) MarkAsRead(ctx context.Context, notificationID uint, userID uint) (bool, error) {
	return s.repo.MarkAsRead(ctx, notificationID, userID, time.Now())
}

func (s *notificationService) MarkAllAsRead(ctx context.Context, userID uint) (int64, error) {
	return s.repo.MarkAllAsRead(ctx, userID, time.Now())
}

func (s *notificationService) NotifyInterviewScheduledTx(tx *gorm.DB, application models.JobApplication, interviewAt time.Time, method string, location string, note string) (*models.Notification, error) {
	sourceID := application.ID
	return s.CreateTx(tx, CreateNotificationInput{
		UserID:     application.StudentID,
		Type:       models.NotificationTypeInterview,
		Title:      "Lịch phỏng vấn mới",
		Content:    buildInterviewNotificationContent(application, interviewAt, method, location, note),
		SourceType: "JOB_APPLICATION",
		SourceID:   &sourceID,
		ActionURL:  "/student/applications",
	})
}

func (s *notificationService) NotifyInterviewResultTx(tx *gorm.DB, application models.JobApplication, result models.InterviewResult, note string) (*models.Notification, error) {
	sourceID := application.ID
	notificationType := models.NotificationTypeInterview
	title := "Cập nhật kết quả phỏng vấn"
	if result == models.InterviewResultHired {
		title = "Chúc mừng, bạn đã được nhận"
	}

	return s.CreateTx(tx, CreateNotificationInput{
		UserID:     application.StudentID,
		Type:       notificationType,
		Title:      title,
		Content:    buildInterviewResultContent(application, result, note),
		SourceType: "JOB_APPLICATION",
		SourceID:   &sourceID,
		ActionURL:  "/student/applications",
	})
}

func (s *notificationService) NotifyGPKDRequestedTx(tx *gorm.DB, enterpriseUserID uint) (*models.Notification, error) {
	return s.CreateTx(tx, CreateNotificationInput{
		UserID:     enterpriseUserID,
		Type:       models.NotificationTypeKYB,
		Title:      "Yêu cầu nộp giấy phép kinh doanh",
		Content:    "Vui lòng bổ sung giấy phép kinh doanh để tài khoản doanh nghiệp được xét duyệt và sử dụng đầy đủ chức năng.",
		SourceType: "ENTERPRISE_PROFILE",
		SourceID:   &enterpriseUserID,
		ActionURL:  "/enterprise/settings",
	})
}

func (s *notificationService) NotifyNewMessageTx(tx *gorm.DB, receiverID uint, receiverRole models.UserRole, conversationID uint, senderName string) (*models.Notification, error) {
	actionURL := fmt.Sprintf("/messages/%d", conversationID)
	if receiverRole == models.RoleEnterprise {
		actionURL = fmt.Sprintf("/enterprise/messages/%d", conversationID)
	}

	sourceID := conversationID
	if strings.TrimSpace(senderName) == "" {
		senderName = "QuickWork"
	}

	return s.CreateTx(tx, CreateNotificationInput{
		UserID:     receiverID,
		Type:       models.NotificationTypeMessage,
		Title:      "Bạn có tin nhắn mới",
		Content:    fmt.Sprintf("%s đã gửi cho bạn một tin nhắn.", senderName),
		SourceType: "CONVERSATION",
		SourceID:   &sourceID,
		ActionURL:  actionURL,
	})
}

func (s *notificationService) NotifyAdminsJobSubmittedTx(tx *gorm.DB, job models.Job) ([]models.Notification, error) {
	if !s.inAppEnabled(context.Background()) {
		return []models.Notification{}, nil
	}
	adminIDs, err := activeAdminIDs(tx)
	if err != nil {
		return nil, err
	}

	sourceID := job.ID
	companyName := jobCompanyName(job)
	title := strings.TrimSpace(job.Title)
	if title == "" {
		title = "tin tuyển dụng mới"
	}

	notifications := make([]models.Notification, 0, len(adminIDs))
	for _, adminID := range adminIDs {
		notification, err := s.CreateTx(tx, CreateNotificationInput{
			UserID:     adminID,
			Type:       models.NotificationTypeJob,
			Title:      "Tin tuyển dụng mới chờ duyệt",
			Content:    fmt.Sprintf("%s vừa gửi tin \"%s\" để admin duyệt.", companyName, title),
			SourceType: "JOB",
			SourceID:   &sourceID,
			ActionURL:  "/admin/jobs",
		})
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, *notification)
	}

	return notifications, nil
}

func (s *notificationService) NotifyAdminsApplicationSubmittedTx(tx *gorm.DB, application models.JobApplication) ([]models.Notification, error) {
	if !s.inAppEnabled(context.Background()) {
		return []models.Notification{}, nil
	}
	adminIDs, err := activeAdminIDs(tx)
	if err != nil {
		return nil, err
	}

	sourceID := application.ID
	studentName := applicationStudentName(application)
	jobTitle := applicationJobTitle(application)
	companyName := applicationCompanyName(application)

	notifications := make([]models.Notification, 0, len(adminIDs))
	for _, adminID := range adminIDs {
		notification, err := s.CreateTx(tx, CreateNotificationInput{
			UserID:     adminID,
			Type:       models.NotificationTypeApplication,
			Title:      "Ứng tuyển mới từ học viên",
			Content:    fmt.Sprintf("%s vừa ứng tuyển vào \"%s\" của %s.", studentName, jobTitle, companyName),
			SourceType: "JOB_APPLICATION",
			SourceID:   &sourceID,
			ActionURL:  "/admin/applications",
		})
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, *notification)
	}

	return notifications, nil
}

func (s *notificationService) NotifyAdminsEnterprisePendingTx(tx *gorm.DB, enterprise models.EnterpriseProfile) ([]models.Notification, error) {
	if !s.kybAlertEnabled() || !s.inAppEnabled(context.Background()) {
		return []models.Notification{}, nil
	}

	adminIDs, err := activeAdminIDs(tx)
	if err != nil {
		return nil, err
	}

	sourceID := enterprise.UserID
	companyName := strings.TrimSpace(enterprise.CompanyName)
	if companyName == "" {
		companyName = fmt.Sprintf("Doanh nghiệp #%d", enterprise.UserID)
	}

	notifications := make([]models.Notification, 0, len(adminIDs))
	for _, adminID := range adminIDs {
		notification, err := s.CreateTx(tx, CreateNotificationInput{
			UserID:     adminID,
			Type:       models.NotificationTypeKYB,
			Title:      "Doanh nghiệp mới chờ xác minh KYB",
			Content:    fmt.Sprintf("%s vừa đăng ký và đang chờ xác minh KYB.", companyName),
			SourceType: "ENTERPRISE_PROFILE",
			SourceID:   &sourceID,
			ActionURL:  "/admin/enterprises",
		})
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, *notification)
	}

	return notifications, nil
}

func (s *notificationService) inAppEnabled(ctx context.Context) bool {
	if s.settings == nil {
		return true
	}
	snapshot, err := s.settings.Current(ctx)
	if err != nil {
		return true
	}
	return snapshot.Settings.Notifications.InApp
}

func (s *notificationService) kybAlertEnabled() bool {
	if s.settings == nil {
		return true
	}
	snapshot, err := s.settings.Current(context.Background())
	if err != nil {
		return true
	}
	return snapshot.Settings.Notifications.KYBAlert
}

func buildNotification(input CreateNotificationInput) *models.Notification {
	return &models.Notification{
		UserID:     input.UserID,
		Type:       input.Type,
		Title:      strings.TrimSpace(input.Title),
		Content:    strings.TrimSpace(input.Content),
		SourceType: strings.TrimSpace(input.SourceType),
		SourceID:   input.SourceID,
		ActionURL:  strings.TrimSpace(input.ActionURL),
	}
}

func activeAdminIDs(tx *gorm.DB) ([]uint, error) {
	var adminIDs []uint
	if err := tx.Model(&models.User{}).
		Where("role = ? AND status = ?", models.RoleAdmin, models.UserStatusActive).
		Pluck("id", &adminIDs).Error; err != nil {
		return nil, err
	}
	return adminIDs, nil
}

func jobCompanyName(job models.Job) string {
	if job.EnterpriseProfile != nil && strings.TrimSpace(job.EnterpriseProfile.CompanyName) != "" {
		return strings.TrimSpace(job.EnterpriseProfile.CompanyName)
	}
	if job.EnterpriseID > 0 {
		return fmt.Sprintf("Doanh nghiệp #%d", job.EnterpriseID)
	}
	return "Doanh nghiệp"
}

func applicationCompanyName(application models.JobApplication) string {
	if application.Job != nil {
		return jobCompanyName(*application.Job)
	}
	return "doanh nghiệp"
}

func applicationStudentName(application models.JobApplication) string {
	if application.Student != nil {
		if application.Student.StudentProfile != nil && strings.TrimSpace(application.Student.StudentProfile.Name) != "" {
			return strings.TrimSpace(application.Student.StudentProfile.Name)
		}
		if strings.TrimSpace(application.Student.Email) != "" {
			return strings.TrimSpace(application.Student.Email)
		}
	}
	if application.StudentID > 0 {
		return fmt.Sprintf("Học viên #%d", application.StudentID)
	}
	return "Học viên"
}

func buildInterviewNotificationContent(application models.JobApplication, interviewAt time.Time, method string, location string, note string) string {
	jobTitle := applicationJobTitle(application)
	parts := []string{
		fmt.Sprintf("Bạn có lịch phỏng vấn cho %s vào %s.", jobTitle, interviewAt.Format("15:04 02/01/2006")),
		"Hình thức: " + method + ".",
	}
	if strings.TrimSpace(location) != "" {
		parts = append(parts, "Địa điểm/Link: "+strings.TrimSpace(location)+".")
	}
	if strings.TrimSpace(note) != "" {
		parts = append(parts, "Ghi chú: "+strings.TrimSpace(note))
	}
	return strings.Join(parts, "\n")
}

func buildInterviewResultContent(application models.JobApplication, result models.InterviewResult, note string) string {
	parts := []string{
		fmt.Sprintf("Kết quả phỏng vấn cho %s: %s.", applicationJobTitle(application), interviewResultLabel(result)),
	}
	if strings.TrimSpace(note) != "" {
		parts = append(parts, "Ghi chú: "+strings.TrimSpace(note))
	}
	return strings.Join(parts, "\n")
}

func applicationJobTitle(application models.JobApplication) string {
	if application.Job != nil && strings.TrimSpace(application.Job.Title) != "" {
		return application.Job.Title
	}
	return "vị trí ứng tuyển"
}

func interviewResultLabel(result models.InterviewResult) string {
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

func normalizePage(page int, pageSize int) (int, int, int) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}
	return page, pageSize, (page - 1) * pageSize
}

func totalPages(total int64, pageSize int) int {
	if pageSize <= 0 || total <= 0 {
		return 0
	}
	pages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		pages++
	}
	return pages
}
