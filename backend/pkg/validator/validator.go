// Package validator abstracts struct validation using go-playground/validator/v10.
package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// ValidationError specifies structural details for validation failures.
type ValidationError struct {
	Field string `json:"field"`
	Tag   string `json:"tag"`
	Value string `json:"value,omitempty"`
}

// ValidateStruct verifies that input structs conform to go-playground rules.
// It returns a slice of ValidationError configurations, or nil if validation passes.
func ValidateStruct(s interface{}) []ValidationError {
	var errs []ValidationError

	err := validate.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			element := ValidationError{
				Field: err.Field(),
				Tag:   err.Tag(),
				Value: fmt.Sprintf("%v", err.Value()),
			}
			errs = append(errs, element)
		}
	}

	if len(errs) > 0 {
		return errs
	}
	return nil
}
