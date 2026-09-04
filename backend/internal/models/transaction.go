package models

import (
	"time"
	"gorm.io/gorm"
)

type TransactionStatus string

const (
	TransactionStatusPending TransactionStatus = "PENDING"
	TransactionStatusSuccess TransactionStatus = "SUCCESS"
	TransactionStatusFailed  TransactionStatus = "FAILED"
)

type Transaction struct {
	ID            uint              `gorm:"primaryKey" json:"id"`
	ApplicationID uint              `gorm:"not null;index" json:"application_id"`
	Amount        float64           `gorm:"type:decimal(15,2);not null" json:"amount"`
	Status        TransactionStatus `gorm:"type:varchar(20);default:'PENDING';not null" json:"status"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
	DeletedAt     gorm.DeletedAt    `gorm:"index" json:"-"`
}

func (Transaction) TableName() string {
	return "transactions"
}
