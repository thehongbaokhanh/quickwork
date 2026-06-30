package services

import (
	"context"
	"time"

	"gorm.io/gorm"
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
}

type authService struct {
	db             *gorm.DB
	userRepo       repositories.UserRepository
	studentRepo    repositories.StudentRepository
	enterpriseRepo repositories.EnterpriseRepository
	authRedisRepo  repositories.AuthRedisRepository
}

func NewAuthService(
	db *gorm.DB,
	userRepo repositories.UserRepository,
	studentRepo repositories.StudentRepository,
	enterpriseRepo repositories.EnterpriseRepository,
	authRedisRepo repositories.AuthRedisRepository,
) AuthService {
	return &authService{
		db:             db,
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
		Role:     "STUDENT",
		Status:   "ACTIVE",
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
		Role:      user.Role,
		Status:    user.Status,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *authService) RegisterEnterprise(req *request.RegisterEnterpriseRequest) (*response.RegisterResponse, error) {
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
		Role:     "ENTERPRISE",
		Status:   "ACTIVE",
	}

	if err := s.userRepo.Create(tx, user); err != nil {
		tx.Rollback()
		return nil, err
	}

	enterpriseProfile := &models.EnterpriseProfile{
		UserID:      user.ID,
		CompanyName: req.CompanyName,
		TaxCode:     req.TaxCode,
		KYBStatus:   models.KYBPending,
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
		Role:      user.Role,
		Status:    user.Status,
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
	if user.Status != "ACTIVE" {
		return nil, ErrAccountBanned
	}

	// 4. Sinh JWT
	accessToken, err := jwt.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.ID, user.Role)
	if err != nil {
		return nil, err
	}

	// 5. Trả Response
	return &response.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		UserID:       user.ID,
		Email:        user.Email,
		Role:         user.Role,
	}, nil
}

func (s *authService) Logout(

	ctx context.Context,

	accessToken string,

	refreshToken string,

) error {

	//----------------------------------
	// Access Token
	//----------------------------------

	accessClaims, err := jwt.VerifyToken(accessToken)

	if err != nil {
		return err
	}

	duration := time.Until(
		accessClaims.ExpiresAt.Time,
	)

	if duration > 0 {

		err = s.authRedisRepo.AddToBlacklist(
			ctx,
			accessClaims.TokenUUID,
			duration,
		)

		if err != nil {
			return err
		}

	}	

	err = s.authRedisRepo.AddToBlacklist(
		ctx,
		accessClaims.TokenUUID,
		duration,
	)

	if err != nil {
		return err
	}

	//----------------------------------
	// Refresh Token
	//----------------------------------

	refreshClaims, err := jwt.VerifyToken(refreshToken)

	if err != nil {
		return err
	}

	duration = time.Until(
		refreshClaims.ExpiresAt.Time,
	)

	err = s.authRedisRepo.AddToBlacklist(
		ctx,
		refreshClaims.TokenUUID,
		duration,
	)

	if err != nil {
		return err
	}

	return nil
}
