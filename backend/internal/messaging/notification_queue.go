package messaging

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"sync"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"quickwork.local/backend/internal/models"
)

const (
	defaultBatchSize          = 50
	defaultDispatchInterval   = time.Second
	defaultReconnectInterval  = 5 * time.Second
	defaultPublishedRetention = 7 * 24 * time.Hour
	maxPublishAttempts        = 20
)

type NotificationQueueConfig struct {
	URL        string
	Exchange   string
	Queue      string
	RoutingKey string
	Prefetch   int
}

type notificationEventPayload struct {
	EventID      string              `json:"event_id"`
	Notification models.Notification `json:"notification"`
}

// NotificationQueue implements a transactional outbox publisher and an
// idempotent RabbitMQ consumer for notification.create events.
type NotificationQueue struct {
	db     *gorm.DB
	config NotificationQueueConfig
	wg     sync.WaitGroup
}

func NewNotificationQueue(db *gorm.DB, config NotificationQueueConfig) *NotificationQueue {
	if config.Prefetch <= 0 {
		config.Prefetch = 20
	}
	return &NotificationQueue{db: db, config: config}
}

// Enqueue persists the event using tx when provided. The generated event ID is
// also copied to the notification payload and becomes the consumer idempotency key.
func (q *NotificationQueue) Enqueue(ctx context.Context, tx *gorm.DB, notification *models.Notification) error {
	if q == nil || q.db == nil {
		return errors.New("notification queue is not configured")
	}
	if notification == nil {
		return errors.New("notification is required")
	}

	eventID := uuid.NewString()
	notification.EventID = &eventID
	payload, err := json.Marshal(notificationEventPayload{
		EventID:      eventID,
		Notification: *notification,
	})
	if err != nil {
		return fmt.Errorf("marshal notification event: %w", err)
	}

	event := models.OutboxEvent{
		ID:          eventID,
		EventType:   models.OutboxEventNotificationCreate,
		Payload:     payload,
		AvailableAt: time.Now().UTC(),
	}
	target := q.db.WithContext(ctx)
	if tx != nil {
		target = tx.WithContext(ctx)
	}
	if err := target.Create(&event).Error; err != nil {
		return fmt.Errorf("persist notification outbox event: %w", err)
	}
	return nil
}

func (q *NotificationQueue) Start(ctx context.Context) {
	if q == nil || q.db == nil {
		return
	}
	q.wg.Add(2)
	go q.runDispatcher(ctx)
	go q.runConsumer(ctx)
}

func (q *NotificationQueue) Wait() {
	if q != nil {
		q.wg.Wait()
	}
}

func (q *NotificationQueue) runDispatcher(ctx context.Context) {
	defer q.wg.Done()
	ticker := time.NewTicker(defaultDispatchInterval)
	cleanupTicker := time.NewTicker(time.Hour)
	defer ticker.Stop()
	defer cleanupTicker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := q.dispatchPending(ctx); err != nil && ctx.Err() == nil {
				log.Printf("RabbitMQ outbox dispatch failed: %v", err)
			}
		case <-cleanupTicker.C:
			q.cleanupPublished(ctx)
		}
	}
}

func (q *NotificationQueue) dispatchPending(ctx context.Context) error {
	var events []models.OutboxEvent
	err := q.db.WithContext(ctx).
		Where("published_at IS NULL AND available_at <= ? AND attempts < ?", time.Now().UTC(), maxPublishAttempts).
		Order("created_at ASC").
		Limit(defaultBatchSize).
		Find(&events).Error
	if err != nil || len(events) == 0 {
		return err
	}

	connection, channel, err := q.openChannel()
	if err != nil {
		q.recordFailure(ctx, &events[0], err)
		return err
	}
	defer connection.Close()
	defer channel.Close()

	if err := channel.Confirm(false); err != nil {
		q.recordFailure(ctx, &events[0], err)
		return fmt.Errorf("enable RabbitMQ publisher confirms: %w", err)
	}
	confirms := channel.NotifyPublish(make(chan amqp.Confirmation, 1))

	for index := range events {
		event := &events[index]
		err = channel.PublishWithContext(ctx, q.config.Exchange, q.config.RoutingKey, true, false, amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			MessageId:    event.ID,
			Type:         event.EventType,
			Timestamp:    event.CreatedAt,
			Body:         event.Payload,
		})
		if err == nil {
			select {
			case confirmation := <-confirms:
				if !confirmation.Ack {
					err = errors.New("RabbitMQ rejected published event")
				}
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(5 * time.Second):
				err = errors.New("RabbitMQ publisher confirm timeout")
			}
		}
		if err != nil {
			q.recordFailure(ctx, event, err)
			return fmt.Errorf("publish outbox event %s: %w", event.ID, err)
		}
		if err := q.markPublished(ctx, event.ID); err != nil {
			return err
		}
	}
	return nil
}

func (q *NotificationQueue) runConsumer(ctx context.Context) {
	defer q.wg.Done()
	for ctx.Err() == nil {
		if err := q.consumeSession(ctx); err != nil && ctx.Err() == nil {
			log.Printf("RabbitMQ notification consumer stopped: %v", err)
		}
		if !waitForContext(ctx, defaultReconnectInterval) {
			return
		}
	}
}

func (q *NotificationQueue) consumeSession(ctx context.Context) error {
	connection, channel, err := q.openChannel()
	if err != nil {
		return err
	}
	defer connection.Close()
	defer channel.Close()

	if err := channel.Qos(q.config.Prefetch, 0, false); err != nil {
		return fmt.Errorf("configure RabbitMQ prefetch: %w", err)
	}
	deliveries, err := channel.Consume(q.config.Queue, "quickwork-api", false, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("consume RabbitMQ queue: %w", err)
	}

	for {
		select {
		case <-ctx.Done():
			return nil
		case delivery, ok := <-deliveries:
			if !ok {
				return errors.New("RabbitMQ delivery channel closed")
			}
			if delivery.Type != "" && delivery.Type != models.OutboxEventNotificationCreate {
				_ = delivery.Nack(false, false)
				continue
			}
			if err := q.storeNotification(ctx, delivery.Body); err != nil {
				log.Printf("RabbitMQ notification event %s moved to dead-letter queue: %v", delivery.MessageId, err)
				_ = delivery.Nack(false, false)
				continue
			}
			_ = delivery.Ack(false)
		}
	}
}

func (q *NotificationQueue) storeNotification(ctx context.Context, payload []byte) error {
	var event notificationEventPayload
	if err := json.Unmarshal(payload, &event); err != nil {
		return fmt.Errorf("decode notification event: %w", err)
	}
	if event.EventID == "" {
		return errors.New("notification event_id is required")
	}
	notification := event.Notification
	notification.EventID = &event.EventID
	notification.ID = 0
	result := q.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "event_id"}},
		DoNothing: true,
	}).Create(&notification)
	if result.Error != nil {
		return fmt.Errorf("store queued notification: %w", result.Error)
	}
	return nil
}

func (q *NotificationQueue) openChannel() (*amqp.Connection, *amqp.Channel, error) {
	connection, err := amqp.DialConfig(q.config.URL, amqp.Config{Dial: amqp.DefaultDial(5 * time.Second)})
	if err != nil {
		return nil, nil, fmt.Errorf("connect to RabbitMQ: %w", err)
	}
	channel, err := connection.Channel()
	if err != nil {
		connection.Close()
		return nil, nil, fmt.Errorf("open RabbitMQ channel: %w", err)
	}
	if err := q.declareTopology(channel); err != nil {
		channel.Close()
		connection.Close()
		return nil, nil, err
	}
	return connection, channel, nil
}

func (q *NotificationQueue) declareTopology(channel *amqp.Channel) error {
	dlx := q.config.Exchange + ".dead"
	deadQueue := q.config.Queue + ".dead"
	if err := channel.ExchangeDeclare(q.config.Exchange, "direct", true, false, false, false, nil); err != nil {
		return fmt.Errorf("declare RabbitMQ exchange: %w", err)
	}
	if err := channel.ExchangeDeclare(dlx, "direct", true, false, false, false, nil); err != nil {
		return fmt.Errorf("declare RabbitMQ dead-letter exchange: %w", err)
	}
	if _, err := channel.QueueDeclare(deadQueue, true, false, false, false, nil); err != nil {
		return fmt.Errorf("declare RabbitMQ dead-letter queue: %w", err)
	}
	if err := channel.QueueBind(deadQueue, q.config.RoutingKey, dlx, false, nil); err != nil {
		return fmt.Errorf("bind RabbitMQ dead-letter queue: %w", err)
	}
	arguments := amqp.Table{
		"x-dead-letter-exchange":    dlx,
		"x-dead-letter-routing-key": q.config.RoutingKey,
	}
	if _, err := channel.QueueDeclare(q.config.Queue, true, false, false, false, arguments); err != nil {
		return fmt.Errorf("declare RabbitMQ queue: %w", err)
	}
	if err := channel.QueueBind(q.config.Queue, q.config.RoutingKey, q.config.Exchange, false, nil); err != nil {
		return fmt.Errorf("bind RabbitMQ queue: %w", err)
	}
	return nil
}

func (q *NotificationQueue) markPublished(ctx context.Context, eventID string) error {
	now := time.Now().UTC()
	result := q.db.WithContext(ctx).Model(&models.OutboxEvent{}).
		Where("id = ? AND published_at IS NULL", eventID).
		Updates(map[string]any{"published_at": &now, "last_error": ""})
	if result.Error != nil {
		return fmt.Errorf("mark outbox event published: %w", result.Error)
	}
	return nil
}

func (q *NotificationQueue) recordFailure(ctx context.Context, event *models.OutboxEvent, publishErr error) {
	if event == nil {
		return
	}
	attempts := event.Attempts + 1
	delaySeconds := math.Min(math.Pow(2, float64(min(attempts, 6))), 60)
	_ = q.db.WithContext(ctx).Model(&models.OutboxEvent{}).
		Where("id = ? AND published_at IS NULL", event.ID).
		Updates(map[string]any{
			"attempts":     attempts,
			"available_at": time.Now().UTC().Add(time.Duration(delaySeconds) * time.Second),
			"last_error":   publishErr.Error(),
		}).Error
}

func (q *NotificationQueue) cleanupPublished(ctx context.Context) {
	cutoff := time.Now().UTC().Add(-defaultPublishedRetention)
	if err := q.db.WithContext(ctx).
		Where("published_at IS NOT NULL AND published_at < ?", cutoff).
		Delete(&models.OutboxEvent{}).Error; err != nil && ctx.Err() == nil {
		log.Printf("RabbitMQ outbox cleanup failed: %v", err)
	}
}

func waitForContext(ctx context.Context, duration time.Duration) bool {
	timer := time.NewTimer(duration)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}
