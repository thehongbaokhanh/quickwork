package repositories

import (
	"context"

	"gorm.io/gorm"

	"quickwork.local/backend/internal/models"
)

// RecommendationRepository exposes only the profile and eligible-job reads
// needed by the hybrid recommendation service.
type RecommendationRepository interface {
	FindStudentMatchProfile(ctx context.Context, studentID uint) (*models.StudentProfile, error)
	FindEligibleRecommendationJobs(ctx context.Context) ([]models.Job, error)
}

type recommendationRepository struct {
	db *gorm.DB
}

func NewRecommendationRepository(db *gorm.DB) RecommendationRepository {
	return &recommendationRepository{db: db}
}

func (r *recommendationRepository) FindStudentMatchProfile(ctx context.Context, studentID uint) (*models.StudentProfile, error) {
	var profile models.StudentProfile
	err := r.db.WithContext(ctx).
		Preload("Skills.Category").
		Preload("WorkExperiences").
		Preload("Educations").
		Where("user_id = ?", studentID).
		First(&profile).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *recommendationRepository) FindEligibleRecommendationJobs(ctx context.Context) ([]models.Job, error) {
	var jobs []models.Job
	err := r.db.WithContext(ctx).
		Select(jobWithEngagementSelect).
		Preload("EnterpriseProfile").
		Preload("Skills").
		Preload("Skills.Category").
		Where("status = ? AND slots > 0", models.JobApproved).
		Order("created_at DESC").
		Find(&jobs).Error
	return jobs, err
}
