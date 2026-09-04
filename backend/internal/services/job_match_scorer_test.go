package services

import (
	"math"
	"testing"

	"quickwork.local/backend/internal/models"
)

func TestScoreDeterministicMatchUsesRequiredWeightsAndNeutralMissingData(t *testing.T) {
	category := models.Category{Name: "Công nghệ"}
	profile := &models.StudentProfile{
		PreferredLocation: "Thành phố Hà Nội, Phường Cầu Giấy",
		PreferredCategory: "Công nghệ",
		ExpectedSalary:    "20 - 30 triệu",
		PreferredJobType:  "Toàn thời gian",
		Skills:            []models.Skill{{Name: "Go", Category: &category}},
	}
	job := models.Job{
		Title: "Go Backend Developer", Salary: "25 - 35 triệu", Location: "Phường Cầu Giấy, Thành phố Hà Nội",
		Description: "Vị trí toàn thời gian", Skills: []models.Skill{{Name: "Go", Category: &category}},
	}

	match := scoreDeterministicMatch(profile, job)
	if match.Breakdown.Location != 10 {
		t.Fatalf("expected exact hierarchical location score 10, got %.1f", match.Breakdown.Location)
	}
	if !match.CategoryExact || match.Breakdown.Category != 10 {
		t.Fatalf("expected exact category score 10, got %.1f", match.Breakdown.Category)
	}
	if match.Breakdown.Skills != 10 {
		t.Fatalf("expected skill score 10, got %.1f", match.Breakdown.Skills)
	}
	if scoreSalary("", "20 - 30 triệu") != NeutralMatchScore {
		t.Fatal("missing profile salary must stay neutral")
	}
	if scoreJobType("", "Toàn thời gian") != NeutralMatchScore {
		t.Fatal("missing job type preference must stay neutral")
	}

	breakdown := MatchBreakdown{Location: 10, Category: 9, Salary: 8, JobType: 7, Skills: 6, Experience: 5, Education: 4}
	want := 10*.25 + 9*.18 + 8*.12 + 7*.10 + 6*.20 + 5*.10 + 4*.05
	if got := CalculateFinalMatchScore(breakdown, DefaultMatchWeights); got != 7.7 || math.Abs(got-want) > 0.05 {
		t.Fatalf("expected centralized weighted score %.1f, got %.1f", want, got)
	}
}

func TestParseSalaryRangeSupportsFormattedVND(t *testing.T) {
	rangeValue := parseSalaryRange("20,000,000 - 30,000,000 VND")
	if !rangeValue.Known || rangeValue.Min != 20 || rangeValue.Max != 30 {
		t.Fatalf("expected 20-30 million range, got %+v", rangeValue)
	}
}
