package models

import "time"

// SystemSettingSingletonID is the only valid primary key for the shared
// system-settings document.
const SystemSettingSingletonID uint = 1

// SystemSetting stores the shared admin settings as one versioned aggregate.
// The JSON payload is intentionally opaque to the model layer; normalization
// and validation belong to SystemSettingsService.
type SystemSetting struct {
	ID           uint      `gorm:"primaryKey;autoIncrement:false" json:"id"`
	SettingsJSON string    `gorm:"column:settings_json;type:longtext;not null" json:"-"`
	Version      uint64    `gorm:"not null" json:"version"`
	UpdatedBy    uint      `gorm:"not null;index" json:"updatedBy"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func (SystemSetting) TableName() string {
	return "system_settings"
}
