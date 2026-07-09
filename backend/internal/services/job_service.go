package services

import (
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type CreateJobDTO struct {
	Title        string `json:"title" validate:"required"`
	Description  string `json:"description"`
	Requirements string `json:"requirements"`
	Salary       string `json:"salary"`
	Location     string `json:"location"`
	Slots        int    `json:"slots"`
	Status       string `json:"status"`
}

type JobService interface {
	CreateJob(enterpriseID uint, req CreateJobDTO) error
	GetDashboardStats() (map[string]int64, error)
	GetAdminPendingJobs() ([]models.Job, error)
	ReviewJob(jobID uint, status string, rejectReason string) error
}

type jobService struct {
	db *gorm.DB
}

func NewJobService(db *gorm.DB, _ any) JobService {
	return &jobService{
		db: db,
	}
}

func (s *jobService) CreateJob(enterpriseID uint, req CreateJobDTO) error {
	status := models.JobDraft
	if req.Status != "" {
		status = models.JobStatus(req.Status)
	}

	job := &models.Job{
		EnterpriseID: enterpriseID,
		Title:        req.Title,
		Description:  req.Description,
		Requirements: req.Requirements,
		Salary:       req.Salary,
		Location:     req.Location,
		Slots:        req.Slots,
		Status:       status,
	}

	return s.db.Create(job).Error
}

func (s *jobService) GetDashboardStats() (map[string]int64, error) {
	var totalStudents int64
	var totalEnterprises int64
	var activeJobs int64
	var pendingJobs int64

	if err := s.db.Model(&models.User{}).Where("role = ?", "STUDENT").Count(&totalStudents).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&models.User{}).Where("role = ?", "ENTERPRISE").Count(&totalEnterprises).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&models.Job{}).Where("status = ?", "APPROVED").Count(&activeJobs).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&models.Job{}).Where("status = ?", "PENDING").Count(&pendingJobs).Error; err != nil {
		return nil, err
	}

	return map[string]int64{
		"total_students":    totalStudents,
		"total_enterprises": totalEnterprises,
		"active_jobs":       activeJobs,
		"pending_jobs":      pendingJobs,
	}, nil
}

func (s *jobService) GetAdminPendingJobs() ([]models.Job, error) {
	var jobs []models.Job
	err := s.db.Model(&models.Job{}).
		Preload("EnterpriseProfile").
		Where("status = ?", "PENDING").
		Find(&jobs).Error
	return jobs, err
}

func (s *jobService) ReviewJob(jobID uint, status string, rejectReason string) error {
	var job models.Job
	if err := s.db.First(&job, jobID).Error; err != nil {
		return err
	}

	job.Status = models.JobStatus(status)
	if status == "REJECTED" {
		job.RejectReason = rejectReason
	} else {
		job.RejectReason = ""
	}

	return s.db.Save(&job).Error
}