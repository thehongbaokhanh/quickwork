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

	LogoURL          string `gorm:"column:logo_url;type:varchar(500)" json:"logo_url"`
	CoverImageURL    string `gorm:"column:cover_image_url;type:varchar(500)" json:"cover_image_url"`
	Industry         string `gorm:"column:industry;type:varchar(255)" json:"industry"`
	CompanySize      string `gorm:"column:company_size;type:varchar(100)" json:"company_size"`
	WorkModel        string `gorm:"column:work_model;type:varchar(100)" json:"work_model"`
	RecruitmentLevel string `gorm:"column:recruitment_level;type:varchar(100)" json:"recruitment_level"`
	Description      string `gorm:"column:description;type:text" json:"description"`
	Address          string `gorm:"column:address;type:varchar(500)" json:"address"`
	Country          string `gorm:"column:country;type:varchar(150)" json:"country"`
	City             string `gorm:"column:city;type:varchar(150)" json:"city"`
	District         string `gorm:"column:district;type:varchar(150)" json:"district"`
	Ward             string `gorm:"column:ward;type:varchar(150)" json:"ward"`
	Latitude         string `gorm:"column:latitude;type:varchar(32)" json:"latitude"`
	Longitude        string `gorm:"column:longitude;type:varchar(32)" json:"longitude"`

	KYBStatus KYBStatus `gorm:"column:kyb_status;type:varchar(20);default:'PENDING'" json:"kyb_status,omitempty"`

	StatusKYB KYBStatus `gorm:"column:status_kyb;type:varchar(20);default:'PENDING'" json:"status_kyb"`

	KYBRejectReason string `gorm:"column:kyb_reject_reason;type:text" json:"kyb_reject_reason,omitempty"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (EnterpriseProfile) TableName() string {
	return "enterprise_profiles"
}
