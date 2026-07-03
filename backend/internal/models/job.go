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
    ID uint `gorm:"primaryKey"`

    EnterpriseID uint `gorm:"not null;index"`

    Title string `gorm:"size:255;not null"`

    Description string `gorm:"type:text"`

    Requirements string `gorm:"type:text"`

    Salary string `gorm:"size:255"`

    Location string `gorm:"size:255"`

    Slots int

    Status JobStatus `gorm:"type:varchar(20);default:'DRAFT'"`

    CreatedAt time.Time

    UpdatedAt time.Time
}