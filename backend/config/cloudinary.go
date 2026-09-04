package config

import (
	"fmt"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
)

// CLD is the global Cloudinary client instance.
var CLD *cloudinary.Cloudinary

// InitCloudinary initializes the Cloudinary client from runtime configuration.
func InitCloudinary(cldURL string) error {
	if strings.TrimSpace(cldURL) == "" {
		CLD = nil
		return nil
	}

	var err error
	CLD, err = cloudinary.NewFromURL(cldURL)
	if err != nil {
		CLD = nil
		return fmt.Errorf("initialize Cloudinary: %w", err)
	}
	return nil
}
