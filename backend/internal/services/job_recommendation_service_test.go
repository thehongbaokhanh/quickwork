package services

import (
	"context"
	"errors"
	"testing"
	"time"

	"quickwork.local/backend/internal/models"
)

type fakeRecommendationRepository struct {
	profile *models.StudentProfile
	jobs    []models.Job
	err     error
}

func (r *fakeRecommendationRepository) FindStudentMatchProfile(context.Context, uint) (*models.StudentProfile, error) {
	if r.err != nil {
		return nil, r.err
	}
	return r.profile, nil
}

func (r *fakeRecommendationRepository) FindEligibleRecommendationJobs(context.Context) ([]models.Job, error) {
	if r.err != nil {
		return nil, r.err
	}
	return r.jobs, nil
}

type fakeRecommendationCache struct {
	values map[string][]byte
	gets   int
	sets   int
}

func (c *fakeRecommendationCache) Get(_ context.Context, key string) ([]byte, bool, error) {
	c.gets++
	value, found := c.values[key]
	return value, found, nil
}

func (c *fakeRecommendationCache) Set(_ context.Context, key string, value []byte, _ time.Duration) error {
	c.sets++
	if c.values == nil {
		c.values = map[string][]byte{}
	}
	c.values[key] = value
	return nil
}

type fakeJobMatchAI struct {
	result *MatchAIResult
	err    error
	calls  int
	input  MatchAIInput
}

func (a *fakeJobMatchAI) Evaluate(_ context.Context, input MatchAIInput) (*MatchAIResult, error) {
	a.calls++
	a.input = input
	return a.result, a.err
}

func TestJobRecommendationServiceAppliesAIAndSortsDescending(t *testing.T) {
	profile, jobs := recommendationFixture()
	ai := &fakeJobMatchAI{result: &MatchAIResult{Items: []MatchAIItem{
		{JobID: 1, Skills: MatchAISkills{Score: 2, Matched: []string{"Rust"}, Missing: []string{"React"}}, Experience: MatchAICriterion{Score: 2}, Education: MatchAICriterion{Score: 4}, CategorySemanticScore: 2, Confidence: .6},
		{JobID: 2, Skills: MatchAISkills{Score: 10, Matched: []string{"Go", "invented"}, Missing: []string{"invented"}, Reason: "Kỹ năng nền tảng phù hợp"}, Experience: MatchAICriterion{Score: 10, Reason: "Kinh nghiệm liên quan"}, Education: MatchAICriterion{Score: 9}, CategorySemanticScore: 10, Confidence: .9},
	}}}
	service := NewJobRecommendationService(
		&fakeRecommendationRepository{profile: profile, jobs: jobs}, nil, ai,
		JobRecommendationConfig{CandidateLimit: 20, Weights: DefaultMatchWeights},
	)

	result, err := service.Recommend(context.Background(), 99, 20, false)
	if err != nil {
		t.Fatalf("Recommend returned error: %v", err)
	}
	if !result.AIUsed || ai.calls != 1 {
		t.Fatalf("expected one batched AI call, used=%v calls=%d", result.AIUsed, ai.calls)
	}
	if len(result.Items) != 2 || result.Items[0].Job.ID != 2 {
		t.Fatalf("expected AI-enhanced descending order [2,1], got %+v", recommendationIDs(result.Items))
	}
	if strengths := result.Items[0].Explanation.Strengths; len(strengths) == 0 {
		t.Fatal("expected a concise explanation")
	}
	if result.Items[0].Confidence != .9 {
		t.Fatalf("expected AI confidence .9, got %.2f", result.Items[0].Confidence)
	}
}

func TestJobRecommendationServiceFallsBackWhenAIFails(t *testing.T) {
	profile, jobs := recommendationFixture()
	ai := &fakeJobMatchAI{err: errors.New("provider unavailable")}
	service := NewJobRecommendationService(
		&fakeRecommendationRepository{profile: profile, jobs: jobs}, nil, ai,
		JobRecommendationConfig{CandidateLimit: 20, Weights: DefaultMatchWeights},
	)
	result, err := service.Recommend(context.Background(), 99, 20, false)
	if err != nil {
		t.Fatalf("AI failure must not fail recommendation: %v", err)
	}
	if result.AIUsed || len(result.Items) != 2 {
		t.Fatalf("expected deterministic fallback, got used=%v items=%d", result.AIUsed, len(result.Items))
	}
	if result.Items[0].MatchScore < result.Items[1].MatchScore {
		t.Fatal("fallback results are not sorted descending")
	}
}

func TestJobRecommendationServiceUsesFingerprintCacheAndRefreshBypass(t *testing.T) {
	profile, jobs := recommendationFixture()
	cache := &fakeRecommendationCache{values: map[string][]byte{}}
	ai := &fakeJobMatchAI{result: &MatchAIResult{}}
	service := NewJobRecommendationService(
		&fakeRecommendationRepository{profile: profile, jobs: jobs}, cache, ai,
		JobRecommendationConfig{CandidateLimit: 20, CacheTTL: 45 * time.Minute, Weights: DefaultMatchWeights},
	)

	first, err := service.Recommend(context.Background(), 99, 1, false)
	if err != nil || first.CacheHit || ai.calls != 1 || len(first.Items) != 1 {
		t.Fatalf("unexpected first response: err=%v cache=%v calls=%d items=%d", err, first.CacheHit, ai.calls, len(first.Items))
	}
	second, err := service.Recommend(context.Background(), 99, 2, false)
	if err != nil || !second.CacheHit || ai.calls != 1 || len(second.Items) != 2 {
		t.Fatalf("expected cache hit without another AI call: err=%v cache=%v calls=%d items=%d", err, second.CacheHit, ai.calls, len(second.Items))
	}
	jobs[0].ApplicationCount = 8
	jobs[0].FavoriteCount = 5
	engagementRefresh, err := service.Recommend(context.Background(), 99, 2, false)
	if err != nil || !engagementRefresh.CacheHit || ai.calls != 1 {
		t.Fatalf("engagement refresh must keep cached AI result: err=%v cache=%v calls=%d", err, engagementRefresh.CacheHit, ai.calls)
	}
	var refreshedJob *models.Job
	for index := range engagementRefresh.Items {
		if engagementRefresh.Items[index].Job.ID == jobs[0].ID {
			refreshedJob = &engagementRefresh.Items[index].Job
			break
		}
	}
	if refreshedJob == nil || refreshedJob.ApplicationCount != 8 || refreshedJob.FavoriteCount != 5 {
		t.Fatalf("expected live engagement counts on cache hit, got %+v", refreshedJob)
	}
	_, err = service.Recommend(context.Background(), 99, 2, true)
	if err != nil || ai.calls != 2 {
		t.Fatalf("refresh must bypass cache: err=%v calls=%d", err, ai.calls)
	}

	profile.PreferredLocation = "Đà Nẵng"
	_, err = service.Recommend(context.Background(), 99, 2, false)
	if err != nil || ai.calls != 3 {
		t.Fatalf("profile fingerprint change must invalidate cache: err=%v calls=%d", err, ai.calls)
	}
}

func TestJobRecommendationServiceReturnsAllResultsButLimitsAIToTopTwenty(t *testing.T) {
	profile, fixtureJobs := recommendationFixture()
	jobs := make([]models.Job, 0, 25)
	for index := 0; index < 25; index++ {
		job := fixtureJobs[index%len(fixtureJobs)]
		job.ID = uint(index + 1)
		job.CreatedAt = job.CreatedAt.Add(-time.Duration(index) * time.Minute)
		jobs = append(jobs, job)
	}
	ai := &fakeJobMatchAI{result: &MatchAIResult{}}
	service := NewJobRecommendationService(
		&fakeRecommendationRepository{profile: profile, jobs: jobs}, nil, ai,
		JobRecommendationConfig{CandidateLimit: 20, Weights: DefaultMatchWeights},
	)

	result, err := service.Recommend(context.Background(), 99, 100, false)
	if err != nil {
		t.Fatalf("Recommend returned error: %v", err)
	}
	if len(result.Items) != 25 {
		t.Fatalf("expected all 25 deterministic results, got %d", len(result.Items))
	}
	if ai.calls != 1 || len(ai.input.Jobs) != 20 {
		t.Fatalf("expected one AI call with top 20 only, calls=%d jobs=%d", ai.calls, len(ai.input.Jobs))
	}
}

func recommendationFixture() (*models.StudentProfile, []models.Job) {
	category := models.Category{Name: "Công nghệ"}
	now := time.Now().UTC()
	profile := &models.StudentProfile{
		UserID: 99, PreferredLocation: "Hà Nội", PreferredCategory: "Công nghệ", ExpectedSalary: "20 - 30 triệu", PreferredJobType: "Toàn thời gian",
		Skills: []models.Skill{{Name: "Go", Category: &category}}, UpdatedAt: now,
		WorkExperiences: []models.StudentWorkExperience{{Position: "Backend Developer", Description: "Xây API Go"}},
		Educations:      []models.StudentEducation{{Major: "Công nghệ thông tin", Degree: "Đại học"}},
	}
	jobs := []models.Job{
		{ID: 1, Title: "Frontend Developer", Description: "React toàn thời gian", Salary: "15 - 20 triệu", Location: "TP. Hồ Chí Minh", Slots: 1, Status: models.JobApproved, Skills: []models.Skill{{Name: "React", Category: &category}}, CreatedAt: now, UpdatedAt: now},
		{ID: 2, Title: "Backend Developer", Description: "Go toàn thời gian", Salary: "20 - 30 triệu", Location: "Hà Nội", Slots: 1, Status: models.JobApproved, Skills: []models.Skill{{Name: "Go", Category: &category}}, CreatedAt: now.Add(-time.Hour), UpdatedAt: now},
	}
	return profile, jobs
}

func recommendationIDs(items []JobRecommendationItem) []uint {
	result := make([]uint, 0, len(items))
	for _, item := range items {
		result = append(result, item.Job.ID)
	}
	return result
}
