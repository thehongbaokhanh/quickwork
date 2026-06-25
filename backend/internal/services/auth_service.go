package service

import (
	"gorm.io/gorm"
	"quickwork.local/backend/internal/dto/request"
	"quickwork.local/backend/internal/dto/response"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
	"quickwork.local/backend/pkg/password"
)

type AuthService interface {
	RegisterStudent(req *request.RegisterStudentRequest) (*response.RegisterResponse, error)
	RegisterEnterprise(req *request.RegisterEnterpriseRequest) (*response.RegisterResponse, error)
}

type authService struct {
	db             *gorm.DB
	userRepo       repositories.UserRepository
	studentRepo    repositories.StudentRepository
	enterpriseRepo repositories.EnterpriseRepository
}

func NewAuthService(
	db *gorm.DB,
	userRepo repositories.UserRepository,
	studentRepo repositories.StudentRepository,
	enterpriseRepo repositories.EnterpriseRepository,
) AuthService {
	return &authService{
		db:             db,
		userRepo:       userRepo,
		studentRepo:    studentRepo,
		enterpriseRepo: enterpriseRepo,
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
