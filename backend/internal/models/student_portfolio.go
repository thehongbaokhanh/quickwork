package models

import "time"

type StudentPortfolio struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	StudentID uint      `gorm:"not null;index" json:"student_id"`
	Title     string    `gorm:"type:varchar(150);not null" json:"title"`
	URL       string    `gorm:"type:varchar(500);not null" json:"url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (StudentPortfolio) TableName() string {
	return "student_portfolios"
}
