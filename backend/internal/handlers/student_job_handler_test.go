package handlers

import "testing"

func TestNormalizeStudentFileName(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{name: "plain name", input: "Nguyen Van A - CV.pdf", want: "Nguyen Van A - CV.pdf"},
		{name: "browser fake path", input: `C:\fakepath\Portfolio.docx`, want: "Portfolio.docx"},
		{name: "unix path", input: "../../uploads/cv.doc", want: "cv.doc"},
		{name: "trim spaces", input: "  CV Fresher.pdf  ", want: "CV Fresher.pdf"},
		{name: "empty", input: "  ", want: ""},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := normalizeStudentFileName(test.input); got != test.want {
				t.Fatalf("normalizeStudentFileName(%q) = %q, want %q", test.input, got, test.want)
			}
		})
	}
}
