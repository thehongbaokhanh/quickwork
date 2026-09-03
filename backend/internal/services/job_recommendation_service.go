package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	redisv9 "github.com/redis/go-redis/v9"

	"quickwork.local/backend/internal/models"
	"quickwork.local/backend/internal/repositories"
)

type RecommendationCache interface {
	Get(ctx context.Context, key string) ([]byte, bool, error)
	Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
}

type RedisRecommendationCache struct {
	client *redisv9.Client
}

func NewRedisRecommendationCache(client *redisv9.Client) *RedisRecommendationCache {
	return &RedisRecommendationCache{client: client}
}

func (c *RedisRecommendationCache) Get(ctx context.Context, key string) ([]byte, bool, error) {
	if c == nil || c.client == nil {
		return nil, false, nil
	}
	value, err := c.client.Get(ctx, key).Bytes()
	if err == redisv9.Nil {
		return nil, false, nil
	}
	if err != nil {
		return nil, false, err
	}
	return value, true, nil
}

func (c *RedisRecommendationCache) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
	if c == nil || c.client == nil {
		return nil
	}
	return c.client.Set(ctx, key, value, ttl).Err()
}

type JobRecommendationConfig struct {
	CandidateLimit int
	CacheTTL       time.Duration
	AITimeout      time.Duration
	Weights        MatchWeights
}

const MaxRecommendationResultLimit = 100

type MatchExplanation struct {
	Strengths []string `json:"strengths"`
	Gaps      []string `json:"gaps"`
}

type JobRecommendationItem struct {
	Job         models.Job       `json:"job"`
	MatchScore  float64          `json:"match_score"`
	Confidence  float64          `json:"confidence"`
	Breakdown   MatchBreakdown   `json:"breakdown"`
	Explanation MatchExplanation `json:"explanation"`
}

type JobRecommendationResult struct {
	Items               []JobRecommendationItem `json:"items"`
	AIUsed              bool                    `json:"ai_used"`
	CacheHit            bool                    `json:"cache_hit"`
	ProfileCompleteness float64                 `json:"profile_completeness"`
	GeneratedAt         time.Time               `json:"generated_at"`
}

type JobRecommendationService struct {
	repository repositories.RecommendationRepository
	cache      RecommendationCache
	ai         JobMatchAI
	config     JobRecommendationConfig
}

func NewJobRecommendationService(
	repository repositories.RecommendationRepository,
	cache RecommendationCache,
	ai JobMatchAI,
	config JobRecommendationConfig,
) *JobRecommendationService {
	if config.CandidateLimit <= 0 {
		config.CandidateLimit = 20
	} else if config.CandidateLimit > 20 {
		config.CandidateLimit = 20
	}
	if config.CacheTTL <= 0 {
		config.CacheTTL = 45 * time.Minute
	}
	if config.AITimeout <= 0 {
		config.AITimeout = 12 * time.Second
	}
	if config.Weights == (MatchWeights{}) {
		config.Weights = DefaultMatchWeights
	}
	return &JobRecommendationService{repository: repository, cache: cache, ai: ai, config: config}
}

type scoredRecommendation struct {
	job           models.Job
	deterministic deterministicMatch
	breakdown     MatchBreakdown
	score         float64
	confidence    float64
	ai            *MatchAIItem
}

type recommendationCacheEnvelope struct {
	Fingerprint string                  `json:"fingerprint"`
	Result      JobRecommendationResult `json:"result"`
}

func (s *JobRecommendationService) Recommend(ctx context.Context, studentID uint, limit int, refresh bool) (*JobRecommendationResult, error) {
	if s == nil || s.repository == nil {
		return nil, fmt.Errorf("job recommendation service is not configured")
	}
	if limit <= 0 {
		limit = s.config.CandidateLimit
	} else if limit > MaxRecommendationResultLimit {
		limit = MaxRecommendationResultLimit
	}

	profile, err := s.repository.FindStudentMatchProfile(ctx, studentID)
	if err != nil {
		return nil, err
	}
	jobs, err := s.repository.FindEligibleRecommendationJobs(ctx)
	if err != nil {
		return nil, err
	}

	candidates := make([]scoredRecommendation, 0, len(jobs))
	for _, job := range jobs {
		deterministic := scoreDeterministicMatch(profile, job)
		breakdown := deterministic.Breakdown
		candidates = append(candidates, scoredRecommendation{
			job: job, deterministic: deterministic, breakdown: breakdown,
			score:      CalculateFinalMatchScore(breakdown, s.config.Weights),
			confidence: clampRange(0.35+0.5*deterministic.ProfileCompleteness, 0, 1),
		})
	}
	sortScoredRecommendations(candidates)
	aiCandidateCount := minInt(len(candidates), s.config.CandidateLimit)

	fingerprint, err := recommendationFingerprint(profile, candidates)
	if err != nil {
		return nil, err
	}
	cacheKey := fmt.Sprintf("recommendations:student:%d:v2", studentID)
	if !refresh && s.cache != nil {
		if cached, found, cacheErr := s.cache.Get(ctx, cacheKey); cacheErr != nil {
			log.Printf("job recommendation cache read failed: student_id=%d error=%v", studentID, cacheErr)
		} else if found {
			var envelope recommendationCacheEnvelope
			if json.Unmarshal(cached, &envelope) == nil && envelope.Fingerprint == fingerprint {
				result := envelope.Result
				result.CacheHit = true
				refreshRecommendationEngagement(result.Items, candidates)
				result.Items = limitRecommendationItems(result.Items, limit)
				return &result, nil
			}
		}
	}

	aiUsed := false
	if s.ai != nil && aiCandidateCount > 0 {
		aiContext, cancel := context.WithTimeout(ctx, s.config.AITimeout)
		aiResult, aiErr := s.ai.Evaluate(aiContext, buildMatchAIInput(profile, candidates[:aiCandidateCount]))
		cancel()
		if aiErr != nil {
			log.Printf("job recommendation AI fallback: student_id=%d candidates=%d error=%v", studentID, aiCandidateCount, aiErr)
		} else if aiResult != nil {
			aiUsed = applyAIResult(candidates[:aiCandidateCount], aiResult, s.config.Weights)
		}
	}

	sortScoredRecommendations(candidates)
	result := JobRecommendationResult{
		Items:               make([]JobRecommendationItem, 0, len(candidates)),
		AIUsed:              aiUsed,
		ProfileCompleteness: profileMatchCompleteness(profile),
		GeneratedAt:         time.Now().UTC(),
	}
	for _, candidate := range candidates {
		result.Items = append(result.Items, JobRecommendationItem{
			Job: candidate.job, MatchScore: candidate.score, Confidence: candidate.confidence,
			Breakdown: candidate.breakdown, Explanation: buildMatchExplanation(candidate),
		})
	}

	if s.cache != nil {
		envelope, marshalErr := json.Marshal(recommendationCacheEnvelope{Fingerprint: fingerprint, Result: result})
		if marshalErr == nil {
			if cacheErr := s.cache.Set(ctx, cacheKey, envelope, s.config.CacheTTL); cacheErr != nil {
				log.Printf("job recommendation cache write failed: student_id=%d error=%v", studentID, cacheErr)
			}
		}
	}
	result.Items = limitRecommendationItems(result.Items, limit)
	return &result, nil
}

func refreshRecommendationEngagement(items []JobRecommendationItem, candidates []scoredRecommendation) {
	counts := make(map[uint][2]int64, len(candidates))
	for _, candidate := range candidates {
		counts[candidate.job.ID] = [2]int64{candidate.job.ApplicationCount, candidate.job.FavoriteCount}
	}
	for index := range items {
		if current, ok := counts[items[index].Job.ID]; ok {
			items[index].Job.ApplicationCount = current[0]
			items[index].Job.FavoriteCount = current[1]
		}
	}
}

func applyAIResult(candidates []scoredRecommendation, result *MatchAIResult, weights MatchWeights) bool {
	indexes := make(map[uint]int, len(candidates))
	for index := range candidates {
		indexes[candidates[index].job.ID] = index
	}
	applied := false
	seen := make(map[uint]struct{}, len(result.Items))
	for _, item := range result.Items {
		index, ok := indexes[item.JobID]
		if !ok {
			continue
		}
		if _, duplicate := seen[item.JobID]; duplicate {
			continue
		}
		seen[item.JobID] = struct{}{}
		candidate := &candidates[index]
		sanitized := sanitizeAIItem(item, candidate.deterministic)
		candidate.ai = &sanitized
		candidate.breakdown.Skills = clampMatchScore(sanitized.Skills.Score)
		candidate.breakdown.Experience = clampMatchScore(sanitized.Experience.Score)
		candidate.breakdown.Education = clampMatchScore(sanitized.Education.Score)
		if !candidate.deterministic.CategoryExact {
			candidate.breakdown.Category = clampMatchScore(sanitized.CategorySemanticScore)
		}
		candidate.score = CalculateFinalMatchScore(candidate.breakdown, weights)
		candidate.confidence = clampRange(sanitized.Confidence, 0, 1)
		applied = true
	}
	return applied
}

func sanitizeAIItem(item MatchAIItem, deterministic deterministicMatch) MatchAIItem {
	studentSkills := normalizedLookup(deterministic.StudentSkills)
	jobSkills := normalizedLookup(deterministic.JobSkills)
	item.Skills.Matched = allowedSkillValues(item.Skills.Matched, studentSkills, jobSkills)
	item.Skills.Missing = allowedSkillValues(item.Skills.Missing, jobSkills)
	related := make([]MatchAIRelated, 0, len(item.Skills.Related))
	for _, relation := range item.Skills.Related {
		studentSkill, studentOK := studentSkills[normalizeMatchText(relation.StudentSkill)]
		jobSkill, jobOK := jobSkills[normalizeMatchText(relation.JobSkill)]
		if studentOK && jobOK {
			relation.StudentSkill, relation.JobSkill = studentSkill, jobSkill
			related = append(related, relation)
		}
	}
	item.Skills.Related = related
	item.Skills.Score = clampMatchScore(item.Skills.Score)
	item.Experience.Score = clampMatchScore(item.Experience.Score)
	item.Education.Score = clampMatchScore(item.Education.Score)
	item.CategorySemanticScore = clampMatchScore(item.CategorySemanticScore)
	item.Confidence = clampRange(item.Confidence, 0, 1)
	return item
}

func allowedSkillValues(values []string, lookups ...map[string]string) []string {
	result := make([]string, 0, len(values))
	seen := map[string]struct{}{}
	for _, value := range values {
		normalized := normalizeMatchText(value)
		if normalized == "" {
			continue
		}
		allowed := ""
		for _, lookup := range lookups {
			matched, ok := lookup[normalized]
			if !ok {
				allowed = ""
				break
			}
			allowed = matched
		}
		if allowed == "" {
			continue
		}
		if _, exists := seen[normalized]; exists {
			continue
		}
		seen[normalized] = struct{}{}
		result = append(result, allowed)
	}
	return result
}

func normalizedLookup(values []string) map[string]string {
	result := make(map[string]string, len(values))
	for _, value := range values {
		if normalized := normalizeMatchText(value); normalized != "" {
			result[normalized] = value
		}
	}
	return result
}

func buildMatchAIInput(profile *models.StudentProfile, candidates []scoredRecommendation) MatchAIInput {
	input := MatchAIInput{
		Student: MatchAIStudent{Skills: skillNames(profile.Skills), PreferredCategory: profile.PreferredCategory},
		Jobs:    make([]MatchAIJob, 0, len(candidates)),
	}
	for _, experience := range profile.WorkExperiences {
		input.Student.Experiences = append(input.Student.Experiences, MatchAIExperience{
			Position: truncateMatchText(experience.Position, 160), Description: truncateMatchText(experience.Description, 500),
		})
	}
	for _, education := range profile.Educations {
		input.Student.Educations = append(input.Student.Educations, MatchAIEducation{
			Major: truncateMatchText(education.Major, 160), Degree: truncateMatchText(education.Degree, 120), Description: truncateMatchText(education.Description, 400),
		})
	}
	for _, candidate := range candidates {
		input.Jobs = append(input.Jobs, MatchAIJob{
			JobID: candidate.job.ID, Title: truncateMatchText(candidate.job.Title, 220),
			Description: truncateMatchText(candidate.job.Description, 800), Requirements: truncateMatchText(candidate.job.Requirements, 800),
			Skills: candidate.deterministic.JobSkills, Category: inferBackendJobCategory(candidate.job), JobType: inferBackendJobType(candidate.job),
		})
	}
	return input
}

func recommendationFingerprint(profile *models.StudentProfile, candidates []scoredRecommendation) (string, error) {
	type fingerprintJob struct {
		ID           uint      `json:"id"`
		Title        string    `json:"title"`
		Description  string    `json:"description"`
		Requirements string    `json:"requirements"`
		Salary       string    `json:"salary"`
		Location     string    `json:"location"`
		Slots        int       `json:"slots"`
		Skills       []string  `json:"skills"`
		UpdatedAt    time.Time `json:"updated_at"`
	}
	type fingerprintProfile struct {
		Location    string              `json:"location"`
		Category    string              `json:"category"`
		Salary      string              `json:"salary"`
		JobType     string              `json:"job_type"`
		Skills      []string            `json:"skills"`
		Experiences []MatchAIExperience `json:"experiences"`
		Educations  []MatchAIEducation  `json:"educations"`
		UpdatedAt   time.Time           `json:"updated_at"`
	}
	profileInput := buildMatchAIInput(profile, nil).Student
	payload := struct {
		Profile fingerprintProfile `json:"profile"`
		Jobs    []fingerprintJob   `json:"jobs"`
	}{
		Profile: fingerprintProfile{
			Location: profile.PreferredLocation, Category: profile.PreferredCategory, Salary: profile.ExpectedSalary,
			JobType: profile.PreferredJobType, Skills: profileInput.Skills, Experiences: profileInput.Experiences,
			Educations: profileInput.Educations, UpdatedAt: profile.UpdatedAt,
		},
		Jobs: make([]fingerprintJob, 0, len(candidates)),
	}
	for _, candidate := range candidates {
		job := candidate.job
		payload.Jobs = append(payload.Jobs, fingerprintJob{
			ID: job.ID, Title: job.Title, Description: job.Description, Requirements: job.Requirements,
			Salary: job.Salary, Location: job.Location, Slots: job.Slots, Skills: candidate.deterministic.JobSkills, UpdatedAt: job.UpdatedAt,
		})
	}
	encoded, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("marshal recommendation fingerprint: %w", err)
	}
	sum := sha256.Sum256(encoded)
	return hex.EncodeToString(sum[:]), nil
}

func buildMatchExplanation(candidate scoredRecommendation) MatchExplanation {
	strengths := make([]string, 0, 4)
	gaps := make([]string, 0, 3)
	if candidate.breakdown.Location >= 8 {
		strengths = append(strengths, "Địa điểm phù hợp với mong muốn")
	} else if candidate.breakdown.Location <= 5 {
		gaps = append(gaps, "Địa điểm chưa khớp ưu tiên")
	}
	if candidate.breakdown.Salary >= 8 {
		strengths = append(strengths, "Mức lương đáp ứng kỳ vọng")
	} else if candidate.breakdown.Salary <= 5.5 {
		gaps = append(gaps, "Mức lương thấp hơn kỳ vọng")
	}
	if len(candidate.deterministic.ExactMatchedSkills) > 0 {
		strengths = append(strengths, "Khớp kỹ năng: "+strings.Join(candidate.deterministic.ExactMatchedSkills, ", "))
	}
	if candidate.ai != nil {
		if reason := strings.TrimSpace(candidate.ai.Skills.Reason); reason != "" && candidate.breakdown.Skills >= 7 {
			strengths = append(strengths, reason)
		}
		if len(candidate.ai.Skills.Missing) > 0 {
			gaps = append(gaps, "Còn thiếu: "+strings.Join(candidate.ai.Skills.Missing, ", "))
		}
		if candidate.breakdown.Experience >= 7.5 && strings.TrimSpace(candidate.ai.Experience.Reason) != "" {
			strengths = append(strengths, candidate.ai.Experience.Reason)
		} else if candidate.breakdown.Experience <= 5 && strings.TrimSpace(candidate.ai.Experience.Reason) != "" {
			gaps = append(gaps, candidate.ai.Experience.Reason)
		}
	}
	if len(strengths) == 0 {
		strengths = append(strengths, "Phù hợp tổng thể với hồ sơ hiện tại")
	}
	return MatchExplanation{Strengths: uniqueLimitedStrings(strengths, 3), Gaps: uniqueLimitedStrings(gaps, 3)}
}

func sortScoredRecommendations(items []scoredRecommendation) {
	sort.SliceStable(items, func(left int, right int) bool {
		if items[left].score != items[right].score {
			return items[left].score > items[right].score
		}
		if !items[left].job.CreatedAt.Equal(items[right].job.CreatedAt) {
			return items[left].job.CreatedAt.After(items[right].job.CreatedAt)
		}
		return items[left].job.ID < items[right].job.ID
	})
}

func limitRecommendationItems(items []JobRecommendationItem, limit int) []JobRecommendationItem {
	if limit <= 0 || len(items) <= limit {
		return items
	}
	return items[:limit]
}

func truncateMatchText(value string, maxRunes int) string {
	value = strings.TrimSpace(value)
	runes := []rune(value)
	if len(runes) <= maxRunes {
		return value
	}
	return string(runes[:maxRunes])
}

func uniqueLimitedStrings(values []string, limit int) []string {
	result := make([]string, 0, minInt(len(values), limit))
	seen := map[string]struct{}{}
	for _, value := range values {
		value = strings.TrimSpace(value)
		normalized := normalizeMatchText(value)
		if value == "" {
			continue
		}
		if _, exists := seen[normalized]; exists {
			continue
		}
		seen[normalized] = struct{}{}
		result = append(result, value)
		if len(result) == limit {
			break
		}
	}
	return result
}
