package services

import "errors"

var (
	ErrEmailConflict       = errors.New("email already exists")
	ErrTaxCodeConflict     = errors.New("tax code already exists")
	ErrInvalidCredential   = errors.New("invalid credential")
	ErrEnterpriseNotVerify = errors.New("enterprise not verified")
	ErrJobClosed           = errors.New("job closed")
	ErrAccountBanned     = errors.New("account banned")
)