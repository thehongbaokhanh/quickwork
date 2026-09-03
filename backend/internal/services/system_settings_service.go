package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net"
	"net/mail"
	"regexp"
	"strings"
	"sync"
	"time"
	_ "time/tzdata"
	"unicode/utf8"

	"gorm.io/gorm"

	"quickwork.local/backend/internal/models"
)

const (
	// SystemSettingsCacheTTL bounds how long one process can serve a cached
	// settings snapshot before checking the shared database again.
	SystemSettingsCacheTTL = time.Minute

	maxSystemNameLength       = 100
	maxAdminDisplayNameLength = 100
	maxSupportEmailLength     = 254
	maxTimezoneLength         = 100
	maxIPAllowlistLength      = 4096
	maxIPAllowlistEntries     = 100
	maxDraftLimit             = 1000
	maxLoginAttempts          = 20
)

var (
	// ErrSystemSettingsConflict indicates that the caller attempted to update
	// an obsolete version of the singleton settings document.
	ErrSystemSettingsConflict = errors.New("system settings version conflict")

	simpleEmailPattern = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
)

// PlatformSettings contains shared presentation and locale settings.
type PlatformSettings struct {
	SystemName       string `json:"systemName"`
	AdminDisplayName string `json:"adminDisplayName"`
	SupportEmail     string `json:"supportEmail"`
	Timezone         string `json:"timezone"`
	Language         string `json:"language"`
}

// RegistrationSettings contains the admin registration preferences.
type RegistrationSettings struct {
	Student     bool `json:"student"`
	Enterprise  bool `json:"enterprise"`
	VerifyEmail bool `json:"verifyEmail"`
	RequireKYB  bool `json:"requireKyb"`
}

// ModerationSettings contains the shared moderation preferences.
type ModerationSettings struct {
	Mode         string `json:"mode"`
	PendingHours int    `json:"pendingHours"`
	DraftLimit   int    `json:"draftLimit"`
	HideRejected bool   `json:"hideRejected"`
}

// NotificationSettings contains notification-channel preferences.
type NotificationSettings struct {
	CriticalEmail bool `json:"criticalEmail"`
	InApp         bool `json:"inApp"`
	DailyDigest   bool `json:"dailyDigest"`
	KYBAlert      bool `json:"kybAlert"`
	ReportedJob   bool `json:"reportedJob"`
}

// SecuritySettings contains the shared security presentation preferences.
type SecuritySettings struct {
	StrongPassword bool   `json:"strongPassword"`
	TwoFactorAdmin bool   `json:"twoFactorAdmin"`
	SessionMinutes int    `json:"sessionMinutes"`
	LoginAttempts  int    `json:"loginAttempts"`
	IPAllowlist    string `json:"ipAllowlist"`
}

// BackupSettings contains backup preferences. The current runtime has no
// backup provider, so Daily is always normalized to false.
type BackupSettings struct {
	Daily bool `json:"daily"`
}

// SystemSettings is the aggregate JSON document shared by every admin.
// JSON tags deliberately match the current frontend settings state.
type SystemSettings struct {
	Platform      PlatformSettings     `json:"platform"`
	Registration  RegistrationSettings `json:"registration"`
	Moderation    ModerationSettings   `json:"moderation"`
	Notifications NotificationSettings `json:"notifications"`
	Security      SecuritySettings     `json:"security"`
	Backup        BackupSettings       `json:"backup"`
}

// SystemSettingCapability describes whether a settings field is effective in
// the current runtime, merely stored, unavailable, or fixed to a safe value.
type SystemSettingCapability string

const (
	SystemSettingCapabilityActive      SystemSettingCapability = "active"
	SystemSettingCapabilityStoredOnly  SystemSettingCapability = "stored_only"
	SystemSettingCapabilityUnavailable SystemSettingCapability = "unavailable"
	SystemSettingCapabilityFixed       SystemSettingCapability = "fixed"
)

type PlatformSettingsCapabilities struct {
	SystemName       SystemSettingCapability `json:"systemName"`
	AdminDisplayName SystemSettingCapability `json:"adminDisplayName"`
	SupportEmail     SystemSettingCapability `json:"supportEmail"`
	Timezone         SystemSettingCapability `json:"timezone"`
	Language         SystemSettingCapability `json:"language"`
}

type RegistrationSettingsCapabilities struct {
	Student     SystemSettingCapability `json:"student"`
	Enterprise  SystemSettingCapability `json:"enterprise"`
	VerifyEmail SystemSettingCapability `json:"verifyEmail"`
	RequireKYB  SystemSettingCapability `json:"requireKyb"`
}

type ModerationSettingsCapabilities struct {
	Mode         SystemSettingCapability `json:"mode"`
	PendingHours SystemSettingCapability `json:"pendingHours"`
	DraftLimit   SystemSettingCapability `json:"draftLimit"`
	HideRejected SystemSettingCapability `json:"hideRejected"`
}

type NotificationSettingsCapabilities struct {
	CriticalEmail SystemSettingCapability `json:"criticalEmail"`
	InApp         SystemSettingCapability `json:"inApp"`
	DailyDigest   SystemSettingCapability `json:"dailyDigest"`
	KYBAlert      SystemSettingCapability `json:"kybAlert"`
	ReportedJob   SystemSettingCapability `json:"reportedJob"`
}

type SecuritySettingsCapabilities struct {
	StrongPassword SystemSettingCapability `json:"strongPassword"`
	TwoFactorAdmin SystemSettingCapability `json:"twoFactorAdmin"`
	SessionMinutes SystemSettingCapability `json:"sessionMinutes"`
	LoginAttempts  SystemSettingCapability `json:"loginAttempts"`
	IPAllowlist    SystemSettingCapability `json:"ipAllowlist"`
}

type BackupSettingsCapabilities struct {
	Daily SystemSettingCapability `json:"daily"`
}

// SystemSettingsCapabilities mirrors SystemSettings so the frontend can
// disable or label each field without hardcoding backend provider support.
type SystemSettingsCapabilities struct {
	Platform      PlatformSettingsCapabilities     `json:"platform"`
	Registration  RegistrationSettingsCapabilities `json:"registration"`
	Moderation    ModerationSettingsCapabilities   `json:"moderation"`
	Notifications NotificationSettingsCapabilities `json:"notifications"`
	Security      SecuritySettingsCapabilities     `json:"security"`
	Backup        BackupSettingsCapabilities       `json:"backup"`
}

// SystemSettingsFieldErrors maps camelCase field paths to user-facing
// validation messages.
type SystemSettingsFieldErrors map[string]string

// SystemSettingsValidationError reports every invalid settings field in one
// pass so the admin form can render all errors without another request.
type SystemSettingsValidationError struct {
	Fields SystemSettingsFieldErrors `json:"fields"`
}

func (e *SystemSettingsValidationError) Error() string {
	return "system settings validation failed"
}

// SystemSettingsSnapshot is an immutable value snapshot returned by the
// service. Version zero and nil metadata mean no persisted singleton row yet.
type SystemSettingsSnapshot struct {
	Settings     SystemSettings             `json:"settings"`
	Capabilities SystemSettingsCapabilities `json:"capabilities"`
	Version      uint64                     `json:"version"`
	Configured   bool                       `json:"configured"`
	UpdatedBy    *uint                      `json:"updatedBy"`
	UpdatedAt    *time.Time                 `json:"updatedAt"`
}

// SystemSettingsConflictError carries the current database snapshot so an
// HTTP handler can return a 409 without forcing the frontend to refetch.
type SystemSettingsConflictError struct {
	Current SystemSettingsSnapshot `json:"current"`
}

func (e *SystemSettingsConflictError) Error() string {
	return ErrSystemSettingsConflict.Error()
}

func (e *SystemSettingsConflictError) Unwrap() error {
	return ErrSystemSettingsConflict
}

// DefaultSystemSettings returns a fresh copy of the canonical settings.
func DefaultSystemSettings() SystemSettings {
	return SystemSettings{
		Platform: PlatformSettings{
			SystemName:       "QuickWork Platform",
			AdminDisplayName: "QuickWork Admin Center",
			SupportEmail:     "support@quickwork.vn",
			Timezone:         "Asia/Ho_Chi_Minh",
			Language:         "vi",
		},
		Registration: RegistrationSettings{
			Student:     true,
			Enterprise:  true,
			VerifyEmail: false,
			RequireKYB:  true,
		},
		Moderation: ModerationSettings{
			Mode:         "manual",
			PendingHours: 72,
			DraftLimit:   20,
			HideRejected: true,
		},
		Notifications: NotificationSettings{
			CriticalEmail: false,
			InApp:         true,
			DailyDigest:   false,
			KYBAlert:      true,
			ReportedJob:   false,
		},
		Security: SecuritySettings{
			StrongPassword: true,
			TwoFactorAdmin: false,
			SessionMinutes: 30,
			LoginAttempts:  5,
			IPAllowlist:    "",
		},
		Backup: BackupSettings{Daily: false},
	}
}

// DefaultSystemSettingsCapabilities returns provider support for every field.
func DefaultSystemSettingsCapabilities() SystemSettingsCapabilities {
	active := SystemSettingCapabilityActive
	storedOnly := SystemSettingCapabilityStoredOnly
	return SystemSettingsCapabilities{
		Platform: PlatformSettingsCapabilities{
			SystemName:       active,
			AdminDisplayName: active,
			SupportEmail:     active,
			Timezone:         storedOnly,
			Language:         storedOnly,
		},
		Registration: RegistrationSettingsCapabilities{
			Student:     active,
			Enterprise:  active,
			VerifyEmail: SystemSettingCapabilityUnavailable,
			RequireKYB:  active,
		},
		Moderation: ModerationSettingsCapabilities{
			Mode:         active,
			PendingHours: active,
			DraftLimit:   active,
			HideRejected: SystemSettingCapabilityFixed,
		},
		Notifications: NotificationSettingsCapabilities{
			CriticalEmail: SystemSettingCapabilityUnavailable,
			InApp:         active,
			DailyDigest:   SystemSettingCapabilityUnavailable,
			KYBAlert:      active,
			ReportedJob:   SystemSettingCapabilityUnavailable,
		},
		Security: SecuritySettingsCapabilities{
			StrongPassword: active,
			TwoFactorAdmin: SystemSettingCapabilityUnavailable,
			SessionMinutes: active,
			LoginAttempts:  active,
			IPAllowlist:    active,
		},
		Backup: BackupSettingsCapabilities{Daily: SystemSettingCapabilityUnavailable},
	}
}

type systemSettingsClock func() time.Time

// SystemSettingsService owns validation, optimistic persistence, and the
// bounded process-local cache for shared settings.
type SystemSettingsService struct {
	db       *gorm.DB
	cacheTTL time.Duration
	now      systemSettingsClock

	mu             sync.Mutex
	cached         *SystemSettingsSnapshot
	cacheExpiresAt time.Time
}

// NewSystemSettingsService creates a service with the required one-minute
// runtime cache.
func NewSystemSettingsService(db *gorm.DB) *SystemSettingsService {
	return newSystemSettingsService(db, SystemSettingsCacheTTL, time.Now)
}

func newSystemSettingsService(db *gorm.DB, cacheTTL time.Duration, now systemSettingsClock) *SystemSettingsService {
	if cacheTTL <= 0 {
		cacheTTL = SystemSettingsCacheTTL
	}
	if now == nil {
		now = time.Now
	}
	return &SystemSettingsService{db: db, cacheTTL: cacheTTL, now: now}
}

// Current returns the cached snapshot while it is fresh, otherwise it reloads
// the singleton from the shared database.
func (s *SystemSettingsService) Current(ctx context.Context) (SystemSettingsSnapshot, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := s.now().UTC()
	if s.cached != nil && now.Before(s.cacheExpiresAt) {
		return cloneSystemSettingsSnapshot(*s.cached), nil
	}

	snapshot, err := s.load(ctx)
	if err != nil {
		return SystemSettingsSnapshot{}, err
	}
	s.storeCacheLocked(snapshot, now)
	return cloneSystemSettingsSnapshot(snapshot), nil
}

// ForceReload bypasses the cache and replaces it with the latest database
// snapshot. A load failure leaves the last valid cached snapshot untouched.
func (s *SystemSettingsService) ForceReload(ctx context.Context) (SystemSettingsSnapshot, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	snapshot, err := s.load(ctx)
	if err != nil {
		return SystemSettingsSnapshot{}, err
	}
	s.storeCacheLocked(snapshot, s.now().UTC())
	return cloneSystemSettingsSnapshot(snapshot), nil
}

// Update normalizes and validates a complete settings aggregate, then writes
// it only when expectedVersion still matches the singleton row. An initial
// write uses expectedVersion zero and creates version one.
func (s *SystemSettingsService) Update(
	ctx context.Context,
	settings SystemSettings,
	expectedVersion uint64,
	updatedBy uint,
) (SystemSettingsSnapshot, error) {
	normalized, err := ValidateAndNormalizeSystemSettings(settings)
	if err != nil {
		return SystemSettingsSnapshot{}, err
	}
	if updatedBy == 0 {
		return SystemSettingsSnapshot{}, &SystemSettingsValidationError{
			Fields: SystemSettingsFieldErrors{"updatedBy": "Người cập nhật không hợp lệ."},
		}
	}
	if expectedVersion == math.MaxUint64 {
		return s.versionConflict(ctx)
	}
	if s.db == nil {
		return SystemSettingsSnapshot{}, errors.New("system settings database is nil")
	}

	payload, err := json.Marshal(normalized)
	if err != nil {
		return SystemSettingsSnapshot{}, fmt.Errorf("encode system settings: %w", err)
	}

	now := s.now().UTC()
	nextVersion := expectedVersion + 1
	if expectedVersion == 0 {
		row := models.SystemSetting{
			ID:           models.SystemSettingSingletonID,
			SettingsJSON: string(payload),
			Version:      nextVersion,
			UpdatedBy:    updatedBy,
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if err := s.db.WithContext(ctx).Create(&row).Error; err != nil {
			var count int64
			countErr := s.db.WithContext(ctx).
				Model(&models.SystemSetting{}).
				Where("id = ?", models.SystemSettingSingletonID).
				Count(&count).Error
			if countErr == nil && count > 0 {
				return s.versionConflict(ctx)
			}
			return SystemSettingsSnapshot{}, fmt.Errorf("create system settings: %w", err)
		}
	} else {
		result := s.db.WithContext(ctx).
			Model(&models.SystemSetting{}).
			Where("id = ? AND version = ?", models.SystemSettingSingletonID, expectedVersion).
			Updates(map[string]any{
				"settings_json": string(payload),
				"version":       nextVersion,
				"updated_by":    updatedBy,
				"updated_at":    now,
			})
		if result.Error != nil {
			return SystemSettingsSnapshot{}, fmt.Errorf("update system settings: %w", result.Error)
		}
		if result.RowsAffected != 1 {
			return s.versionConflict(ctx)
		}
	}

	updatedByCopy := updatedBy
	updatedAtCopy := now
	snapshot := SystemSettingsSnapshot{
		Settings:     normalized,
		Capabilities: DefaultSystemSettingsCapabilities(),
		Version:      nextVersion,
		Configured:   true,
		UpdatedBy:    &updatedByCopy,
		UpdatedAt:    &updatedAtCopy,
	}

	s.mu.Lock()
	s.storeCacheLocked(snapshot, now)
	s.mu.Unlock()

	return cloneSystemSettingsSnapshot(snapshot), nil
}

func (s *SystemSettingsService) load(ctx context.Context) (SystemSettingsSnapshot, error) {
	if s.db == nil {
		return SystemSettingsSnapshot{}, errors.New("system settings database is nil")
	}

	var row models.SystemSetting
	result := s.db.WithContext(ctx).
		Where("id = ?", models.SystemSettingSingletonID).
		Limit(1).
		Find(&row)
	if result.Error != nil {
		return SystemSettingsSnapshot{}, fmt.Errorf("load system settings: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return SystemSettingsSnapshot{
			Settings:     DefaultSystemSettings(),
			Capabilities: DefaultSystemSettingsCapabilities(),
			Version:      0,
			Configured:   false,
		}, nil
	}
	if row.Version == 0 {
		return SystemSettingsSnapshot{}, errors.New("stored system settings version must be greater than zero")
	}

	settings, err := decodeStoredSystemSettings(row.SettingsJSON)
	if err != nil {
		return SystemSettingsSnapshot{}, fmt.Errorf("decode stored system settings: %w", err)
	}

	updatedBy := row.UpdatedBy
	updatedAt := row.UpdatedAt.UTC()
	return SystemSettingsSnapshot{
		Settings:     settings,
		Capabilities: DefaultSystemSettingsCapabilities(),
		Version:      row.Version,
		Configured:   true,
		UpdatedBy:    &updatedBy,
		UpdatedAt:    &updatedAt,
	}, nil
}

func (s *SystemSettingsService) versionConflict(ctx context.Context) (SystemSettingsSnapshot, error) {
	current, err := s.ForceReload(ctx)
	if err != nil {
		return SystemSettingsSnapshot{}, fmt.Errorf("%w: reload current settings: %v", ErrSystemSettingsConflict, err)
	}
	return current, &SystemSettingsConflictError{Current: cloneSystemSettingsSnapshot(current)}
}

func (s *SystemSettingsService) storeCacheLocked(snapshot SystemSettingsSnapshot, loadedAt time.Time) {
	copy := cloneSystemSettingsSnapshot(snapshot)
	s.cached = &copy
	s.cacheExpiresAt = loadedAt.Add(s.cacheTTL)
}

func cloneSystemSettingsSnapshot(snapshot SystemSettingsSnapshot) SystemSettingsSnapshot {
	copy := snapshot
	if snapshot.UpdatedBy != nil {
		value := *snapshot.UpdatedBy
		copy.UpdatedBy = &value
	}
	if snapshot.UpdatedAt != nil {
		value := *snapshot.UpdatedAt
		copy.UpdatedAt = &value
	}
	return copy
}

func decodeStoredSystemSettings(payload string) (SystemSettings, error) {
	settings := DefaultSystemSettings()
	decoder := json.NewDecoder(strings.NewReader(payload))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&settings); err != nil {
		return SystemSettings{}, err
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		if err == nil {
			err = errors.New("multiple JSON values")
		}
		return SystemSettings{}, err
	}
	return ValidateAndNormalizeSystemSettings(settings)
}

// ValidateAndNormalizeSystemSettings canonicalizes user input, forces fields
// without a runtime provider to safe values, and returns all validation errors.
func ValidateAndNormalizeSystemSettings(input SystemSettings) (SystemSettings, error) {
	settings := input
	settings.Platform.SystemName = normalizeDisplayText(settings.Platform.SystemName)
	settings.Platform.AdminDisplayName = normalizeDisplayText(settings.Platform.AdminDisplayName)
	settings.Platform.SupportEmail = strings.ToLower(strings.TrimSpace(settings.Platform.SupportEmail))
	settings.Platform.Timezone = strings.TrimSpace(settings.Platform.Timezone)
	settings.Platform.Language = strings.ToLower(strings.TrimSpace(settings.Platform.Language))
	settings.Moderation.Mode = strings.ToLower(strings.TrimSpace(settings.Moderation.Mode))

	// These controls have no active backend provider. Persisting a true value
	// would misrepresent runtime behavior, so they are always forced safe.
	settings.Registration.VerifyEmail = false
	settings.Moderation.HideRejected = true
	settings.Notifications.CriticalEmail = false
	settings.Notifications.DailyDigest = false
	settings.Notifications.ReportedJob = false
	settings.Security.TwoFactorAdmin = false
	settings.Backup.Daily = false

	fieldErrors := SystemSettingsFieldErrors{}
	validateRequiredText(fieldErrors, "platform.systemName", settings.Platform.SystemName, maxSystemNameLength)
	validateRequiredText(fieldErrors, "platform.adminDisplayName", settings.Platform.AdminDisplayName, maxAdminDisplayNameLength)

	if !validSupportEmail(settings.Platform.SupportEmail) {
		fieldErrors["platform.supportEmail"] = "Email hỗ trợ không hợp lệ."
	}
	if utf8.RuneCountInString(settings.Platform.Timezone) > maxTimezoneLength || !validIANATimezone(settings.Platform.Timezone) {
		fieldErrors["platform.timezone"] = "Múi giờ IANA không hợp lệ."
	}
	if settings.Platform.Language != "vi" && settings.Platform.Language != "en" {
		fieldErrors["platform.language"] = "Ngôn ngữ phải là vi hoặc en."
	}
	if settings.Moderation.Mode != "manual" && settings.Moderation.Mode != "automatic" {
		fieldErrors["moderation.mode"] = "Chế độ kiểm duyệt phải là manual hoặc automatic."
	}
	if !oneOfInt(settings.Moderation.PendingHours, 24, 48, 72) {
		fieldErrors["moderation.pendingHours"] = "Thời gian chờ phải là 24, 48 hoặc 72 giờ."
	}
	if settings.Moderation.DraftLimit < 1 || settings.Moderation.DraftLimit > maxDraftLimit {
		fieldErrors["moderation.draftLimit"] = "Giới hạn bản nháp phải từ 1 đến 1000."
	}
	if !oneOfInt(settings.Security.SessionMinutes, 15, 30, 60) {
		fieldErrors["security.sessionMinutes"] = "Thời lượng phiên phải là 15, 30 hoặc 60 phút."
	}
	if settings.Security.LoginAttempts < 1 || settings.Security.LoginAttempts > maxLoginAttempts {
		fieldErrors["security.loginAttempts"] = "Số lần đăng nhập phải từ 1 đến 20."
	}

	if utf8.RuneCountInString(settings.Security.IPAllowlist) > maxIPAllowlistLength {
		fieldErrors["security.ipAllowlist"] = "Danh sách IP vượt quá giới hạn cho phép."
	} else {
		normalizedAllowlist, err := normalizeIPAllowlist(settings.Security.IPAllowlist)
		if err != nil {
			fieldErrors["security.ipAllowlist"] = "Danh sách chỉ được chứa địa chỉ IP hoặc CIDR hợp lệ."
		} else {
			settings.Security.IPAllowlist = normalizedAllowlist
		}
	}

	if len(fieldErrors) > 0 {
		return SystemSettings{}, &SystemSettingsValidationError{Fields: fieldErrors}
	}
	return settings, nil
}

func normalizeDisplayText(value string) string {
	return strings.Join(strings.Fields(value), " ")
}

func validateRequiredText(fieldErrors SystemSettingsFieldErrors, field string, value string, maxLength int) {
	length := utf8.RuneCountInString(value)
	if length == 0 {
		fieldErrors[field] = "Trường này là bắt buộc."
		return
	}
	if length > maxLength {
		fieldErrors[field] = fmt.Sprintf("Trường này không được vượt quá %d ký tự.", maxLength)
	}
}

func validSupportEmail(value string) bool {
	if value == "" || utf8.RuneCountInString(value) > maxSupportEmailLength || !simpleEmailPattern.MatchString(value) {
		return false
	}
	address, err := mail.ParseAddress(value)
	return err == nil && address.Address == value
}

func validIANATimezone(value string) bool {
	if value == "" {
		return false
	}
	if value != "UTC" && !strings.Contains(value, "/") {
		return false
	}
	_, err := time.LoadLocation(value)
	return err == nil
}

func oneOfInt(value int, options ...int) bool {
	for _, option := range options {
		if value == option {
			return true
		}
	}
	return false
}

func normalizeIPAllowlist(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", nil
	}

	parts := strings.Split(value, ",")
	if len(parts) > maxIPAllowlistEntries {
		return "", errors.New("too many IP allowlist entries")
	}

	seen := make(map[string]struct{}, len(parts))
	normalized := make([]string, 0, len(parts))
	for _, part := range parts {
		entry := strings.TrimSpace(part)
		if entry == "" {
			continue
		}

		canonical := ""
		if ip := net.ParseIP(entry); ip != nil {
			canonical = ip.String()
		} else {
			_, network, err := net.ParseCIDR(entry)
			if err != nil {
				return "", err
			}
			canonical = network.String()
		}

		if _, exists := seen[canonical]; exists {
			continue
		}
		seen[canonical] = struct{}{}
		normalized = append(normalized, canonical)
	}

	return strings.Join(normalized, ", "), nil
}

// MatchIPAllowlist reports whether candidateIP is allowed by a comma-separated
// IP/CIDR allowlist. A blank allowlist is unrestricted; malformed input or an
// invalid candidate fails closed.
func MatchIPAllowlist(allowlist string, candidateIP string) bool {
	candidate := parseCandidateIP(candidateIP)
	if candidate == nil {
		return false
	}

	normalized, err := normalizeIPAllowlist(allowlist)
	if err != nil {
		return false
	}
	if normalized == "" {
		return true
	}

	for _, entry := range strings.Split(normalized, ", ") {
		if ip := net.ParseIP(entry); ip != nil {
			if ip.Equal(candidate) {
				return true
			}
			continue
		}
		_, network, err := net.ParseCIDR(entry)
		if err == nil && network.Contains(candidate) {
			return true
		}
	}
	return false
}

func parseCandidateIP(value string) net.IP {
	value = strings.TrimSpace(value)
	if ip := net.ParseIP(value); ip != nil {
		return ip
	}
	if host, _, err := net.SplitHostPort(value); err == nil {
		if zoneIndex := strings.LastIndex(host, "%"); zoneIndex >= 0 {
			host = host[:zoneIndex]
		}
		return net.ParseIP(host)
	}
	return nil
}
