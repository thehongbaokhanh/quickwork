package models

import "time"

type FavoriteJob struct {
	ID uint `gorm:"primaryKey" json:"id"`

	StudentID uint `gorm:"not null;index;uniqueIndex:idx_student_favorite_job" json:"student_id"`
	JobID     uint `gorm:"not null;index;uniqueIndex:idx_student_favorite_job" json:"job_id"`

	Student *User `gorm:"foreignKey:StudentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"student,omitempty"`
	Job     *Job  `gorm:"foreignKey:JobID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"job,omitempty"`

	CreatedAt time.Time `json:"created_at"`
}

func (FavoriteJob) TableName() string {
	return "favorite_jobs"
}
