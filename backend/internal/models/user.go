package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Email    string `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password string `gorm:"type:varchar(255);not null" json:"-"`

	Role   string `gorm:"type:enum('ADMIN','STUDENT','ENTERPRISE');default:'STUDENT';not null" json:"role"`
	Status string `gorm:"type:enum('ACTIVE','INACTIVE','BANNED');default:'ACTIVE';not null" json:"status"`

	StudentProfile    *StudentProfile    `gorm:"foreignKey:UserID" json:"student_profile,omitempty"`
	EnterpriseProfile *EnterpriseProfile `gorm:"foreignKey:UserID" json:"enterprise_profile,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (User) TableName() string {
	return "users"
}
