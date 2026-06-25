// Package database handles connection setups, lifecycle management,
// migrations, and database seeding for GORM MySQL and Redis.
package database

import (
	"fmt"
	"time"

	"quickwork.local/backend/config"
	"quickwork.local/backend/pkg/logger"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// InitMySQL initializes a GORM database connection pool and pings it.
func InitMySQL(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to open mysql connection: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to load database interface: %w", err)
	}

	// Pooling parameters
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Validate connectivity
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("database ping failed: %w", err)
	}

	logger.Info("✅ MySQL Connected")
	return db, nil
}
