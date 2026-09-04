package services

import (
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"unicode"

	"quickwork.local/backend/internal/models"
)

const NeutralMatchScore = 7.0

type MatchWeights struct {
	Location   float64
	Category   float64
	Salary     float64
	JobType    float64
	Skills     float64
	Experience float64
	Education  float64
}

var DefaultMatchWeights = MatchWeights{
	Location:   0.25,
	Category:   0.18,
	Salary:     0.12,
	JobType:    0.10,
	Skills:     0.20,
	Experience: 0.10,
	Education:  0.05,
}

type MatchBreakdown struct {
	Location   float64 `json:"location"`
	Category   float64 `json:"category"`
	Salary     float64 `json:"salary"`
	JobType    float64 `json:"job_type"`
	Skills     float64 `json:"skills"`
	Experience float64 `json:"experience"`
	Education  float64 `json:"education"`
}

type deterministicMatch struct {
	Breakdown           MatchBreakdown
	CategoryExact       bool
	StudentSkills       []string
	JobSkills           []string
	ExactMatchedSkills  []string
	ProfileCompleteness float64
}

type salaryRange struct {
	Min   float64
	Max   float64
	Known bool
}

var salaryNumberPattern = regexp.MustCompile(`\d[\d.,]*`)

func scoreDeterministicMatch(profile *models.StudentProfile, job models.Job) deterministicMatch {
	studentSkills := skillNames(profile.Skills)
	jobSkills := skillNames(job.Skills)
	categoryScore, categoryExact := scoreCategory(profile.PreferredCategory, inferBackendJobCategory(job))

	result := deterministicMatch{
		Breakdown: MatchBreakdown{
			Location:   scoreLocation(profile.PreferredLocation, job.Location),
			Category:   categoryScore,
			Salary:     scoreSalary(profile.ExpectedSalary, job.Salary),
			JobType:    scoreJobType(profile.PreferredJobType, inferBackendJobType(job)),
			Skills:     scoreSkillsFallback(studentSkills, jobSkills),
			Experience: scoreExperienceFallback(profile.WorkExperiences, job),
			Education:  scoreEducationFallback(profile.Educations, job),
		},
		CategoryExact:      categoryExact,
		StudentSkills:      studentSkills,
		JobSkills:          jobSkills,
		ExactMatchedSkills: exactSkillMatches(studentSkills, jobSkills),
	}
	result.ProfileCompleteness = profileMatchCompleteness(profile)
	return result
}

func CalculateFinalMatchScore(b MatchBreakdown, weights MatchWeights) float64 {
	score := clampMatchScore(b.Location)*weights.Location +
		clampMatchScore(b.Category)*weights.Category +
		clampMatchScore(b.Salary)*weights.Salary +
		clampMatchScore(b.JobType)*weights.JobType +
		clampMatchScore(b.Skills)*weights.Skills +
		clampMatchScore(b.Experience)*weights.Experience +
		clampMatchScore(b.Education)*weights.Education
	return math.Round(clampMatchScore(score)*10) / 10
}

func scoreLocation(preference string, location string) float64 {
	preferred := normalizeMatchText(preference)
	jobLocation := normalizeMatchText(location)
	if preferred == "" || jobLocation == "" {
		return NeutralMatchScore
	}
	preferredRemote := strings.Contains(preferred, "remote") || strings.Contains(preferred, "tu xa")
	jobRemote := strings.Contains(jobLocation, "remote") || strings.Contains(jobLocation, "tu xa")
	if jobRemote {
		if preferredRemote {
			return 10
		}
		return 8
	}
	if preferredRemote {
		return 5
	}
	if preferred == jobLocation || strings.Contains(jobLocation, preferred) || strings.Contains(preferred, jobLocation) {
		return 10
	}
	preferredTokens := locationTokens(preferred)
	jobTokens := locationTokens(jobLocation)
	if len(preferredTokens) > 0 && len(jobTokens) > 0 {
		matches := 0
		for token := range preferredTokens {
			if _, exists := jobTokens[token]; exists {
				matches++
			}
		}
		if matches == len(preferredTokens) && matches == len(jobTokens) {
			return 10
		}
		if matches == len(preferredTokens) || matches == len(jobTokens) {
			return 9
		}
		if float64(matches)/float64(maxInt(len(preferredTokens), len(jobTokens))) >= 0.6 {
			return 8
		}
	}

	preferredParts := meaningfulLocationParts(preferred)
	jobParts := meaningfulLocationParts(jobLocation)
	for _, part := range preferredParts {
		for _, candidate := range jobParts {
			if part == candidate || strings.Contains(part, candidate) || strings.Contains(candidate, part) {
				return 9
			}
		}
	}
	return 2
}

func locationTokens(value string) map[string]struct{} {
	administrativeWords := map[string]struct{}{
		"thanh": {}, "pho": {}, "tinh": {}, "phuong": {}, "xa": {}, "quan": {}, "huyen": {}, "tp": {},
	}
	result := map[string]struct{}{}
	for _, token := range strings.Fields(value) {
		if _, administrative := administrativeWords[token]; administrative || len(token) < 2 {
			continue
		}
		result[token] = struct{}{}
	}
	return result
}

func meaningfulLocationParts(value string) []string {
	value = strings.NewReplacer(" thanh pho ", " ", " tinh ", " ", " phuong ", " ", " xa ", " ", " quan ", " ", " huyen ", " ", " tp ", " ").Replace(" " + value + " ")
	parts := strings.FieldsFunc(value, func(r rune) bool { return r == ',' || r == ';' || r == '-' })
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if len(part) >= 3 {
			result = append(result, part)
		}
	}
	return result
}

func scoreCategory(preference string, jobCategory string) (float64, bool) {
	preferred := normalizeMatchText(preference)
	category := normalizeMatchText(jobCategory)
	if preferred == "" || category == "" {
		return NeutralMatchScore, false
	}
	if preferred == category || strings.Contains(preferred, category) || strings.Contains(category, preferred) {
		return 10, true
	}
	return 4, false
}

func scoreSalary(preference string, salary string) float64 {
	preferred := parseSalaryRange(preference)
	job := parseSalaryRange(salary)
	if !preferred.Known || !job.Known {
		return NeutralMatchScore
	}
	if job.Min > preferred.Max {
		return 9
	}
	overlap := math.Min(preferred.Max, job.Max) - math.Max(preferred.Min, job.Min)
	if overlap >= 0 {
		preferredSpan := math.Max(preferred.Max-preferred.Min, 1)
		coverage := math.Min(1, (overlap+1)/(preferredSpan+1))
		return clampMatchScore(7 + 3*coverage)
	}
	if job.Max < preferred.Min {
		gapRatio := (preferred.Min - job.Max) / math.Max(preferred.Min, 1)
		return clampRange(7-gapRatio*12, 1, 6.5)
	}
	return 5
}

func parseSalaryRange(value string) salaryRange {
	normalized := normalizeMatchText(value)
	if normalized == "" || strings.Contains(normalized, "thoa thuan") || strings.Contains(normalized, "negotiable") || strings.Contains(normalized, "canh tranh") {
		return salaryRange{}
	}
	rawNumbers := salaryNumberPattern.FindAllString(strings.ToLower(value), -1)
	if len(rawNumbers) == 0 {
		return salaryRange{}
	}
	numbers := make([]float64, 0, len(rawNumbers))
	for _, raw := range rawNumbers {
		cleaned := strings.TrimSpace(raw)
		if strings.Count(cleaned, ",")+strings.Count(cleaned, ".") > 1 ||
			(strings.Contains(cleaned, ",") && len(cleaned)-strings.LastIndex(cleaned, ",")-1 == 3) ||
			(strings.Contains(cleaned, ".") && len(cleaned)-strings.LastIndex(cleaned, ".")-1 == 3) {
			cleaned = strings.NewReplacer(",", "", ".", "").Replace(cleaned)
		} else {
			cleaned = strings.ReplaceAll(cleaned, ",", ".")
		}
		number, err := strconv.ParseFloat(cleaned, 64)
		if err != nil {
			continue
		}
		if number > 1000 {
			number /= 1_000_000
		}
		numbers = append(numbers, number)
	}
	if len(numbers) == 0 {
		return salaryRange{}
	}
	minValue, maxValue := numbers[0], numbers[0]
	if len(numbers) > 1 {
		minValue, maxValue = math.Min(numbers[0], numbers[1]), math.Max(numbers[0], numbers[1])
	}
	return salaryRange{Min: minValue, Max: maxValue, Known: true}
}

func scoreJobType(preference string, jobType string) float64 {
	preferred := canonicalJobType(preference)
	actual := canonicalJobType(jobType)
	if preferred == "" || actual == "" {
		return NeutralMatchScore
	}
	if preferred == actual {
		return 10
	}
	if preferred == "remote" || actual == "remote" {
		return 6
	}
	if (preferred == "full_time" && actual == "part_time") || (preferred == "part_time" && actual == "full_time") {
		return 3
	}
	if preferred == "internship" || actual == "internship" {
		return 4
	}
	return 5
}

func canonicalJobType(value string) string {
	normalized := normalizeMatchText(value)
	switch {
	case normalized == "":
		return ""
	case strings.Contains(normalized, "remote"), strings.Contains(normalized, "tu xa"):
		return "remote"
	case strings.Contains(normalized, "part"), strings.Contains(normalized, "ban thoi gian"):
		return "part_time"
	case strings.Contains(normalized, "freelance"):
		return "freelance"
	case strings.Contains(normalized, "intern"), strings.Contains(normalized, "thuc tap"), strings.Contains(normalized, "trainee"):
		return "internship"
	case strings.Contains(normalized, "full"), strings.Contains(normalized, "toan thoi gian"):
		return "full_time"
	default:
		return normalized
	}
}

func scoreSkillsFallback(studentSkills []string, jobSkills []string) float64 {
	if len(studentSkills) == 0 || len(jobSkills) == 0 {
		return NeutralMatchScore
	}
	matches := exactSkillMatches(studentSkills, jobSkills)
	if len(matches) == 0 {
		return 4
	}
	return clampMatchScore(4 + 6*(float64(len(matches))/float64(len(jobSkills))))
}

func exactSkillMatches(studentSkills []string, jobSkills []string) []string {
	available := make(map[string]string, len(studentSkills))
	for _, skill := range studentSkills {
		available[normalizeMatchText(skill)] = skill
	}
	matches := make([]string, 0)
	for _, jobSkill := range jobSkills {
		if skill, ok := available[normalizeMatchText(jobSkill)]; ok {
			matches = append(matches, skill)
		}
	}
	sort.Strings(matches)
	return matches
}

func scoreExperienceFallback(experiences []models.StudentWorkExperience, job models.Job) float64 {
	if len(experiences) == 0 {
		return 6.5
	}
	jobText := normalizeMatchText(strings.Join([]string{job.Title, job.Requirements, job.Description}, " "))
	best := 4.0
	for _, experience := range experiences {
		relevance := tokenOverlapScore(
			normalizeMatchText(experience.Position+" "+experience.Description),
			jobText,
		)
		best = math.Max(best, 4+6*relevance)
	}
	return clampMatchScore(best)
}

func scoreEducationFallback(educations []models.StudentEducation, job models.Job) float64 {
	if len(educations) == 0 {
		return NeutralMatchScore
	}
	jobText := normalizeMatchText(job.Title + " " + job.Requirements + " " + inferBackendJobCategory(job))
	best := NeutralMatchScore
	for _, education := range educations {
		relevance := tokenOverlapScore(normalizeMatchText(education.Major+" "+education.Degree+" "+education.Description), jobText)
		if relevance > 0 {
			best = math.Max(best, 7+3*relevance)
		}
	}
	return clampMatchScore(best)
}

func tokenOverlapScore(left string, right string) float64 {
	leftTokens := meaningfulTokens(left)
	rightTokens := meaningfulTokens(right)
	if len(leftTokens) == 0 || len(rightTokens) == 0 {
		return 0
	}
	rightSet := make(map[string]struct{}, len(rightTokens))
	for _, token := range rightTokens {
		rightSet[token] = struct{}{}
	}
	matches := 0
	for _, token := range leftTokens {
		if _, ok := rightSet[token]; ok {
			matches++
		}
	}
	return math.Min(1, float64(matches)/float64(maxInt(1, minInt(len(leftTokens), 6))))
}

func meaningfulTokens(value string) []string {
	stopWords := map[string]struct{}{
		"va": {}, "voi": {}, "cho": {}, "cac": {}, "cong": {}, "viec": {}, "lam": {}, "the": {}, "and": {}, "for": {}, "with": {}, "job": {},
	}
	result := make([]string, 0)
	seen := map[string]struct{}{}
	for _, token := range strings.Fields(value) {
		if len(token) < 2 {
			continue
		}
		if _, blocked := stopWords[token]; blocked {
			continue
		}
		if _, exists := seen[token]; exists {
			continue
		}
		seen[token] = struct{}{}
		result = append(result, token)
	}
	return result
}

func inferBackendJobType(job models.Job) string {
	text := normalizeMatchText(job.Title + " " + job.Description + " " + job.Requirements + " " + job.Location)
	switch {
	case strings.Contains(text, "remote"), strings.Contains(text, "tu xa"):
		return "Remote"
	case strings.Contains(text, "part time"), strings.Contains(text, "ban thoi gian"):
		return "Bán thời gian"
	case strings.Contains(text, "freelance"):
		return "Freelance"
	case strings.Contains(text, "intern"), strings.Contains(text, "thuc tap"), strings.Contains(text, "trainee"):
		return "Thực tập"
	default:
		return "Toàn thời gian"
	}
}

func inferBackendJobCategory(job models.Job) string {
	counts := map[string]int{}
	for _, skill := range job.Skills {
		if skill.Category != nil && strings.TrimSpace(skill.Category.Name) != "" {
			counts[skill.Category.Name]++
		}
	}
	bestName, bestCount := "", 0
	for name, count := range counts {
		if count > bestCount || (count == bestCount && name < bestName) {
			bestName, bestCount = name, count
		}
	}
	if bestName != "" {
		return bestName
	}

	text := normalizeMatchText(job.Title + " " + job.Description + " " + job.Requirements)
	switch {
	case containsAny(text, "marketing", "content", "seo", "social", "campaign"):
		return "Marketing"
	case containsAny(text, "design", "figma", "ui", "ux"):
		return "Thiết kế"
	case containsAny(text, "sales", "crm", "business", "analyst", "van hanh", "operations"):
		return "Kinh doanh"
	default:
		return "Công nghệ"
	}
}

func profileMatchCompleteness(profile *models.StudentProfile) float64 {
	completed := 0
	if strings.TrimSpace(profile.PreferredLocation) != "" {
		completed++
	}
	if strings.TrimSpace(profile.PreferredCategory) != "" {
		completed++
	}
	if strings.TrimSpace(profile.ExpectedSalary) != "" {
		completed++
	}
	if strings.TrimSpace(profile.PreferredJobType) != "" {
		completed++
	}
	if len(profile.Skills) > 0 {
		completed++
	}
	if len(profile.WorkExperiences) > 0 {
		completed++
	}
	if len(profile.Educations) > 0 {
		completed++
	}
	return math.Round((float64(completed)/7)*100) / 100
}

func skillNames(skills []models.Skill) []string {
	result := make([]string, 0, len(skills))
	for _, skill := range skills {
		if name := strings.TrimSpace(skill.Name); name != "" {
			result = append(result, name)
		}
	}
	sort.Strings(result)
	return result
}

func normalizeMatchText(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = vietnameseMatchReplacer.Replace(value)
	var builder strings.Builder
	builder.Grow(len(value))
	lastSpace := false
	for _, r := range value {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			builder.WriteRune(r)
			lastSpace = false
			continue
		}
		if !lastSpace {
			builder.WriteByte(' ')
			lastSpace = true
		}
	}
	return strings.Join(strings.Fields(builder.String()), " ")
}

var vietnameseMatchReplacer = strings.NewReplacer(
	"à", "a", "á", "a", "ạ", "a", "ả", "a", "ã", "a", "â", "a", "ầ", "a", "ấ", "a", "ậ", "a", "ẩ", "a", "ẫ", "a", "ă", "a", "ằ", "a", "ắ", "a", "ặ", "a", "ẳ", "a", "ẵ", "a",
	"è", "e", "é", "e", "ẹ", "e", "ẻ", "e", "ẽ", "e", "ê", "e", "ề", "e", "ế", "e", "ệ", "e", "ể", "e", "ễ", "e",
	"ì", "i", "í", "i", "ị", "i", "ỉ", "i", "ĩ", "i",
	"ò", "o", "ó", "o", "ọ", "o", "ỏ", "o", "õ", "o", "ô", "o", "ồ", "o", "ố", "o", "ộ", "o", "ổ", "o", "ỗ", "o", "ơ", "o", "ờ", "o", "ớ", "o", "ợ", "o", "ở", "o", "ỡ", "o",
	"ù", "u", "ú", "u", "ụ", "u", "ủ", "u", "ũ", "u", "ư", "u", "ừ", "u", "ứ", "u", "ự", "u", "ử", "u", "ữ", "u",
	"ỳ", "y", "ý", "y", "ỵ", "y", "ỷ", "y", "ỹ", "y", "đ", "d",
)

func clampMatchScore(value float64) float64 {
	return clampRange(value, 0, 10)
}

func clampRange(value float64, minValue float64, maxValue float64) float64 {
	return math.Max(minValue, math.Min(maxValue, value))
}

func containsAny(value string, candidates ...string) bool {
	for _, candidate := range candidates {
		if strings.Contains(value, candidate) {
			return true
		}
	}
	return false
}

func minInt(left int, right int) int {
	if left < right {
		return left
	}
	return right
}

func maxInt(left int, right int) int {
	if left > right {
		return left
	}
	return right
}
