package models

import "time"

type Conversation struct {
	ID               uint `gorm:"primaryKey" json:"id"`
	JobApplicationID uint `gorm:"not null;uniqueIndex" json:"job_application_id"`

	StudentUserID    uint `gorm:"not null;index:idx_conversations_student_last" json:"student_user_id"`
	EnterpriseUserID uint `gorm:"not null;index:idx_conversations_enterprise_last" json:"enterprise_user_id"`

	LastMessageID *uint      `gorm:"index" json:"last_message_id,omitempty"`
	LastMessageAt *time.Time `gorm:"index:idx_conversations_student_last;index:idx_conversations_enterprise_last;index:idx_conversations_closed_last" json:"last_message_at,omitempty"`

	StudentUnreadCount    int `gorm:"not null;default:0" json:"student_unread_count"`
	EnterpriseUnreadCount int `gorm:"not null;default:0" json:"enterprise_unread_count"`

	IsClosed     bool       `gorm:"not null;default:false;index:idx_conversations_closed_last" json:"is_closed"`
	ClosedAt     *time.Time `json:"closed_at,omitempty"`
	ClosedReason string     `gorm:"type:varchar(255)" json:"closed_reason,omitempty"`

	JobApplication JobApplication `gorm:"foreignKey:JobApplicationID" json:"job_application,omitempty"`
	StudentUser    User           `gorm:"foreignKey:StudentUserID" json:"student,omitempty"`
	EnterpriseUser User           `gorm:"foreignKey:EnterpriseUserID" json:"enterprise,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Conversation) TableName() string {
	return "conversations"
}
