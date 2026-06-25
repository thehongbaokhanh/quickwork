package response

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestSuccess(t *testing.T) {

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return Success(c, 200, "OK", fiber.Map{
			"name": "Bao Khanh",
		})
	})

	req := httptest.NewRequest("GET", "/", nil)

	resp, _ := app.Test(req)

	var result APIResponse

	json.NewDecoder(resp.Body).Decode(&result)

	if result.Status != "success" {
		t.Error("Wrong status")
	}
}