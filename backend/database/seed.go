// Package database provides database seed helpers.
package database

import (
	"gorm.io/gorm"
)

// Seed inserts initial data into database.
// Safe to call multiple times.
func Seed(db *gorm.DB) error {

	// TODO:
	// Create default admin
	// Create roles
	// Create categories
	// Create skills

	return nil
}