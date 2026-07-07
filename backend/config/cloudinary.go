package config

import (
	"log"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
)

// CLD is the global Cloudinary client instance.
var CLD *cloudinary.Cloudinary

// InitCloudinary initializes the Cloudinary connection using CLOUDINARY_URL from the environment.
func InitCloudinary() {
	cldURL := os.Getenv("CLOUDINARY_URL")
	if cldURL == "" {
		log.Println("⚠️  CLOUDINARY_URL environment variable is not set")
		return
	}

	var err error
	CLD, err = cloudinary.NewFromURL(cldURL)
	if err != nil {
		log.Fatalf("❌ Failed to initialize Cloudinary: %v", err)
	}
}
