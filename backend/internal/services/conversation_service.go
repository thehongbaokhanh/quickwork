package services

import (
	"context"
	"errors"
	"strings"
	"time"
	"unicode/utf8"

	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
)

type ParticipantSummary struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type JobSummary struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
}

type ConversationListItem struct {
	ID                uint                        `json:"id"`
	JobApplicationID  uint                        `json:"job_application_id"`
	Job               JobSummary                  `json:"job"`
	Participant       ParticipantSummary          `json:"participant"`
	ApplicationStatus models.JobApplicationStatus `json:"application_status"`
	InterviewResult   models.InterviewResult      `json:"interview_result,omitempty"`
	LastMessage       *models.Message             `json:"last_message,omitempty"`
	UnreadCount       int                         `json:"unread_count"`
	IsClosed          bool                        `json:"is_closed"`
	CanSendMessages   bool                        `json:"can_send_messages"`
	LockedReason      string                      `json:"locked_reason,omitempty"`
	LastMessageAt     *time.Time                  `json:"last_message_at,omitempty"`
}

type ConversationListResult struct {
	Items      []ConversationListItem `json:"items"`
	Pagination Pagination             `json:"pagination"`
}

type MessageListResult struct {
	Items        []models.Message `json:"items"`
	NextBeforeID *uint            `json:"next_before_id,omitempty"`
	HasMore      bool             `json:"has_more"`
}

type OpenConversationResult struct {
	ID               uint `json:"id"`
	JobApplicationID uint `json:"job_application_id"`
}

type SendMessageResult struct {
	Conversation OpenConversationResult `json:"conversation"`
	Message      models.Message         `json:"message"`
}

type MarkConversationReadResult struct {
	UpdatedMessages int64 `json:"updated_messages"`
}

type ConversationService interface {
	ListForCurrentUser(ctx context.Context, currentUserID uint, page int, pageSize int) (*ConversationListResult, error)
	OpenByApplication(ctx context.Context, currentUserID uint, applicationID uint) (*OpenConversationResult, error)
	ListMessages(ctx context.Context, currentUserID uint, conversationID uint, beforeID *uint, limit int) (*MessageListResult, error)
	SendMessageByApplication(ctx context.Context, currentUserID uint, applicationID uint, content string) (*SendMessageResult, error)
	SendMessageByConversation(ctx context.Context, currentUserID uint, conversationID uint, content string) (*SendMessageResult, error)
	MarkRead(ctx context.Context, currentUserID uint, conversationID uint) (*MarkConversationReadResult, error)
	CountUnread(ctx context.Context, currentUserID uint) (int64, error)
}

type conversationService struct {
	db                  *gorm.DB
	conversationRepo    repositories.ConversationRepository
	messageRepo         repositories.MessageRepository
	notificationService NotificationService
}

func NewConversationService(
	db *gorm.DB,
	conversationRepo repositories.ConversationRepository,
	messageRepo repositories.MessageRepository,
	notificationService NotificationService,
) ConversationService {
	return &conversationService{
		db:                  db,
		conversationRepo:    conversationRepo,
		messageRepo:         messageRepo,
		notificationService: notificationService,
	}
}

func (s *conversationService) ListForCurrentUser(ctx context.Context, currentUserID uint, page int, pageSize int) (*ConversationListResult, error) {
	page, pageSize, offset := normalizePage(page, pageSize)
	conversations, total, err := s.conversationRepo.ListForUser(ctx, currentUserID, pageSize, offset)
	if err != nil {
		return nil, err
	}

	items := make([]ConversationListItem, 0, len(conversations))
	for _, conversation := range conversations {
		item := s.buildConversationListItem(ctx, conversation, currentUserID)
		items = append(items, item)
	}

	return &ConversationListResult{
		Items: items,
		Pagination: Pagination{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages(total, pageSize),
		},
	}, nil
}

func (s *conversationService) OpenByApplication(ctx context.Context, currentUserID uint, applicationID uint) (*OpenConversationResult, error) {
	application, err := s.loadApplication(ctx, applicationID)
	if err != nil {
		return nil, err
	}
	if !userBelongsToApplication(currentUserID, application) {
		return nil, ErrConversationForbidden
	}

	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	conversation, err := s.findOrCreateConversation(tx, application)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &OpenConversationResult{
		ID:               conversation.ID,
		JobApplicationID: conversation.JobApplicationID,
	}, nil
}

func (s *conversationService) ListMessages(ctx context.Context, currentUserID uint, conversationID uint, beforeID *uint, limit int) (*MessageListResult, error) {
	if limit <= 0 {
		limit = 30
	}
	if limit > 100 {
		limit = 100
	}

	if _, err := s.conversationRepo.FindByIDForUser(ctx, conversationID, currentUserID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrConversationNotFound
		}
		return nil, err
	}

	messages, err := s.messageRepo.ListByConversation(ctx, conversationID, beforeID, limit+1)
	if err != nil {
		return nil, err
	}

	hasMore := len(messages) > limit
	if hasMore {
		messages = messages[:limit]
	}

	var nextBeforeID *uint
	if hasMore && len(messages) > 0 {
		next := messages[len(messages)-1].ID
		nextBeforeID = &next
	}

	return &MessageListResult{
		Items:        messages,
		NextBeforeID: nextBeforeID,
		HasMore:      hasMore,
	}, nil
}

func (s *conversationService) SendMessageByApplication(ctx context.Context, currentUserID uint, applicationID uint, content string) (*SendMessageResult, error) {
	application, err := s.loadApplication(ctx, applicationID)
	if err != nil {
		return nil, err
	}
	if !userBelongsToApplication(currentUserID, application) {
		return nil, ErrConversationForbidden
	}
	if !canSendMessageForApplication(application, nil) {
		return nil, ErrConversationClosed
	}

	return s.sendMessageInTransaction(ctx, currentUserID, application, nil, content)
}

func (s *conversationService) SendMessageByConversation(ctx context.Context, currentUserID uint, conversationID uint, content string) (*SendMessageResult, error) {
	conversation, err := s.conversationRepo.FindByIDForUser(ctx, conversationID, currentUserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrConversationNotFound
		}
		return nil, err
	}
	application := conversation.JobApplication
	if !canSendMessageForApplication(&application, conversation) {
		return nil, ErrConversationClosed
	}

	return s.sendMessageInTransaction(ctx, currentUserID, &application, conversation, content)
}

func (s *conversationService) MarkRead(ctx context.Context, currentUserID uint, conversationID uint) (*MarkConversationReadResult, error) {
	if _, err := s.conversationRepo.FindByIDForUser(ctx, conversationID, currentUserID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrConversationNotFound
		}
		return nil, err
	}

	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	updatedMessages, err := s.messageRepo.MarkConversationMessagesRead(tx, conversationID, currentUserID, time.Now())
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := s.conversationRepo.ResetUnread(tx, conversationID, currentUserID); err != nil {
		tx.Rollback()
		return nil, err
	}
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &MarkConversationReadResult{UpdatedMessages: updatedMessages}, nil
}

func (s *conversationService) CountUnread(ctx context.Context, currentUserID uint) (int64, error) {
	return s.conversationRepo.CountUnread(ctx, currentUserID)
}

func (s *conversationService) sendMessageInTransaction(ctx context.Context, currentUserID uint, application *models.JobApplication, existingConversation *models.Conversation, content string) (*SendMessageResult, error) {
	content = strings.TrimSpace(content)
	if content == "" {
		return nil, ErrMessageContentRequired
	}
	if utf8.RuneCountInString(content) > 2000 {
		return nil, ErrMessageTooLong
	}

	studentUserID := application.StudentID
	enterpriseUserID := uint(0)
	if application.Job != nil {
		enterpriseUserID = application.Job.EnterpriseID
	}
	if enterpriseUserID == 0 || (currentUserID != studentUserID && currentUserID != enterpriseUserID) {
		return nil, ErrConversationForbidden
	}

	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	conversation := existingConversation
	if conversation == nil {
		var err error
		conversation, err = s.findOrCreateConversation(tx, application)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	conversationID := conversation.ID
	receiverID := enterpriseUserID
	receiverRole := models.RoleEnterprise
	if currentUserID == enterpriseUserID {
		receiverID = studentUserID
		receiverRole = models.RoleStudent
	}

	message := &models.Message{
		ConversationID: &conversationID,
		SenderID:       currentUserID,
		ReceiverID:     &receiverID,
		Type:           models.MessageTypeText,
		Content:        content,
	}
	if err := s.messageRepo.Create(tx, message); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := s.conversationRepo.UpdateLastMessage(tx, conversation.ID, message.ID, message.CreatedAt, string(receiverRole)); err != nil {
		tx.Rollback()
		return nil, err
	}

	if _, err := s.notificationService.NotifyNewMessageTx(tx, receiverID, receiverRole, conversation.ID, senderDisplayName(currentUserID, application)); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &SendMessageResult{
		Conversation: OpenConversationResult{
			ID:               conversation.ID,
			JobApplicationID: conversation.JobApplicationID,
		},
		Message: *message,
	}, nil
}

func (s *conversationService) findOrCreateConversation(tx *gorm.DB, application *models.JobApplication) (*models.Conversation, error) {
	conversation, err := s.conversationRepo.FindByApplicationIDTx(tx, application.ID)
	if err == nil {
		return conversation, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	if application.Job == nil || application.Job.EnterpriseID == 0 {
		return nil, ErrApplicationNotFound
	}

	conversation = &models.Conversation{
		JobApplicationID: application.ID,
		StudentUserID:    application.StudentID,
		EnterpriseUserID: application.Job.EnterpriseID,
	}
	if err := s.conversationRepo.Create(tx, conversation); err != nil {
		if existing, findErr := s.conversationRepo.FindByApplicationIDTx(tx, application.ID); findErr == nil {
			return existing, nil
		}
		return nil, err
	}
	conversation.JobApplication = *application
	return conversation, nil
}

func (s *conversationService) loadApplication(ctx context.Context, applicationID uint) (*models.JobApplication, error) {
	var application models.JobApplication
	err := s.db.WithContext(ctx).
		Preload("Job").
		Preload("Job.EnterpriseProfile").
		Preload("Student").
		Preload("Student.StudentProfile").
		First(&application, applicationID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrApplicationNotFound
		}
		return nil, err
	}
	return &application, nil
}

func (s *conversationService) buildConversationListItem(ctx context.Context, conversation models.Conversation, currentUserID uint) ConversationListItem {
	var lastMessage *models.Message
	if conversation.LastMessageID != nil {
		if message, err := s.messageRepo.FindByID(ctx, *conversation.LastMessageID); err == nil {
			lastMessage = message
		}
	}

	canSendMessages := canSendMessageForApplication(&conversation.JobApplication, &conversation)

	return ConversationListItem{
		ID:                conversation.ID,
		JobApplicationID:  conversation.JobApplicationID,
		Job:               jobSummary(conversation.JobApplication),
		Participant:       participantSummary(conversation, currentUserID),
		ApplicationStatus: conversation.JobApplication.Status,
		InterviewResult:   conversation.JobApplication.InterviewResult,
		LastMessage:       lastMessage,
		UnreadCount:       unreadCountForUser(conversation, currentUserID),
		IsClosed:          !canSendMessages,
		CanSendMessages:   canSendMessages,
		LockedReason:      conversationLockedReason(&conversation.JobApplication, &conversation),
		LastMessageAt:     conversation.LastMessageAt,
	}
}

func userBelongsToApplication(currentUserID uint, application *models.JobApplication) bool {
	if application == nil || application.Job == nil {
		return false
	}
	return currentUserID == application.StudentID || currentUserID == application.Job.EnterpriseID
}

func canSendMessageForApplication(application *models.JobApplication, conversation *models.Conversation) bool {
	if application == nil {
		return false
	}
	if conversation != nil && conversation.IsClosed {
		return false
	}
	if application.Status == models.JobApplicationRejected {
		return false
	}
	if application.InterviewResult == models.InterviewResultRejected || application.InterviewResult == models.InterviewResultNoShow {
		return false
	}
	return true
}

func conversationLockedReason(application *models.JobApplication, conversation *models.Conversation) string {
	if conversation != nil && conversation.IsClosed {
		if reason := strings.TrimSpace(conversation.ClosedReason); reason != "" {
			return reason
		}
		return "Hội thoại đã được đóng. Bạn vẫn có thể xem lại lịch sử tin nhắn."
	}
	if application == nil {
		return "Không thể xác định trạng thái đơn ứng tuyển."
	}
	if application.Status == models.JobApplicationRejected {
		return "Đơn ứng tuyển đã bị từ chối nên không thể gửi thêm tin nhắn."
	}
	if application.InterviewResult == models.InterviewResultRejected {
		return "Kết quả phỏng vấn không đạt nên hội thoại chỉ còn ở chế độ xem."
	}
	if application.InterviewResult == models.InterviewResultNoShow {
		return "Ứng viên không tham gia phỏng vấn nên hội thoại chỉ còn ở chế độ xem."
	}
	return ""
}

func jobSummary(application models.JobApplication) JobSummary {
	if application.Job == nil {
		return JobSummary{}
	}
	return JobSummary{ID: application.Job.ID, Title: application.Job.Title}
}

func participantSummary(conversation models.Conversation, currentUserID uint) ParticipantSummary {
	if currentUserID == conversation.StudentUserID {
		name := ""
		if conversation.JobApplication.Job != nil && conversation.JobApplication.Job.EnterpriseProfile != nil {
			name = conversation.JobApplication.Job.EnterpriseProfile.CompanyName
		}
		if name == "" && conversation.EnterpriseUser.EnterpriseProfile != nil {
			name = conversation.EnterpriseUser.EnterpriseProfile.CompanyName
		}
		if name == "" {
			name = conversation.EnterpriseUser.Email
		}
		return ParticipantSummary{ID: conversation.EnterpriseUserID, Name: name}
	}

	name := ""
	avatar := ""
	if conversation.JobApplication.Student != nil && conversation.JobApplication.Student.StudentProfile != nil {
		name = conversation.JobApplication.Student.StudentProfile.Name
		avatar = conversation.JobApplication.Student.StudentProfile.Avatar
	}
	if name == "" && conversation.StudentUser.StudentProfile != nil {
		name = conversation.StudentUser.StudentProfile.Name
		avatar = conversation.StudentUser.StudentProfile.Avatar
	}
	if name == "" {
		name = conversation.StudentUser.Email
	}
	return ParticipantSummary{ID: conversation.StudentUserID, Name: name, Avatar: avatar}
}

func senderDisplayName(senderID uint, application *models.JobApplication) string {
	if application == nil {
		return ""
	}
	if senderID == application.StudentID {
		if application.Student != nil && application.Student.StudentProfile != nil && strings.TrimSpace(application.Student.StudentProfile.Name) != "" {
			return application.Student.StudentProfile.Name
		}
		if application.Student != nil {
			return application.Student.Email
		}
		return "Ứng viên"
	}
	if application.Job != nil && application.Job.EnterpriseProfile != nil && strings.TrimSpace(application.Job.EnterpriseProfile.CompanyName) != "" {
		return application.Job.EnterpriseProfile.CompanyName
	}
	return "Nhà tuyển dụng"
}

func unreadCountForUser(conversation models.Conversation, currentUserID uint) int {
	if currentUserID == conversation.StudentUserID {
		return conversation.StudentUnreadCount
	}
	if currentUserID == conversation.EnterpriseUserID {
		return conversation.EnterpriseUnreadCount
	}
	return 0
}
