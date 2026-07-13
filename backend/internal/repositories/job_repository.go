package repositories

import (
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type JobRepository interface {
	Create(job *models.Job) error
	Update(job *models.Job) error
	FindByID(id uint) (*models.Job, error)
	FindByEnterprise(enterpriseID uint, status string) ([]models.Job, error)
	FindJobs(filters map[string]any) ([]models.Job, error)
}

type jobRepository struct {
	db *gorm.DB
}

func NewJobRepository(db *gorm.DB) JobRepository {
	return &jobRepository{
		db: db,
	}
}

func (r *jobRepository) Create(job *models.Job) error {
	return r.db.Create(job).Error
}

func (r *jobRepository) FindByID(id uint) (*models.Job, error) {
	var job models.Job
	err := r.db.Preload("EnterpriseProfile").Preload("Skills").First(&job, id).Error
	if err != nil {
		return nil, err
	}
	return &job, nil
}

func (r *jobRepository) Update(job *models.Job) error {
	return r.db.Save(job).Error
}

func (r *jobRepository) FindByEnterprise(enterpriseID uint, status string) ([]models.Job, error) {
	var jobs []models.Job

	query := r.db.Where("enterprise_id = ?", enterpriseID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Find(&jobs).Error
	return jobs, err
}

func (r *jobRepository) FindJobs(filters map[string]any) ([]models.Job, error) {
	var jobs []models.Job
	query := r.db.Model(&models.Job{})

	// Optimize payload for list queries while keeping every field the frontend displays.
	query = query.Select("id, enterprise_id, title, description, requirements, salary, location, slots, status, created_at, updated_at")

	// Resolve N+1 issues using Preload
	query = query.Preload("EnterpriseProfile").Preload("Skills").Preload("Skills.Category")

	// Dynamic filters
	for key, val := range filters {
		switch key {
		case "title":
			if strVal, ok := val.(string); ok && strVal != "" {
				query = query.Where("title LIKE ?", "%"+strVal+"%")
			}
		case "location":
			if strVal, ok := val.(string); ok && strVal != "" {
				query = query.Where("location LIKE ?", "%"+strVal+"%")
			}
		case "status":
			if statusVal, ok := val.(models.JobStatus); ok && statusVal != "" {
				query = query.Where("status = ?", statusVal)
			} else if strVal, ok := val.(string); ok && strVal != "" {
				query = query.Where("status = ?", strVal)
			}
		case "enterprise_id":
			if idVal, ok := val.(uint); ok {
				query = query.Where("enterprise_id = ?", idVal)
			} else if floatVal, ok := val.(float64); ok {
				query = query.Where("enterprise_id = ?", uint(floatVal))
			} else if intVal, ok := val.(int); ok {
				query = query.Where("enterprise_id = ?", uint(intVal))
			}
		case "salary":
			if strVal, ok := val.(string); ok && strVal != "" {
				query = query.Where("salary LIKE ?", "%"+strVal+"%")
			}
		case "q":
			if strVal, ok := val.(string); ok && strVal != "" {
				like := "%" + strVal + "%"
				query = query.Where("title LIKE ? OR description LIKE ? OR requirements LIKE ? OR location LIKE ? OR salary LIKE ?", like, like, like, like, like)
			}
		}
	}

	err := query.Order("created_at DESC").Find(&jobs).Error
	return jobs, err
}
