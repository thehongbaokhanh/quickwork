package repositories

import (
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type StudentRepository interface {
	Create(db *gorm.DB, profile *models.StudentProfile) error
}

type studentRepository struct{}

func NewStudentRepository() StudentRepository {
	return &studentRepository{}
}

func (r *studentRepository) Create(db *gorm.DB, profile *models.StudentProfile) error {
	return db.Create(profile).Error
}