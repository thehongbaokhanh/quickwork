package services

import "errors"

var (
	ErrEmailConflict           = errors.New("email already exists")
	ErrTaxCodeConflict         = errors.New("tax code already exists")
	ErrBusinessLicenseRequired = errors.New("business license is required")
	ErrInvalidCredential       = errors.New("invalid credential")
	ErrEnterpriseNotVerify     = errors.New("enterprise not verified")
	ErrEnterpriseRejected      = errors.New("enterprise verification rejected")
	ErrJobClosed               = errors.New("job closed")
	ErrAccountInactive         = errors.New("account inactive")
	ErrAccountBanned           = errors.New("account banned")
)
