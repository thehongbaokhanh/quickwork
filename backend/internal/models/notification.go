package models

import "time"

type NotificationType string

const (
	NotificationInfo    NotificationType = "INFO"
	NotificationWarning NotificationType = "WARNING"
	NotificationAlert   NotificationType = "ALERT"
)

type Notification struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	UserID    uint             `gorm:"not null;index" json:"user_id"`
	Type      NotificationType `gorm:"type:varchar(50);not null" json:"type"`
	Title     string           `gorm:"type:varchar(255);not null" json:"title"`
	Content   string           `gorm:"type:text;not null" json:"content"`
	IsRead    bool             `gorm:"default:false;not null" json:"is_read"`
	CreatedAt time.Time        `json:"created_at"`
}

func (Notification) TableName() string {
	return "notifications"
}
