package services

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestCareerGuidanceServiceReturnsUnavailableWithoutProvider(t *testing.T) {
	service := NewCareerGuidanceService(nil, time.Second)
	_, err := service.Generate(context.Background(), CareerGuidanceInput{Goal: "Tìm việc Backend", ArticleTitle: "Lộ trình Backend"})
	if !errors.Is(err, ErrCareerGuidanceUnavailable) {
		t.Fatalf("expected ErrCareerGuidanceUnavailable, got %v", err)
	}
}

func TestOpenAICareerGuidanceGeneratesStructuredResult(t *testing.T) {
	structuredOutput, err := json.Marshal(CareerGuidanceResult{
		Direction:      "Tập trung hoàn thiện một dự án API có thể trình bày trong phỏng vấn.",
		NextSteps:      []string{"Chọn phạm vi dự án", "Viết API", "Bổ sung kiểm thử"},
		PrioritySkills: []string{"Go", "SQL"},
		RelatedTopics:  []string{"CV Backend", "Phỏng vấn Backend"},
	})
	if err != nil {
		t.Fatal(err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/responses" {
			t.Fatalf("unexpected request path %s", request.URL.Path)
		}
		if request.Header.Get("Authorization") != "Bearer test-key" {
			t.Fatalf("missing bearer token")
		}
		var payload map[string]any
		if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		if store, ok := payload["store"].(bool); !ok || store {
			t.Fatalf("expected store=false, got %#v", payload["store"])
		}
		writer.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(writer).Encode(map[string]any{
			"output": []map[string]any{{
				"content": []map[string]any{{"type": "output_text", "text": string(structuredOutput)}},
			}},
		})
	}))
	defer server.Close()

	provider := NewOpenAICareerGuidanceAI(OpenAICareerGuidanceConfig{
		APIKey:  "test-key",
		Model:   "test-model",
		BaseURL: server.URL,
		Client:  server.Client(),
	})
	service := NewCareerGuidanceService(provider, time.Second)
	result, err := service.Generate(context.Background(), CareerGuidanceInput{
		Goal:              "Ứng tuyển Backend Intern trong hai tháng",
		ArticleTitle:      "Lộ trình học Backend",
		ArticleCategory:   "Kỹ năng nghề nghiệp",
		ArticleExcerpt:    "Học qua dự án thực tế.",
		ArticleHighlights: []string{"Học Go", "Luyện SQL"},
	})
	if err != nil {
		t.Fatalf("Generate returned error: %v", err)
	}
	if !result.AIUsed || result.Direction == "" || len(result.NextSteps) != 3 {
		t.Fatalf("unexpected result: %#v", result)
	}
	if result.Disclaimer == "" {
		t.Fatal("expected server-owned disclaimer")
	}
}
