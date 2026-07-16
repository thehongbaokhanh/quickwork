// Package database handles database schema migrations.
package database

import (
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

// Migrate runs all database migrations.
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.StudentProfile{},
		&models.EnterpriseProfile{},
		&models.Job{},
		&models.JobApplication{},
		&models.FavoriteJob{},
		&models.Category{},
		&models.Skill{},
		&models.Notification{},
		&models.Transaction{},
		&models.Message{},
	)
}
