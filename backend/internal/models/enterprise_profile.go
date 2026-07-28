package models

import (
	"gorm.io/gorm"
	"time"
)

type KYBStatus string

const (
	KYBPending  KYBStatus = "PENDING"
	KYBApproved KYBStatus = "APPROVED"
	KYBRejected KYBStatus = "REJECTED"
)

type EnterpriseProfile struct {
	UserID uint `gorm:"primaryKey" json:"user_id"`

	CompanyName string `gorm:"column:company_name;type:varchar(255);not null" json:"company_name"`

	Phone string `gorm:"column:phone;type:varchar(20)" json:"phone"`

	TaxCode string `gorm:"column:tax_code;type:varchar(100);uniqueIndex" json:"tax_code"`

	GPKDURL string `gorm:"column:gpkd_url;type:varchar(255)" json:"gpkd_url"`

	KYBStatus KYBStatus `gorm:"column:kyb_status;type:varchar(20);default:'PENDING'" json:"kyb_status,omitempty"`

	StatusKYB KYBStatus `gorm:"column:status_kyb;type:varchar(20);default:'PENDING'" json:"status_kyb"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (EnterpriseProfile) TableName() string {
	return "enterprise_profiles"
}
