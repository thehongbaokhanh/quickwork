package repositories

import (
	"quickwork.local/backend/internal/models"
	"gorm.io/gorm"
)

type EnterpriseRepository interface {
	FindByTaxCode(tx *gorm.DB, taxCode string) (*models.EnterpriseProfile, error)
	Create(tx *gorm.DB, profile *models.EnterpriseProfile) error
}

type enterpriseRepository struct{}

func NewEnterpriseRepository() EnterpriseRepository {
	return &enterpriseRepository{}
}

func (r *enterpriseRepository) FindByTaxCode(tx *gorm.DB, taxCode string) (*models.EnterpriseProfile, error) {
	var profile models.EnterpriseProfile
	err := tx.Where("tax_code = ?", taxCode).First(&profile).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *enterpriseRepository) Create(tx *gorm.DB, profile *models.EnterpriseProfile) error {
	return tx.Create(profile).Error
}