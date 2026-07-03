package repositories

import (
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type JobRepository interface {
	Create(job *models.Job) error

	Update(job *models.Job) error

	FindByID(id uint) (*models.Job, error)

	FindByEnterprise(
		enterpriseID uint,
		status string,
	) ([]models.Job, error)
}

type jobRepository struct {
    db *gorm.DB
}

func (r *jobRepository) Create(job *models.Job) error {

    return r.db.Create(job).Error
}

func (r *jobRepository) FindByID(id uint) (*models.Job,error){

    var job models.Job

    err := r.db.First(&job,id).Error

    if err != nil{
        return nil,err
    }

    return &job,nil
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

func NewJobRepository(db *gorm.DB) JobRepository {

    return &jobRepository{
        db: db,
    }
}
