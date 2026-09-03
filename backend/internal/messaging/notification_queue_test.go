package messaging

import (
	"context"
	"errors"
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
)

func TestNotificationQueueEnqueueAndConsumeIsIdempotent(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:notification-queue?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&models.Notification{}, &models.OutboxEvent{}); err != nil {
		t.Fatalf("migrate sqlite: %v", err)
	}

	queue := NewNotificationQueue(db, NotificationQueueConfig{})
	notification := &models.Notification{
		UserID:  42,
		Type:    models.NotificationTypeApplication,
		Title:   "Đơn ứng tuyển mới",
		Content: "Nội dung thử nghiệm",
	}
	if err := queue.Enqueue(context.Background(), nil, notification); err != nil {
		t.Fatalf("enqueue: %v", err)
	}
	if notification.EventID == nil || *notification.EventID == "" {
		t.Fatal("expected enqueue to assign an event id")
	}

	var event models.OutboxEvent
	if err := db.First(&event).Error; err != nil {
		t.Fatalf("load outbox event: %v", err)
	}
	if event.EventType != models.OutboxEventNotificationCreate {
		t.Fatalf("unexpected event type: %s", event.EventType)
	}

	if err := queue.storeNotification(context.Background(), event.Payload); err != nil {
		t.Fatalf("consume first delivery: %v", err)
	}
	if err := queue.storeNotification(context.Background(), event.Payload); err != nil {
		t.Fatalf("consume duplicate delivery: %v", err)
	}

	var count int64
	if err := db.Model(&models.Notification{}).Count(&count).Error; err != nil {
		t.Fatalf("count notifications: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected one idempotent notification, got %d", count)
	}
}

func TestNotificationQueueEnqueueUsesCallerTransaction(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:notification-queue-transaction?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&models.Notification{}, &models.OutboxEvent{}); err != nil {
		t.Fatalf("migrate sqlite: %v", err)
	}

	queue := NewNotificationQueue(db, NotificationQueueConfig{})
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := queue.Enqueue(context.Background(), tx, &models.Notification{
			UserID:  7,
			Type:    models.NotificationTypeSystem,
			Title:   "Rollback",
			Content: "Event must roll back with its business transaction",
		}); err != nil {
			return err
		}
		return errors.New("force rollback")
	})
	if err == nil {
		t.Fatal("expected transaction rollback")
	}

	var count int64
	if err := db.Model(&models.OutboxEvent{}).Count(&count).Error; err != nil {
		t.Fatalf("count outbox events: %v", err)
	}
	if count != 0 {
		t.Fatalf("expected outbox event to roll back, got %d rows", count)
	}
}

func TestNotificationQueueRejectsPayloadWithoutEventID(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:notification-queue-invalid?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.AutoMigrate(&models.Notification{}, &models.OutboxEvent{}); err != nil {
		t.Fatalf("migrate sqlite: %v", err)
	}

	queue := NewNotificationQueue(db, NotificationQueueConfig{})
	if err := queue.storeNotification(context.Background(), []byte(`{"notification":{"user_id":42}}`)); err == nil {
		t.Fatal("expected payload without event_id to fail")
	}
}
