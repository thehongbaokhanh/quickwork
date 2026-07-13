// Package database provides database seed helpers.
package database

import (
	"errors"

	"gorm.io/gorm"
	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/pkg/password"
)

// Seed inserts initial data into database.
// Safe to call multiple times.
func Seed(db *gorm.DB) error {
	hashedPassword, err := password.Hash("QuickWork@123")
	if err != nil {
		return err
	}

	if _, err := ensureSeedUser(db, "admin@quickwork.local", hashedPassword, models.RoleAdmin); err != nil {
		return err
	}

	categories, err := ensureSeedCategories(db, []string{
		"Công nghệ",
		"Marketing",
		"Kinh doanh",
		"Thiết kế",
	})
	if err != nil {
		return err
	}

	skills, err := ensureSeedSkills(db, categories, map[string]string{
		"Go":                "Công nghệ",
		"PostgreSQL":        "Công nghệ",
		"Docker":            "Công nghệ",
		"Vue.js":            "Công nghệ",
		"Nuxt.js":           "Công nghệ",
		"TypeScript":        "Công nghệ",
		"QA":                "Công nghệ",
		"Figma":             "Thiết kế",
		"UI/UX":             "Thiết kế",
		"Content":           "Marketing",
		"SEO":               "Marketing",
		"Social Ads":        "Marketing",
		"CRM":               "Kinh doanh",
		"Excel":             "Kinh doanh",
		"Phân tích dữ liệu": "Kinh doanh",
	})
	if err != nil {
		return err
	}

	enterprises := []struct {
		email       string
		companyName string
		taxCode     string
		gpkdURL     string
		kybStatus   models.KYBStatus
	}{
		{"hr@quickwork-labs.vn", "QuickWork Labs", "0109990001", "/uploads/sample/gpkd-quickwork-labs.pdf", models.KYBApproved},
		{"talent@fpt-digital.vn", "FPT Digital", "0109990002", "/uploads/sample/gpkd-fpt-digital.jpg", models.KYBApproved},
		{"jobs@greenlab.vn", "GreenLab Studio", "0109990003", "/uploads/sample/gpkd-greenlab.jpg", models.KYBApproved},
		{"pending@nova-commerce.vn", "Nova Commerce", "0109990004", "/uploads/sample/gpkd-quickwork-labs.pdf", models.KYBPending},
	}

	enterpriseUsers := map[string]models.User{}
	for _, sample := range enterprises {
		user, err := ensureSeedUser(db, sample.email, hashedPassword, models.RoleEnterprise)
		if err != nil {
			return err
		}
		if err := ensureSeedEnterpriseProfile(db, user.ID, sample.companyName, sample.taxCode, sample.gpkdURL, sample.kybStatus); err != nil {
			return err
		}
		enterpriseUsers[sample.companyName] = user
	}

	students := []struct {
		email      string
		name       string
		phone      string
		skillNames []string
	}{
		{"minh.nguyen@student.quickwork.local", "Nguyễn Minh", "0901000001", []string{"Go", "PostgreSQL", "Docker"}},
		{"linh.tran@student.quickwork.local", "Trần Khánh Linh", "0901000002", []string{"Vue.js", "Nuxt.js", "TypeScript"}},
		{"anh.pham@student.quickwork.local", "Phạm Hoàng Anh", "0901000003", []string{"Content", "SEO", "Social Ads"}},
	}

	for _, sample := range students {
		user, err := ensureSeedUser(db, sample.email, hashedPassword, models.RoleStudent)
		if err != nil {
			return err
		}
		if err := ensureSeedStudentProfile(db, user.ID, sample.name, sample.phone, pickSkills(skills, sample.skillNames)); err != nil {
			return err
		}
	}

	jobs := []struct {
		enterpriseName string
		title          string
		description    string
		requirements   string
		salary         string
		location       string
		slots          int
		status         models.JobStatus
		rejectReason   string
		skillNames     []string
	}{
		{"QuickWork Labs", "Backend Developer Go Junior", "Phát triển API tuyển dụng, tối ưu truy vấn và phối hợp cùng đội frontend Nuxt.", "Junior, Go, PostgreSQL, Docker, làm việc toàn thời gian", "20 - 35 triệu", "Hà Nội", 3, models.JobApproved, "", []string{"Go", "PostgreSQL", "Docker"}},
		{"QuickWork Labs", "Remote QA Trainee", "Viết test case, kiểm thử chức năng web app và báo lỗi trong quy trình release.", "Thực tập, remote, QA, Excel", "6 - 9 triệu", "Remote", 2, models.JobApproved, "", []string{"QA", "Excel"}},
		{"FPT Digital", "Frontend Developer Nuxt.js", "Xây dựng giao diện Vue/Nuxt, chuẩn hóa component và tối ưu trải nghiệm ứng viên.", "Junior, Vue.js, Nuxt.js, TypeScript, toàn thời gian", "15 - 25 triệu", "TP. Hồ Chí Minh", 4, models.JobApproved, "", []string{"Vue.js", "Nuxt.js", "TypeScript"}},
		{"FPT Digital", "Business Analyst Intern", "Hỗ trợ lấy yêu cầu, viết tài liệu nghiệp vụ và phân tích dữ liệu vận hành sản phẩm.", "Thực tập, CRM, Excel, phân tích dữ liệu", "5 - 9 triệu", "Hà Nội", 2, models.JobApproved, "", []string{"CRM", "Excel", "Phân tích dữ liệu"}},
		{"GreenLab Studio", "Content Creator Part-time", "Lên kịch bản video ngắn, viết caption và theo dõi hiệu quả nội dung tuyển dụng.", "Part-time, Content, SEO, Social Ads", "4 - 7 triệu", "Đà Nẵng", 5, models.JobApproved, "", []string{"Content", "SEO", "Social Ads"}},
		{"GreenLab Studio", "UI/UX Designer Intern", "Thiết kế wireframe, prototype và cải thiện luồng ứng tuyển trên sản phẩm nội bộ.", "Thực tập, Figma, UI/UX, product design", "7 - 10 triệu", "TP. Hồ Chí Minh", 2, models.JobApproved, "", []string{"Figma", "UI/UX"}},
		{"Nova Commerce", "Marketing Assistant Part-time", "Theo dõi campaign, tổng hợp báo cáo và hỗ trợ nội dung thương mại điện tử.", "Part-time, Content, Social Ads", "5 - 8 triệu", "TP. Hồ Chí Minh", 3, models.JobPending, "", []string{"Content", "Social Ads"}},
		{"Nova Commerce", "Sales Operations Intern", "Hỗ trợ cập nhật CRM, xử lý dữ liệu khách hàng và báo cáo vận hành bán hàng.", "Thực tập, CRM, Excel", "4 - 6 triệu", "Hà Nội", 2, models.JobRejected, "Cần bổ sung mô tả quyền lợi và thời gian làm việc.", []string{"CRM", "Excel"}},
	}

	for _, sample := range jobs {
		enterprise, ok := enterpriseUsers[sample.enterpriseName]
		if !ok {
			continue
		}
		if err := ensureSeedJob(db, enterprise.ID, sample.title, sample.description, sample.requirements, sample.salary, sample.location, sample.slots, sample.status, sample.rejectReason, pickSkills(skills, sample.skillNames)); err != nil {
			return err
		}
	}

	return nil
}

func ensureSeedUser(db *gorm.DB, email string, hashedPassword string, role models.UserRole) (models.User, error) {
	var user models.User
	err := db.Where("email = ?", email).First(&user).Error
	if err == nil {
		return user, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return user, err
	}

	user = models.User{
		Email:    email,
		Password: hashedPassword,
		Role:     role,
		Status:   models.UserStatusActive,
	}
	return user, db.Create(&user).Error
}

func ensureSeedEnterpriseProfile(db *gorm.DB, userID uint, companyName string, taxCode string, gpkdURL string, kybStatus models.KYBStatus) error {
	var profile models.EnterpriseProfile
	err := db.Where("user_id = ?", userID).First(&profile).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		profile = models.EnterpriseProfile{UserID: userID}
	}

	profile.CompanyName = companyName
	profile.TaxCode = taxCode
	profile.GPKDURL = gpkdURL
	profile.KYBStatus = kybStatus
	profile.StatusKYB = kybStatus
	return db.Save(&profile).Error
}

func ensureSeedStudentProfile(db *gorm.DB, userID uint, name string, phone string, skills []models.Skill) error {
	var profile models.StudentProfile
	err := db.Where("user_id = ?", userID).First(&profile).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		profile = models.StudentProfile{UserID: userID}
	}

	profile.Name = name
	profile.Phone = phone
	if err := db.Save(&profile).Error; err != nil {
		return err
	}
	return db.Model(&profile).Association("Skills").Replace(skills)
}

func ensureSeedCategories(db *gorm.DB, names []string) (map[string]models.Category, error) {
	categories := map[string]models.Category{}
	for _, name := range names {
		var category models.Category
		err := db.Where("name = ?", name).First(&category).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			category = models.Category{Name: name}
			if err := db.Create(&category).Error; err != nil {
				return nil, err
			}
		}
		categories[name] = category
	}
	return categories, nil
}

func ensureSeedSkills(db *gorm.DB, categories map[string]models.Category, skillCategories map[string]string) (map[string]models.Skill, error) {
	skills := map[string]models.Skill{}
	for skillName, categoryName := range skillCategories {
		category, ok := categories[categoryName]
		if !ok {
			continue
		}

		var skill models.Skill
		err := db.Where("name = ?", skillName).First(&skill).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			skill = models.Skill{Name: skillName, CategoryID: category.ID}
			if err := db.Create(&skill).Error; err != nil {
				return nil, err
			}
		} else if skill.CategoryID != category.ID {
			skill.CategoryID = category.ID
			if err := db.Save(&skill).Error; err != nil {
				return nil, err
			}
		}
		skills[skillName] = skill
	}
	return skills, nil
}

func ensureSeedJob(db *gorm.DB, enterpriseID uint, title string, description string, requirements string, salary string, location string, slots int, status models.JobStatus, rejectReason string, skills []models.Skill) error {
	var job models.Job
	err := db.Where("enterprise_id = ? AND title = ?", enterpriseID, title).First(&job).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		job = models.Job{EnterpriseID: enterpriseID, Title: title}
	}

	job.Description = description
	job.Requirements = requirements
	job.Salary = salary
	job.Location = location
	job.Slots = slots
	job.Status = status
	job.RejectReason = rejectReason
	if err := db.Save(&job).Error; err != nil {
		return err
	}
	return db.Model(&job).Association("Skills").Replace(skills)
}

func pickSkills(skills map[string]models.Skill, names []string) []models.Skill {
	picked := make([]models.Skill, 0, len(names))
	for _, name := range names {
		if skill, ok := skills[name]; ok {
			picked = append(picked, skill)
		}
	}
	return picked
}
