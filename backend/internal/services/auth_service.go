package services

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"quickwork.local/backend/config"
	"quickwork.local/backend/internal/dto/request"
	"quickwork.local/backend/internal/dto/response"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
	jwt "quickwork.local/backend/pkg/jwt"
	"quickwork.local/backend/pkg/password"
)

type AuthService interface {
	RegisterStudent(req *request.RegisterStudentRequest) (*response.RegisterResponse, error)
	RegisterEnterprise(req *request.RegisterEnterpriseRequest) (*response.RegisterResponse, error)
	Login(req *request.LoginRequest) (*response.LoginResponse, error)
	Logout(
		ctx context.Context,
		accessToken string,
		refreshToken string,
	) error

	RegisterFirstAdmin(
		req *request.RegisterAdminRequest,
		secret string,
	) (*response.RegisterResponse, error)

	LoginOrRegisterGoogle(ctx context.Context, code string) (*response.LoginResponse, error)
	GetGoogleConfig() map[string]string
}

type authService struct {
	db  *gorm.DB
	cfg *config.Config

	userRepo       repositories.UserRepository
	studentRepo    repositories.StudentRepository
	enterpriseRepo repositories.EnterpriseRepository
	authRedisRepo  repositories.AuthRedisRepository
}

func NewAuthService(
	db *gorm.DB,
	cfg *config.Config,

	userRepo repositories.UserRepository,
	studentRepo repositories.StudentRepository,
	enterpriseRepo repositories.EnterpriseRepository,
	authRedisRepo repositories.AuthRedisRepository,
) AuthService {
	return &authService{
		db:             db,
		cfg:            cfg,
		userRepo:       userRepo,
		studentRepo:    studentRepo,
		enterpriseRepo: enterpriseRepo,
		authRedisRepo:  authRedisRepo,
	}
}

func (s *authService) RegisterStudent(req *request.RegisterStudentRequest) (*response.RegisterResponse, error) {
	// 1. Kiểm tra email trùng lặp sử dụng DB kết nối chuẩn
	_, err := s.userRepo.FindByEmail(s.db, req.Email)
	if err == nil {
		return nil, ErrEmailConflict
	}

	// 2. Băm mật khẩu người dùng gửi lên
	hashedPassword, err := password.Hash(req.Password)
	if err != nil {
		return nil, err
	}

	// 3. Khởi tạo Database Transaction bảo đảm an toàn dữ liệu
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	user := &models.User{
		Email:    req.Email,
		Password: hashedPassword,
		Role:     models.RoleStudent,
		Status:   models.UserStatusActive,
	}

	if err := s.userRepo.Create(tx, user); err != nil {
		tx.Rollback()
		return nil, err
	}

	studentProfile := &models.StudentProfile{
		UserID: user.ID,
		Name:   req.Name,
		Phone:  req.Phone,
	}

	if err := s.studentRepo.Create(tx, studentProfile); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Hoàn tất lưu dữ liệu
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &response.RegisterResponse{
		ID:        user.ID,
		Email:     user.Email,
		Role:      string(user.Role),
		Status:    string(user.Status),
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *authService) RegisterEnterprise(req *request.RegisterEnterpriseRequest) (*response.RegisterResponse, error) {
	req.GPKDURL = strings.TrimSpace(req.GPKDURL)
	if req.GPKDURL == "" {
		return nil, ErrBusinessLicenseRequired
	}

	// 1. Kiểm tra email trùng lặp
	_, err := s.userRepo.FindByEmail(s.db, req.Email)
	if err == nil {
		return nil, ErrEmailConflict
	}

	// 2. Kiểm tra mã số thuế trùng lặp
	_, err = s.enterpriseRepo.FindByTaxCode(s.db, req.TaxCode)
	if err == nil {
		return nil, ErrTaxCodeConflict
	}

	// 3. Băm mật khẩu
	hashedPassword, err := password.Hash(req.Password)
	if err != nil {
		return nil, err
	}

	// 4. Khởi tạo Database Transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	user := &models.User{
		Email:    req.Email,
		Password: hashedPassword,
		Role:     models.RoleEnterprise,
		Status:   models.UserStatusActive,
	}

	if err := s.userRepo.Create(tx, user); err != nil {
		tx.Rollback()
		return nil, err
	}

	enterpriseProfile := &models.EnterpriseProfile{
		UserID:      user.ID,
		CompanyName: req.CompanyName,
		TaxCode:     req.TaxCode,
		GPKDURL:     req.GPKDURL,
		KYBStatus:   models.KYBPending,
		StatusKYB:   models.KYBPending,
	}

	if err := s.enterpriseRepo.Create(tx, enterpriseProfile); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &response.RegisterResponse{
		ID:        user.ID,
		Email:     user.Email,
		Role:      string(user.Role),
		Status:    string(user.Status),
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *authService) Login(req *request.LoginRequest) (*response.LoginResponse, error) {

	// 1. Tìm User theo Email
	user, err := s.userRepo.FindByEmail(s.db, req.Email)
	if err != nil {
		return nil, ErrInvalidCredential
	}

	// 2. So sánh Password
	if err := password.Compare(user.Password, req.Password); err != nil {
		return nil, ErrInvalidCredential
	}

	// 3. Kiểm tra Status
	if err := s.ensureCanLogin(user); err != nil {
		return nil, err
	}

	// 4. Sinh JWT
	accessToken, err := jwt.GenerateAccessToken(user.ID, string(user.Role))
	if err != nil {
		return nil, err
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.ID, string(user.Role))
	if err != nil {
		return nil, err
	}

	// 5. Trả Response
	return s.buildLoginResponse(&response.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		UserID:       user.ID,
		Email:        user.Email,
		Role:         string(user.Role),
	}, user), nil
}

func (s *authService) Logout(
	ctx context.Context,
	accessToken string,
	refreshToken string,
) error {

	if err := s.blacklistToken(ctx, accessToken); err != nil {
		return err
	}

	if err := s.blacklistToken(ctx, refreshToken); err != nil {
		return err
	}

	return nil
}

func (s *authService) blacklistToken(ctx context.Context, token string) error {
	token = strings.TrimSpace(token)
	if token == "" || isInvalidTokenValue(token) || strings.Count(token, ".") != 2 {
		return nil
	}

	claims, err := jwt.DecodeToken(token)
	if err != nil {
		return err
	}

	if claims.ExpiresAt == nil {
		return errors.New("token expiration missing")
	}

	expiration := time.Until(claims.ExpiresAt.Time)
	if expiration <= 0 {
		return nil
	}

	return s.authRedisRepo.AddToBlacklist(ctx, token, expiration)
}

func isInvalidTokenValue(token string) bool {
	return strings.EqualFold(token, "null") || strings.EqualFold(token, "undefined")
}

func (s *authService) RegisterFirstAdmin(
	req *request.RegisterAdminRequest,
	secret string,
) (*response.RegisterResponse, error) {

	// 1. Kiểm tra Admin Secret
	if secret != s.cfg.AdminSecret {
		return nil, errors.New("invalid admin secret")
	}

	// 2. Transaction
	tx := s.db.Begin()

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 3. Kiểm tra đã có admin chưa
	count, err := s.userRepo.CountAdmin(tx)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if count > 0 {
		tx.Rollback()
		return nil, errors.New("admin already exists")
	}

	// 4. Kiểm tra email đã tồn tại chưa
	_, err = s.userRepo.FindByEmail(tx, req.Email)
	if err == nil {
		tx.Rollback()
		return nil, ErrEmailConflict
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return nil, err
	}

	// 5. Hash Password
	hashedPassword, err := password.Hash(req.Password)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	// 6. Tạo User Admin
	admin := &models.User{
		Email:    req.Email,
		Password: hashedPassword,
		Role:     models.RoleAdmin,
		Status:   models.UserStatusActive,
	}

	// Nếu model User của bạn có FullName thì thêm	:
	// FullName: req.FullName,

	// 7. Lưu xuống Database
	if err := s.userRepo.Create(tx, admin); err != nil {
		tx.Rollback()
		return nil, err
	}

	// 8. Commit
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &response.RegisterResponse{
		ID:        admin.ID,
		Email:     admin.Email,
		Role:      string(admin.Role),
		Status:    string(admin.Status),
		CreatedAt: admin.CreatedAt,
	}, nil
}

type googleTokenResponse struct {
	AccessToken string `json:"access_token"`
	IDToken     string `json:"id_token"`
}

type googleUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func (s *authService) LoginOrRegisterGoogle(ctx context.Context, code string) (*response.LoginResponse, error) {
	var email, name, picture string

	// Mock flow check
	if strings.HasPrefix(code, "mock_") || s.cfg.GoogleClientID == "" || s.cfg.GoogleClientSecret == "" {
		// Mock authentication
		email = "google_mock_user@gmail.com"
		name = "Google Mock Student"
		picture = "https://lh3.googleusercontent.com/a/mock-avatar-id"
	} else {
		// Real Google flow
		// 1. Exchange auth code for access token
		tokenURL := "https://oauth2.googleapis.com/token"
		form := url.Values{}
		form.Add("code", code)
		form.Add("client_id", s.cfg.GoogleClientID)
		form.Add("client_secret", s.cfg.GoogleClientSecret)
		form.Add("redirect_uri", s.cfg.GoogleRedirectURI)
		form.Add("grant_type", "authorization_code")

		resp, err := http.PostForm(tokenURL, form)
		if err != nil {
			return nil, errors.New("failed to connect to Google OAuth server: " + err.Error())
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			bodyBytes, _ := io.ReadAll(resp.Body)
			return nil, errors.New("Google token exchange returned status " + resp.Status + ": " + string(bodyBytes))
		}

		var tokenRes googleTokenResponse
		if err := json.NewDecoder(resp.Body).Decode(&tokenRes); err != nil {
			return nil, err
		}

		// 2. Fetch UserInfo
		userInfoURL := "https://www.googleapis.com/oauth2/v2/userinfo"
		req, err := http.NewRequestWithContext(ctx, "GET", userInfoURL, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Authorization", "Bearer "+tokenRes.AccessToken)

		client := &http.Client{Timeout: 10 * time.Second}
		infoResp, err := client.Do(req)
		if err != nil {
			return nil, errors.New("failed to fetch user info from Google: " + err.Error())
		}
		defer infoResp.Body.Close()

		if infoResp.StatusCode != http.StatusOK {
			return nil, errors.New("failed to fetch user info from Google, status: " + infoResp.Status)
		}

		var userInfo googleUserInfo
		if err := json.NewDecoder(infoResp.Body).Decode(&userInfo); err != nil {
			return nil, err
		}

		email = userInfo.Email
		name = userInfo.Name
		picture = userInfo.Picture
	}

	if email == "" {
		return nil, errors.New("Google account does not provide an email address")
	}

	// Look up user in Database
	user, err := s.userRepo.FindByEmail(s.db, email)
	if err != nil {
		// User does not exist, auto-register as STUDENT
		hashedPassword, err := password.Hash(uuid.New().String())
		if err != nil {
			return nil, err
		}

		tx := s.db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		user = &models.User{
			Email:    email,
			Password: hashedPassword,
			Role:     "STUDENT",
			Status:   "ACTIVE",
		}

		if err := s.userRepo.Create(tx, user); err != nil {
			tx.Rollback()
			return nil, err
		}

		studentProfile := &models.StudentProfile{
			UserID: user.ID,
			Name:   name,
			Avatar: picture,
		}

		if err := s.studentRepo.Create(tx, studentProfile); err != nil {
			tx.Rollback()
			return nil, err
		}

		if err := tx.Commit().Error; err != nil {
			return nil, err
		}
	} else {
		// User exists, if it is active, we just log them in. But we also update their name/avatar if empty/changed
		if err := s.ensureCanLogin(user); err != nil {
			return nil, err
		}

		// Update profile photo if empty
		if user.Role == models.RoleStudent {
			var studentProfile models.StudentProfile
			err := s.db.Where("user_id = ?", user.ID).First(&studentProfile).Error
			if err == nil && (studentProfile.Avatar == "" || studentProfile.Name == "") {
				if studentProfile.Avatar == "" {
					studentProfile.Avatar = picture
				}
				if studentProfile.Name == "" {
					studentProfile.Name = name
				}
				s.db.Save(&studentProfile)
			}
		}
	}

	// Generate Access and Refresh Tokens
	accessToken, err := jwt.GenerateAccessToken(user.ID, string(user.Role))
	if err != nil {
		return nil, err
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.ID, string(user.Role))
	if err != nil {
		return nil, err
	}

	return s.buildLoginResponse(&response.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		UserID:       user.ID,
		Email:        user.Email,
		Role:         string(user.Role),
	}, user), nil
}

func (s *authService) GetGoogleConfig() map[string]string {
	return map[string]string{
		"client_id":    s.cfg.GoogleClientID,
		"redirect_uri": s.cfg.GoogleRedirectURI,
	}
}

func (s *authService) buildLoginResponse(res *response.LoginResponse, user *models.User) *response.LoginResponse {
	if user.Role != models.RoleEnterprise {
		return res
	}

	res.EnterpriseKYBStatus = string(models.KYBPending)

	var profile models.EnterpriseProfile
	if err := s.db.Where("user_id = ?", user.ID).First(&profile).Error; err != nil {
		return res
	}

	kybStatus := profile.KYBStatus
	if kybStatus == "" {
		kybStatus = profile.StatusKYB
	}
	if kybStatus == "" {
		kybStatus = models.KYBPending
	}

	res.EnterpriseKYBStatus = string(kybStatus)
	res.EnterpriseApproved = kybStatus == models.KYBApproved
	res.BusinessLicenseURL = profile.GPKDURL
	return res
}

func (s *authService) ensureCanLogin(user *models.User) error {
	switch user.Status {
	case models.UserStatusActive:
	case models.UserStatusInactive:
		return ErrAccountInactive
	case models.UserStatusBanned:
		return ErrAccountBanned
	default:
		return ErrAccountInactive
	}

	if user.Role != models.RoleEnterprise {
		return nil
	}

	var profile models.EnterpriseProfile
	if err := s.db.Where("user_id = ?", user.ID).First(&profile).Error; err != nil {
		return ErrEnterpriseNotVerify
	}

	kybStatus := profile.KYBStatus
	if kybStatus == "" {
		kybStatus = profile.StatusKYB
	}
	if kybStatus == "" {
		kybStatus = models.KYBPending
	}

	if kybStatus == models.KYBApproved {
		return nil
	}
	if kybStatus == models.KYBRejected {
		return ErrEnterpriseRejected
	}
	return ErrEnterpriseNotVerify
}
