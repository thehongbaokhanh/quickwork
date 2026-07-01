package repositories

import (
	"quickwork.local/backend/internal/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindByEmail(tx *gorm.DB, email string) (*models.User, error)
	Create(tx *gorm.DB, user *models.User) error
	CountAdmin(tx *gorm.DB) (int64, error)
}

type userRepository struct{}

func NewUserRepository() UserRepository {
	return &userRepository{}
}

func (r *userRepository) FindByEmail(tx *gorm.DB, email string) (*models.User, error) {
	var user models.User
	err := tx.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Create(tx *gorm.DB, user *models.User) error {
	return tx.Create(user).Error
}

func (r *userRepository) CountAdmin(tx *gorm.DB) (int64, error) {
	var count int64

	err := tx.Model(&models.User{}).
		Where("role = ?", "admin").
		Count(&count).Error

	return count, err
}