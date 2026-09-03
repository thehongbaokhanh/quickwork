package services

import "errors"

var (
	ErrEmailConflict                  = errors.New("email already exists")
	ErrTaxCodeConflict                = errors.New("tax code already exists")
	ErrBusinessLicenseRequired        = errors.New("business license is required")
	ErrInvalidCredential              = errors.New("invalid credential")
	ErrStudentRegistrationDisabled    = errors.New("student registration is disabled")
	ErrEnterpriseRegistrationDisabled = errors.New("enterprise registration is disabled")
	ErrTooManyLoginAttempts           = errors.New("too many login attempts")
	ErrCurrentPasswordInvalid         = errors.New("current password invalid")
	ErrNewPasswordSame                = errors.New("new password same as current password")
	ErrPasswordPolicyInvalid          = errors.New("password does not meet policy")
	ErrEnterpriseNotVerify            = errors.New("enterprise not verified")
	ErrEnterpriseRejected             = errors.New("enterprise verification rejected")
	ErrJobClosed                      = errors.New("job closed")
	ErrAccountInactive                = errors.New("account inactive")
	ErrAccountBanned                  = errors.New("account banned")
	ErrMessageContentRequired         = errors.New("message content is required")
	ErrMessageTooLong                 = errors.New("message content is too long")
	ErrConversationForbidden          = errors.New("conversation forbidden")
	ErrConversationClosed             = errors.New("conversation closed")
	ErrConversationNotFound           = errors.New("conversation not found")
	ErrApplicationNotFound            = errors.New("application not found")
)
