package pagination

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestGetParams(t *testing.T) {

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {

		p := GetParams(c)

		if p.Page != 2 {
			t.Error("Page should be 2")
		}

		if p.Limit != 20 {
			t.Error("Limit should be 20")
		}

		if p.Offset != 20 {
			t.Error("Offset should be 20")
		}

		return nil
	})

	req := httptest.NewRequest(
		"GET",
		"/?page=2&limit=20",
		nil,
	)

	_, err := app.Test(req)

	if err != nil {
		t.Fatal(err)
	}
}