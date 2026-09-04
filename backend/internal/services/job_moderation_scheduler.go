package services

import (
	"context"
	"fmt"
	"log"
	"time"

	goredis "github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

const (
	JobModerationSchedulerInterval = time.Hour
	jobModerationLeaseKey          = "quickwork:jobs:moderation-expiry"
	jobModerationLeaseTTL          = 55 * time.Minute
)

type JobModerationScheduler struct {
	db       *gorm.DB
	settings *SystemSettingsService
	redis    *goredis.Client
	now      func() time.Time
	interval time.Duration
}

func NewJobModerationScheduler(db *gorm.DB, settings *SystemSettingsService, redisClient *goredis.Client) *JobModerationScheduler {
	return &JobModerationScheduler{
		db:       db,
		settings: settings,
		redis:    redisClient,
		now:      time.Now,
		interval: JobModerationSchedulerInterval,
	}
}

// Start performs one batch at startup and then at most one batch per hour.
// A short Redis lease avoids duplicate database work when several API
// instances are running; the SQL update remains idempotent if Redis is down.
func (s *JobModerationScheduler) Start(ctx context.Context) {
	if s == nil || s.db == nil || s.settings == nil {
		return
	}

	go func() {
		s.runLogged(ctx)

		interval := s.interval
		if interval <= 0 {
			interval = JobModerationSchedulerInterval
		}
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				s.runLogged(ctx)
			}
		}
	}()
}

func (s *JobModerationScheduler) runLogged(ctx context.Context) {
	expired, err := s.RunOnce(ctx)
	if err != nil {
		log.Printf("job moderation expiry batch failed: %v", err)
		return
	}
	if expired > 0 {
		log.Printf("job moderation expiry batch rejected %d overdue job(s)", expired)
	}
}

// RunOnce backfills a deadline for legacy PENDING rows and atomically rejects
// every row whose frozen deadline has passed.
func (s *JobModerationScheduler) RunOnce(ctx context.Context) (int64, error) {
	if s == nil || s.db == nil || s.settings == nil {
		return 0, fmt.Errorf("job moderation scheduler is not configured")
	}

	if s.redis != nil {
		now := s.now().UTC()
		acquired, err := s.redis.SetNX(ctx, jobModerationLeaseKey, now.Unix(), jobModerationLeaseTTL).Result()
		if err != nil {
			log.Printf("job moderation lease unavailable; continuing with idempotent update: %v", err)
		} else if !acquired {
			return 0, nil
		}
	}

	snapshot, err := s.settings.Current(ctx)
	if err != nil {
		return 0, fmt.Errorf("load moderation settings: %w", err)
	}
	pendingHours := snapshot.Settings.Moderation.PendingHours
	if pendingHours <= 0 {
		pendingHours = 48
	}

	if err := s.backfillLegacyDeadlines(ctx, pendingHours); err != nil {
		return 0, err
	}

	now := s.now().UTC()
	result := s.db.WithContext(ctx).
		Model(&models.Job{}).
		Where("status = ? AND review_due_at IS NOT NULL AND review_due_at <= ?", models.JobPending, now).
		Updates(map[string]any{
			"status":        models.JobRejected,
			"reject_reason": "Tự động từ chối: đã quá hạn chờ kiểm duyệt.",
			"reviewed_at":   now,
		})
	if result.Error != nil {
		return 0, fmt.Errorf("expire pending jobs: %w", result.Error)
	}
	return result.RowsAffected, nil
}

func (s *JobModerationScheduler) backfillLegacyDeadlines(ctx context.Context, pendingHours int) error {
	var deadline any
	switch s.db.Dialector.Name() {
	case "mysql":
		deadline = gorm.Expr(fmt.Sprintf(
			"DATE_ADD(COALESCE(submitted_at, updated_at), INTERVAL %d HOUR)",
			pendingHours,
		))
	case "sqlite":
		deadline = gorm.Expr(
			"datetime(COALESCE(submitted_at, updated_at), ?)",
			fmt.Sprintf("+%d hours", pendingHours),
		)
	default:
		return fmt.Errorf("backfill pending deadlines: unsupported database dialect %q", s.db.Dialector.Name())
	}

	result := s.db.WithContext(ctx).
		Model(&models.Job{}).
		Where("status = ? AND review_due_at IS NULL", models.JobPending).
		Updates(map[string]any{
			"submitted_at":  gorm.Expr("COALESCE(submitted_at, updated_at)"),
			"review_due_at": deadline,
		})
	if result.Error != nil {
		return fmt.Errorf("backfill pending deadlines: %w", result.Error)
	}
	return nil
}
