package models

import "time"

type JobApplicationStatus string

const (
	JobApplicationApplied  JobApplicationStatus = "APPLIED"
	JobApplicationAccepted JobApplicationStatus = "ACCEPTED"
	JobApplicationRejected JobApplicationStatus = "REJECTED"
)

type JobApplication struct {
	ID uint `gorm:"primaryKey" json:"id"`

	StudentID uint `gorm:"not null;index;uniqueIndex:idx_student_job_application" json:"student_id"`
	JobID     uint `gorm:"not null;index;uniqueIndex:idx_student_job_application" json:"job_id"`

	Status JobApplicationStatus `gorm:"type:varchar(20);default:'APPLIED';not null" json:"status"`

	EmployerNote string     `gorm:"type:text" json:"employer_note,omitempty"`
	ReviewedAt   *time.Time `json:"reviewed_at,omitempty"`

	Student *User `gorm:"foreignKey:StudentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"student,omitempty"`
	Job     *Job  `gorm:"foreignKey:JobID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"job,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (JobApplication) TableName() string {
	return "job_applications"
}
