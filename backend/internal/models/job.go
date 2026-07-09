package models

import "time"

type JobStatus string

const (
	JobDraft    JobStatus = "DRAFT"
	JobPending  JobStatus = "PENDING"
	JobApproved JobStatus = "APPROVED"
	JobRejected JobStatus = "REJECTED"
	JobClosed   JobStatus = "CLOSED"
)

type Job struct {
	ID uint `gorm:"primaryKey" json:"id"`

	EnterpriseID uint `gorm:"not null;index" json:"enterprise_id"`

	Title string `gorm:"size:255;not null" json:"title"`

	Description string `gorm:"type:text" json:"description"`

	Requirements string `gorm:"type:text" json:"requirements"`

	Salary string `gorm:"size:255" json:"salary"`

	Location string `gorm:"size:255" json:"location"`

	Slots int `json:"slots"`

	Status JobStatus `gorm:"type:varchar(20);default:'DRAFT'" json:"status"`

	Skills            []Skill            `gorm:"many2many:job_skills;" json:"skills,omitempty"`
	EnterpriseProfile *EnterpriseProfile `gorm:"foreignKey:EnterpriseID;references:UserID" json:"enterprise_profile,omitempty"`
	RejectReason      string             `gorm:"type:text" json:"reject_reason,omitempty"`

	CreatedAt time.Time `json:"created_at"`

	UpdatedAt time.Time `json:"updated_at"`
}

func (Job) TableName() string {
	return "jobs"
}