package repositories

import (
	"context"
	"time"

	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type NotificationRepository interface {
	Create(ctx context.Context, notification *models.Notification) error
	CreateTx(tx *gorm.DB, notification *models.Notification) error
	ListByUser(ctx context.Context, userID uint, isRead *bool, notificationType string, limit int, offset int) ([]models.Notification, int64, error)
	CountUnread(ctx context.Context, userID uint) (int64, error)
	MarkAsRead(ctx context.Context, notificationID uint, userID uint, readAt time.Time) (bool, error)
	MarkAllAsRead(ctx context.Context, userID uint, readAt time.Time) (int64, error)
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) Create(ctx context.Context, notification *models.Notification) error {
	return r.db.WithContext(ctx).Create(notification).Error
}

func (r *notificationRepository) CreateTx(tx *gorm.DB, notification *models.Notification) error {
	return tx.Create(notification).Error
}

func (r *notificationRepository) ListByUser(ctx context.Context, userID uint, isRead *bool, notificationType string, limit int, offset int) ([]models.Notification, int64, error) {
	var notifications []models.Notification
	var total int64

	query := r.db.WithContext(ctx).
		Model(&models.Notification{}).
		Where("user_id = ?", userID)

	if isRead != nil {
		query = query.Where("is_read = ?", *isRead)
	}
	if notificationType != "" {
		query = query.Where("type = ?", notificationType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notifications).Error
	return notifications, total, err
}

func (r *notificationRepository) CountUnread(ctx context.Context, userID uint) (int64, error) {
	var total int64
	err := r.db.WithContext(ctx).
		Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&total).Error
	return total, err
}

func (r *notificationRepository) MarkAsRead(ctx context.Context, notificationID uint, userID uint, readAt time.Time) (bool, error) {
	result := r.db.WithContext(ctx).
		Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Updates(map[string]any{
			"is_read": true,
			"read_at": readAt,
		})
	if result.Error != nil {
		return false, result.Error
	}
	return result.RowsAffected > 0, nil
}

func (r *notificationRepository) MarkAllAsRead(ctx context.Context, userID uint, readAt time.Time) (int64, error) {
	result := r.db.WithContext(ctx).
		Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]any{
			"is_read": true,
			"read_at": readAt,
		})
	if result.Error != nil {
		return 0, result.Error
	}
	return result.RowsAffected, nil
}
