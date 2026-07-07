package repositories

import "gorm.io/gorm"

type BaseRepository interface {
	WithTransaction(fn func(tx *gorm.DB) error) error
}

type baseRepository struct {
	db *gorm.DB
}

func NewBaseRepository(db *gorm.DB) BaseRepository {
	return &baseRepository{
		db: db,
	}
}

func (r *baseRepository) WithTransaction(fn func(tx *gorm.DB) error) error {
	return r.db.Transaction(fn)
}
