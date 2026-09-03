package repositories

import (
	"context"
	"time"

	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type ConversationRepository interface {
	FindByApplicationID(ctx context.Context, applicationID uint) (*models.Conversation, error)
	FindByApplicationIDTx(tx *gorm.DB, applicationID uint) (*models.Conversation, error)
	FindByIDForUser(ctx context.Context, conversationID uint, userID uint) (*models.Conversation, error)
	Create(tx *gorm.DB, conversation *models.Conversation) error
	ListForUser(ctx context.Context, userID uint, limit int, offset int) ([]models.Conversation, int64, error)
	UpdateLastMessage(tx *gorm.DB, conversationID uint, messageID uint, messageAt time.Time, receiverRole string) error
	ResetUnread(tx *gorm.DB, conversationID uint, userID uint) error
	CountUnread(ctx context.Context, userID uint) (int64, error)
}

type conversationRepository struct {
	db *gorm.DB
}

func NewConversationRepository(db *gorm.DB) ConversationRepository {
	return &conversationRepository{db: db}
}

func preloadConversation(query *gorm.DB) *gorm.DB {
	return query.
		Preload("JobApplication").
		Preload("JobApplication.Job").
		Preload("JobApplication.Job.EnterpriseProfile").
		Preload("JobApplication.Student").
		Preload("JobApplication.Student.StudentProfile").
		Preload("StudentUser.StudentProfile").
		Preload("EnterpriseUser.EnterpriseProfile")
}

func (r *conversationRepository) FindByApplicationID(ctx context.Context, applicationID uint) (*models.Conversation, error) {
	var conversation models.Conversation
	err := preloadConversation(r.db.WithContext(ctx)).
		Where("job_application_id = ?", applicationID).
		First(&conversation).Error
	if err != nil {
		return nil, err
	}
	return &conversation, nil
}

func (r *conversationRepository) FindByApplicationIDTx(tx *gorm.DB, applicationID uint) (*models.Conversation, error) {
	var conversation models.Conversation
	err := preloadConversation(tx).
		Where("job_application_id = ?", applicationID).
		First(&conversation).Error
	if err != nil {
		return nil, err
	}
	return &conversation, nil
}

func (r *conversationRepository) FindByIDForUser(ctx context.Context, conversationID uint, userID uint) (*models.Conversation, error) {
	var conversation models.Conversation
	err := preloadConversation(r.db.WithContext(ctx)).
		Where("id = ? AND (student_user_id = ? OR enterprise_user_id = ?)", conversationID, userID, userID).
		First(&conversation).Error
	if err != nil {
		return nil, err
	}
	return &conversation, nil
}

func (r *conversationRepository) Create(tx *gorm.DB, conversation *models.Conversation) error {
	return tx.Create(conversation).Error
}

func (r *conversationRepository) ListForUser(ctx context.Context, userID uint, limit int, offset int) ([]models.Conversation, int64, error) {
	var conversations []models.Conversation
	var total int64

	query := r.db.WithContext(ctx).
		Model(&models.Conversation{}).
		Where("student_user_id = ? OR enterprise_user_id = ?", userID, userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := preloadConversation(query).
		Order("COALESCE(last_message_at, created_at) DESC").
		Limit(limit).
		Offset(offset).
		Find(&conversations).Error
	return conversations, total, err
}

func (r *conversationRepository) UpdateLastMessage(tx *gorm.DB, conversationID uint, messageID uint, messageAt time.Time, receiverRole string) error {
	updates := map[string]any{
		"last_message_id": messageID,
		"last_message_at": messageAt,
	}
	if receiverRole == string(models.RoleStudent) {
		updates["student_unread_count"] = gorm.Expr("student_unread_count + ?", 1)
	} else if receiverRole == string(models.RoleEnterprise) {
		updates["enterprise_unread_count"] = gorm.Expr("enterprise_unread_count + ?", 1)
	}

	return tx.Model(&models.Conversation{}).
		Where("id = ?", conversationID).
		Updates(updates).Error
}

func (r *conversationRepository) ResetUnread(tx *gorm.DB, conversationID uint, userID uint) error {
	return tx.Model(&models.Conversation{}).
		Where("id = ? AND (student_user_id = ? OR enterprise_user_id = ?)", conversationID, userID, userID).
		Updates(map[string]any{
			"student_unread_count":    gorm.Expr("CASE WHEN student_user_id = ? THEN 0 ELSE student_unread_count END", userID),
			"enterprise_unread_count": gorm.Expr("CASE WHEN enterprise_user_id = ? THEN 0 ELSE enterprise_unread_count END", userID),
		}).Error
}

func (r *conversationRepository) CountUnread(ctx context.Context, userID uint) (int64, error) {
	var total int64
	err := r.db.WithContext(ctx).
		Model(&models.Conversation{}).
		Select("COALESCE(SUM(CASE WHEN student_user_id = ? THEN student_unread_count WHEN enterprise_user_id = ? THEN enterprise_unread_count ELSE 0 END), 0)", userID, userID).
		Scan(&total).Error
	return total, err
}
