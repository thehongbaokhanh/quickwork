package models

import (
	"time"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin      UserRole = "ADMIN"
	RoleStudent    UserRole = "STUDENT"
	RoleEnterprise UserRole = "ENTERPRISE"
)

type UserStatus string

const (
	UserStatusActive   UserStatus = "ACTIVE"
	UserStatusInactive UserStatus = "INACTIVE"
	UserStatusBanned   UserStatus = "BANNED"
)

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Email    string `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password string `gorm:"type:varchar(255);not null" json:"-"`

	Role   UserRole   `gorm:"type:varchar(20);default:'STUDENT';not null" json:"role"`
	Status UserStatus `gorm:"type:varchar(20);default:'ACTIVE';not null" json:"status"`

	StudentProfile    *StudentProfile    `gorm:"foreignKey:UserID" json:"student_profile,omitempty"`
	EnterpriseProfile *EnterpriseProfile `gorm:"foreignKey:UserID" json:"enterprise_profile,omitempty"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (User) TableName() string {
	return "users"
}

