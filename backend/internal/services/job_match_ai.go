package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type JobMatchAI interface {
	Evaluate(ctx context.Context, input MatchAIInput) (*MatchAIResult, error)
}

type MatchAIInput struct {
	Student MatchAIStudent `json:"student"`
	Jobs    []MatchAIJob   `json:"jobs"`
}

type MatchAIStudent struct {
	Skills            []string            `json:"skills"`
	Experiences       []MatchAIExperience `json:"experiences"`
	Educations        []MatchAIEducation  `json:"educations"`
	PreferredCategory string              `json:"preferred_category,omitempty"`
}

type MatchAIExperience struct {
	Position    string `json:"position"`
	Description string `json:"description,omitempty"`
}

type MatchAIEducation struct {
	Major       string `json:"major"`
	Degree      string `json:"degree,omitempty"`
	Description string `json:"description,omitempty"`
}

type MatchAIJob struct {
	JobID        uint     `json:"job_id"`
	Title        string   `json:"title"`
	Description  string   `json:"description,omitempty"`
	Requirements string   `json:"requirements,omitempty"`
	Skills       []string `json:"skills"`
	Category     string   `json:"category"`
	JobType      string   `json:"job_type"`
}

type MatchAIResult struct {
	Items []MatchAIItem `json:"items"`
}

type MatchAIItem struct {
	JobID                  uint             `json:"job_id"`
	Skills                 MatchAISkills    `json:"skills"`
	Experience             MatchAICriterion `json:"experience"`
	Education              MatchAICriterion `json:"education"`
	CategorySemanticScore  float64          `json:"category_semantic_score"`
	CategorySemanticReason string           `json:"category_semantic_reason"`
	Confidence             float64          `json:"confidence"`
}

type MatchAISkills struct {
	Score   float64          `json:"score"`
	Matched []string         `json:"matched"`
	Related []MatchAIRelated `json:"related"`
	Missing []string         `json:"missing"`
	Reason  string           `json:"reason"`
}

type MatchAIRelated struct {
	StudentSkill string `json:"student_skill"`
	JobSkill     string `json:"job_skill"`
	Reason       string `json:"reason"`
}

type MatchAICriterion struct {
	Score  float64 `json:"score"`
	Reason string  `json:"reason"`
}

type OpenAIJobMatchConfig struct {
	APIKey  string
	Model   string
	BaseURL string
	Timeout time.Duration
	Client  *http.Client
}

type OpenAIJobMatchAI struct {
	apiKey  string
	model   string
	baseURL string
	client  *http.Client
}

func NewOpenAIJobMatchAI(cfg OpenAIJobMatchConfig) *OpenAIJobMatchAI {
	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = 12 * time.Second
	}
	client := cfg.Client
	if client == nil {
		client = &http.Client{Timeout: timeout}
	}
	model := strings.TrimSpace(cfg.Model)
	if model == "" {
		model = "gpt-4o-mini"
	}
	baseURL := strings.TrimRight(strings.TrimSpace(cfg.BaseURL), "/")
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}
	return &OpenAIJobMatchAI{
		apiKey: strings.TrimSpace(cfg.APIKey), model: model, baseURL: baseURL, client: client,
	}
}

func (a *OpenAIJobMatchAI) Evaluate(ctx context.Context, input MatchAIInput) (*MatchAIResult, error) {
	if a == nil || a.apiKey == "" {
		return nil, errors.New("OpenAI job matching is not configured")
	}
	if len(input.Jobs) == 0 {
		return &MatchAIResult{}, nil
	}

	inputJSON, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("marshal job matching input: %w", err)
	}

	payload := map[string]any{
		"model": a.model,
		"store": false,
		"input": []map[string]any{
			{
				"role": "system",
				"content": []map[string]string{{
					"type": "input_text",
					"text": "Bạn là bộ đánh giá độ phù hợp nghề nghiệp. Chỉ dùng bằng chứng trong JSON. Không suy diễn kỹ năng chưa có. Điểm nằm trong 0..10, confidence trong 0..1. Trả một item cho đúng từng job_id. Matched/missing chỉ dùng nguyên văn kỹ năng có trong đầu vào; related phải giải thích quan hệ chuyển đổi được. Viết lý do ngắn bằng tiếng Việt.",
				}},
			},
			{
				"role":    "user",
				"content": []map[string]string{{"type": "input_text", "text": string(inputJSON)}},
			},
		},
		"text": map[string]any{
			"format": map[string]any{
				"type":   "json_schema",
				"name":   "quickwork_job_match_batch",
				"strict": true,
				"schema": jobMatchResponseSchema(),
			},
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal OpenAI request: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.baseURL+"/responses", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create OpenAI request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+a.apiKey)
	req.Header.Set("Content-Type", "application/json")

	response, err := a.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call OpenAI responses API: %w", err)
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 2<<20))
	if err != nil {
		return nil, fmt.Errorf("read OpenAI response: %w", err)
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("OpenAI responses API returned status %d", response.StatusCode)
	}

	var envelope struct {
		Output []struct {
			Content []struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"content"`
		} `json:"output"`
	}
	if err := json.Unmarshal(responseBody, &envelope); err != nil {
		return nil, fmt.Errorf("decode OpenAI response: %w", err)
	}
	for _, output := range envelope.Output {
		for _, content := range output.Content {
			if content.Type != "output_text" || strings.TrimSpace(content.Text) == "" {
				continue
			}
			var result MatchAIResult
			if err := json.Unmarshal([]byte(content.Text), &result); err != nil {
				return nil, fmt.Errorf("decode structured job matching output: %w", err)
			}
			return &result, nil
		}
	}
	return nil, errors.New("OpenAI response did not contain structured output text")
}

func jobMatchResponseSchema() map[string]any {
	stringArray := map[string]any{"type": "array", "items": map[string]any{"type": "string"}}
	criterion := map[string]any{
		"type": "object", "additionalProperties": false,
		"properties": map[string]any{
			"score":  map[string]any{"type": "number", "minimum": 0, "maximum": 10},
			"reason": map[string]any{"type": "string"},
		},
		"required": []string{"score", "reason"},
	}
	related := map[string]any{
		"type": "object", "additionalProperties": false,
		"properties": map[string]any{
			"student_skill": map[string]any{"type": "string"},
			"job_skill":     map[string]any{"type": "string"},
			"reason":        map[string]any{"type": "string"},
		},
		"required": []string{"student_skill", "job_skill", "reason"},
	}
	skills := map[string]any{
		"type": "object", "additionalProperties": false,
		"properties": map[string]any{
			"score":   map[string]any{"type": "number", "minimum": 0, "maximum": 10},
			"matched": stringArray,
			"related": map[string]any{"type": "array", "items": related},
			"missing": stringArray,
			"reason":  map[string]any{"type": "string"},
		},
		"required": []string{"score", "matched", "related", "missing", "reason"},
	}
	item := map[string]any{
		"type": "object", "additionalProperties": false,
		"properties": map[string]any{
			"job_id":                   map[string]any{"type": "integer", "minimum": 1},
			"skills":                   skills,
			"experience":               criterion,
			"education":                criterion,
			"category_semantic_score":  map[string]any{"type": "number", "minimum": 0, "maximum": 10},
			"category_semantic_reason": map[string]any{"type": "string"},
			"confidence":               map[string]any{"type": "number", "minimum": 0, "maximum": 1},
		},
		"required": []string{"job_id", "skills", "experience", "education", "category_semantic_score", "category_semantic_reason", "confidence"},
	}
	return map[string]any{
		"type": "object", "additionalProperties": false,
		"properties": map[string]any{"items": map[string]any{"type": "array", "items": item}},
		"required":   []string{"items"},
	}
}
