package models

import "time"

type JobApplicationStatus string
type InterviewResult string

const (
	JobApplicationApplied  JobApplicationStatus = "APPLIED"
	JobApplicationAccepted JobApplicationStatus = "ACCEPTED"
	JobApplicationRejected JobApplicationStatus = "REJECTED"
)

const (
	InterviewResultHired    InterviewResult = "HIRED"
	InterviewResultRejected InterviewResult = "REJECTED"
	InterviewResultNoShow   InterviewResult = "NO_SHOW"
)

type JobApplication struct {
	ID uint `gorm:"primaryKey" json:"id"`

	StudentID uint `gorm:"not null;index;uniqueIndex:idx_student_job_application" json:"student_id"`
	JobID     uint `gorm:"not null;index;uniqueIndex:idx_student_job_application" json:"job_id"`

	Status JobApplicationStatus `gorm:"type:varchar(20);default:'APPLIED';not null" json:"status"`

	EmployerNote string     `gorm:"type:text" json:"employer_note,omitempty"`
	ReviewedAt   *time.Time `json:"reviewed_at,omitempty"`

	InterviewAt          *time.Time      `json:"interview_at,omitempty"`
	InterviewMethod      string          `gorm:"type:varchar(100)" json:"interview_method,omitempty"`
	InterviewLocation    string          `gorm:"type:varchar(255)" json:"interview_location,omitempty"`
	InterviewNote        string          `gorm:"type:text" json:"interview_note,omitempty"`
	InterviewScheduledAt *time.Time      `json:"interview_scheduled_at,omitempty"`
	InterviewResult      InterviewResult `gorm:"type:varchar(30)" json:"interview_result,omitempty"`
	InterviewResultNote  string          `gorm:"type:text" json:"interview_result_note,omitempty"`
	InterviewResultAt    *time.Time      `json:"interview_result_at,omitempty"`

	Student *User `gorm:"foreignKey:StudentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"student,omitempty"`
	Job     *Job  `gorm:"foreignKey:JobID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"job,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (JobApplication) TableName() string {
	return "job_applications"
}
