package models

import "time"

type MessageType string

const (
	MessageTypeText   MessageType = "TEXT"
	MessageTypeSystem MessageType = "SYSTEM"
)

type Message struct {
	ID             uint        `gorm:"primaryKey" json:"id"`
	ConversationID *uint       `gorm:"index:idx_messages_conversation_created" json:"conversation_id,omitempty"`
	SenderID       uint        `gorm:"not null;index" json:"sender_id"`
	ReceiverID     *uint       `gorm:"index" json:"receiver_id,omitempty"`
	Type           MessageType `gorm:"type:varchar(20);not null;default:'TEXT'" json:"type"`
	Content        string      `gorm:"type:text;not null" json:"content"`
	IsRead         bool        `gorm:"default:false;not null" json:"is_read"`
	ReadAt         *time.Time  `gorm:"index" json:"read_at,omitempty"`
	CreatedAt      time.Time   `gorm:"index:idx_messages_conversation_created" json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`

	Conversation *Conversation `gorm:"foreignKey:ConversationID" json:"-"`
	Sender       User          `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
}

func (Message) TableName() string {
	return "messages"
}
