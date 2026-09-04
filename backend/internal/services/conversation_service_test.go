package services

import (
	"strings"
	"testing"

	"quickwork.local/backend/internal/models"
)

func TestCanSendMessageForApplication(t *testing.T) {
	tests := []struct {
		name         string
		application  *models.JobApplication
		conversation *models.Conversation
		want         bool
	}{
		{name: "applied application stays open", application: &models.JobApplication{Status: models.JobApplicationApplied}, want: true},
		{name: "accepted application stays open", application: &models.JobApplication{Status: models.JobApplicationAccepted}, want: true},
		{name: "hired result stays open", application: &models.JobApplication{Status: models.JobApplicationAccepted, InterviewResult: models.InterviewResultHired}, want: true},
		{name: "closed job does not close chat", application: &models.JobApplication{Status: models.JobApplicationAccepted, Job: &models.Job{Status: models.JobClosed}}, want: true},
		{name: "rejected application is locked", application: &models.JobApplication{Status: models.JobApplicationRejected}, want: false},
		{name: "rejected interview is locked", application: &models.JobApplication{Status: models.JobApplicationAccepted, InterviewResult: models.InterviewResultRejected}, want: false},
		{name: "no show interview is locked", application: &models.JobApplication{Status: models.JobApplicationAccepted, InterviewResult: models.InterviewResultNoShow}, want: false},
		{name: "explicitly closed conversation is locked", application: &models.JobApplication{Status: models.JobApplicationAccepted}, conversation: &models.Conversation{IsClosed: true}, want: false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := canSendMessageForApplication(test.application, test.conversation); got != test.want {
				t.Fatalf("canSendMessageForApplication() = %v, want %v", got, test.want)
			}
		})
	}
}

func TestConversationLockedReason(t *testing.T) {
	tests := []struct {
		name         string
		application  *models.JobApplication
		conversation *models.Conversation
		contains     string
	}{
		{name: "custom close reason", application: &models.JobApplication{}, conversation: &models.Conversation{IsClosed: true, ClosedReason: "Vi phạm quy định"}, contains: "Vi phạm quy định"},
		{name: "application rejection", application: &models.JobApplication{Status: models.JobApplicationRejected}, contains: "đơn ứng tuyển"},
		{name: "interview rejection", application: &models.JobApplication{InterviewResult: models.InterviewResultRejected}, contains: "phỏng vấn"},
		{name: "no show", application: &models.JobApplication{InterviewResult: models.InterviewResultNoShow}, contains: "không tham gia"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got := conversationLockedReason(test.application, test.conversation)
			if !strings.Contains(strings.ToLower(got), strings.ToLower(test.contains)) {
				t.Fatalf("conversationLockedReason() = %q, want it to contain %q", got, test.contains)
			}
		})
	}
}
