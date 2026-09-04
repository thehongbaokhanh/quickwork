package models

import "time"

const OutboxEventNotificationCreate = "notification.create"

// OutboxEvent is written in the same database transaction as the business
// change, then published to RabbitMQ by the background dispatcher.
type OutboxEvent struct {
	ID          string     `gorm:"type:char(36);primaryKey" json:"id"`
	EventType   string     `gorm:"type:varchar(100);not null;index" json:"event_type"`
	Payload     []byte     `gorm:"type:longblob;not null" json:"-"`
	Attempts    int        `gorm:"not null;default:0" json:"attempts"`
	AvailableAt time.Time  `gorm:"not null;index:idx_outbox_pending" json:"available_at"`
	PublishedAt *time.Time `gorm:"index:idx_outbox_pending" json:"published_at,omitempty"`
	LastError   string     `gorm:"type:text" json:"last_error,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (OutboxEvent) TableName() string {
	return "outbox_events"
}
