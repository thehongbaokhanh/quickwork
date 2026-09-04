package request

type CreateJobRequest struct {
	Title string `json:"title" validate:"required"`

	Description string `json:"description"`

	Requirements string `json:"requirements"`

	Salary string `json:"salary"`

	Location string `json:"location"`

	Slots int `json:"slots"`

	Status string `json:"status"`

	SkillIDs []uint `json:"skill_ids"`
}
