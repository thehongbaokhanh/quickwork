package handlers

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"

	"quickwork.local/backend/internal/dto/request"
	service "quickwork.local/backend/internal/services"
)

type AuthHandler struct {
	authService service.AuthService
	validate    *validator.Validate
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		validate:    validator.New(),
	}
}

// RegisterStudent
// @Summary Đăng ký tài khoản Sinh viên
// @Description Tiếp nhận thông tin cơ bản của học viên để mở tài khoản tự động và khởi tạo Profile.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body request.RegisterStudentRequest true "Payload Đăng ký Sinh viên"
// @Success 201 {object} map[string]interface{} "Thành công"
// @Failure 400 {object} map[string]interface{} "Lỗi định dạng dữ liệu"
// @Failure 409 {object} map[string]interface{} "Trùng lặp Email"
// @Failure 500 {object} map[string]interface{} "Lỗi hệ thống"
// @Router /api/v1/auth/register-student [post]
func (h *AuthHandler) RegisterStudent(c *fiber.Ctx) error {

	req := new(request.RegisterStudentRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Không thể đọc dữ liệu JSON.",
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Dữ liệu không hợp lệ.",
			"errors":  err.Error(),
		})
	}

	res, err := h.authService.RegisterStudent(req)
	if err != nil {

		switch err {

		case service.ErrEmailConflict:
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"success": false,
				"message": "Email đã tồn tại.",
			})

		default:
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Đăng ký Sinh viên thành công.",
		"data":    res,
	})
}

// RegisterEnterprise
// @Summary Đăng ký tài khoản Doanh nghiệp
// @Description Tiếp nhận thông tin doanh nghiệp.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body request.RegisterEnterpriseRequest true "Payload Đăng ký Doanh nghiệp"
// @Success 201 {object} map[string]interface{} "Thành công"
// @Failure 400 {object} map[string]interface{} "Lỗi định dạng dữ liệu"
// @Failure 409 {object} map[string]interface{} "Trùng Email hoặc TaxCode"
// @Failure 500 {object} map[string]interface{} "Lỗi hệ thống"
// @Router /api/v1/auth/register-enterprise [post]
func (h *AuthHandler) RegisterEnterprise(c *fiber.Ctx) error {

	req := new(request.RegisterEnterpriseRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Không thể đọc dữ liệu JSON.",
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Dữ liệu không hợp lệ.",
			"errors":  err.Error(),
		})
	}

	res, err := h.authService.RegisterEnterprise(req)
	if err != nil {

		switch err {

		case service.ErrEmailConflict:
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"success": false,
				"message": "Email đã tồn tại.",
			})

		case service.ErrTaxCodeConflict:
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"success": false,
				"message": "Mã số thuế đã tồn tại.",
			})

		default:
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Đăng ký Doanh nghiệp thành công.",
		"data":    res,
	})
}