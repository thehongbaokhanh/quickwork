package repositories_test

import (
	"errors"
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
)

func TestBaseRepository_WithTransaction(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open sqlite database: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		t.Fatalf("Failed to migrate: %v", err)
	}

	repo := repositories.NewBaseRepository(db)

	t.Run("Commit on success", func(t *testing.T) {
		err := repo.WithTransaction(func(tx *gorm.DB) error {
			user := &models.User{
				Email:    "test@success.com",
				Password: "password",
				Role:     models.RoleStudent,
				Status:   models.UserStatusActive,
			}
			return tx.Create(user).Error
		})

		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		var count int64
		db.Model(&models.User{}).Where("email = ?", "test@success.com").Count(&count)
		if count != 1 {
			t.Errorf("Expected user to be created, count = %d", count)
		}
	})

	t.Run("Rollback on error", func(t *testing.T) {
		err := repo.WithTransaction(func(tx *gorm.DB) error {
			user := &models.User{
				Email:    "test@rollback.com",
				Password: "password",
				Role:     models.RoleStudent,
				Status:   models.UserStatusActive,
			}
			if err := tx.Create(user).Error; err != nil {
				return err
			}
			return errors.New("simulated database write error")
		})

		if err == nil {
			t.Fatal("Expected error, got nil")
		}

		var count int64
		db.Model(&models.User{}).Where("email = ?", "test@rollback.com").Count(&count)
		if count != 0 {
			t.Errorf("Expected user creation to be rolled back, count = %d", count)
		}
	})
}
