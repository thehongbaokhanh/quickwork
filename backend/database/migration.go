// Package database handles database schema migrations.
package database

import (
	"quickwork.local/backend/internal/models"
	"gorm.io/gorm"
)

// Migrate runs all database migrations.
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.StudentProfile{},
		&models.EnterpriseProfile{},
		&models.Job{},
	)
}