package request

type UpdateJobRequest struct {
	Title string `json:"title"`

	Description string `json:"description"`

	Requirements string `json:"requirements"`

	Salary string `json:"salary"`

	Location string `json:"location"`

	Slots int `json:"slots"`

	Status string `json:"status"`

	SkillIDs []uint `json:"skill_ids"`
}
