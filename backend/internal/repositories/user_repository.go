package repositories

import (
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

type UserRepository interface {
	FindByEmail(tx *gorm.DB, email string) (*models.User, error)
	FindByID(tx *gorm.DB, id uint) (*models.User, error)
	Create(tx *gorm.DB, user *models.User) error
	UpdatePassword(tx *gorm.DB, id uint, hashedPassword string) error
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

func (r *userRepository) FindByID(tx *gorm.DB, id uint) (*models.User, error) {
	var user models.User
	err := tx.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Create(tx *gorm.DB, user *models.User) error {
	return tx.Create(user).Error
}

func (r *userRepository) UpdatePassword(tx *gorm.DB, id uint, hashedPassword string) error {
	return tx.Model(&models.User{}).Where("id = ?", id).Update("password", hashedPassword).Error
}

func (r *userRepository) CountAdmin(tx *gorm.DB) (int64, error) {
	var count int64

	err := tx.Model(&models.User{}).
		Where("role = ?", models.RoleAdmin).
		Count(&count).Error

	return count, err
}
