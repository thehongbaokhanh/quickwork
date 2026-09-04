package models

import (
	"gorm.io/gorm"
	"time"
)

type StudentProfile struct {
	UserID uint `gorm:"primaryKey" json:"user_id"`

	Name  string `gorm:"type:varchar(100);not null" json:"name"`
	Phone string `gorm:"type:varchar(20)" json:"phone"`

	Avatar string `gorm:"type:varchar(255)" json:"avatar"`

	Skills []Skill `gorm:"many2many:student_profile_skills;" json:"skills"`

	CVURL        string `gorm:"column:cv_url;type:varchar(255)" json:"cv_url"`
	CVFileName   string `gorm:"column:cv_file_name;type:varchar(255)" json:"cv_file_name"`
	Summary      string `gorm:"type:text" json:"summary"`
	PortfolioURL string `gorm:"column:portfolio_url;type:varchar(500)" json:"portfolio_url"`

	PreferredLocation string `gorm:"type:varchar(150)" json:"preferred_location"`
	PreferredCategory string `gorm:"type:varchar(150)" json:"preferred_category"`
	ExpectedSalary    string `gorm:"type:varchar(100)" json:"expected_salary"`
	PreferredJobType  string `gorm:"type:varchar(50)" json:"preferred_job_type"`

	ProfileVisible         bool `gorm:"not null;default:true" json:"profile_visible"`
	AllowEnterpriseContact bool `gorm:"not null;default:true" json:"allow_enterprise_contact"`
	ShowContactInfo        bool `gorm:"not null;default:false" json:"show_contact_info"`

	WorkExperiences []StudentWorkExperience `gorm:"foreignKey:StudentID;references:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"work_experiences"`
	Educations      []StudentEducation      `gorm:"foreignKey:StudentID;references:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"educations"`
	Portfolios      []StudentPortfolio      `gorm:"foreignKey:StudentID;references:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"portfolios"`

	User User `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (StudentProfile) TableName() string {
	return "student_profiles"
}
