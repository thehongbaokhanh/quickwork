package models

import "time"

type StudentWorkExperience struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	StudentID   uint       `gorm:"not null;index" json:"student_id"`
	Position    string     `gorm:"type:varchar(150);not null" json:"position"`
	Company     string     `gorm:"type:varchar(150);not null" json:"company"`
	StartDate   time.Time  `gorm:"type:date;not null" json:"start_date"`
	EndDate     *time.Time `gorm:"type:date" json:"end_date"`
	IsCurrent   bool       `gorm:"not null;default:false" json:"is_current"`
	Description string     `gorm:"type:text" json:"description"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (StudentWorkExperience) TableName() string {
	return "student_work_experiences"
}
