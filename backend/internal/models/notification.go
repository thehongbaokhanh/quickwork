package models

import "time"

type NotificationType string

const (
	NotificationTypeApplication NotificationType = "APPLICATION"
	NotificationTypeInterview   NotificationType = "INTERVIEW"
	NotificationTypeJob         NotificationType = "JOB"
	NotificationTypeKYB         NotificationType = "KYB"
	NotificationTypeMessage     NotificationType = "MESSAGE"
	NotificationTypeSystem      NotificationType = "SYSTEM"

	NotificationInfo    NotificationType = "INFO"
	NotificationWarning NotificationType = "WARNING"
	NotificationAlert   NotificationType = "ALERT"
)

type Notification struct {
	ID      uint             `gorm:"primaryKey" json:"id"`
	EventID *string          `gorm:"type:char(36);uniqueIndex" json:"-"`
	UserID  uint             `gorm:"not null;index:idx_notifications_user_created" json:"user_id"`
	Type    NotificationType `gorm:"type:varchar(30);not null;index" json:"type"`
	Title   string           `gorm:"type:varchar(255);not null" json:"title"`
	Content string           `gorm:"type:text;not null" json:"content"`

	SourceType string `gorm:"type:varchar(50);index" json:"source_type,omitempty"`
	SourceID   *uint  `gorm:"index" json:"source_id,omitempty"`
	ActionURL  string `gorm:"type:varchar(500)" json:"action_url,omitempty"`

	IsRead bool       `gorm:"default:false;not null;index" json:"is_read"`
	ReadAt *time.Time `json:"read_at,omitempty"`

	User User `gorm:"foreignKey:UserID" json:"-"`

	CreatedAt time.Time `gorm:"index:idx_notifications_user_created" json:"created_at"`
}

func (Notification) TableName() string {
	return "notifications"
}
