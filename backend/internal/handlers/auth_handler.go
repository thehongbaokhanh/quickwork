package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

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
// @Router /auth/register-student [post]
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
// @Router /auth/register-enterprise [post]
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

// Login
// @Summary Đăng nhập
// @Description Đăng nhập hệ thống
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body request.LoginRequest true "Thông tin đăng nhập"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {

	req := new(request.LoginRequest)

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

	res, err := h.authService.Login(req)

	if err != nil {

		switch err {

		case service.ErrInvalidCredential:
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Email hoặc mật khẩu không đúng.",
			})

		case service.ErrAccountBanned:
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Tài khoản đã bị khóa.",
			})

		default:
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đăng nhập thành công.",
		"data":    res,
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {

	accessToken, ok := parseBearerToken(c.Get("Authorization"))
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Invalid Authorization Header",
		})
	}

	refreshToken := strings.TrimSpace(c.Cookies("refresh_token"))
	if refreshToken == "" {
		refreshToken = strings.TrimSpace(c.Cookies("qw_refresh_token"))
	}

	err := h.authService.Logout(
		c.Context(),
		accessToken,
		refreshToken,
	)

	if err != nil {

		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:   "refresh_token",
		Value:  "",
		MaxAge: -1,
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logged out successfully",
	})
}

func parseBearerToken(authHeader string) (string, bool) {
	authHeader = strings.TrimSpace(authHeader)
	if authHeader == "" {
		return "", false
	}

	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authHeader, bearerPrefix) {
		return "", false
	}

	token := strings.TrimSpace(strings.TrimPrefix(authHeader, bearerPrefix))
	if token == "" || isInvalidTokenValue(token) || strings.Count(token, ".") != 2 {
		return "", false
	}

	return token, true
}

func isInvalidTokenValue(token string) bool {
	return strings.EqualFold(token, "null") || strings.EqualFold(token, "undefined")
}

func (h *AuthHandler) RegisterFirstAdmin(c *fiber.Ctx) error {

	req := new(request.RegisterAdminRequest)

	// Đọc JSON
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Không thể đọc dữ liệu JSON.",
		})
	}

	// Validate
	if err := h.validate.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Dữ liệu không hợp lệ.",
			"errors":  err.Error(),
		})
	}

	// Lấy Admin Secret từ Header
	adminSecret := c.Get("X-ADMIN-SECRET")

	// Gọi Service
	res, err := h.authService.RegisterFirstAdmin(req, adminSecret)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Tạo Admin đầu tiên thành công.",
		"data":    res,
	})
}

// UploadGPKD
// @Summary Tải lên giấy phép kinh doanh (GPKD)
// @Description Tải lên file giấy phép kinh doanh và nhận về đường dẫn lưu trữ.
// @Tags Authentication
// @Accept multipart/form-data
// @Produce json
// @Param gpkd formData file true "File giấy phép kinh doanh"
// @Success 200 {object} map[string]interface{} "Tải lên thành công"
// @Failure 400 {object} map[string]interface{} "Không tìm thấy file"
// @Failure 500 {object} map[string]interface{} "Lỗi hệ thống khi lưu file"
// @Router /auth/upload [post]
func (h *AuthHandler) UploadGPKD(c *fiber.Ctx) error {
	file, err := c.FormFile("gpkd")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Không tìm thấy file gpkd",
		})
	}

	if err := os.MkdirAll("uploads", 0755); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể tạo thư mục lưu trữ",
		})
	}

	ext := filepath.Ext(file.Filename)
	filename := uuid.New().String() + ext
	filePath := filepath.Join("uploads", filename)

	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Không thể lưu file",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"url":     "/uploads/" + filename,
	})
}

// GoogleLogin
// @Summary Đăng nhập bằng Google
// @Description Tiếp nhận mã xác thực từ phía client để xác thực và lấy thông tin tài khoản Google từ Google Server.
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body request.GoogleLoginRequest true "Mã xác thực từ Google"
// @Success 200 {object} map[string]interface{} "Đăng nhập thành công"
// @Failure 400 {object} map[string]interface{} "Lỗi tham số hoặc dữ liệu"
// @Failure 550 {object} map[string]interface{} "Lỗi hệ thống"
// @Router /auth/google [post]
func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	req := new(request.GoogleLoginRequest)

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

	res, err := h.authService.LoginOrRegisterGoogle(c.UserContext(), req.Code)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Đăng nhập bằng Google thành công.",
		"data":    res,
	})
}

// GetGoogleConfig
// @Summary Lấy cấu hình Google OAuth
// @Tags Authentication
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /auth/google/config [get]
func (h *AuthHandler) GetGoogleConfig(c *fiber.Ctx) error {
	config := h.authService.GetGoogleConfig()
	return c.JSON(fiber.Map{
		"success": true,
		"data":    config,
	})
}
