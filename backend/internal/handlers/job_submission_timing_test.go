package handlers

import (
	"testing"
	"time"

	"quickwork.local/backend/internal/models"
)

func TestApplyJobSubmissionTimingFreezesPendingDeadline(t *testing.T) {
	submittedAt := time.Date(2026, 8, 22, 8, 0, 0, 0, time.UTC)
	job := &models.Job{Status: models.JobPending}

	applyJobSubmissionTiming(job, models.JobDraft, true, 48, submittedAt)
	if job.SubmittedAt == nil || !job.SubmittedAt.Equal(submittedAt) {
		t.Fatalf("SubmittedAt = %v, want %v", job.SubmittedAt, submittedAt)
	}
	wantDue := submittedAt.Add(48 * time.Hour)
	if job.ReviewDueAt == nil || !job.ReviewDueAt.Equal(wantDue) {
		t.Fatalf("ReviewDueAt = %v, want %v", job.ReviewDueAt, wantDue)
	}

	editedAt := submittedAt.Add(6 * time.Hour)
	applyJobSubmissionTiming(job, models.JobPending, true, 24, editedAt)
	if !job.SubmittedAt.Equal(submittedAt) || !job.ReviewDueAt.Equal(wantDue) {
		t.Fatalf("editing a pending job moved its frozen deadline: %+v", job)
	}
}

func TestApplyJobSubmissionTimingResubmitCreatesNewDeadline(t *testing.T) {
	oldSubmitted := time.Date(2026, 8, 20, 8, 0, 0, 0, time.UTC)
	oldDue := oldSubmitted.Add(24 * time.Hour)
	reviewedAt := oldDue
	resubmittedAt := time.Date(2026, 8, 22, 9, 0, 0, 0, time.UTC)
	job := &models.Job{
		Status:       models.JobPending,
		SubmittedAt:  &oldSubmitted,
		ReviewDueAt:  &oldDue,
		ReviewedAt:   &reviewedAt,
		RejectReason: "Cần chỉnh sửa",
	}

	applyJobSubmissionTiming(job, models.JobRejected, true, 72, resubmittedAt)
	if job.SubmittedAt == nil || !job.SubmittedAt.Equal(resubmittedAt) {
		t.Fatalf("SubmittedAt = %v, want %v", job.SubmittedAt, resubmittedAt)
	}
	wantDue := resubmittedAt.Add(72 * time.Hour)
	if job.ReviewDueAt == nil || !job.ReviewDueAt.Equal(wantDue) {
		t.Fatalf("ReviewDueAt = %v, want %v", job.ReviewDueAt, wantDue)
	}
	if job.ReviewedAt != nil || job.RejectReason != "" {
		t.Fatalf("resubmission retained previous review state: %+v", job)
	}
}

func TestApplyJobSubmissionTimingMarksAutomaticApprovalReviewed(t *testing.T) {
	now := time.Date(2026, 8, 22, 10, 0, 0, 0, time.UTC)
	job := &models.Job{Status: models.JobApproved}

	applyJobSubmissionTiming(job, models.JobDraft, true, 48, now)
	if job.SubmittedAt == nil || !job.SubmittedAt.Equal(now) {
		t.Fatalf("SubmittedAt = %v, want %v", job.SubmittedAt, now)
	}
	if job.ReviewedAt == nil || !job.ReviewedAt.Equal(now) {
		t.Fatalf("ReviewedAt = %v, want %v", job.ReviewedAt, now)
	}
	if job.ReviewDueAt != nil {
		t.Fatalf("automatic approval unexpectedly has a pending deadline: %v", job.ReviewDueAt)
	}
}
