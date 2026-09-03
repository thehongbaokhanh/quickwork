package repositories

import (
	"context"
	"time"

	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type MessageRepository interface {
	Create(tx *gorm.DB, message *models.Message) error
	FindByID(ctx context.Context, id uint) (*models.Message, error)
	ListByConversation(ctx context.Context, conversationID uint, beforeID *uint, limit int) ([]models.Message, error)
	MarkConversationMessagesRead(tx *gorm.DB, conversationID uint, currentUserID uint, readAt time.Time) (int64, error)
}

type messageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) MessageRepository {
	return &messageRepository{db: db}
}

func (r *messageRepository) Create(tx *gorm.DB, message *models.Message) error {
	return tx.Create(message).Error
}

func (r *messageRepository) FindByID(ctx context.Context, id uint) (*models.Message, error) {
	var message models.Message
	if err := r.db.WithContext(ctx).First(&message, id).Error; err != nil {
		return nil, err
	}
	return &message, nil
}

func (r *messageRepository) ListByConversation(ctx context.Context, conversationID uint, beforeID *uint, limit int) ([]models.Message, error) {
	var messages []models.Message
	query := r.db.WithContext(ctx).
		Where("conversation_id = ?", conversationID)

	if beforeID != nil && *beforeID > 0 {
		query = query.Where("id < ?", *beforeID)
	}

	err := query.
		Order("id DESC").
		Limit(limit).
		Find(&messages).Error
	return messages, err
}

func (r *messageRepository) MarkConversationMessagesRead(tx *gorm.DB, conversationID uint, currentUserID uint, readAt time.Time) (int64, error) {
	result := tx.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id <> ? AND read_at IS NULL", conversationID, currentUserID).
		Updates(map[string]any{
			"is_read": true,
			"read_at": readAt,
		})
	if result.Error != nil {
		return 0, result.Error
	}
	return result.RowsAffected, nil
}
