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
	// Engagement counters are derived by repository subqueries. They are read-only
	// response fields and are intentionally excluded from database migration.
	ApplicationCount int64 `gorm:"column:application_count;->;-:migration" json:"application_count"`
	FavoriteCount    int64 `gorm:"column:favorite_count;->;-:migration" json:"favorite_count"`

	Status JobStatus `gorm:"type:varchar(20);default:'DRAFT';index:idx_jobs_status_review_due,priority:1" json:"status"`

	Skills            []Skill            `gorm:"many2many:job_skills;" json:"skills,omitempty"`
	EnterpriseProfile *EnterpriseProfile `gorm:"foreignKey:EnterpriseID;references:UserID" json:"enterprise_profile,omitempty"`
	RejectReason      string             `gorm:"type:text" json:"reject_reason,omitempty"`
	SubmittedAt       *time.Time         `json:"submitted_at,omitempty"`
	ReviewDueAt       *time.Time         `gorm:"index:idx_jobs_status_review_due,priority:2" json:"review_due_at,omitempty"`
	ReviewedAt        *time.Time         `json:"reviewed_at,omitempty"`

	CreatedAt time.Time `json:"created_at"`

	UpdatedAt time.Time `json:"updated_at"`
}

func (Job) TableName() string {
	return "jobs"
}
