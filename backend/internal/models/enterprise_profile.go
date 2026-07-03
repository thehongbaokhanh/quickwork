package models

import (
	"gorm.io/gorm"
	"time"
)

const (
	KYBPending  = "PENDING"
	KYBApproved = "APPROVED"
	KYBRejected = "REJECTED"
)

type EnterpriseProfile struct {
	UserID uint `gorm:"primaryKey" json:"user_id"`

	CompanyName string `gorm:"column:company_name;type:varchar(255);not null" json:"company_name"`

	TaxCode string `gorm:"column:tax_code;type:varchar(100);uniqueIndex" json:"tax_code"`

	GPKDURL string `gorm:"column:gpkd_url;type:varchar(255)" json:"gpkd_url"`

	KYBStatus string `gorm:"column:kyb_status;size:20;default:PENDING"`

	StatusKYB string `gorm:"column:status_kyb;type:enum('PENDING','APPROVED','REJECTED');default:'PENDING'" json:"status_kyb"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`


	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (EnterpriseProfile) TableName() string {
	return "enterprise_profiles"
}
