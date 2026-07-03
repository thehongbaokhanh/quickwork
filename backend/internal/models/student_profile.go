package models

import (
	"time"
	"gorm.io/gorm"
)

type StudentProfile struct {
	UserID uint `gorm:"primaryKey" json:"user_id"`

	Name  string `gorm:"type:varchar(100);not null" json:"name"`
	Phone string `gorm:"type:varchar(20)" json:"phone"`

	Avatar string `gorm:"type:varchar(255)" json:"avatar"`

	Skills string `gorm:"type:text" json:"skills"`

	CVURL string `gorm:"column:cv_url;type:varchar(255)" json:"cv_url"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (StudentProfile) TableName() string {
	return "student_profiles"
}