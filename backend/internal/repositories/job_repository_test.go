package repositories_test

import (
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
)

func TestJobRepository_FindJobs(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open sqlite database: %v", err)
	}

	// AutoMigrate all models
	err = db.AutoMigrate(
		&models.User{},
		&models.StudentProfile{},
		&models.EnterpriseProfile{},
		&models.Job{},
		&models.Category{},
		&models.Skill{},
		&models.Notification{},
		&models.Transaction{},
		&models.Message{},
	)
	if err != nil {
		t.Fatalf("Failed to migrate: %v", err)
	}

	// Seed Category & Skills
	cat := models.Category{Name: "Tech"}
	db.Create(&cat)

	skillGo := models.Skill{Name: "Go", CategoryID: cat.ID}
	skillReact := models.Skill{Name: "React", CategoryID: cat.ID}
	db.Create(&skillGo)
	db.Create(&skillReact)

	// Seed EnterpriseProfile
	ep := models.EnterpriseProfile{
		UserID:      1,
		CompanyName: "Google",
	}
	db.Create(&ep)

	// Seed Jobs
	job1 := models.Job{
		EnterpriseID: ep.UserID,
		Title:        "Go Developer",
		Salary:       "5000",
		Location:     "Hanoi",
		Status:       models.JobApproved,
		Skills:       []models.Skill{skillGo},
	}
	job2 := models.Job{
		EnterpriseID: ep.UserID,
		Title:        "Frontend Developer",
		Salary:       "4000",
		Location:     "HCM",
		Status:       models.JobDraft,
		Skills:       []models.Skill{skillReact},
	}
	db.Create(&job1)
	db.Create(&job2)

	repo := repositories.NewJobRepository(db)

	t.Run("Find all approved jobs", func(t *testing.T) {
		jobs, err := repo.FindJobs(map[string]any{"status": models.JobApproved})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if len(jobs) != 1 {
			t.Errorf("Expected 1 job, got %d", len(jobs))
		}
		if jobs[0].Title != "Go Developer" {
			t.Errorf("Expected Go Developer, got %s", jobs[0].Title)
		}
		if len(jobs[0].Skills) != 1 || jobs[0].Skills[0].Name != "Go" {
			t.Errorf("Expected Skill Go to be preloaded, got %v", jobs[0].Skills)
		}
		if jobs[0].EnterpriseProfile == nil || jobs[0].EnterpriseProfile.CompanyName != "Google" {
			t.Errorf("Expected EnterpriseProfile to be preloaded, got %v", jobs[0].EnterpriseProfile)
		}
	})

	t.Run("Filter by title", func(t *testing.T) {
		jobs, err := repo.FindJobs(map[string]any{"title": "Frontend"})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if len(jobs) != 1 {
			t.Errorf("Expected 1 job, got %d", len(jobs))
		}
		if jobs[0].Title != "Frontend Developer" {
			t.Errorf("Expected Frontend Developer, got %s", jobs[0].Title)
		}
	})
}
