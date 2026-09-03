package models

import "time"

type StudentEducation struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	StudentID   uint       `gorm:"not null;index" json:"student_id"`
	School      string     `gorm:"type:varchar(200);not null" json:"school"`
	Major       string     `gorm:"type:varchar(200);not null" json:"major"`
	Degree      string     `gorm:"type:varchar(120)" json:"degree"`
	StartDate   time.Time  `gorm:"type:date;not null" json:"start_date"`
	EndDate     *time.Time `gorm:"type:date" json:"end_date"`
	Description string     `gorm:"type:text" json:"description"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (StudentEducation) TableName() string {
	return "student_educations"
}
