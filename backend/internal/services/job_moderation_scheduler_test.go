package services

import (
	"context"
	"testing"
	"time"

	"quickwork.local/backend/internal/models"
)

func TestJobModerationSchedulerRunOnceExpiresOnlyOverduePendingJobs(t *testing.T) {
	db := openSystemSettingsTestDB(t)
	if err := db.AutoMigrate(&models.Job{}); err != nil {
		t.Fatalf("migrate jobs: %v", err)
	}

	now := time.Date(2026, 8, 22, 8, 0, 0, 0, time.UTC)
	overdueSubmitted := now.Add(-49 * time.Hour)
	overdueDue := now.Add(-time.Hour)
	futureSubmitted := now.Add(-time.Hour)
	futureDue := now.Add(47 * time.Hour)
	legacyUpdated := now.Add(-72 * time.Hour)

	jobs := []models.Job{
		{
			EnterpriseID: 1,
			Title:        "Overdue",
			Status:       models.JobPending,
			SubmittedAt:  &overdueSubmitted,
			ReviewDueAt:  &overdueDue,
		},
		{
			EnterpriseID: 1,
			Title:        "Boundary",
			Status:       models.JobPending,
			SubmittedAt:  &overdueSubmitted,
			ReviewDueAt:  &now,
		},
		{
			EnterpriseID: 1,
			Title:        "Future",
			Status:       models.JobPending,
			SubmittedAt:  &futureSubmitted,
			ReviewDueAt:  &futureDue,
		},
		{
			EnterpriseID: 1,
			Title:        "Legacy pending",
			Status:       models.JobPending,
			CreatedAt:    legacyUpdated,
			UpdatedAt:    legacyUpdated,
		},
		{
			EnterpriseID: 1,
			Title:        "Already approved",
			Status:       models.JobApproved,
		},
	}
	if err := db.Create(&jobs).Error; err != nil {
		t.Fatalf("create jobs: %v", err)
	}

	settings := newSystemSettingsService(db, time.Minute, func() time.Time { return now })
	scheduler := NewJobModerationScheduler(db, settings, nil)
	scheduler.now = func() time.Time { return now }

	expired, err := scheduler.RunOnce(context.Background())
	if err != nil {
		t.Fatalf("RunOnce() error = %v", err)
	}
	if expired != 3 {
		t.Fatalf("RunOnce() expired = %d, want 3", expired)
	}

	var got []models.Job
	if err := db.Order("id").Find(&got).Error; err != nil {
		t.Fatalf("reload jobs: %v", err)
	}
	if got[0].Status != models.JobRejected || got[0].ReviewedAt == nil {
		t.Fatalf("overdue job was not rejected: %+v", got[0])
	}
	if got[1].Status != models.JobRejected {
		t.Fatalf("job at exact deadline was not rejected: %+v", got[1])
	}
	if got[2].Status != models.JobPending || got[2].ReviewedAt != nil {
		t.Fatalf("future job changed unexpectedly: %+v", got[2])
	}
	if got[3].Status != models.JobRejected || got[3].SubmittedAt == nil || got[3].ReviewDueAt == nil {
		t.Fatalf("legacy job was not backfilled and rejected: %+v", got[3])
	}
	if got[4].Status != models.JobApproved {
		t.Fatalf("approved job changed unexpectedly: %+v", got[4])
	}

	expired, err = scheduler.RunOnce(context.Background())
	if err != nil {
		t.Fatalf("second RunOnce() error = %v", err)
	}
	if expired != 0 {
		t.Fatalf("second RunOnce() expired = %d, want idempotent 0", expired)
	}
}
